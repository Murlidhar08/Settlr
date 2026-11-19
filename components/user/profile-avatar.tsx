"use client";

import { useDeviceAccounts, useSwitchAccount } from "@/hooks/queries/user";
import { authClient, onIdentityChange, signOutThisAccount } from "@/lib/auth/auth-client";
import { hasRole } from "@/lib/auth/permissions";
import { MAX_ACCOUNTS } from "@/lib/config/constants";
import { UserRole } from "@/lib/generated/prisma/enums";
import { tran } from "@/lib/languages/i18n";
import { cn, getFileUrl } from "@/lib/utils";
import type { DeviceAccountItem } from "@/types";
import { getInitials } from "@/utility/common-function";
import { LayoutDashboard, LogOut, User as UserIcon, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function ProfileAvatar() {
    const { data: session } = authClient.useSession();
    const { data: deviceAccounts } = useDeviceAccounts();
    const isAdmin = hasRole(session?.user?.role, UserRole.admin);
    const canAccessAdmin = hasRole(session?.user?.role, UserRole.admin);
    const { mutate: switchAccount, isPending: isSwitching } = useSwitchAccount();
    const router = useRouter();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const isAtLimit = (deviceAccounts?.length ?? 0) >= MAX_ACCOUNTS;

    const handleSwitchAccount = (sessionId: string, isBanned: boolean, isSuspended: boolean) => {
        if (isBanned) {
            toast.error("Cannot switch to a banned account.");
            return;
        }
        if (isSuspended) {
            toast.error("Cannot switch to a suspended account.");
            return;
        }

        switchAccount(sessionId, {
            onSuccess: () => {
                onIdentityChange();
                window.location.assign("/dashboard");
            },
            onError: (err: any) => {
                toast.error(err?.message || "Failed to switch account");
            },
        });
    };

    const handleAddAccount = () => {
        if (isAtLimit) {
            toast.error(`Maximum accounts limit (${MAX_ACCOUNTS}) reached. Sign out of an account to add another.`);
            return;
        }
        router.push("/login?add_account=1");
    };

    const handleManageProfile = () => {
        router.push("/settings/profile");
    };

    const handleSignOutSingle = async () => {
        setIsSigningOut(true);
        try {
            await signOutThisAccount();
        } catch (err: any) {
            toast.error(err?.message || "Failed to sign out");
            setIsSigningOut(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <button
                        type="button"
                        aria-label="User account menu"
                        className={cn(
                            "rounded-full transition-all duration-200 cursor-pointer inline-flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:opacity-95 active:scale-95",
                            isAdmin
                                ? "p-[2.5px] bg-[conic-gradient(from_315deg,#EA4335_0deg_90deg,#4285F4_90deg_180deg,#34A853_180deg_270deg,#FBBC05_270deg_360deg)] shadow-xs"
                                : "p-0"
                        )}
                    >
                        <div className={cn("rounded-full", isAdmin ? "p-[1.5px] bg-background" : "")}>
                            <Avatar
                                className={cn(
                                    "h-7 w-7 sm:h-7.5 sm:w-7.5 transition-all",
                                    !isAdmin && "ring-1.5 ring-border/80 hover:ring-primary/40 shadow-xs"
                                )}
                            >
                                <AvatarImage src={getFileUrl(session?.user?.image) || ""} className="object-cover" />
                                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] sm:text-[11px] font-bold font-mono">
                                    {getInitials(session?.user?.name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </button>
                }
            />

            <DropdownMenuContent align="end" className="w-68 sm:w-72 p-1.5 rounded-xl shadow-xl border-border/60">
                {/* User Information Header */}
                <div className="flex items-center gap-2.5 px-2.5 py-2 border-b border-border/50 mb-1">
                    <Avatar className="h-8 w-8 border border-border/50 shrink-0">
                        <AvatarImage src={getFileUrl(session?.user?.image) || ""} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold font-mono">
                            {getInitials(session?.user?.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground truncate">{session?.user?.name}</span>
                            {isAdmin && (
                                <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                                    Admin
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                            {session?.user?.email}
                        </span>
                    </div>
                </div>

                <DropdownMenuGroup>
                    {/* Switch Account Submenu */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="cursor-pointer py-2 px-2.5 rounded-lg flex items-center justify-between text-xs font-medium hover:bg-accent/80 focus:bg-accent transition-colors">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{tran("profile.switch_account")}</span>
                            </div>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-72 p-1.5 space-y-1 rounded-xl shadow-xl border-border/60">
                            {deviceAccounts && deviceAccounts.length > 0 && (
                                <>
                                    <DropdownMenuLabel className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-1">
                                        {tran("profile.switch_account")}
                                    </DropdownMenuLabel>
                                    {deviceAccounts.map((account: DeviceAccountItem) => {
                                        if (account.isCurrent) return null;

                                        return (
                                            <DropdownMenuItem
                                                key={account.sessionId}
                                                disabled={account.isBanned || account.isSuspended || isSwitching}
                                                onClick={() =>
                                                    handleSwitchAccount(
                                                        account.sessionId,
                                                        account.isBanned,
                                                        account.isSuspended
                                                    )
                                                }
                                                className={cn(
                                                    "cursor-pointer flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-accent/80 focus:bg-accent gap-2 text-xs",
                                                    (account.isBanned || account.isSuspended) &&
                                                    "opacity-60 cursor-not-allowed hover:bg-transparent"
                                                )}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <Avatar className="h-7 w-7 border border-border/60 shrink-0">
                                                        <AvatarImage
                                                            src={getFileUrl(account.image) || ""}
                                                            className="object-cover"
                                                        />
                                                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold font-mono">
                                                            {getInitials(account.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-semibold text-foreground truncate">
                                                                {account.name}
                                                            </span>
                                                            {account.isBanned && (
                                                                <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-destructive/10 text-destructive border border-destructive/20 shrink-0">
                                                                    Banned
                                                                </span>
                                                            )}
                                                            {account.isSuspended && (
                                                                <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
                                                                    Suspended
                                                                </span>
                                                            )}
                                                            {account.isPending && (
                                                                <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-muted-foreground truncate">
                                                            {account.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                    <DropdownMenuSeparator className="my-1" />
                                </>
                            )}
                            <DropdownMenuItem
                                disabled={isAtLimit}
                                onClick={handleAddAccount}
                                title={
                                    isAtLimit
                                        ? `Maximum accounts limit (${MAX_ACCOUNTS}) reached. Sign out of an account to add another.`
                                        : undefined
                                }
                                className={cn(
                                    "flex items-center gap-2 py-2 px-2.5 rounded-lg font-medium text-xs transition-colors",
                                    isAtLimit
                                        ? "opacity-50 cursor-not-allowed bg-muted/30 text-muted-foreground"
                                        : "cursor-pointer bg-muted/60 hover:bg-muted text-foreground"
                                )}
                            >
                                <UserPlus className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span>{tran("profile.add_account")}</span>
                                    {isAtLimit && (
                                        <span className="text-[10px] text-muted-foreground">
                                            Limit reached ({MAX_ACCOUNTS}/{MAX_ACCOUNTS})
                                        </span>
                                    )}
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1" />

                {/* Profile navigation items */}
                <DropdownMenuItem
                    onClick={handleManageProfile}
                    className="cursor-pointer py-2 px-2.5 rounded-lg text-xs font-medium hover:bg-accent/80 focus:bg-accent transition-colors"
                >
                    <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{tran("profile.manage_profile")}</span>
                </DropdownMenuItem>

                {canAccessAdmin && (
                    <DropdownMenuItem
                        onClick={() => router.push("/admin/dashboard")}
                        className="cursor-pointer py-2 px-2.5 rounded-lg text-xs font-medium hover:bg-accent/80 focus:bg-accent transition-colors"
                    >
                        <LayoutDashboard className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{tran("admin.dashboard.title")}</span>
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem
                    onClick={() => router.push("/signout")}
                    className="cursor-pointer py-2 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent/80 focus:bg-accent transition-colors"
                >
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{tran("profile.accounts")}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                {/* Sign out */}
                <DropdownMenuItem
                    onClick={handleSignOutSingle}
                    disabled={isSigningOut}
                    className="cursor-pointer py-2 px-2.5 rounded-lg text-xs font-medium text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-colors"
                >
                    <LogOut className="h-4 w-4 mr-2 text-destructive" />
                    <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
