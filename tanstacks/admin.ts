import {
    comprehensiveDeleteUser,
    getAdminUsers,
    updateUserStatus
} from "@/actions/admin.actions";
import { getAdminAppConfig, testSmtpConfig, updateAppConfig } from "@/actions/admin/app-config";
import { UserStatus } from "@/lib/generated/prisma/enums";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./keys";

// --- QUERIES (READ) ---

export const useAdminUsers = () => {
    return useQuery({
        queryKey: QUERY_KEYS.admin.users,
        queryFn: () => getAdminUsers(),
    });
};

export const useAppConfig = () => {
    return useQuery({
        queryKey: QUERY_KEYS.admin.appConfig,
        queryFn: () => getAdminAppConfig(),
    });
};

// --- MUTATIONS (CREATE / UPDATE / DELETE) ---

export const useUpdateAppConfig = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Parameters<typeof updateAppConfig>[0]) => updateAppConfig(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.appConfig });
        },
    });
};

export const useTestSmtpConfig = () => {
    return useMutation({
        mutationFn: (data: Parameters<typeof testSmtpConfig>[0]) => testSmtpConfig(data),
    });
};

export const useComprehensiveDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => comprehensiveDeleteUser(userId),
        onSuccess: (_data, userId) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.detail(userId) });
        },
    });
};

export const useUpdateUserStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
            updateUserStatus(userId, status),
        onSuccess: (_data, { userId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.detail(userId) });
        },
    });
};
