"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/providers/confirm-provider";
import { containerVariants, itemVariants } from "@/lib/animations";
import { authClient, signOutThisAccount, useSession } from "@/lib/auth/auth-client";
import { tran } from "@/lib/languages/i18n";
import { DangerAccountCard } from "./danger-account-card";
import { DangerDestructionCard } from "./danger-destruction-card";
import { DangerEmailBanner } from "./danger-email-banner";
import { DangerSkeleton } from "./danger-skeleton";

export function DangerView() {
  const confirm = useConfirm();
  const { data: session, isPending } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (isPending) {
    return <DangerSkeleton />;
  }

  const deleteUserAccount = async () => {
    if (isSubmitting) return;

    const confirmed = await confirm({
      title: tran("danger.confirm_delete_title"),
      description: tran("danger.delete_account_description"),
      confirmText: tran("danger.confirm_delete_button"),
      cancelText: tran("common.cancel"),
      destructive: true,
    });

    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      const data = await authClient.deleteUser({
        callbackURL: "/",
      });

      if (data.error) {
        toast.error(data?.error?.message || "Something went wrong");
      } else {
        setEmailSent(true);
        toast.success(tran("danger.msg.delete_confirmation_email_sent"));
        await signOutThisAccount();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to initiate deletion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const userEmail = session?.user?.email || "";

  return (
    <div className="min-h-screen bg-background pb-24">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl mt-6 space-y-6 sm:space-y-8 px-4 sm:px-6"
      >
        {/* SECTION HEADER */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 ml-2">
          <span className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
            <AlertOctagon size={16} />
          </span>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-destructive">
            {tran("danger.title")}
          </h3>
        </motion.div>

        {/* CURRENT ACCOUNT CARD */}
        {session?.user && (
          <motion.div variants={itemVariants}>
            <DangerAccountCard user={session.user} />
          </motion.div>
        )}

        {/* EMAIL SENT STATUS BANNER (ACTIVE IF DISPATCHED) */}
        <AnimatePresence>
          {emailSent && (
            <DangerEmailBanner
              email={userEmail}
              onResend={deleteUserAccount}
              isSubmitting={isSubmitting}
            />
          )}
        </AnimatePresence>

        {/* MAIN DESTRUCTION CARD */}
        <motion.div variants={itemVariants}>
          <DangerDestructionCard
            onDeleteAccount={deleteUserAccount}
            isSubmitting={isSubmitting}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

