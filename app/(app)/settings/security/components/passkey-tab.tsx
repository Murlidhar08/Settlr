"use client";

import { FooterButtons } from "@/components/footer-buttons";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { tran } from "@/lib/languages/i18n";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Fingerprint, Key, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
};

export function PasskeyTab() {
    const { data: passkeys, isPending, refetch } = authClient.useListPasskeys();
    const [isAdding, setIsAdding] = useState(false);
    const [passkeyName, setPasskeyName] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [editingPasskey, setEditingPasskey] = useState<{ id: string, name: string } | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleAddPasskey = async () => {
        if (!passkeyName.trim()) {
            toast.error(tran("security.passkeys.msg.name_required"));
            return;
        }

        setIsAdding(true);
        try {
            const { error } = await authClient.passkey.addPasskey({
                name: passkeyName
            });
            if (error) {
                toast.error(error.message || tran("security.passkeys.msg.failed_to_register"));
            } else {
                toast.success(tran("security.passkeys.msg.passkey_registered"));
                setIsDialogOpen(false);
                setPasskeyName("");
                refetch();
            }
        } catch (err) {
            toast.error(tran("security.passkeys.msg.failed_to_register"));
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdatePasskey = async () => {
        if (!editingPasskey || !editingPasskey.name.trim()) {
            toast.error(tran("security.passkeys.msg.name_required"));
            return;
        }

        setIsUpdating(true);
        try {
            const { error } = await authClient.passkey.updatePasskey({
                id: editingPasskey.id,
                name: editingPasskey.name
            });
            if (error) {
                toast.error(error.message || tran("security.passkeys.msg.failed_to_update"));
            } else {
                toast.success(tran("security.passkeys.msg.passkey_updated"));
                setIsEditDialogOpen(false);
                setEditingPasskey(null);
                refetch();
            }
        } catch (err) {
            toast.error(tran("security.passkeys.msg.failed_to_update"));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeletePasskey = async (id: string) => {
        try {
            const { error } = await authClient.passkey.deletePasskey({ id });
            if (error) {
                toast.error(error.message || tran("security.passkeys.msg.failed_to_delete"));
            } else {
                toast.success(tran("security.passkeys.msg.passkey_deleted"));
                refetch();
            }
        } catch (err) {
            toast.error(tran("security.passkeys.msg.failed_to_delete"));
        }
    };

    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 ml-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger>
                        <FooterButtons>
                            <Button
                                size="sm"
                                variant="default"
                                className={cn(
                                    "h-14 w-full text-white md:w-auto rounded-full px-8 md:px-12 gap-3 font-bold uppercase",
                                    "bg-primary hover:bg-primary/90",
                                    "shadow-[0_10px_40px_rgba(225,29,72,0.3)] hover:shadow-[0_15px_50px_rgba(225,29,72,0.4)]",
                                    "border-t border-white/20 transition-all duration-300"
                                )}
                            >
                                <Plus size={14} className="mr-2" />
                                <span className="text-center font-black tracking-[0.15em] text-sm hidden md:block">
                                    {tran("security.passkeys.add_passkey")}
                                </span>
                            </Button>
                        </FooterButtons>
                    </DialogTrigger>
                    <DialogContent className="rounded-[3rem] p-10 sm:max-w-xl mx-auto border shadow-2xl">
                        <DialogHeader className="space-y-4 mb-8">
                            <div className="h-16 w-16 rounded-[2rem] bg-primary/5 text-primary flex items-center justify-center mb-2">
                                <Key size={32} />
                            </div>
                            <DialogTitle className="text-2xl font-black">{tran("security.passkeys.register_passkey")}</DialogTitle>
                            <DialogDescription className="text-muted-foreground text-base">
                                {tran("security.passkeys.description")}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="passkey-name" className="ml-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">
                                    {tran("security.passkeys.passkey_name")}
                                </Label>
                                <Input
                                    id="passkey-name"
                                    value={passkeyName}
                                    onChange={(e) => setPasskeyName(e.target.value)}
                                    placeholder={tran("security.passkeys.passkey_name")}
                                    className="h-14 rounded-2xl bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all"
                                    autoFocus
                                />
                            </div>

                            <Button
                                onClick={handleAddPasskey}
                                disabled={isAdding || !passkeyName.trim()}
                                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-2xl transition-all active:scale-[0.98]"
                            >
                                <LoadingSwap isLoading={isAdding}>
                                    {tran("security.passkeys.add_passkey")}
                                </LoadingSwap>
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {isPending ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-24 w-full animate-pulse bg-muted/50 rounded-[2rem]" />
                    ))
                ) : passkeys && passkeys.length > 0 ? (
                    passkeys.map((passkey) => (
                        <div
                            key={passkey.id}
                            className="rounded-[2rem] bg-card border shadow-xs p-6 flex items-center justify-between group hover:border-primary/20 transition-all hover:shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                                    <Fingerprint size={24} />
                                </div>
                                <div className="space-y-1 overflow-hidden">
                                    <p className="font-bold text-base truncate">{passkey.name || tran("security.passkeys.unnamed_passkey")}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar size={12} />
                                        <span>{format(new Date(passkey.createdAt), "PPP")}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                    <DialogTrigger>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditingPasskey({ id: passkey.id, name: passkey.name || "" });
                                                setIsEditDialogOpen(true);
                                            }}
                                            className="rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors shrink-0"
                                        >
                                            <Pencil size={18} />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-[3rem] p-10 sm:max-w-xl mx-auto border shadow-2xl">
                                        <DialogHeader className="space-y-4 mb-8">
                                            <div className="h-16 w-16 rounded-[2rem] bg-primary/5 text-primary flex items-center justify-center mb-2">
                                                <Pencil size={32} />
                                            </div>
                                            <DialogTitle className="text-2xl font-black">{tran("security.passkeys.edit_passkey_title")}</DialogTitle>
                                            <DialogDescription className="text-muted-foreground text-base">
                                                {tran("security.passkeys.passkey_name")}
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-passkey-name" className="ml-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">
                                                    {tran("security.passkeys.passkey_name")}
                                                </Label>
                                                <Input
                                                    id="edit-passkey-name"
                                                    value={editingPasskey?.name ?? ""}
                                                    onChange={(e) => setEditingPasskey(prev => prev ? { ...prev, name: e.target.value } : null)}
                                                    className="h-14 rounded-2xl bg-muted/20 border-muted-foreground/10 focus:bg-background transition-all"
                                                    autoFocus
                                                />
                                            </div>

                                            <Button
                                                onClick={handleUpdatePasskey}
                                                disabled={isUpdating || !editingPasskey?.name.trim()}
                                                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-2xl transition-all active:scale-[0.98]"
                                            >
                                                <LoadingSwap isLoading={isUpdating}>
                                                    {tran("common.save")}
                                                </LoadingSwap>
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                    <AlertDialogTrigger>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-[2.5rem] p-8">
                                        <AlertDialogHeader>
                                            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <AlertDialogTitle className="text-xl font-black">{tran("security.passkeys.delete_passkey_title")}</AlertDialogTitle>
                                            <AlertDialogDescription className="text-muted-foreground">
                                                {tran("security.passkeys.delete_passkey_desc")}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="mt-6">
                                            <AlertDialogCancel className="rounded-2xl font-bold">{tran("common.cancel")}</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDeletePasskey(passkey.id)}
                                                className="bg-rose-500 hover:bg-rose-600 rounded-2xl font-bold shadow-lg shadow-rose-100"
                                            >
                                                {tran("security.passkeys.delete_passkey")}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl bg-muted/20 border border-dashed p-8 text-center space-y-4">
                        <div className="h-16 w-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto text-muted-foreground">
                            <Key size={32} />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-lg">{tran("security.passkeys.no_passkeys")}</p>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                {tran("security.passkeys.description")}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(true)}
                            className="rounded-2xl font-bold h-12 px-8 mt-2"
                        >
                            {tran("security.passkeys.register_passkey")}
                        </Button>
                    </div>
                )}
            </div>

        </motion.section>
    );
}