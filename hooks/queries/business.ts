"use client";

import {
  addBusiness,
  deleteBusiness,
  getBusinessDetailsWithStats,
  getBusinessList,
  switchBusiness,
  updateBusiness,
} from "@/actions/business.actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./keys";

export const useBusinessList = () => {
  return useQuery({
    queryKey: QUERY_KEYS.business.all,
    queryFn: () => getBusinessList(),
  });
};

export const useBusinessDetails = (businessId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.business.detail(businessId),
    queryFn: () => getBusinessDetailsWithStats(businessId),
    enabled: !!businessId,
  });
};

export const useAddBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => addBusiness(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.business.all });
    },
  });
};

export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      businessId,
      name,
    }: {
      id?: string;
      businessId?: string;
      name: string;
    }) => {
      const targetId = (businessId || id) as string;
      return updateBusiness(targetId, name);
    },
    onSuccess: (_, variables) => {
      const targetId = (variables.businessId || variables.id) as string;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.business.all });
      if (targetId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.business.detail(targetId),
        });
      }
    },
  });
};

export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (businessId: string) => deleteBusiness(businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.business.all });
    },
  });
};

export const useSwitchBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      businessId,
      redirectTo,
    }: {
      businessId: string;
      redirectTo?: string | null;
    }) => switchBusiness(businessId, redirectTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.business.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.current });
    },
  });
};
