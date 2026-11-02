"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn, getFileUrl } from "@/lib/utils";
import { useDeleteUserDocument, useRenameUserDocument } from "@/tanstacks/user";
import {
    Download,
    Eye,
    FileText,
    Image as ImageIcon,
    Maximize2,
    MoreVertical,
    Pencil,
    RotateCw,
    Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentPreview } from "../document-preview";

interface DocumentCardProps {
    document: any;
    isEditable?: boolean;
}

export function DocumentCard({ document, isEditable = false }: DocumentCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(document.fileName);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const deleteDocumentMutation = useDeleteUserDocument();
    const renameDocumentMutation = useRenameUserDocument();

    const handleDownload = () => {
        const link = window.document.createElement('a');
        link.href = document.documentRelativePath;
        link.download = document.fileName;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
    };

    const handlePreview = () => {
        setIsPreviewOpen(true);
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteDocumentMutation.mutateAsync({ documentId: document.id, userId: document.userId });
            toast.success("Document deleted successfully");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete document");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRename = async () => {
        if (!newName.trim()) return;
        try {
            setIsRenaming(true);
            await renameDocumentMutation.mutateAsync({ documentId: document.id, newName, userId: document.userId });
            toast.success("Document renamed successfully");
            setIsRenameDialogOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to rename document");
        } finally {
            setIsRenaming(false);
        }
    };

    const isImage = document.extension?.match(/(jpg|jpeg|png|gif|webp)$/i);
    const fileType = document.extension?.toUpperCase() || "FILE";

    return (
        <>
            <Card className="p-5 rounded-[2.5rem] border-border bg-card shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative flex flex-col justify-between h-70 overflow-hidden">
                <div className="flex items-start justify-between">
                    <div className={cn(
                        "h-16 w-16 rounded-[1.5rem] flex items-center justify-center border transition-all duration-500 group-hover:scale-110",
                        isImage ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" : "bg-primary/10 text-primary border-primary/10"
                    )}>
                        {isImage ? <ImageIcon size={32} /> : <FileText size={32} />}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical size={20} />
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end" className="rounded-2xl min-w-45 p-2 bg-card/95 backdrop-blur-md shadow-xl border-border/50">
                            <DropdownMenuItem onClick={handlePreview} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-primary/5 text-sm font-bold transition-colors">
                                <Maximize2 size={16} className="text-primary" />
                                Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDownload} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-primary/5 text-sm font-bold transition-colors">
                                <Download size={16} className="text-emerald-500" />
                                Download
                            </DropdownMenuItem>
                            {isEditable && (
                                <>
                                    <DropdownMenuItem onClick={() => setIsRenameDialogOpen(true)} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-primary/5 text-sm font-bold transition-colors">
                                        <Pencil size={16} className="text-blue-500" />
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-red-50 text-red-500 font-bold transition-colors">
                                        {isDeleting ? <RotateCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="min-w-0 flex-1 flex flex-col justify-center gap-1">
                    <h5 className="font-black tracking-tight text-foreground truncate text-base leading-tight group-hover:text-primary transition-colors">{document.fileName}</h5>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{fileType} FILE</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-1">
                    <Button
                        onClick={handlePreview}
                        variant="ghost"
                        className="rounded-2xl border border-border/50 bg-muted/20 hover:bg-primary/5 hover:text-primary hover:border-primary/20 font-black uppercase tracking-widest text-[9px] items-center gap-2 h-11"
                    >
                        <Eye size={14} />
                        Preview
                    </Button>
                    <Button
                        onClick={handleDownload}
                        variant="ghost"
                        className="rounded-2xl border border-border/50 bg-muted/20 hover:bg-emerald-500/5 hover:text-emerald-600 hover:border-emerald-500/20 font-black uppercase tracking-widest text-[9px] items-center gap-2 h-11"
                    >
                        <Download size={14} />
                        Get File
                    </Button>
                </div>
            </Card>

            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent className="sm:max-w-106.25 rounded-[2.5rem] border-border bg-card shadow-2xl p-8">
                    <DialogHeader>
                        <DialogTitle className="font-black tracking-tight text-2xl uppercase">Rename Document</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Document Name</label>
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="rounded-2xl h-14 font-black border-border shadow-inner bg-muted/20 focus:ring-primary px-6"
                            placeholder="Enter new file name..."
                        />
                    </div>
                    <DialogFooter className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsRenameDialogOpen(false)}
                            className="flex-1 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] h-12"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRename}
                            disabled={isRenaming}
                            className="flex-1 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] h-12 shadow-lg shadow-primary/20"
                        >
                            {isRenaming ? <RotateCw size={16} className="animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DocumentPreview
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                url={document.documentRelativePath ? getFileUrl(document.documentRelativePath) : ""}
                fileName={document.fileName}
                fileExtension={document.extension}
            />
        </>
    );
}
