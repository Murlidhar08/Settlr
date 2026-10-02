"use client";

import { DocumentPreview } from "@/components/document-preview";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn, getFileUrl } from "@/lib/utils";
import {
    useDeleteStorageItem,
    useRenameStorageItem,
    useStorageItems
} from "@/tanstacks/storage";
import {
    ChevronDown,
    ChevronRight,
    Database,
    Eye,
    File,
    FileText,
    Folder,
    Image as ImageIcon,
    Monitor,
    Pencil,
    RefreshCw,
    Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StorageItemProps {
    item: {
        name: string;
        path: string;
        isDir: boolean;
        size: number;
        updatedAt: Date;
        extension: string;
    };
    depth: number;
    onRefresh: () => void;
}

const StorageItem = ({ item, depth, onRefresh }: StorageItemProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [newName, setNewName] = useState(item.name);
    const confirm = useConfirm();

    const { data: children, isLoading, refetch, error: childrenError } = useStorageItems(item.path, item.isDir && isExpanded);
    const renameMutation = useRenameStorageItem();
    const deleteMutation = useDeleteStorageItem();

    useEffect(() => {
        if (childrenError) {
            const message = childrenError.message === "FORBIDDEN"
                ? `Permission denied to view contents of ${item.name}`
                : childrenError.message || `Failed to load ${item.name}`;
            toast.error(message);
        }
    }, [childrenError, item.name]);

    const isImage = item.extension.match(/(jpg|jpeg|png|gif|webp)$/i);
    const isPDF = item.extension === ".pdf";

    const handleRename = () => {
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
                    const message = err?.message === "FORBIDDEN"
                        ? "Permission denied: you cannot rename this item"
                        : err?.message || "Failed to rename item";
                    toast.error(message);
                },
            }
        );
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();

        const isConfirmed = await confirm({
            title: `Delete ${item.isDir ? "folder" : "file"}`,
            description: `Are you sure you want to delete ${item.isDir ? `folder <strong>${item.name}</strong>` : `file <strong>${item.name}</strong>`}?`,
            confirmText: `Delete ${item.isDir ? "folder" : "file"}`,
            destructive: true
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
                    const message = err?.message === "FORBIDDEN"
                        ? "Permission denied: you cannot delete this item"
                        : err?.message || "Failed to delete item";
                    toast.error(message);
                },
            }
        );
    };

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
                            {isExpanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
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

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                    {!item.isDir && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-white hover:text-primary transition-all shadow-hover"
                            onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(true); }}
                        >
                            <Eye size={14} />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-white hover:text-primary transition-all shadow-hover"
                        onClick={(e) => { e.stopPropagation(); setIsRenameOpen(true); }}
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
            <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogContent className="max-w-md p-8 rounded-[2.5rem] border-border bg-card shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Rename Item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="h-12 rounded-xl border-border bg-muted/20 font-bold px-4"
                            disabled={renameMutation.isPending}
                        />
                        <div className="flex gap-3">
                            <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setIsRenameOpen(false)} disabled={renameMutation.isPending}>
                                Cancel
                            </Button>
                            <Button className="flex-1 rounded-xl font-black" onClick={handleRename} disabled={renameMutation.isPending}>
                                {renameMutation.isPending ? "Saving..." : "Save Name"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

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
                        children?.map((child: any) => (
                            <StorageItem key={child.path} item={child} depth={0} onRefresh={refetch} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export const AdminStorageManager = () => {
    const { data: items, isLoading, refetch, error } = useStorageItems("/");

    useEffect(() => {
        if (error) {
            const message = error.message === "FORBIDDEN"
                ? "You do not have permission to access system storage"
                : error.message || "Failed to load storage items";
            toast.error(message);
        }
    }, [error]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Database className="text-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">System Storage</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manage files and folders in upload root</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full shadow-hover"
                    onClick={() => refetch()}
                >
                    <RefreshCw size={18} />
                </Button>
            </div>

            <div className="bg-card rounded-[2.5rem] border border-border p-4 shadow-sm min-h-100">
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
                        <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl font-bold">
                            <RefreshCw size={14} className="mr-2" /> Retry
                        </Button>
                    </div>
                ) : items?.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-muted-foreground/30">
                        <Monitor size={48} className="mb-4 opacity-10" />
                        <span className="font-black uppercase tracking-widest text-xs">Directory is empty</span>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 py-3 px-4 mb-2 bg-muted/30 rounded-2xl">
                            <Folder size={18} className="text-primary fill-primary/10" />
                            <span className="text-xs font-black uppercase tracking-widest">Storage Root</span>
                        </div>
                        {items?.map((item: any) => (
                            <StorageItem key={item.path} item={item} depth={0} onRefresh={refetch} />
                        ))}
                    </div>
                )}
            </div>

            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center gap-4 text-primary text-xs font-bold leading-relaxed">
                <Database size={24} className="shrink-0 opacity-40" />
                <p>Warning: Deleting or renaming files here will break existing database references. Use this tool with extreme caution for maintenance purposes only.</p>
            </div>
        </div>
    );
};
