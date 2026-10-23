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
    isUpdating,
    isUpToDate,
    hasUpdate,
    updateResult,
    checkError,
    handleCheckUpdates,
    handleApplyUpdate,
    isConfirmOpen,
    setIsConfirmOpen,
    isLogsOpen,
    setIsLogsOpen,
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
                  v{status?.currentVersion || "0.0.1"}
                </strong>
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {updateResult && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLogsOpen(true)}
                className="h-9 px-3 text-xs font-semibold rounded-xl border-border/60 hover:bg-muted/60 transition-all cursor-pointer"
              >
                <Terminal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                View Logs
              </Button>
            )}

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

            {hasUpdate && (
              <Button
                size="sm"
                onClick={() => setIsConfirmOpen(true)}
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
                    Update Now
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
        ) : hasUpdate ? (
          <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-bold text-foreground">
                  {status?.hasVersionUpdate
                    ? `New version available: v${status.currentVersion} → v${status.latestVersion}`
                    : `New commits available on branch ${status?.branch} (${status?.currentCommit} → ${status?.latestCommit})`}
                </span>
              </div>
            </div>

            <Button
              onClick={() => setIsConfirmOpen(true)}
              disabled={isUpdating}
              className="rounded-xl px-4 py-2 text-xs font-bold bg-primary text-primary-foreground shadow-sm shrink-0 cursor-pointer self-start md:self-auto"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Updating Application...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Apply Update Now
                </>
              )}
            </Button>
          </div>
        ) : isUpToDate ? (
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-foreground font-medium">
                Your application is up to date!
              </span>
            </div>
            {status?.lastCheckedAt && (
              <span className="text-[11px] text-muted-foreground font-mono">
                Last checked: {new Date(status.lastCheckedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        ) : checkError ? (
          <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10 flex items-center justify-between gap-2 text-xs text-rose-600 dark:text-rose-400">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                Unable to check updates: {checkError instanceof Error ? checkError.message : "GitHub API request failed"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCheckUpdates}
              className="h-7 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
            >
              Retry
            </Button>
          </div>
        ) : null}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold">
              Confirm Application Update
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground space-y-2 pt-1 text-left">
              <span>
                You are about to update this application directly from the repository.
              </span>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-[11px] font-mono space-y-1">
                <div>Repo: {status?.repo}</div>
                <div>Branch: {status?.branch}</div>
                <div>
                  Version: v{status?.currentVersion} → v{status?.latestVersion}
                </div>
                <div>
                  Commit: {status?.currentCommit} → {status?.latestCommit}
                </div>
              </div>
              <span className="block pt-1 text-muted-foreground">
                This will execute:
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Pull latest commits from origin</li>
                  <li>Install dependencies (`npm install`)</li>
                  <li>Regenerate Prisma client and apply migrations</li>
                </ul>
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isUpdating}
              className="rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApplyUpdate}
              disabled={isUpdating}
              className="rounded-xl text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Applying Update...
                </>
              ) : (
                "Yes, Apply Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execution Logs Dialog */}
      <Dialog open={isLogsOpen} onOpenChange={setIsLogsOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Terminal className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Update Execution Report
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {updateResult?.success
                    ? "Update applied successfully to your server."
                    : "Update execution log and diagnostic details."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {updateResult?.success ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Updated to v{updateResult.updatedVersion} ({updateResult.updatedCommit}).
                </span>
              </div>
            ) : updateResult ? (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Update status: {updateResult.message}</span>
              </div>
            ) : null}

            {/* Terminal log window */}
            <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] leading-relaxed max-h-80 overflow-y-auto border border-border/40 select-text">
              {updateResult?.logs && updateResult.logs.length > 0 ? (
                updateResult.logs.map((line, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "py-0.5",
                      line.startsWith("►") && "text-cyan-400 font-semibold",
                      line.startsWith("✔") && "text-emerald-400 font-semibold",
                      line.startsWith("✖") && "text-rose-400 font-semibold",
                      line.startsWith("ℹ") && "text-amber-400",
                      line.startsWith("⚠") && "text-amber-300 font-medium"
                    )}
                  >
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-slate-400">No logs captured yet.</div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2 flex-wrap sm:flex-nowrap">
            {updateResult?.success && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reload Application
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setIsLogsOpen(false)}
              className="rounded-xl text-xs font-semibold bg-primary text-primary-foreground cursor-pointer"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
