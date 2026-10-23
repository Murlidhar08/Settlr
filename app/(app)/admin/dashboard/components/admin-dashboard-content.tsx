"use client";

import { Button } from "@/components/ui/button";
import { useAdminDashboardState } from "@/hooks/use-admin-dashboard";
import { useSession } from "@/lib/auth/auth-client";
import { AlertCircle, RefreshCw } from "lucide-react";
import { ActiveSessionsCard } from "./active-sessions-card";
import { AdminDashboardSkeleton } from "./admin-dashboard-skeleton";
import { GrowthChart } from "./growth-chart";
import { KpiCards } from "./kpi-cards";
import { PendingApprovalsAlert } from "./pending-approvals-alert";
import { QuickNavigationGrid } from "./quick-navigation-grid";
import { RecentSignupsCard } from "./recent-signups-card";
import { SystemHealthCard } from "./system-health-card";
import { SystemUpdateCard } from "./system-update-card";

export function AdminDashboardContent() {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    timeframe,
    setTimeframe,
    searchQuery,
    setSearchQuery,
    filteredUsers,
    filteredSessions,
    activeGrowthTrend,
    handleRefresh,
    handleRevokeSession,
    handleApproveUser,
    isRevokingSession,
    isUpdatingStatus,
  } = useAdminDashboardState();
  const { data: sessionData } = useSession();

  if (isFetching || isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 max-w-md mx-auto my-16">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
          <AlertCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">Failed to Load Dashboard</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error instanceof Error ? error.message : "An unexpected error occurred while fetching admin metrics."}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          className="rounded-xl px-6 py-2.5 bg-primary text-primary-foreground font-semibold text-xs cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 space-y-8 pb-34 pt-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      {/* Pending Approvals Warning Banner */}
      <PendingApprovalsAlert
        pendingCount={data.userMetrics.pendingApproval}
      />

      {/* Primary KPI Metrics */}
      <KpiCards
        userMetrics={data.userMetrics}
        securityMetrics={data.securityMetrics}
        storageMetrics={data.storageMetrics}
      />

      {/* Visual Analytics */}
      <div>
        <GrowthChart
          data={activeGrowthTrend}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
      </div>

      {/* Quick Navigation Shortcuts */}
      <QuickNavigationGrid />

      {/* Recent Users & Active Sessions Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentSignupsCard
          users={filteredUsers}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onApproveUser={handleApproveUser}
          isUpdatingStatus={isUpdatingStatus}
        />

        <ActiveSessionsCard
          sessions={filteredSessions}
          currentSessionId={sessionData?.session?.id}
          onRevokeSession={handleRevokeSession}
          isRevokingSession={isRevokingSession}
        />
      </div>

      {/* Infrastructure Diagnostics */}
      <SystemHealthCard health={data.systemHealth} />


      {/* Application Version & Update Center */}
      <SystemUpdateCard />
    </div>
  );
}
