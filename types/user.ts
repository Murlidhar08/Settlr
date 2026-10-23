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
