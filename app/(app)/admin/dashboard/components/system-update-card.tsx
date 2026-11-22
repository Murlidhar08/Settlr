"use client";

import { useConfirm } from "@/components/providers/confirm-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSystemUpdate } from "@/hooks/use-system-update";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  GitBranch,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export function SystemUpdateCard() {
  const confirm = useConfirm();
  const {
    status,
    isLoading,
    isChecking,
    isUpdating,
    isUpToDate,
    hasUpdate,
    hasError,
    hasWebhook,
    handleCheckUpdates,
    handleApplyUpdate,
  } = useSystemUpdate();

  const handleApplicationUpdate = async () => {
    const isConfirmed = await confirm({
      title: "Update Application",
      description: (
        <div className="space-y-3 py-2 text-xs text-muted-foreground">
          <p>
            Are you sure you want to trigger the application update?
          </p>
          <div className="rounded-xl border border-border/60 bg-muted/40 p-3 space-y-1 font-mono text-[11px] text-foreground">
            <div>Current Version: v{status?.currentVersion || "-"}</div>
            <div>Target Version: v{status?.latestVersion || "-"}</div>
          </div>
          <p>
            An API call will be made to the configured update webhook URL to pull and apply the latest release.
          </p>
        </div>
      ),
      confirmText: "Update",
    });

    if (!isConfirmed) return;

    handleApplyUpdate();
  };

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
            <p className="text-xs text-muted-foreground flex items-center flex-wrap gap-3 pt-0.5">
              <span>
                Current Version:{" "}
                <strong className="text-foreground font-mono">
                  v{status?.currentVersion || "-"}
                </strong>
              </span>
              {status?.latestVersion ? (
                <span>
                  Latest Version:{" "}
                  <strong className="text-foreground font-mono">
                    v{status.latestVersion}
                  </strong>
                </span>
              ) : null}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckUpdates}
              disabled={isChecking || isUpdating}
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

            {hasUpdate && hasWebhook && (
              <Button
                size="sm"
                onClick={handleApplicationUpdate}
                disabled={isUpdating}
                className="h-9 px-3.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Update Application
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Content body based on status */}
        {isLoading ? (
          <div className="h-16 rounded-xl bg-muted/20 animate-pulse border border-border/40 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Checking update status...</span>
          </div>
        ) : hasError ? (
          <div className="p-4 rounded-xl border border-destructive/25 bg-destructive/5 dark:bg-destructive/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <div className="space-y-0.5">
                <span className="font-bold">Failed to fetch latest version:</span>
                <p className="text-muted-foreground">{status?.error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={handleCheckUpdates}
              disabled={isChecking}
              className="px-3 rounded-lg self-start sm:self-auto shrink-0 cursor-pointer"
            >
              Retry
            </Button>
          </div>
        ) : hasUpdate ? (
          <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-bold text-foreground">
                  Update available: v{status?.currentVersion || "-"} → v{status?.latestVersion || "-"}
                </span>
                {status?.source && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                    {status.source}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground pl-8">
                {hasWebhook
                  ? "Click Update Application to trigger the deployment webhook."
                  : "An update is available, but no update webhook URL is configured in the environment (UPDATE_WEBHOOK_URL)."}
              </p>
            </div>
          </div>
        ) : isUpToDate ? (
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-foreground font-medium">
                Your application is up to date! (v{status?.currentVersion || "-"})
              </span>
              {status?.source && (
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  • Verified via {status.source}
                </span>
              )}
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
