/**
 * Formats a stored relative or absolute path into an accessible URL for the browser.
 */
export function getFileUrl(path?: string | null): string {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Remove leading slashes and redundant upload directory references
  let cleanPath = path.replace(/^\/+/, "");

  if (cleanPath.startsWith("uploads/")) {
    cleanPath = cleanPath.replace(/^uploads\//, "");
  }

  if (cleanPath.startsWith("api/files/")) {
    return `/${cleanPath}`;
  }

  return `/api/files/${cleanPath}`;
}
