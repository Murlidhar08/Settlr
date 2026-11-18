"use client";

import { Database, Folder, Monitor, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StorageItem } from "@/types/storage";
import { StorageItemNode } from "./storage-item-node";

interface StorageTreeViewProps {
  items?: StorageItem[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

export function StorageTreeView({
  items,
  isLoading,
  error,
  onRefresh,
}: StorageTreeViewProps) {
  return (
    <div className="bg-card rounded-[2rem] sm:rounded-[2.5rem] border border-border p-4 shadow-xs min-h-[350px]">
      {isLoading ? (
        <div className="h-40 flex items-center justify-center text-muted-foreground animate-pulse font-black uppercase tracking-widest text-xs">
          Scanning directory...
        </div>
      ) : error ? (
        <div className="h-60 flex flex-col items-center justify-center text-center space-y-3 p-6">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <Database size={24} />
          </div>
          <div>
            <h3 className="font-bold text-foreground">
              {error.message === "FORBIDDEN" ? "Permission Denied" : "Error Loading Storage"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {error.message === "FORBIDDEN"
                ? "You do not have the required permissions to view system storage."
                : error.message || "An unexpected error occurred."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="rounded-xl font-bold"
          >
            <RefreshCw size={14} className="mr-2" /> Retry
          </Button>
        </div>
      ) : items?.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground/30">
          <Monitor size={48} className="mb-4 opacity-10" />
          <span className="font-black uppercase tracking-widest text-xs">
            Directory is empty
          </span>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center gap-3 py-3 px-4 mb-2 bg-muted/30 rounded-2xl">
            <Folder size={18} className="text-primary fill-primary/10" />
            <span className="text-xs font-black uppercase tracking-widest">Storage Root</span>
          </div>
          {items?.map((item) => (
            <StorageItemNode
              key={item.path}
              item={item}
              depth={0}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

