/**
 * Metadata for a file or directory item in storage management.
 */
export interface StorageItem {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  updatedAt: Date;
  extension: string;
}

export interface StorageOperationResult {
  success: boolean;
  message?: string;
  error?: string;
}
