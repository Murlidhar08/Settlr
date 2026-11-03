import { Currency, ThemeMode, UserStatus } from "@/lib/generated/prisma/client";

/**
 * Preferences and locale settings for an authenticated user.
 */
export interface UserSettingsInput {
  dateFormat?: string;
  timeFormat?: string;
  language?: string;
  theme?: ThemeMode;
  currency?: Currency;
  currencySymbol?: string;
  locale?: string;
  debug?: boolean;
}

/**
 * Summary user model for administrative user lists.
 */
export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role?: string | null;
  roles: string[];
  status?: UserStatus | null;
  banned?: boolean | null;
  image?: string | null;
  createdAt: Date;
  contactNo?: string | null;
  businessCount?: number;
  transactionCount?: number;
  emailVerified?: boolean;
}

/**
 * Aggregated user counts and statistics for admin dashboards.
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  adminUsers: number;
}

/**
 * Opaque device account descriptor for safe multi-session switching.
 */
export interface DeviceAccountItem {
  sessionId: string;
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  status: UserStatus;
  role: string;
  isCurrent: boolean;
  isBanned: boolean;
  isSuspended: boolean;
  isPending: boolean;
  isImpersonated: boolean;
  createdAt: Date;
  expiresAt: Date;
}
