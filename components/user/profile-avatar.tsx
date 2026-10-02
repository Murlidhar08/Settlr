"use client";

import { authClient } from "@/lib/auth/auth-client";
import { hasRole } from "@/lib/auth/permissions";
import { UserRole } from "@/lib/generated/prisma/enums";
import { tran } from "@/lib/languages/i18n";
import { cn, getFileUrl } from "@/lib/utils";
import { useDeviceSessions, useSetActiveSession } from "@/tanstacks/user";
import { getInitials } from "@/utility/common-function";
import { LogOut, User as UserIcon, UserPlus, UserRoundCog } from "lucide-react";
import { useRouter } from "next/navigation";
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
    const { data: deviceSessions } = useDeviceSessions();
    const isAdmin = hasRole(session?.user?.role, UserRole.admin);
    const canAccessAdmin = hasRole(session?.user?.role, UserRole.admin);
    const { mutate: setActive } = useSetActiveSession();
    const router = useRouter();

    const handleSwitchAccount = (sessionToken: string) => {
        setActive(sessionToken, {
            onSuccess: () => {
                window.location.reload();
            }
        });
    }

    const handleAddAccount = () => {
        router.push("/login?add_account=1");
    }

    const handleManageProfile = () => {
        router.push("/settings/profile");
    }

    const handleLogout = () => {
        router.push("/logout");
    }

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

            <DropdownMenuContent align="end" className="w-64 p-2">
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
                        <DropdownMenuSubContent className="w-64 p-1.5 space-y-1">
                            {deviceSessions && deviceSessions.length > 0 && (
                                <>
                                    <DropdownMenuLabel className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-1">
                                        {tran("profile.switch_account")}
                                    </DropdownMenuLabel>
                                    {deviceSessions.map((ds: any) => {
                                        const isCurrent = ds.session?.token === session?.session?.token || ds.user?.id === session?.user?.id;
                                        if (isCurrent) return null;
                                        return (
                                            <DropdownMenuItem
                                                key={ds.session?.token || ds.user?.id}
                                                onClick={() => handleSwitchAccount(ds.session?.token)}
                                                className="cursor-pointer flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-accent/80 focus:bg-accent gap-2"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <Avatar className="h-7 w-7 border border-border/60 shrink-0">
                                                        <AvatarImage src={getFileUrl(ds.user?.image) || ''} className="object-cover" />
                                                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold font-mono">
                                                            {getInitials(ds.user?.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-semibold text-foreground truncate">{ds.user?.name}</span>
                                                        <span className="text-[11px] text-muted-foreground truncate">{ds.user?.email}</span>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                    <DropdownMenuSeparator className="my-1.5" />
                                </>
                            )}
                            <DropdownMenuItem
                                onClick={handleAddAccount}
                                className="cursor-pointer flex items-center gap-2 py-2 px-2.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground font-medium text-xs transition-colors"
                            >
                                <UserPlus className="h-4 w-4 text-muted-foreground" />
                                <span>{tran("profile.add_account")}</span>
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
                    <DropdownMenuItem onClick={() => router.push("/admin")} className="cursor-pointer py-2">
                        <UserRoundCog className="h-4 w-4 mr-2" />
                        <span>{tran("admin.title")}</span>
                    </DropdownMenuItem>
                ) : null}

                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer focus:text-destructive py-2">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>{tran("profile.logout")}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}