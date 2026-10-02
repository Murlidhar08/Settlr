"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient, useSession } from "@/lib/auth/auth-client";
import { useDeviceSessions, useRevokeSession, useSetActiveSession } from "@/tanstacks/user";
import { AnimatePresence } from "framer-motion";
import { UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import SessionCard from "./session-card";

interface SessionListProps {
    isSigningOutAll?: boolean;
}

export default function SessionList({ isSigningOutAll = false }: SessionListProps) {
    const router = useRouter();
    const { data: currentSessionData, isPending: isSessionPending } = useSession();
    const { data: deviceSessions, isLoading: isListLoading, refetch } = useDeviceSessions();
    const { mutateAsync: revokeSession } = useRevokeSession();
    const { mutateAsync: setActive } = useSetActiveSession();

    const [loadingToken, setLoadingToken] = useState<string | null>(null);
    const [switchingToken, setSwitchingToken] = useState<string | null>(null);

    const handleSignOutSingle = async (sessionToken: string, isCurrent: boolean) => {
        setLoadingToken(sessionToken);
        try {
            if (isCurrent) {
                const remaining = (deviceSessions || []).filter(
                    (ds: any) => ds.session?.token !== sessionToken
                );
                if (remaining.length > 0 && remaining[0]?.session?.token) {
                    await revokeSession(sessionToken);
                    await setActive(remaining[0].session.token);
                    toast.success(
                        `Switched to ${remaining[0].user?.name || remaining[0].user?.email || "next account"}`
                    );
                    router.push("/dashboard");
                    window.location.reload();
                    return;
                } else {
                    await authClient.signOut();
                    toast.success("Signed out successfully");
                    router.push("/login");
                    return;
                }
            } else {
                await revokeSession(sessionToken);
                toast.success("Account signed out");
                await refetch();
            }
        } catch (error: any) {
            console.error("Failed to sign out session:", error);
            toast.error(error?.message || "Failed to sign out session");
        } finally {
            setLoadingToken(null);
        }
    };

    if (isSessionPending || isListLoading) {
        return <SessionListSkeleton />;
    }

    const currentToken = currentSessionData?.session?.token;
    const currentUserId = currentSessionData?.user?.id;
    const sessionsList = deviceSessions || [];

    return (
        <Card className="p-0 overflow-hidden border border-border/60 shadow-lg rounded-3xl bg-card/80 backdrop-blur-sm">
            <div className="divide-y divide-border/50">
                {sessionsList.length === 0 ? (
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
                        {sessionsList.map((ds: any, index: number) => {
                            const sessionToken = ds.session?.token;
                            const isCurrent =
                                Boolean(sessionToken && sessionToken === currentToken) ||
                                Boolean(ds.user?.id && ds.user.id === currentUserId);
                            const isLoading = loadingToken === sessionToken;
                            const isSwitching = switchingToken === sessionToken;

                            return (
                                <SessionCard
                                    key={sessionToken || ds.session?.id || index}
                                    sessionToken={sessionToken}
                                    isCurrent={isCurrent}
                                    isLoading={isLoading}
                                    isSwitching={isSwitching}
                                    ds={ds}
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
