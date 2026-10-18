"use client";

import {
  addTransaction,
  deleteTransaction,
  getCashbookTransactions,
  getTransactionDetail,
} from "@/actions/transaction.actions";
import { useSession } from "@/lib/auth/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./keys";

export const useCashbook = (filters: {
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { data: session } = useSession();
  const businessId = session?.user?.activeBusinessId;

  return useQuery({
    queryKey: QUERY_KEYS.cashbook.filtered(filters, businessId),
    queryFn: () => getCashbookTransactions(filters),
  });
};

export const useTransactionDetail = (transactionId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.transaction.detail(transactionId),
    queryFn: () => getTransactionDetail(transactionId),
    enabled: !!transactionId,
  });
};

export const useAddTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      pathToRevalidate,
    }: {
      data: any;
      pathToRevalidate?: string;
    }) => addTransaction(data, pathToRevalidate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.financialAccount.all,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cashbook.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["budget-insights"] });
      queryClient.invalidateQueries({ queryKey: ["accounts-distribution"] });
      if (variables.data.partyId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.parties.detail(variables.data.partyId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.parties.transactions(variables.data.partyId),
        });
      }
      if (variables.data.fromAccountId)
        queryClient.invalidateQueries({
          queryKey: ["financial-account", variables.data.fromAccountId],
        });
      if (variables.data.toAccountId)
        queryClient.invalidateQueries({
          queryKey: ["financial-account", variables.data.toAccountId],
        });
      if (variables.data.id)
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.transaction.detail(variables.data.id),
        });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      redirectPath,
    }: {
      id: string;
      redirectPath?: string;
    }) => deleteTransaction(id, redirectPath),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.financialAccount.all,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cashbook.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["budget-insights"] });
      queryClient.invalidateQueries({ queryKey: ["accounts-distribution"] });
      queryClient.invalidateQueries({ queryKey: ["party-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["account-transactions"] });
    },
  });
};
