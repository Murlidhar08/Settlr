"use client";

import {
  AlertTriangle,
  FileText,
  KeyRound,
  Laptop,
  Mail,
  ShieldAlert,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { tran } from "@/lib/languages/i18n";

interface DangerDestructionCardProps {
  onDeleteAccount: () => void;
  isSubmitting: boolean;
}

export function DangerDestructionCard({
  onDeleteAccount,
  isSubmitting,
}: DangerDestructionCardProps) {
  const deletionCategories = [
    {
      icon: <User className="size-5 text-rose-500" />,
      title: tran("danger.item_profile"),
      desc: tran("danger.item_profile_desc"),
    },
    {
      icon: <FileText className="size-5 text-rose-500" />,
      title: tran("danger.item_documents"),
      desc: tran("danger.item_documents_desc"),
    },
    {
      icon: <KeyRound className="size-5 text-rose-500" />,
      title: tran("danger.item_security"),
      desc: tran("danger.item_security_desc"),
    },
    {
      icon: <Laptop className="size-5 text-rose-500" />,
      title: tran("danger.item_sessions"),
      desc: tran("danger.item_sessions_desc"),
    },
  ];

  const workflowSteps = [
    {
      num: "1",
      title: tran("danger.step_1"),
      desc: tran("danger.step_1_desc"),
      icon: <AlertTriangle className="size-4 text-rose-500" />,
    },
    {
      num: "2",
      title: tran("danger.step_2"),
      desc: tran("danger.step_2_desc"),
      icon: <Mail className="size-4 text-rose-500" />,
    },
    {
      num: "3",
      title: tran("danger.step_3"),
      desc: tran("danger.step_3_desc"),
      icon: <Trash2 className="size-4 text-rose-500" />,
    },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-[2.5rem] bg-card border border-destructive/20 shadow-xl shadow-destructive/5 relative overflow-hidden group space-y-6 sm:space-y-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/5 dark:bg-destructive/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-destructive/10 transition-colors pointer-events-none" />

      {/* TOP WARNING BANNER */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 shadow-inner">
          <ShieldAlert size={28} className="animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-black text-lg sm:text-xl text-destructive tracking-tight">
            {tran("danger.irreversible_actions")}
          </h3>
          <p className="text-[11px] font-black uppercase tracking-widest text-destructive/70 italic">
            {tran("danger.permanent_deletion")}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
            {tran("danger.delete_account_description")}
          </p>
        </div>
      </div>

      {/* WHAT WILL BE DELETED BREAKDOWN GRID */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground ml-1">
          {tran("danger.what_will_be_deleted")}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {deletionCategories.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 hover:border-destructive/20 transition-all flex items-start gap-3.5"
            >
              <div className="p-2 rounded-xl bg-background border border-destructive/15 shrink-0 shadow-xs">
                {item.icon}
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-foreground">{item.title}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-STEP WORKFLOW INDICATOR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
        <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          {tran("danger.how_it_works")}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40">
              <div className="size-8 rounded-lg bg-destructive/10 text-destructive font-black text-xs flex items-center justify-center shrink-0">
                {step.num}
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-xs text-foreground block truncate">{step.title}</span>
                <span className="text-[11px] text-muted-foreground block truncate">{step.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONFIRMATION EMAIL NOTICE */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/5 border border-destructive/15">
        <Mail size={18} className="text-destructive shrink-0" />
        <p className="text-xs text-destructive font-bold leading-relaxed">
          {tran("danger.msg.delete_confirmation_email")}
        </p>
      </div>

      {/* ACTION TRIGGER BUTTON */}
      <div className="pt-2">
        <Button
          onClick={onDeleteAccount}
          disabled={isSubmitting}
          variant="destructive"
          className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-destructive/20 hover:shadow-2xl hover:shadow-destructive/30 transition-all active:scale-[0.98] cursor-pointer"
        >
          <LoadingSwap isLoading={isSubmitting} className="flex items-center justify-center gap-2">
            <Trash2 className="size-5 mr-1" />
            {tran("danger.terminate_account")}
          </LoadingSwap>
        </Button>
      </div>
    </div>
  );
}

