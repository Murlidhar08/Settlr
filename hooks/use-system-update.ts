"use client";

import {
  useApplySystemUpdate,
  useSystemUpdateStatus,
} from "@/hooks/queries/admin-dashboard";
import type { ApplyUpdateResult } from "@/types/admin-dashboard";
import { useState } from "react";
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
  const [updateResult, setUpdateResult] = useState<ApplyUpdateResult | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

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
   * Applies the update directly from the application.
   */
  const handleApplyUpdate = async () => {
    try {
      setIsConfirmOpen(false);
      toast.loading("Applying update: pulling commits and syncing dependencies...", {
        id: "apply-update",
        duration: 120000,
      });

      const result = await applyMutation.mutateAsync();
      setUpdateResult(result);

      if (result.success) {
        toast.success(
          `Successfully updated to v${result.updatedVersion} (${result.updatedCommit})!`,
          {
            id: "apply-update",
            duration: 8000,
          }
        );
        setIsLogsOpen(true);
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

  const hasUpdate = Boolean(status?.hasUpdate);
  const isUpToDate = Boolean(status && !status.hasUpdate);

  return {
    status,
    isLoading,
    isChecking,
    isUpdating: applyMutation.isPending,
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
  };
}
