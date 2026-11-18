"use client";

import {
  ChevronDown,
  ChevronRight,
  Eye,
  File,
  FileText,
  Folder,
  Image as ImageIcon,
  Pencil,
  Trash2,
} from "lucide-react";
import { DocumentPreview } from "@/components/document-preview";
import { Button } from "@/components/ui/button";
import { cn, getFileUrl } from "@/lib/utils";
import { useStorageItem } from "@/hooks/use-storage-item";
import type { StorageItem } from "@/types/storage";
import { StorageRenameDialog } from "./storage-rename-dialog";

interface StorageItemNodeProps {
  item: StorageItem;
  depth: number;
  onRefresh: () => void;
}

export function StorageItemNode({ item, depth, onRefresh }: StorageItemNodeProps) {
  const {
    isExpanded,
    setIsExpanded,
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
  } = useStorageItem({ item, onRefresh });

  const isImage = Boolean(item.extension.match(/(jpg|jpeg|png|gif|webp)$/i));
  const isPDF = item.extension.toLowerCase() === ".pdf";

  return (
    <div className="flex flex-col w-full">
      <div
        className={cn(
          "flex items-center justify-between py-2 px-3 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group",
          depth === 0 ? "font-black" : "font-medium"
        )}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
        onClick={() => item.isDir && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {item.isDir ? (
            <>
              {isExpanded ? (
                <ChevronDown size={14} className="text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight size={14} className="text-muted-foreground shrink-0" />
              )}
              <Folder size={18} className="text-primary/70 shrink-0 fill-primary/10" />
            </>
          ) : (
            <>
              <div className="w-3.5" />
              {isImage ? (
                <ImageIcon size={18} className="text-blue-500/70 shrink-0" />
              ) : isPDF ? (
                <FileText size={18} className="text-red-500/70 shrink-0" />
              ) : (
                <File size={18} className="text-muted-foreground/70 shrink-0" />
              )}
            </>
          )}
          <span className="text-sm truncate">{item.name}</span>
        </div>

        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pr-2">
          {!item.isDir && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-background hover:text-primary transition-all shadow-xs"
              onClick={(e) => {
                e.stopPropagation();
                setIsPreviewOpen(true);
              }}
            >
              <Eye size={14} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-background hover:text-primary transition-all shadow-xs"
            onClick={(e) => {
              e.stopPropagation();
              setIsRenameOpen(true);
            }}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
            onClick={handleDelete}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Rename Dialog */}
      <StorageRenameDialog
        isOpen={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        newName={newName}
        onNewNameChange={setNewName}
        onSave={handleRename}
        isPending={renameMutation.isPending}
      />

      {/* Preview Component */}
      {!item.isDir && (
        <DocumentPreview
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          url={getFileUrl(item.path)}
          fileName={item.name}
          fileExtension={item.extension}
        />
      )}

      {/* Recursive Children */}
      {item.isDir && isExpanded && (
        <div className="flex flex-col border-l border-border/30 ml-5.75">
          {isLoading ? (
            <div className="py-2 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
              Loading contents...
            </div>
          ) : children?.length === 0 ? (
            <div className="py-2 px-6 text-[10px] font-bold text-muted-foreground/30 italic">
              Empty folder
            </div>
          ) : (
            children?.map((child) => (
              <StorageItemNode
                key={child.path}
                item={child}
                depth={0}
                onRefresh={refetch}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

