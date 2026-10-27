"use client";

import { useConfirm } from "@/components/providers/confirm-provider";
import { usePrompt } from "@/components/providers/prompt-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/auth-client";
import { getRoleConfig, parseRoles, Role } from "@/utility/users-fn";
import {
    Activity,
    Ban,
    Check,
    MoreHorizontal,
    Pencil,
    Phone,
    RefreshCw,
    Shield,
    UserCircle,
    UserMinus,
    UserPlus,
    UserX
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { UserStatus } from "@/lib/generated/prisma/enums";
import { tran } from "@/lib/languages/i18n";
import { cn, getFileUrl } from "@/lib/utils";
import { useComprehensiveDeleteUser } from "@/tanstacks/admin";
import { getInitials } from "@/utility/common-function";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const UserRoleModal = dynamic(
    () => import("./user-role-modal").then((m) => m.UserRoleModal),
    { ssr: false }
);

const UserStatusModal = dynamic(
    () => import("./user-status-modal").then((m) => m.UserStatusModal),
    { ssr: false }
);

interface User {
    id: string;
    email: string;
    name: string;
    role?: string | null;
    roles: string[];
    status?: UserStatus | null;
    banned?: boolean | null;
    image?: string | null;
    createdAt: Date;
    contactNo?: string | null;
    businessCount?: number;
    transactionCount?: number;
    emailVerified?: boolean;
}

export function UserCard({ user, refetch }: { user: User, refetch: () => void }) {
    const confirm = useConfirm();
    const prompt = usePrompt();
    const router = useRouter();
    const deleteUserMutation = useComprehensiveDeleteUser();

    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // User Status Update
    const [selectedUserForStatus, setSelectedUserForStatus] = useState<User | null>(null);

    // User Role Update
    const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);

    const handleAction = async (userId: string, action: () => Promise<any>, successMsg: string) => {
        setActionLoading(userId);
        try {
            const res = await action();
            if (res?.error) {
                toast.error(res.error);
            } else {
                toast.success(successMsg);
                refetch();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to perform action");
        } finally {
            setActionLoading(null);
        }
    };

    const banUser = async (userId: string) => {
        const banReason = await prompt({
            title: tran("admin.user_mng.ban_user"),
            description: tran("admin.user_mng.ban_reason_desc"),
            placeholder: tran("admin.user_mng.ban_reason_placeholder"),
            confirmText: tran("admin.user_mng.ban_user"),
            destructive: true
        });

        if (!banReason) return;

        await handleAction(
            userId,
            () => authClient.admin.banUser({ userId, banReason }),
            tran("admin.user_mng.msg.success_user_banned")
        );
    };

    const impersonateUser = async (userId: string) => {
        await handleAction(
            userId,
            () => authClient.admin.impersonateUser({ userId }),
            tran("admin.user_mng.msg.success_impersonating")
        );
        window.location.replace("/dashboard");
    };

    const revokeSessions = async (userId: string) => {
        await handleAction(
            userId,
            () => authClient.admin.revokeUserSessions({ userId }),
            tran("admin.user_mng.msg.success_sessions_revoked")
        );
    };

    const deleteUser = async (userId: string) => {
        const isConfirmed = await confirm({
            title: tran("admin.user_mng.delete_user_confirm_title"),
            description: tran("admin.user_mng.delete_user_confirm_desc"),
            confirmText: tran("admin.user_mng.delete_user"),
            destructive: true
        });

        if (!isConfirmed) return;

        await handleAction(
            userId,
            () => deleteUserMutation.mutateAsync(userId),
            tran("admin.user_mng.msg.success_user_deleted")
        );
    };

    const unbanUser = async (userId: string) => {
        await handleAction(
            userId,
            () => authClient.admin.unbanUser({ userId }),
            tran("admin.user_mng.msg.success_user_unbanned")
        );
    };

    const getRoleBadges = (roleString?: string | null) => {
        const userRoles = parseRoles(roleString);
        return userRoles.map((r) => {
            if (r === "user" && userRoles.length === 1) return null;
            const config = getRoleConfig(r);
            return (
                <Badge
                    key={r}
                    variant="secondary"
                    className={cn(config.colors.badge, "text-[9px] font-black tracking-widest h-5 px-2")}
                >
                    {config.label}
                </Badge>
            );
        });
    };

    return (
        <>
            <div
                key={user.id}
                onClick={() => router.push(`/admin/user/${user.id}`)}
                className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-border/60 bg-card/40 hover:bg-card hover:border-primary/40 hover:shadow-xl shadow-primary/5 transition-all duration-300 gap-4 cursor-pointer"
            >
                <div className="flex items-center gap-4 min-w-0">
                    <div className="relative shrink-0">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-lg ring-2 ring-border/10">
                            <AvatarImage src={getFileUrl(user.image)} alt={user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-lg">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        {user.banned && (
                            <div className="absolute -bottom-1 -right-1 bg-rose-500 rounded-full p-1.5 border-2 border-background shadow-lg scale-90">
                                <Ban size={10} className="text-white fill-white/20" />
                            </div>
                        )}
                        {user.emailVerified && (
                            <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-background shadow-lg scale-90">
                                <Check size={9} className="text-white fill-white/20" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-black text-[16px] tracking-tight text-foreground truncate max-w-35 sm:max-w-none">
                                {user.name}
                            </span>
                            {user.status && (
                                <Badge
                                    variant="secondary"
                                    className={`text-[9px] font-black uppercase tracking-widest h-5 px-2 shadow-sm border ${user.status === UserStatus.approved
                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5"
                                        : user.status === UserStatus.pendingapproval
                                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-500/5"
                                            : user.status === UserStatus.suspended
                                                ? "bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-rose-500/5"
                                                : "bg-muted text-muted-foreground border-muted-foreground/20"
                                        }`}
                                >
                                    {user.status === UserStatus.pendingapproval ? "Pending Approval" : user.status}
                                </Badge>
                            )}
                            <div className="flex flex-wrap gap-1">
                                {getRoleBadges(user.role)}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[12px] font-bold text-muted-foreground/60 truncate max-w-45">{user.email}</span>
                            {user.contactNo && (
                                <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest bg-muted/5 px-2 py-0.5 rounded border border-border/20">
                                    <Phone size={10} className="text-primary/40" />
                                    {user.contactNo}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl bg-muted/20 border border-transparent hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all duration-300"
                                    disabled={actionLoading === user.id}
                                >
                                    <MoreHorizontal size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end" className="w-60 rounded-3xl p-2 border-none shadow-2xl bg-background/95 backdrop-blur-xl">
                            <DropdownMenuGroup>
                                {/* Edit User */}
                                <DropdownMenuItem
                                    onClick={() => router.push(`/admin/user/${user.id}/edit`)}
                                    className="group rounded-2xl gap-3 p-2.5 focus:bg-blue-600 focus:text-white transition-all duration-300 cursor-pointer active:scale-95 mt-1"
                                >
                                    <div className="p-2.5 bg-blue-500/10 rounded-xl group-focus:bg-white/20 transition-colors">
                                        <Pencil size={18} className="text-blue-600 group-focus:text-white" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="font-bold text-[13px] tracking-tight">{tran("admin.user_mng.edit_user")}</span>
                                        <span className="text-[10px] opacity-70 font-medium group-focus:text-white/80">{tran("admin.user_mng.edit_desc")}</span>
                                    </div>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedUserForStatus(user);
                                    }}
                                    className="rounded-2xl gap-3 p-3 focus:bg-orange-500 focus:text-white transition-all duration-300 cursor-pointer active:scale-95 mt-1"
                                >
                                    <div className="p-2 bg-orange-500/10 rounded-xl">
                                        <Activity size={16} className="text-orange-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Status</span>
                                        <span className="text-[10px] text-muted-foreground/60">Update Account Status</span>
                                    </div>
                                </DropdownMenuItem>

                                {/* Role Management */}
                                <DropdownMenuItem
                                    onClick={() => setSelectedUserForRole(user)}
                                    className="group rounded-2xl gap-3 p-2.5 focus:bg-indigo-600 focus:text-white transition-all duration-300 cursor-pointer active:scale-95 mt-1"
                                >
                                    <div className="p-2.5 bg-indigo-500/10 rounded-xl group-focus:bg-white/20 transition-colors">
                                        <Shield size={18} className="text-indigo-600 group-focus:text-white" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="font-bold text-[13px] tracking-tight">Manage Roles</span>
                                        <span className="text-[10px] opacity-70 font-medium group-focus:text-white/80 capitalize">
                                            {parseRoles(user.role).join(", ")}
                                        </span>
                                    </div>
                                </DropdownMenuItem>

                                {/* Impersonation */}
                                <DropdownMenuItem
                                    onClick={() => impersonateUser(user.id)}
                                    className="group rounded-2xl gap-3 p-2.5 focus:bg-blue-600 focus:text-white transition-all duration-300 cursor-pointer active:scale-95 mt-1"
                                >
                                    <div className="p-2.5 bg-blue-500/10 rounded-xl group-focus:bg-white/20 transition-colors">
                                        <UserCircle size={18} className="text-blue-600 group-focus:text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[13px] tracking-tight">{tran("admin.user_mng.impersonate")}</span>
                                        <span className="text-[10px] opacity-70 font-medium group-focus:text-white/80">{tran("admin.user_mng.impersonate_desc")}</span>
                                    </div>
                                </DropdownMenuItem>

                                {/* Revoke Sessions */}
                                <DropdownMenuItem
                                    onClick={() => revokeSessions(user.id)}
                                    className="group rounded-2xl gap-3 p-2.5 focus:bg-amber-600 focus:text-white transition-all duration-300 cursor-pointer active:scale-95 mt-1"
                                >
                                    <div className="p-2.5 bg-amber-500/10 rounded-xl group-focus:bg-white/20 transition-colors">
                                        <RefreshCw size={18} className="text-amber-600 group-focus:text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[13px] tracking-tight">{tran("admin.user_mng.revoke_sessions")}</span>
                                        <span className="text-[10px] opacity-70 font-medium group-focus:text-white/80">{tran("admin.user_mng.revoke_desc")}</span>
                                    </div>
                                </DropdownMenuItem>

                                {/* Ban Management */}
                                <DropdownMenuItem
                                    onClick={() => user.banned ? unbanUser(user.id) : banUser(user.id)}
                                    className={`group rounded-2xl gap-3 p-2.5 transition-all duration-300 cursor-pointer active:scale-95 mt-1 ${user.banned
                                        ? "focus:bg-emerald-600 focus:text-white"
                                        : "focus:bg-rose-600 focus:text-white"
                                        }`}
                                >
                                    {user.banned ? (
                                        <>
                                            <div className="p-2.5 bg-emerald-500/10 rounded-xl group-focus:bg-white/20 transition-colors">
                                                <UserPlus size={18} className="text-emerald-600 group-focus:text-white" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[13px] tracking-tight">{tran("admin.user_mng.unban_user")}</span>
                                                <span className="text-[10px] opacity-70 font-medium group-focus:text-white/80">{tran("admin.user_mng.unban_desc")}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-2.5 bg-rose-500/10 rounded-xl group-focus:bg-white/20 transition-colors">
                                                <Ban size={18} className="text-rose-600 group-focus:text-white" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[13px] tracking-tight">{tran("admin.user_mng.ban_user")}</span>
                                                <span className="text-[10px] opacity-70 font-medium group-focus:text-white/80">{tran("admin.user_mng.ban_desc")}</span>
                                            </div>
                                        </>
                                    )}
                                </DropdownMenuItem>

                                {/* Delete User */}
                                <DropdownMenuItem
                                    onClick={() => deleteUser(user.id)}
                                    className="group rounded-2xl gap-3 p-2.5 focus:bg-rose-600 focus:text-white transition-all duration-300 cursor-pointer active:scale-95 mt-1 border border-rose-500/10 hover:border-rose-500/20"
                                >
                                    <div className="p-2.5 bg-rose-500/10 rounded-xl group-focus:bg-white/20 transition-colors">
                                        <UserX size={18} className="text-rose-600 group-focus:text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[13px] tracking-tight">{tran("admin.user_mng.delete_user")}</span>
                                        <span className="text-[10px] opacity-70 font-medium group-focus:text-white/80">{tran("admin.user_mng.delete_desc")}</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <UserStatusModal
                user={selectedUserForStatus}
                onClose={() => setSelectedUserForStatus(null)}
                onSuccess={refetch}
            />

            <UserRoleModal
                user={selectedUserForRole}
                onClose={() => setSelectedUserForRole(null)}
                onSuccess={refetch}
            />
        </>
    );
}
