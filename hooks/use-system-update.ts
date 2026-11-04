"use client";

import { useState } from "react";
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
      toast.loading("Checking GitHub for updates...", { id: "check-update" });
      const res = await refetch();
      if (res.data?.hasUpdate) {
        toast.info(
          `New version available: v${res.data.latestVersion}`,
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

  const hasUpdate = Boolean(status?.hasUpdate);
  const isUpToDate = Boolean(status && !status.hasUpdate);
  const hasWebhook = Boolean(status?.hasWebhook);

  return {
    status,
    isLoading,
    isChecking,
    isUpdating,
    isUpToDate,
    hasUpdate,
    hasWebhook,
    handleCheckUpdates,
    handleApplyUpdate,
  };
}
