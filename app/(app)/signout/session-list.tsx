"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { signOutThisAccount } from "@/lib/auth/auth-client";
import { useDeviceAccounts, useRevokeDeviceAccount } from "@/hooks/queries/user";
import type { DeviceAccountItem } from "@/types";
import { AnimatePresence } from "framer-motion";
import { UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import SessionCard from "./session-card";

interface SessionListProps {
    isSigningOutAll?: boolean;
}

export default function SessionList({ isSigningOutAll = false }: SessionListProps) {
    const { data: deviceAccounts, isLoading: isListLoading, refetch } = useDeviceAccounts();
    const { mutateAsync: revokeDeviceAccount } = useRevokeDeviceAccount();

    const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

    const handleSignOutSingle = async (account: DeviceAccountItem) => {
        setLoadingSessionId(account.sessionId);
        try {
            if (account.isCurrent) {
                // Active session sign out (F1, F5)
                // signOutThisAccount revokes the active session and Better Auth promotes
                // the next session or clears the cookie.
                await signOutThisAccount();
                return;
            } else {
                // Inactive session revoke (F5, F8)
                await revokeDeviceAccount(account.sessionId);
                toast.success(`Signed out ${account.name || account.email}`);
                await refetch();
            }
        } catch (error: any) {
            console.error("Failed to sign out session:", error);
            toast.error(error?.message || "Failed to sign out account");
        } finally {
            setLoadingSessionId(null);
        }
    };

    if (isListLoading) {
        return <SessionListSkeleton />;
    }

    const accountsList = deviceAccounts || [];

    return (
        <Card className="p-0 overflow-hidden border border-border/60 shadow-lg rounded-3xl bg-card/80 backdrop-blur-sm">
            <div className="divide-y divide-border/50">
                {accountsList.length === 0 ? (
                    <div className="p-10 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto text-muted-foreground">
                            <UserX className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">No active sessions found</p>
                        <p className="text-xs text-muted-foreground">
                            You are not currently signed into any accounts on this device.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {accountsList.map((account: DeviceAccountItem) => {
                            const isLoading = loadingSessionId === account.sessionId;

                            return (
                                <SessionCard
                                    key={account.sessionId}
                                    account={account}
                                    isLoading={isLoading}
                                    onSignOutSingle={handleSignOutSingle}
                                    disabled={isSigningOutAll}
                                />
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </Card>
    );
}

function SessionListSkeleton() {
    return (
        <Card className="p-0 overflow-hidden border border-border/60 shadow-lg rounded-3xl bg-card/80 backdrop-blur-sm">
            <div className="divide-y divide-border/50">
                {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 sm:p-5">
                        <div className="flex items-center gap-3.5 min-w-0">
                            <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32 rounded-md" />
                                <Skeleton className="h-3 w-48 rounded-md" />
                            </div>
                        </div>
                        <Skeleton className="h-9 w-24 rounded-xl shrink-0" />
                    </div>
                ))}
            </div>
        </Card>
    );
}
