import {
  getAppVersion,
  getEnabledOAuthProviders,
  getListSessions,
  getListUserAccounts,
  getUserSettings,
  upsertUserSettings,
} from "@/actions/user-settings.actions";
import type { UserSettingsInput } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./keys";

// --- QUERIES (READ) ---

export const useAppVersion = () => {
  return useQuery({
    queryKey: QUERY_KEYS.settings.appVersion,
    queryFn: () => getAppVersion(),
  });
};

export const useUserSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.settings.userSettings,
    queryFn: () => getUserSettings(),
  });
};

export const useListUserAccounts = () => {
  return useQuery({
    queryKey: QUERY_KEYS.settings.userAccounts,
    queryFn: () => getListUserAccounts(),
  });
};

export const useListSessions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.settings.userSessions,
    queryFn: () => getListSessions(),
  });
};

export const useEnabledOAuthProviders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.settings.oauthProviders,
    queryFn: () => getEnabledOAuthProviders(),
  });
};

// --- MUTATIONS (CREATE / UPDATE / DELETE) ---

export const useUpsertUserSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserSettingsInput) => upsertUserSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings.userSettings });
    },
  });
};
