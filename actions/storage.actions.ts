"use server";

import { requirePermission } from "@/lib/auth/guard";
import {
    deleteDirectory,
    deleteFile,
    listDirectoryContents,
    moveFile,
    renameItem
} from "@/lib/file-operations";

export async function getStorageItems(relativePath: string = "") {
    await requirePermission("storage", "read");
    return await listDirectoryContents(relativePath);
}

export async function renameStorageItem(oldPath: string, newName: string) {
    await requirePermission("storage", "write");
    return await renameItem(oldPath, newName);
}

export async function deleteStorageItem(relativePath: string, isDir: boolean) {
    await requirePermission("storage", "delete");

    if (isDir) {
        return await deleteDirectory(relativePath);
    } else {
        return await deleteFile(relativePath);
    }
}

export async function moveStorageItem(oldPath: string, newDirPath: string) {
    await requirePermission("storage", "move");
    return await moveFile(oldPath, newDirPath);
}
