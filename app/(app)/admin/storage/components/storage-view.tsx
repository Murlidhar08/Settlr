"use client";

import { useEffect } from "react";
import { Database, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStorageItems } from "@/hooks/queries/storage";
import { StorageTreeView } from "./storage-tree-view";

export function StorageView() {
  const { data: items, isLoading, refetch, error } = useStorageItems("/");

  useEffect(() => {
    if (error) {
      const message =
        error.message === "FORBIDDEN"
          ? "You do not have permission to access system storage"
          : error.message || "Failed to load storage items";
      toast.error(message);
    }
  }, [error]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Database className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">System Storage</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Manage files and folders in upload root
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full shadow-xs self-start sm:self-auto cursor-pointer"
          onClick={() => refetch()}
        >
          <RefreshCw size={18} />
        </Button>
      </div>

      {/* Directory Explorer */}
      <StorageTreeView
        items={items}
        isLoading={isLoading}
        error={error}
        onRefresh={() => refetch()}
      />

      {/* Warning Notice */}
      <div className="p-5 sm:p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center gap-4 text-primary text-xs font-bold leading-relaxed">
        <Database size={24} className="shrink-0 opacity-40" />
        <p>
          Warning: Deleting or renaming files here will break existing database references. Use this tool with extreme
          caution for maintenance purposes only.
        </p>
      </div>
    </div>
  );
}

