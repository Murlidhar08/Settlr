/**
 * Centralized TanStack Query Keys Factory
 * Prevents key collisions and provides type-safe query key management.
 */

export const QUERY_KEYS = {
  user: {
    all: ["users"] as const,
    current: ["current-user"] as const,
    detail: (id: string) => ["user", id] as const,
    deviceSessions: ["device-sessions"] as const,
    documents: (userId: string) => ["user-documents", userId] as const,
  },
  admin: {
    dashboard: ["admin-dashboard"] as const,
    users: ["admin-users"] as const,
    sessions: ["admin-sessions"] as const,
    appConfig: ["admin-app-config"] as const,
    systemUpdate: ["admin-system-update"] as const,
    storage: {
      all: ["storage"] as const,
      byPath: (path: string) => ["storage", path] as const,
    },
  },
  settings: {
    userSettings: ["user-settings"] as const,
    appVersion: ["app-version"] as const,
    userAccounts: ["user-accounts"] as const,
    userSessions: ["user-sessions"] as const,
    oauthProviders: ["oauth-providers"] as const,
  },
  business: {
    all: ["business-list"] as const,
    list: (period?: string) => ["business-list", period ?? "month"] as const,
    detail: (businessId: string) => ["business-details", businessId] as const,
  },
  cashbook: {
    all: ["cashbook-transactions"] as const,
    filtered: (filters: unknown, businessId?: string | null) =>
      ["cashbook-transactions", filters, businessId] as const,
  },
  dashboard: {
    userName: ["user-name"] as const,
    budgetInsights: (businessId?: string | null) =>
      ["budget-insights", businessId] as const,
    summary: (businessId?: string | null) =>
      ["dashboard-summary", businessId] as const,
    distribution: (businessId?: string | null) =>
      ["accounts-distribution", businessId] as const,
  },
  financialAccount: {
    all: ["financial-accounts"] as const,
    list: (showInactive: boolean, businessId?: string | null) =>
      ["financial-accounts", showInactive, businessId] as const,
    balance: (accountId: string, businessId?: string | null) =>
      ["financial-account", accountId, businessId] as const,
    stats: (accountId: string, period: string, businessId?: string | null) =>
      ["account-stats", accountId, period, businessId] as const,
    transactions: (
      accountId: string,
      period: string,
      search: string,
      sortBy: string,
      sortOrder: string,
      businessId?: string | null
    ) =>
      [
        "account-transactions",
        accountId,
        period,
        search,
        sortBy,
        sortOrder,
        businessId,
      ] as const,
  },
  parties: {
    all: ["party-list"] as const,
    list: (
      type: unknown,
      search?: string,
      includeInactive: boolean = false,
      period: string = "all",
      businessId?: string | null
    ) =>
      [
        "party-list",
        type,
        search,
        includeInactive,
        period,
        businessId,
      ] as const,
    detail: (partyId: string, businessId?: string | null) =>
      ["party-detail", partyId, businessId] as const,
    transactions: (
      partyId: string,
      period: string = "all",
      businessId?: string | null
    ) => ["party-transactions", partyId, period, businessId] as const,
  },
  transaction: {
    detail: (transactionId: string) =>
      ["transaction-detail", transactionId] as const,
  },
} as const;

export type QueryKeys = typeof QUERY_KEYS;
