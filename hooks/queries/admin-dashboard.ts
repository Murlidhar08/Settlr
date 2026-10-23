import {
  adminRevokeSession,
  applySystemUpdateAction,
  checkSystemUpdateAction,
  getAdminDashboardSummary,
  restartApplicationAction,
} from "@/actions/admin-dashboard.actions";
import { updateUserStatus } from "@/actions/admin.actions";
import { UserStatus } from "@/lib/generated/prisma/enums";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./keys";

// --- QUERIES ---

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: QUERY_KEYS.admin.dashboard,
    queryFn: async () => {
      const result = await getAdminDashboardSummary();
      if (!result.success) {
        throw new Error(result.error || "Failed to load admin dashboard");
      }
      return result.data;
    },
    staleTime: 30 * 1000, // 30 seconds fresh
    refetchInterval: 60 * 1000, // Background auto-poll every minute
  });
};

// --- MUTATIONS ---

export const useAdminRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const result = await adminRevokeSession(sessionId);
      if (!result.success) {
        throw new Error(result.error || "Failed to revoke session");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.dashboard });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.sessions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings.userSessions });
    },
  });
};

export const useAdminDashboardUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.dashboard });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users });
    },
  });
};

export const useSystemUpdateStatus = () => {
  return useQuery({
    queryKey: QUERY_KEYS.admin.systemUpdate,
    queryFn: async () => {
      const result = await checkSystemUpdateAction();
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to check for system updates");
      }
      return result.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useApplySystemUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options?: { restart?: boolean }) => {
      const result = await applySystemUpdateAction(options);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to apply system update");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.systemUpdate });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.dashboard });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings.appVersion });
    },
  });
};

export const useRestartApplication = () => {
  return useMutation({
    mutationFn: async () => {
      const result = await restartApplicationAction();
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to restart application");
      }
      return result.data;
    },
  });
};


