"use client";

import {
  addParties,
  deleteParty,
  getPartyDetails,
  getPartyList,
  getPartyTransactions,
  updateParty,
} from "@/actions/parties.actions";
import { useSession } from "@/lib/auth/auth-client";
import { PartyType } from "@/lib/generated/prisma/enums";
import { PartyInput } from "@/types/party";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./keys";

export const useParties = (
  type: PartyType,
  search?: string,
  includeInactive: boolean = false,
  period: "month" | "year" | "all" = "all"
) => {
  const { data: session } = useSession();
  const businessId = session?.user?.activeBusinessId;

  return useQuery({
    queryKey: QUERY_KEYS.parties.list(
      type,
      search,
      includeInactive,
      period,
      businessId
    ),
    queryFn: () => getPartyList(type, search, includeInactive, period),
  });
};

export const usePartyDetails = (partyId: string) => {
  const { data: session } = useSession();
  const businessId = session?.user?.activeBusinessId;

  return useQuery({
    queryKey: QUERY_KEYS.parties.detail(partyId, businessId),
    queryFn: () => getPartyDetails(partyId),
    enabled: !!partyId,
  });
};

export const usePartyTransactions = (
  partyId: string,
  period: "month" | "year" | "all" = "all"
) => {
  const { data: session } = useSession();
  const businessId = session?.user?.activeBusinessId;

  return useQuery({
    queryKey: QUERY_KEYS.parties.transactions(partyId, period, businessId),
    queryFn: () => getPartyTransactions(partyId, period),
    enabled: !!partyId,
  });
};

export const useAddParty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PartyInput) => addParties(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parties.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.financialAccount.all,
      });
    },
  });
};

export const useUpdateParty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      partyId,
      data,
    }: {
      partyId: string;
      data: Partial<PartyInput>;
    }) => updateParty(partyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parties.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.parties.detail(variables.partyId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.financialAccount.all,
      });
    },
  });
};

export const useDeleteParty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partyId: string) => deleteParty(partyId),
    onSuccess: (_, partyId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parties.all });
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.parties.detail(partyId),
      });
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.parties.transactions(partyId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.financialAccount.all,
      });
    },
  });
};
