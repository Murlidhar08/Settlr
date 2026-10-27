"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PendingApprovalsAlertProps {
  pendingCount: number;
}

export function PendingApprovalsAlert({ pendingCount }: PendingApprovalsAlertProps) {
  if (pendingCount <= 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-foreground">
              {pendingCount} {pendingCount === 1 ? "User" : "Users"} Awaiting Registration Approval
            </h4>
            <p className="text-xs text-muted-foreground">
              New accounts in <code className="text-amber-600 dark:text-amber-400 font-semibold font-mono">pendingapproval</code> status cannot sign in or interact with the application until verified.
            </p>
          </div>
        </div>

        <Link href="/admin/user">
          <Button
            size="sm"
            className="h-9 px-4 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            Review & Approve
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
