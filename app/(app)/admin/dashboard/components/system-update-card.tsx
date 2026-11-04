"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSystemUpdate } from "@/hooks/use-system-update";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  GitBranch,
  GitCommit,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Terminal,
} from "lucide-react";

export function SystemUpdateCard() {
  const {
    status,
    isLoading,
    isChecking,
    isUpToDate,
    hasUpdate,
    handleCheckUpdates,
  } = useSystemUpdate();

  return (
    <>
      <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs space-y-4">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <GitBranch className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                Application Version & Updates
              </h3>
              {hasUpdate && (
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-semibold animate-pulse">
                  Update Available
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center flex-wrap gap-2 pt-0.5">
              <span>
                Current Version:{" "}
                <strong className="text-foreground font-mono">
                  v{status?.currentVersion || "-"}
                </strong>
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckUpdates}
              disabled={isChecking}
              className="h-9 px-3 text-xs font-semibold rounded-xl border-border/60 hover:bg-muted/60 transition-all cursor-pointer"
            >
              <RefreshCw
                className={cn(
                  "h-3.5 w-3.5 mr-1.5",
                  isChecking && "animate-spin text-primary"
                )}
              />
              {isChecking ? "Checking..." : "Check for Updates"}
            </Button>
          </div>
        </div>

        {/* Content body based on status */}
        {isLoading ? (
          <div className="h-16 rounded-xl bg-muted/20 animate-pulse border border-border/40 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Checking update status...</span>
          </div>
        ) : hasUpdate ? (
          <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-bold text-foreground">
                  {status?.hasUpdate
                    ? `Update available: v${status.currentVersion} → v${status.latestVersion}`
                    : `You're running the latest version`}
                </span>
              </div>
            </div>
          </div>
        ) : isUpToDate ? (
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-foreground font-medium">
                Your application is up to date!
              </span>
            </div>
            {status?.checkedAt && (
              <span className="text-[11px] text-muted-foreground font-mono">
                Last checked: {new Date(status.checkedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
