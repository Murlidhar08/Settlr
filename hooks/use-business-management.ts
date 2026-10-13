"use client";

import { useState } from "react";
import { toast } from "sonner";
import { tran } from "@/lib/languages/i18n";
import { useAddBusiness, useBusinessList, useUpdateBusiness } from "@/hooks/queries/business";
import type { PeriodFilter } from "@/types";

export function useBusinessManagement(initialPeriod: PeriodFilter = "month") {
  const [period, setPeriod] = useState<PeriodFilter>(initialPeriod);
  const { data: businesses, isLoading, refetch } = useBusinessList(period);

  const addBusinessMutation = useAddBusiness();
  const updateBusinessMutation = useUpdateBusiness();
  const isSubmitting = addBusinessMutation.isPending || updateBusinessMutation.isPending;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = async () => {
    if (!newName.trim() || isSubmitting) return;
    addBusinessMutation.mutate(newName, {
      onSuccess: () => {
        setNewName("");
        setIsAddOpen(false);
        toast.success(tran("business.msg.created"));
      },
      onError: (error: any) => {
        toast.error(error.message || tran("business.msg.create_failed"));
      },
    });
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim() || isSubmitting) return;
    updateBusinessMutation.mutate(
      { id, name: editName },
      {
        onSuccess: () => {
          setEditingId(null);
          toast.success(tran("business.msg.updated"));
        },
        onError: (error: any) => {
          toast.error(error.message || tran("business.msg.update_failed"));
        },
      }
    );
  };

  return {
    period,
    setPeriod,
    businesses: businesses ?? [],
    isLoading,
    refetch,
    editingId,
    setEditingId,
    editName,
    setEditName,
    isAddOpen,
    setIsAddOpen,
    newName,
    setNewName,
    handleAdd,
    handleUpdate,
    isSubmitting,
  };
}
