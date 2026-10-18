import {
  deleteStorageItem,
  getStorageItems,
  moveStorageItem,
  renameStorageItem,
} from "@/actions/storage.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./keys";

// --- QUERIES (READ) ---

export const useStorageItems = (relativePath: string = "", enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.admin.storage.byPath(relativePath || "root"),
    queryFn: () => getStorageItems(relativePath),
    enabled,
  });
};

// --- MUTATIONS (CREATE / UPDATE / DELETE) ---

export const useRenameStorageItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ oldPath, newName }: { oldPath: string; newName: string }) =>
      renameStorageItem(oldPath, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.storage.all });
    },
  });
};

export const useDeleteStorageItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ relativePath, isDir }: { relativePath: string; isDir: boolean }) =>
      deleteStorageItem(relativePath, isDir),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.storage.all });
    },
  });
};

export const useMoveStorageItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ oldPath, newDirPath }: { oldPath: string; newDirPath: string }) =>
      moveStorageItem(oldPath, newDirPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.storage.all });
    },
  });
};
