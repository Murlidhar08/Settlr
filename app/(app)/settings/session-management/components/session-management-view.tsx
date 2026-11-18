"use client";

import { motion } from "framer-motion";
import { containerVariants } from "@/lib/animations";
import { useSession } from "@/lib/auth/auth-client";
import { useListSessions } from "@/tanstacks/settings";
import { SessionModalBody } from "./session-body";
import { SessionSkeleton } from "./session-skeleton";

export function SessionManagementView() {
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
        className="mx-auto max-w-lg p-4 sm:p-6 mt-4"
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

