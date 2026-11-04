"use client";

import {
  useSystemUpdateStatus,
} from "@/hooks/queries/admin-dashboard";
import { toast } from "sonner";

export function useSystemUpdate() {
  const {
    data: status,
    isLoading,
    isFetching: isChecking,
    refetch,
  } = useSystemUpdateStatus();

  /**
   * Triggers an on-demand check for updates.
   */
  const handleCheckUpdates = async () => {
    try {
      toast.loading("Checking GitHub for updates...", { id: "check-update" });
      const res = await refetch();
      if (res.data?.hasUpdate) {
        toast.info(res.data.hasUpdate
          ? `New version available: v${res.data.latestVersion}`
          : `New version available`,
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
    isUpToDate,
    hasUpdate,
    handleCheckUpdates
  };
}
