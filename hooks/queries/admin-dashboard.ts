import {
  adminRevokeSession,
  getAdminDashboardSummary,
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
