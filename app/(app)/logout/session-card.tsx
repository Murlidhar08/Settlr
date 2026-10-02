"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getFileUrl } from "@/lib/utils";
import { getInitials } from "@/utility/common-function";
import { motion } from "framer-motion";
import { Loader2, LogOut } from "lucide-react";

interface SessionCardProps {
    sessionToken: string;
    isCurrent: boolean;
    isLoading: boolean;
    isSwitching?: boolean;
    ds: any;
    onSignOutSingle: (sessionToken: string, isCurrent: boolean) => Promise<void>;
    disabled: boolean;
}

export default function SessionCard({
    sessionToken,
    isCurrent,
    isLoading,
    isSwitching,
    ds,
    onSignOutSingle,
    disabled,
}: SessionCardProps) {
    const userName = ds.user?.name || ds.user?.username || "Account";
    const userEmail = ds.user?.email || "";
    const userImage = getFileUrl(ds.user?.image) || "";
    const initials = getInitials(userName);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center justify-between p-4 sm:p-5 transition-all duration-200 ${isCurrent
                ? "bg-primary/[0.03] dark:bg-primary/[0.06]"
                : "hover:bg-muted/30"
                }`}
        >
            <div className="flex items-center gap-3.5 min-w-0 pr-3">
                <div className="relative shrink-0">
                    <Avatar className={`h-11 w-11 border-2 transition-all shadow-sm ${isCurrent ? "border-primary ring-2 ring-primary/20" : "border-border/60"
                        }`}>
                        <AvatarImage src={userImage} alt={userName} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {isCurrent && (
                        <span
                            title="Active account"
                            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background ring-1 ring-emerald-500/20"
                        />
                    )}
                </div>

                <div className="flex flex-col min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm sm:text-base font-bold text-foreground truncate max-w-[180px] sm:max-w-[220px]">
                            {userName}
                        </p>
                        {isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-[220px] sm:max-w-[260px]">
                        {userEmail}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled || isLoading || isSwitching}
                    onClick={() => onSignOutSingle(sessionToken, isCurrent)}
                    className="rounded-xl px-3.5 sm:px-4 font-semibold text-xs border-border/70 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all flex items-center gap-1.5 active:scale-[0.98]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-destructive" />
                            <span>Signing out...</span>
                        </>
                    ) : (
                        <>
                            <LogOut className="w-3.5 h-3.5 text-muted-foreground group-hover:text-destructive transition-colors" />
                            <span>Sign out</span>
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
