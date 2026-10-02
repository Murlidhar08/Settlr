"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserStatus } from "@/lib/generated/prisma/enums";
import { useUpdateUserStatus } from "@/tanstacks/admin";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UserStatusModalProps {
    user: any | null;
    onClose: () => void;
    onSuccess: () => void;
}

const statusItems = [
    { label: "Approved", value: UserStatus.approved },
    { label: "Pending Approval", value: UserStatus.pendingapproval },
    { label: "Suspended", value: UserStatus.suspended },
];

export function UserStatusModal({ user, onClose, onSuccess }: UserStatusModalProps) {
    const [newStatus, setNewStatus] = useState<UserStatus>(UserStatus.pendingapproval);
    const [loading, setLoading] = useState<boolean>(false);
    const updateStatusMutation = useUpdateUserStatus();

    useEffect(() => {
        if (user?.status) {
            setNewStatus(user.status);
        } else {
            setNewStatus(UserStatus.pendingapproval);
        }
    }, [user]);

    const onUpdateStatus = async () => {
        if (!user) return;

        setLoading(true);
        try {
            await updateStatusMutation.mutateAsync({ userId: user.id, status: newStatus });
            toast.success("User status updated successfully");
            onSuccess();
            onClose();
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to update user status");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-100 rounded-[2rem] border-none shadow-2xl bg-background/95 backdrop-blur-xl p-8">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tight text-foreground uppercase">Update Status</DialogTitle>
                    <p className="text-xs text-muted-foreground font-medium">Changing status for <span className="text-primary font-bold">{user?.name}</span></p>
                </DialogHeader>

                <div className="py-8">
                    <div className="relative">
                        <Label className="absolute -top-2 left-4 px-2 bg-background text-[10px] font-black uppercase tracking-widest text-primary z-10">Status</Label>

                        <Select
                            items={statusItems}
                            value={newStatus}
                            onValueChange={(value) => {
                                if (!value) return;
                                setNewStatus(value)
                            }}
                        >
                            <SelectTrigger className="w-full h-10 rounded-xl border-2 font-bold focus:ring-primary/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl shadow-2xl">
                                {statusItems.map((item) => (
                                    <SelectItem key={item.value} value={item.value} className="rounded-lg font-medium">
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="flex flex-row gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-muted"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onUpdateStatus}
                        disabled={loading}
                        className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                    >
                        {loading ? "Updating..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
