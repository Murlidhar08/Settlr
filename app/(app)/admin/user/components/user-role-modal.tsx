"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth/auth-client";
import { tran } from "@/lib/languages/i18n";
import { cn } from "@/lib/utils";
import { parseRoles, Role, ROLES, USER_ROLE_OPTIONS } from "@/utility/users-fn";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UserRoleModalProps {
    user: any | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function UserRoleModal({ user, onClose, onSuccess }: UserRoleModalProps) {
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (user) {
            setSelectedRoles(parseRoles(user.role));
        } else {
            setSelectedRoles([ROLES.USER]);
        }
    }, [user]);

    const toggleRole = (roleId: Role) => {
        setSelectedRoles((prev) => {
            if (prev.includes(roleId)) {
                if (prev.length === 1) {
                    toast.error("At least one role must be selected");
                    return prev;
                }
                return prev.filter((r) => r !== roleId);
            } else {
                return [...prev, roleId];
            }
        });
    };

    const onUpdateRoles = async () => {
        if (!user) return;

        if (selectedRoles.length === 0) {
            toast.error("Please select at least one role");
            return;
        }

        setLoading(true);
        try {
            const res = await authClient.admin.setRole({
                userId: user.id,
                role: selectedRoles,
            });

            if (res?.error) {
                toast.error(res.error.message || "Failed to update role");
                return;
            }

            toast.success(
                tran("admin.user_mng.msg.success_role_updated", {
                    role: selectedRoles.join(", "),
                })
            );
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to update role");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-105 rounded-[2.5rem] border-none shadow-2xl bg-background/95 backdrop-blur-xl p-8">
                <DialogHeader className="text-left space-y-1">
                    <DialogTitle className="text-2xl font-black tracking-tight text-foreground uppercase">
                        Update Role
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground font-medium">
                        Changing role for <span className="text-primary font-bold">{user?.name ?? "Unknown"}</span>
                    </p>
                </DialogHeader>

                <div className="flex flex-col gap-3 py-6">
                    {USER_ROLE_OPTIONS.map((role) => {
                        const isSelected = selectedRoles.includes(role.id as Role);
                        const Icon = role.icon;

                        return (
                            <div
                                key={role.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => toggleRole(role.id as Role)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        toggleRole(role.id as Role);
                                    }
                                }}
                                className={cn(
                                    "group relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                    isSelected
                                        ? "border-primary bg-primary/[0.04] dark:bg-primary/[0.08] shadow-xs"
                                        : "border-border/50 bg-background/60 hover:bg-muted/30 hover:border-border/80"
                                )}
                            >
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className={cn(
                                            "w-11 h-11 rounded-2xl flex items-center justify-center transition-colors",
                                            isSelected
                                                ? "bg-primary/15 text-primary"
                                                : role.accent
                                        )}
                                    >
                                        <Icon size={20} className="stroke-[2.2]" />
                                    </div>
                                    <span
                                        className={cn(
                                            "font-bold text-base transition-colors",
                                            isSelected ? "text-primary" : "text-foreground/90"
                                        )}
                                    >
                                        {role.label}
                                    </span>
                                </div>

                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
                                        isSelected
                                            ? "bg-primary text-primary-foreground shadow-xs scale-105"
                                            : "border-2 border-border/80 group-hover:border-muted-foreground/50"
                                    )}
                                >
                                    {isSelected && <Check size={14} className="stroke-[3]" />}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <DialogFooter className="flex flex-row gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 h-12 rounded-2xl font-black uppercase tracking-wider text-xs border-2 border-border/80 hover:bg-muted cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onUpdateRoles}
                        disabled={loading}
                        className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wider text-xs shadow-lg shadow-primary/25 hover:opacity-90 cursor-pointer"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
