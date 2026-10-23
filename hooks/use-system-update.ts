"use client";

import {
  useApplySystemUpdate,
  useRestartApplication,
  useSystemUpdateStatus,
} from "@/hooks/queries/admin-dashboard";
import type { ApplyUpdateResult } from "@/types/admin-dashboard";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useSystemUpdate() {
  const {
    data: status,
    isLoading,
    isFetching: isChecking,
    refetch,
    error: checkError,
  } = useSystemUpdateStatus();

  const applyMutation = useApplySystemUpdate();
  const restartMutation = useRestartApplication();
  const [updateResult, setUpdateResult] = useState<ApplyUpdateResult | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  /**
   * Periodically pings /api/health until the server comes back online, then reloads the page.
   */
  const pollForServerRestart = useCallback(async () => {
    setIsRestarting(true);
    toast.loading("Application is restarting. Reconnecting...", {
      id: "server-restart",
      duration: 120000,
    });

    // Wait 3 seconds for the server to initiate shutdown/restart
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const maxRetries = 40; // ~60 seconds total polling
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch("/api/health", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (response.ok) {
          toast.success("Application restarted successfully! Reloading page...", {
            id: "server-restart",
            duration: 3000,
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          return;
        }
      } catch {
        // Server is still offline/restarting, continue waiting
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    setIsRestarting(false);
    toast.info("Server may have restarted. Click 'Reload Page' to refresh.", {
      id: "server-restart",
      duration: 10000,
    });
  }, []);

  /**
   * Triggers an on-demand check for updates.
   */
  const handleCheckUpdates = async () => {
    try {
      toast.loading("Checking GitHub for updates...", { id: "check-update" });
      const res = await refetch();
      if (res.data?.hasUpdate) {
        toast.info(
          res.data.hasVersionUpdate
            ? `New version available: v${res.data.latestVersion}`
            : `New commits available on ${res.data.branch}`,
          { id: "check-update" }
        );
      } else {
        toast.success("Application is up to date!", { id: "check-update" });
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to check for updates",
        { id: "check-update" }
      );
    }
  };

  /**
   * Applies the update directly from the application and restarts the server.
   */
  const handleApplyUpdate = async () => {
    try {
      setIsConfirmOpen(false);
      toast.loading("Applying update: pulling commits, installing dependencies, and generating schema...", {
        id: "apply-update",
        duration: 180000,
      });

      const result = await applyMutation.mutateAsync({ restart: true });
      setUpdateResult(result);

      if (result.success) {
        toast.success(
          `Update complete! Updated to v${result.updatedVersion} (${result.updatedCommit}).`,
          {
            id: "apply-update",
            duration: 6000,
          }
        );

        if (result.restarting) {
          await pollForServerRestart();
        } else {
          setIsLogsOpen(true);
        }
      } else {
        toast.error(result.message || "Update encountered an error.", {
          id: "apply-update",
        });
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to apply system update",
        { id: "apply-update" }
      );
    }
  };

  /**
   * Triggers a manual application restart.
   */
  const handleManualRestart = async () => {
    try {
      toast.loading("Scheduling application restart...", { id: "manual-restart" });
      await restartMutation.mutateAsync();
      toast.dismiss("manual-restart");
      await pollForServerRestart();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to trigger server restart",
        { id: "manual-restart" }
      );
    }
  };

  const hasUpdate = Boolean(status?.hasUpdate);
  const isUpToDate = Boolean(status && !status.hasUpdate);

  return {
    status,
    isLoading,
    isChecking,
    isUpdating: applyMutation.isPending,
    isRestarting,
    isUpToDate,
    hasUpdate,
    updateResult,
    checkError,
    handleCheckUpdates,
    handleApplyUpdate,
    handleManualRestart,
    isConfirmOpen,
    setIsConfirmOpen,
    isLogsOpen,
    setIsLogsOpen,
  };
}
