"use client";

import {
  addFinancialAccount,
  getFinancialAccountBalance,
  getFinancialAccounts,
  updateFinancialAccount,
} from "@/actions/financial-account.actions";
import {
  getAccountStats,
  getAccountTransactions,
} from "@/actions/transaction.actions";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "@/lib/auth/auth-client";
import { QUERY_KEYS } from "./keys";

export const useFinancialAccounts = (showInactive: boolean) => {
  const { data: session } = useSession();
  const businessId = session?.user?.activeBusinessId;

  const res = useQuery({
    queryKey: QUERY_KEYS.financialAccount.list(showInactive, businessId),
    queryFn: () => getFinancialAccounts(showInactive),
  });

  return {
    allAccounts: res.data,
    isLoading: res.isLoading,
    isError: res.isError,
    error: res.error,
  };
};

export const useFinancialAccountBalance = (accountId: string) => {
  const { data: session } = useSession();
  const businessId = session?.user?.activeBusinessId;

  const res = useQuery({
    queryKey: QUERY_KEYS.financialAccount.balance(accountId, businessId),
    queryFn: () => getFinancialAccountBalance(accountId),
  });

  return {
    balance: res.data,
    isLoading: res.isLoading,
    isError: res.isError,
    error: res.error,
  };
};

export const useAccountStats = (
  accountId: string,
  period: "month" | "year" | "all" = "all"
) => {
  const { data: session } = useSession();
  const businessId = session?.user?.activeBusinessId;

  return useQuery({
    queryKey: QUERY_KEYS.financialAccount.stats(accountId, period, businessId),
    queryFn: () => getAccountStats(accountId, period),
    enabled: !!accountId,
  });
};

export const useAccountTransactions = (
  accountId: string,
  period: "month" | "year" | "all" = "all",
  search: string = "",
  sortBy: "date" | "title" | "price" = "date",
  sortOrder: "asc" | "desc" = "desc"
) => {
  const { data: session } = useSession();
  const businessId = session?.user?.activeBusinessId;

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.financialAccount.transactions(
      accountId,
      period,
      search,
      sortBy,
      sortOrder,
      businessId
    ),
    queryFn: ({ pageParam = 1 }) =>
      getAccountTransactions(
        accountId,
        { page: pageParam as number, limit: 20 },
        period,
        search,
        sortBy,
        sortOrder
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.length * 20;
      return loadedCount < lastPage.totalTransactions
        ? allPages.length + 1
        : undefined;
    },
    enabled: !!accountId,
  });
};

export const useAddFinancialAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof addFinancialAccount>[0]) =>
      addFinancialAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.financialAccount.all,
      });
      queryClient.invalidateQueries({ queryKey: ["accounts-distribution"] });
    },
  });
};

export const useUpdateFinancialAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateFinancialAccount>[1];
    }) => updateFinancialAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.financialAccount.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["financial-account", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["accounts-distribution"] });
    },
  });
};
