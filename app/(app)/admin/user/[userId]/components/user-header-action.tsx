"use client";

import { BackHeader } from "@/components/header/back-header";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";
import { useRemoveUserProfile, useUserById } from "@/tanstacks/user";
import { Eye, EyeOff, Lock, Pencil, RefreshCw, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface UserHeaderMenuProps {
    userId: string;
    hasImage?: boolean;
}

export function UserHeader({ userId, hasImage }: UserHeaderMenuProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const removeUserProfileMutation = useRemoveUserProfile();

    const handleUpdatePassword = async () => {
        if (!newPassword) {
            toast.error("Please enter a new password");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await authClient.admin.setUserPassword({
                userId,
                newPassword: newPassword
            });

            if (res?.error) {
                toast.error(res.error.message || "Failed to update password");
            } else {
                toast.success("Password updated successfully");
                setIsOpen(false);
                setNewPassword("");
                setConfirmPassword("");
                setShowNewPassword(false);
                setShowConfirmPassword(false);
            }
        } catch (err) {
            toast.error("Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    const removeProfile = async () => {
        try {
            await removeUserProfileMutation.mutateAsync(userId);
            toast.success("Profile removed successfully");
        } catch (error) {
            toast.error("Failed to remove profile");
        }
    };

    return (
        <>
            <BackHeader
                title={"User Details"}
                showProfile={false}
                menuItems={[
                    {
                        label: "Refresh",
                        onClick: () => window.location.reload(),
                        icon: <RefreshCw size={18} className="text-blue-500" />
                    },
                    {
                        label: "Edit",
                        onClick: () => router.push(`/admin/user/${userId}/edit` as any),
                        icon: <Pencil size={18} className="text-blue-600" />
                    },
                    ...(hasImage ? [{
                        label: "Remove Profile",
                        onClick: () => removeProfile(),
                        icon: <Trash size={18} className="text-red-600" />
                    }] : []),
                    {
                        label: "Update Password",
                        onClick: () => setIsOpen(true),
                        icon: <Lock size={18} className="text-green-500" />
                    },
                ]}
            />

            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open && !loading) {
                        setIsOpen(false);
                        setNewPassword("");
                        setConfirmPassword("");
                        setShowNewPassword(false);
                        setShowConfirmPassword(false);
                    }
                }}
            >
                <DialogContent className="max-w-md p-8 rounded-[2rem] border-border bg-card shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            <Lock className="text-green-500" size={20} />
                            Update User Password
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</Label>
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="h-12 rounded-xl border-border bg-muted/20 font-bold pl-4 pr-12 focus:ring-primary w-full"
                                    placeholder="Enter new password..."
                                    disabled={loading}
                                    autoFocus={true}
                                    tabIndex={1}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    disabled={loading}
                                    tabIndex={4}
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !loading) {
                                            e.preventDefault();
                                            handleUpdatePassword();
                                        }
                                    }}
                                    className="h-12 rounded-xl border-border bg-muted/20 font-bold pl-4 pr-12 focus:ring-primary w-full"
                                    placeholder="Confirm new password..."
                                    disabled={loading}
                                    tabIndex={2}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    disabled={loading}
                                    tabIndex={5}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex gap-3 pt-6">
                        <Button variant="ghost" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setIsOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 rounded-xl h-12 font-black bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
                            onClick={handleUpdatePassword}
                            disabled={loading}
                            tabIndex={3}
                        >
                            {loading ? "Updating..." : "Save Password"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
