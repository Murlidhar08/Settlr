"use client";

import { useState, useMemo, useCallback } from "react";
import { useAdminUsers } from "@/hooks/queries/admin";
import { hasRole } from "@/lib/auth/permissions";
import type { UserListItem, UserStats } from "@/types/user";

export interface UseUserManagementReturn {
  // Raw and filtered lists
  users: UserListItem[];
  filteredUsers: UserListItem[];
  isLoading: boolean;
  refetch: () => void;

  // Filter state & setters
  search: string;
  setSearch: (value: string) => void;
  filterRole: string;
  setFilterRole: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterVerified: string;
  setFilterVerified: (value: string) => void;

  // Flags & Helpers
  isFilterApplied: boolean;
  resetFilters: () => void;
  stats: UserStats;
}

/**
 * Custom hook isolating user listing, filtering, search, and statistics calculations
 * from the UI presentation components.
 */
export function useUserManagement(): UseUserManagementReturn {
  const { data: usersData, isLoading, refetch } = useAdminUsers();

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterVerified, setFilterVerified] = useState<string>("all");

  const users: UserListItem[] = useMemo(() => {
    return (usersData as UserListItem[]) || [];
  }, [usersData]);

  // Calculate high-level stats
  const stats: UserStats = useMemo(() => {
    const totalUsers = users.length;
    const adminUsers = users.filter((u) => hasRole(u.role, "admin")).length;
    const bannedUsers = users.filter((u) => Boolean(u.banned)).length;
    const activeUsers = totalUsers - bannedUsers;

    return {
      totalUsers,
      adminUsers,
      bannedUsers,
      activeUsers,
    };
  }, [users]);

  // Compute filtered dataset
  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name?.toLowerCase().includes(normalizedSearch) ||
        user.email?.toLowerCase().includes(normalizedSearch);

      const matchesRole =
        filterRole === "all" || hasRole(user.role, filterRole as any);

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "banned" ? Boolean(user.banned) : !user.banned);

      const matchesVerified =
        filterVerified === "all" ||
        (filterVerified === "verified"
          ? Boolean(user.emailVerified)
          : !user.emailVerified);

      return matchesSearch && matchesRole && matchesStatus && matchesVerified;
    });
  }, [users, search, filterRole, filterStatus, filterVerified]);

  const isFilterApplied = useMemo(() => {
    return (
      search.trim() !== "" ||
      filterRole !== "all" ||
      filterStatus !== "all" ||
      filterVerified !== "all"
    );
  }, [search, filterRole, filterStatus, filterVerified]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setFilterRole("all");
    setFilterStatus("all");
    setFilterVerified("all");
  }, []);

  return {
    users,
    filteredUsers,
    isLoading,
    refetch,
    search,
    setSearch,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    filterVerified,
    setFilterVerified,
    isFilterApplied,
    resetFilters,
    stats,
  };
}
