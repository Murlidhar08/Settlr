/**
 * Formats a stored relative or absolute path into an accessible URL for the browser.
 */
export function getFileUrl(path?: string | null): string {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Remove leading slashes and redundant upload directory references
  let cleanPath = path.trim().replace(/^\/+/, "");

  if (cleanPath.startsWith("uploads/")) {
    cleanPath = cleanPath.replace(/^uploads\//, "");
  }

  if (cleanPath.startsWith("api/files/")) {
    return `/${cleanPath}`;
  }

  return `/api/files/${cleanPath}`;
}

/**
 * Formats a file size in bytes to a human-readable string (e.g. "1.5 MB").
 */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0 || isNaN(Number(bytes))) return "0 B";
  const numBytes = Number(bytes);
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(numBytes) / Math.log(k)), sizes.length - 1);
  const safeI = Math.max(0, i);
  return `${parseFloat((numBytes / Math.pow(k, safeI)).toFixed(1))} ${sizes[safeI]}`;
}
