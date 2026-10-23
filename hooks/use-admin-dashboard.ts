"use client";

import {
  useAdminDashboard,
  useAdminDashboardUpdateStatus,
  useAdminRevokeSession,
} from "@/hooks/queries/admin-dashboard";
import { UserStatus } from "@/lib/generated/prisma/enums";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export type DashboardTimeframe = "14d" | "6m";
export type DashboardTab = "overview" | "users" | "sessions" | "system";

export function useAdminDashboardState() {
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminDashboard();
  const revokeSessionMutation = useAdminRevokeSession();
  const updateStatusMutation = useAdminDashboardUpdateStatus();

  const [timeframe, setTimeframe] = useState<DashboardTimeframe>("14d");
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter recent users based on search query
  const filteredUsers = useMemo(() => {
    if (!data?.recentUsers) return [];
    if (!searchQuery.trim()) return data.recentUsers;

    const query = searchQuery.toLowerCase();
    return data.recentUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
    );
  }, [data?.recentUsers, searchQuery]);

  // Filter active sessions based on search query
  const filteredSessions = useMemo(() => {
    if (!data?.recentSessions) return [];
    if (!searchQuery.trim()) return data.recentSessions;

    const query = searchQuery.toLowerCase();
    return data.recentSessions.filter(
      (session) =>
        session.userName?.toLowerCase().includes(query) ||
        session.userEmail?.toLowerCase().includes(query) ||
        session.ipAddress?.toLowerCase().includes(query) ||
        session.userAgent?.toLowerCase().includes(query)
    );
  }, [data?.recentSessions, searchQuery]);

  // Active growth trend dataset based on selected timeframe
  const activeGrowthTrend = useMemo(() => {
    if (!data?.growthTrends) return [];
    return timeframe === "14d" ? data.growthTrends.daily14d : data.growthTrends.monthly6m;
  }, [data?.growthTrends, timeframe]);

  // Manual refresh with user feedback
  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Admin dashboard metrics updated");
    } catch {
      toast.error("Failed to refresh admin dashboard");
    }
  };

  // Quick session revocation with notification
  const handleRevokeSession = async (sessionId: string, userName: string) => {
    toast.promise(revokeSessionMutation.mutateAsync(sessionId), {
      loading: `Revoking session for ${userName}...`,
      success: `Session for ${userName} revoked successfully`,
      error: "Failed to revoke session",
    });
  };

  // Quick user approval from dashboard
  const handleApproveUser = async (userId: string, userName: string) => {
    toast.promise(
      updateStatusMutation.mutateAsync({ userId, status: UserStatus.approved }),
      {
        loading: `Approving ${userName}...`,
        success: `${userName} approved successfully`,
        error: "Failed to approve user",
      }
    );
  };

  return {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    timeframe,
    setTimeframe,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filteredUsers,
    filteredSessions,
    activeGrowthTrend,
    handleRefresh,
    handleRevokeSession,
    handleApproveUser,
    isRevokingSession: revokeSessionMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}
