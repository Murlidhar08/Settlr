"use client";

import {
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
  const hasUpdate = Boolean(status?.hasUpdate);
  const isUpToDate = Boolean(status && !status.hasUpdate);

  return {
    status,
    isLoading,
    isChecking,
    isRestarting,
    isUpToDate,
    hasUpdate,
    updateResult,
    checkError,
    handleCheckUpdates,
    isConfirmOpen,
    setIsConfirmOpen,
    isLogsOpen,
    setIsLogsOpen,
  };
}
