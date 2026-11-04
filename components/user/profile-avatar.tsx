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
    DropdownMenuTrigger
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
            }
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
                    <div
                        className={cn(
                            "rounded-full transition-all cursor-pointer inline-block",
                            isAdmin
                                ? "p-[3.5px] bg-[conic-gradient(from_315deg,#EA4335_0deg_90deg,#4285F4_90deg_180deg,#34A853_180deg_270deg,#FBBC05_270deg_360deg)] shadow-lg"
                                : "p-0"
                        )}
                    >
                        <div className={cn("rounded-full", isAdmin ? "p-0.5 bg-background" : "")}>
                            <Avatar
                                className={cn(
                                    "h-8 w-8 sm:h-9 sm:w-9 transition-all",
                                    !isAdmin && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background shadow-lg hover:ring-primary/50"
                                )}
                            >
                                <AvatarImage src={getFileUrl(session?.user?.image) || ''} className="object-cover" />
                                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold font-mono">
                                    {getInitials(session?.user?.name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                }
            />

            <DropdownMenuContent align="end" className="w-68 p-2">
                <DropdownMenuGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="w-full flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent transition-colors">
                            <div className="flex flex-col space-y-1 text-left min-w-0 pr-2">
                                <p className="text-sm font-medium leading-none truncate">{session?.user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground truncate">
                                    {session?.user?.email}
                                </p>
                            </div>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-72 p-1.5 space-y-1">
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
                                                onClick={() => handleSwitchAccount(account.sessionId, account.isBanned, account.isSuspended)}
                                                className={cn(
                                                    "cursor-pointer flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-accent/80 focus:bg-accent gap-2",
                                                    (account.isBanned || account.isSuspended) && "opacity-60 cursor-not-allowed hover:bg-transparent"
                                                )}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <Avatar className="h-7 w-7 border border-border/60 shrink-0">
                                                        <AvatarImage src={getFileUrl(account.image) || ''} className="object-cover" />
                                                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold font-mono">
                                                            {getInitials(account.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-semibold text-foreground truncate">{account.name}</span>
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
                                                        <span className="text-[11px] text-muted-foreground truncate">{account.email}</span>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                    <DropdownMenuSeparator className="my-1.5" />
                                </>
                            )}
                            <DropdownMenuItem
                                disabled={isAtLimit}
                                onClick={handleAddAccount}
                                title={isAtLimit ? `Maximum accounts limit (${MAX_ACCOUNTS}) reached. Sign out of an account to add another.` : undefined}
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
                                        <span className="text-[10px] text-muted-foreground">Limit reached ({MAX_ACCOUNTS}/{MAX_ACCOUNTS})</span>
                                    )}
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleManageProfile} className="cursor-pointer py-2">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span>{tran("profile.manage_profile")}</span>
                </DropdownMenuItem>

                {canAccessAdmin ? (
                    <DropdownMenuItem onClick={() => router.push("/admin/dashboard")} className="cursor-pointer py-2">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        <span>{tran("admin.dashboard.title")}</span>
                    </DropdownMenuItem>
                ) : null}

                <DropdownMenuItem onClick={() => router.push("/signout")} className="cursor-pointer py-2 text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Manage accounts</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleSignOutSingle}
                    disabled={isSigningOut}
                    className="cursor-pointer focus:text-destructive py-2 text-destructive font-medium"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
