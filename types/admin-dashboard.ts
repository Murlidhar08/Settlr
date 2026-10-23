import { UserStatus } from "@/lib/generated/prisma/client";

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  pendingApproval: number;
  suspendedUsers: number;
  bannedUsers: number;
  adminCount: number;
  moderatorCount: number;
  regularUserCount: number;
  verifiedEmailsCount: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  growthPercentage: number;
}

export interface SecurityMetrics {
  activeSessionsCount: number;
  twoFactorUsersCount: number;
  passkeyUsersCount: number;
  twoFactorAdoptionRate: number;
}

export interface DocumentTypeCount {
  type: string;
  count: number;
}

export interface StorageMetrics {
  totalDocuments: number;
  documentsByType: DocumentTypeCount[];
}

export type HealthStatus = "healthy" | "degraded" | "down";

export interface SystemHealth {
  database: HealthStatus;
  databaseLatencyMs: number;
  smtpConfigured: boolean;
  oauthGoogleConfigured: boolean;
  oauthDiscordConfigured: boolean;
  environment: string;
  uptimeSeconds: number;
  lastChecked: string;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  status: UserStatus;
  banned: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface RecentSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  userRole: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

export interface GrowthDataPoint {
  date: string;
  label: string;
  count: number;
}

export interface DistributionItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AdminDashboardSummary {
  userMetrics: UserMetrics;
  securityMetrics: SecurityMetrics;
  storageMetrics: StorageMetrics;
  systemHealth: SystemHealth;
  recentUsers: RecentUser[];
  recentSessions: RecentSession[];
  growthTrends: {
    daily14d: GrowthDataPoint[];
    monthly6m: GrowthDataPoint[];
  };
}

export interface SystemUpdateStatus {
  repo: string;
  branch: string;
  currentVersion: string;
  latestVersion: string;
  currentCommit: string;
  latestCommit: string;
  hasVersionUpdate: boolean;
  hasCommitUpdate: boolean;
  hasUpdate: boolean;
  releaseTitle?: string;
  releaseNotes?: string;
  publishedAt?: string;
  lastCheckedAt: string;
}

export interface ApplyUpdateResult {
  success: boolean;
  previousVersion: string;
  updatedVersion: string;
  previousCommit: string;
  updatedCommit: string;
  logs: string[];
  message: string;
  restarting?: boolean;
}

