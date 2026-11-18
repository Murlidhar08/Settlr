"use client";

import {
  useSystemUpdateStatus,
  useTriggerSystemUpdate,
} from "@/hooks/queries/admin-dashboard";
import { toast } from "sonner";

export function useSystemUpdate() {
  const {
    data: status,
    isLoading,
    isFetching: isChecking,
    refetch,
  } = useSystemUpdateStatus();

  const {
    mutateAsync: triggerUpdateMutation,
    isPending: isUpdating,
  } = useTriggerSystemUpdate();

  /**
   * Triggers an on-demand check for updates.
   */
  const handleCheckUpdates = async () => {
    try {
      toast.loading("Checking for updates...", { id: "check-update" });
      const res = await refetch();
      const data = res.data;

      if (!data) {
        toast.error("Failed to retrieve update status", { id: "check-update" });
        return;
      }

      if (data.error) {
        toast.error(`Check failed: ${data.error}`, { id: "check-update" });
        return;
      }

      if (data.hasUpdate) {
        toast.info(
          `New version available: v${data.latestVersion} (Current: v${data.currentVersion})`,
          { id: "check-update" }
        );
      } else {
        toast.success(
          `Application is up to date! (v${data.currentVersion})`,
          { id: "check-update" }
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to check for updates",
        { id: "check-update" }
      );
    }
  };

  /**
   * Triggers application update by calling the update webhook URL.
   */
  const handleApplyUpdate = async () => {
    try {
      toast.loading("Triggering application update webhook...", { id: "trigger-update" });
      const res = await triggerUpdateMutation();
      toast.success(res.message || "Application update triggered successfully!", {
        id: "trigger-update",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to trigger application update",
        { id: "trigger-update" }
      );
    }
  };

  const hasError = Boolean(status?.error);
  const hasUpdate = Boolean(status?.hasUpdate && !status?.error);
  const isUpToDate = Boolean(
    status && !status.hasUpdate && !status.error && status.latestVersion
  );
  const hasWebhook = Boolean(status?.hasWebhook);

  return {
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
  };
}
