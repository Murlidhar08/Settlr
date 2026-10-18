import fs from "fs";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

/**
 * Ensures a directory exists, creating it if necessary.
 */
export const ensureDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * Gets the absolute path for a given relative path within the upload root.
 * Enforces strict boundary verification to prevent directory traversal attacks.
 */
export const getAbsolutePath = (relativePath: string): string => {
    // 1. Normalize and strip leading slashes/backslashes
    const normalized = path.normalize(relativePath).replace(/^[/\\]+/, "");

    // 2. Strip leading 'uploads' prefix if present
    let safePath = normalized;
    if (safePath.toLowerCase().startsWith("uploads")) {
        safePath = safePath.slice(7).replace(/^[/\\]+/, "");
    }

    // 3. Resolve against UPLOAD_ROOT
    const resolvedPath = path.resolve(UPLOAD_ROOT, safePath);

    // 4. Strict check: path MUST remain inside UPLOAD_ROOT
    const rootWithSep = UPLOAD_ROOT.endsWith(path.sep) ? UPLOAD_ROOT : `${UPLOAD_ROOT}${path.sep}`;
    if (resolvedPath !== UPLOAD_ROOT && !resolvedPath.startsWith(rootWithSep)) {
        throw new Error("Access denied: Invalid file path traversal attempt");
    }

    return resolvedPath;
};


/**
 * Gets the relative path (from upload root) for a given absolute path.
 */
export const getRelativePath = (absolutePath: string) => {
    return path.relative(UPLOAD_ROOT, absolutePath).replace(/\\/g, "/");
};

/**
 * Uploads a file to a specific location.
 */
export const uploadFile = async (file: File, destinationDir: string, fileName?: string): Promise<string> => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const finalFileName = fileName || `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const absoluteDir = getAbsolutePath(destinationDir);
    ensureDir(absoluteDir);

    const absolutePath = path.join(absoluteDir, finalFileName);
    fs.writeFileSync(absolutePath, buffer);

    return getRelativePath(absolutePath);
};

/**
 * Deletes a file from the server.
 */
export const deleteFile = async (relativePath: string) => {
    const absolutePath = getAbsolutePath(relativePath);
    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        return true;
    }
    return false;
};

/**
 * Moves a file from one location to another.
 */
export const moveFile = async (sourcePath: string, destinationDir: string, newFileName?: string): Promise<string> => {
    const sourceAbs = getAbsolutePath(sourcePath);
    if (!fs.existsSync(sourceAbs)) {
        throw new Error(`Source file not found: ${sourcePath}`);
    }

    const fileName = newFileName || path.basename(sourceAbs);
    const destAbsDir = getAbsolutePath(destinationDir);
    ensureDir(destAbsDir);

    const destAbs = path.join(destAbsDir, fileName);
    fs.renameSync(sourceAbs, destAbs);

    return getRelativePath(destAbs);
};

/**
 * Deletes a directory and all its contents.
 */
export const deleteDirectory = async (relativePath: string) => {
    const absolutePath = getAbsolutePath(relativePath);
    if (fs.existsSync(absolutePath)) {
        fs.rmSync(absolutePath, { recursive: true, force: true });
        return true;
    }
    return false;
};

/**
 * Lists contents of a directory.
 */
export const listDirectoryContents = async (relativePath: string = "") => {
    const absolutePath = getAbsolutePath(relativePath);
    if (!fs.existsSync(absolutePath)) return [];

    const items = fs.readdirSync(absolutePath, { withFileTypes: true });

    return items.map(item => {
        const itemPath = path.join(relativePath, item.name).replace(/\\/g, "/");
        const stats = fs.statSync(path.join(absolutePath, item.name));

        return {
            name: item.name,
            path: itemPath,
            isDir: item.isDirectory(),
            size: stats.size,
            updatedAt: stats.mtime,
            extension: item.isFile() ? path.extname(item.name).toLowerCase() : ""
        };
    });
};

/**
 * Renames a file or directory safely within its parent directory.
 */
export const renameItem = async (oldRelativePath: string, newName: string) => {
    // Disallow path separators or directory traversal symbols in newName
    if (newName.includes("/") || newName.includes("\\") || newName.includes("..")) {
        throw new Error("Invalid name: cannot contain path separators or parent directory references");
    }

    const oldAbsPath = getAbsolutePath(oldRelativePath);
    if (!fs.existsSync(oldAbsPath)) throw new Error("Item not found");

    const parentDir = path.dirname(oldAbsPath);
    const newAbsPath = path.join(parentDir, newName);

    // Verify destination remains in parent directory and within upload root
    if (path.dirname(newAbsPath) !== parentDir) {
        throw new Error("Invalid destination path");
    }

    fs.renameSync(oldAbsPath, newAbsPath);
    return getRelativePath(newAbsPath);
};
