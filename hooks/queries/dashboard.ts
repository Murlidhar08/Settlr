"use client";

import {
  getAccountsDistribution,
  getDashboardSummary,
  getFirstName,
} from "@/actions/dashboard.actions";
import { getBudgetInsights } from "@/actions/transaction.actions";
import { useSession } from "@/lib/auth/auth-client";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "./keys";

export const useFirstName = () => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.userName,
    queryFn: () => getFirstName(),
  });
};

export const useBudgetInsights = () => {
  const { data: session } = useSession();
  const businessId = session?.user?.activeBusinessId;

  return useQuery({
    queryKey: QUERY_KEYS.dashboard.budgetInsights(businessId),
    queryFn: () => getBudgetInsights(),
  });
};

export const useDashboardSummary = () => {
  const { data: session } = useSession();
  const businessId = session?.user?.activeBusinessId;
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.summary(businessId),
    queryFn: () => getDashboardSummary(businessId),
  });
};

export const useAccountsDistribution = () => {
  const { data: session } = useSession();
  const businessId = session?.user?.activeBusinessId;
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.distribution(businessId),
    queryFn: () => getAccountsDistribution(businessId),
  });
};
