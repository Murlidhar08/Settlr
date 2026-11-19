"use client";

import { motion } from "framer-motion";
import { MailCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tran } from "@/lib/languages/i18n";

interface DangerEmailBannerProps {
  email: string;
  onResend: () => void;
  isSubmitting: boolean;
}

export function DangerEmailBanner({
  email,
  onResend,
  isSubmitting,
}: DangerEmailBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-5 sm:p-6 rounded-[2rem] bg-emerald-500/10 border-2 border-emerald-500/20 text-foreground shadow-lg shadow-emerald-500/5 space-y-4"
    >
      <div className="flex items-start gap-4">
        <div className="size-11 sm:size-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <MailCheck size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-base text-emerald-700 dark:text-emerald-400">
            {tran("danger.email_sent_title")}
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {tran("danger.email_sent_desc", { email })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onResend}
          disabled={isSubmitting}
          className="h-10 rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs gap-2 cursor-pointer"
        >
          <RotateCcw size={14} />
          {tran("danger.resend_btn")}
        </Button>
      </div>
    </motion.div>
  );
}

