"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/confirm-provider";
import {
  useDeleteStorageItem,
  useRenameStorageItem,
  useStorageItems,
} from "@/hooks/queries/storage";
import type { StorageItem } from "@/types/storage";

export interface UseStorageItemOptions {
  item: StorageItem;
  onRefresh: () => void;
}

export function useStorageItem({ item, onRefresh }: UseStorageItemOptions) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const confirm = useConfirm();

  const {
    data: children,
    isLoading,
    refetch,
    error: childrenError,
  } = useStorageItems(item.path, item.isDir && isExpanded);

  const renameMutation = useRenameStorageItem();
  const deleteMutation = useDeleteStorageItem();

  useEffect(() => {
    if (childrenError) {
      const message =
        childrenError.message === "FORBIDDEN"
          ? `Permission denied to view contents of ${item.name}`
          : childrenError.message || `Failed to load ${item.name}`;
      toast.error(message);
    }
  }, [childrenError, item.name]);

  const toggleExpanded = useCallback(() => {
    if (item.isDir) {
      setIsExpanded((prev) => !prev);
    }
  }, [item.isDir]);

  const handleRename = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }
    if (trimmed === item.name) {
      setIsRenameOpen(false);
      return;
    }

    renameMutation.mutate(
      { oldPath: item.path, newName: trimmed },
      {
        onSuccess: () => {
          toast.success("Item renamed successfully");
          setIsRenameOpen(false);
          onRefresh();
        },
        onError: (err: any) => {
          const message =
            err?.message === "FORBIDDEN"
              ? "Permission denied: you cannot rename this item"
              : err?.message || "Failed to rename item";
          toast.error(message);
        },
      }
    );
  }, [newName, item.name, item.path, renameMutation, onRefresh]);

  const handleDelete = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();

      const isConfirmed = await confirm({
        title: `Delete ${item.isDir ? "folder" : "file"}`,
        description: `Are you sure you want to delete ${
          item.isDir
            ? `folder <strong>${item.name}</strong>`
            : `file <strong>${item.name}</strong>`
        }?`,
        confirmText: `Delete ${item.isDir ? "folder" : "file"}`,
        destructive: true,
      });

      if (!isConfirmed) return;

      deleteMutation.mutate(
        { relativePath: item.path, isDir: item.isDir },
        {
          onSuccess: () => {
            toast.success(`${item.isDir ? "Folder" : "File"} deleted successfully`);
            onRefresh();
          },
          onError: (err: any) => {
            const message =
              err?.message === "FORBIDDEN"
                ? "Permission denied: you cannot delete this item"
                : err?.message || "Failed to delete item";
            toast.error(message);
          },
        }
      );
    },
    [confirm, item.isDir, item.name, item.path, deleteMutation, onRefresh]
  );

  return {
    isExpanded,
    setIsExpanded,
    toggleExpanded,
    isPreviewOpen,
    setIsPreviewOpen,
    isRenameOpen,
    setIsRenameOpen,
    newName,
    setNewName,
    children,
    isLoading,
    refetch,
    handleRename,
    handleDelete,
    renameMutation,
    deleteMutation,
    isRenaming: renameMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
