"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { containerVariants } from "@/lib/animations";
import { useSession } from "@/lib/auth/auth-client";
import { tran } from "@/lib/languages/i18n";
import { useListSessions } from "@/tanstacks/settings";
import { motion } from "framer-motion";
import { SessionModalBody } from "./components/session-body";

export default function SessionManagementPage() {
    const { data: session, isPending: isSessionPending } = useSession();
    const { data: sessionsList = [], isLoading: isListLoading, refetch } = useListSessions();

    if (isSessionPending || isListLoading) {
        return <SessionSkeleton />;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-lg p-6 mt-4"
            >
                <SessionModalBody
                    sessions={sessionsList as any}
                    currentSessionToken={session?.session.token}
                    onUpdate={refetch}
                />
            </motion.div>
        </div>
    );
}

// @ts-ignore
function SessionSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-lg p-6 mt-6 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-28 w-full rounded-3xl" />
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                    {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-3xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}
