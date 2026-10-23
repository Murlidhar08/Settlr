"use server";

import { safeAction } from "@/lib/actions/action-handler";
import { requirePermission } from "@/lib/auth/guard";
import { envServer } from "@/lib/env.server";
import { UserStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/prisma";
import { applyAppUpdate, checkForUpdates } from "@/lib/system/app-updater";
import type {
  AdminDashboardSummary,
  ApplyUpdateResult,
  GrowthDataPoint,
  RecentSession,
  RecentUser,
  SystemHealth,
  SystemUpdateStatus,
} from "@/types/admin-dashboard";

export async function getAdminDashboardSummary() {
  return safeAction<AdminDashboardSummary>(async () => {
    // 1. Guard check: only users with permission to list users can view admin metrics
    await requirePermission("user", "list");

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // 2. Measure database latency & query health in parallel
    const dbStartTime = Date.now();
    let dbStatus: "healthy" | "degraded" | "down" = "healthy";
    let dbLatencyMs = 0;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStartTime;
      if (dbLatencyMs > 500) {
        dbStatus = "degraded";
      }
    } catch (dbErr) {
      console.error("[Admin Dashboard] Database ping failed:", dbErr);
      dbStatus = "down";
      dbLatencyMs = Date.now() - dbStartTime;
    }

    // 3. Parallel database aggregation
    const [
      totalUsers,
      statusGroups,
      bannedUsers,
      verifiedEmails,
      twoFactorUsers,
      passkeysCount,
      activeSessionsCount,
      totalDocuments,
      documentTypeGroups,
      newUsersThisWeek,
      newUsersThisMonth,
      newUsersPrevMonth,
      adminCount,
      moderatorCount,
      appConfig,
      recentUsersRaw,
      recentSessionsRaw,
      growthUsersRaw,
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),

      // Users grouped by status
      prisma.user.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // Banned users count
      prisma.user.count({
        where: { banned: true },
      }),

      // Email verified count
      prisma.user.count({
        where: { emailVerified: true },
      }),

      // Two-factor enabled count
      prisma.user.count({
        where: { twoFactorEnabled: true },
      }),

      // Passkeys registered count
      prisma.passkey.count(),

      // Active (non-expired) sessions count
      prisma.session.count({
        where: { expiresAt: { gt: now } },
      }),

      // Total uploaded documents
      prisma.userDocument.count(),

      // Documents grouped by type
      prisma.userDocument.groupBy({
        by: ["documentType"],
        _count: { id: true },
      }),

      // New users in last 7 days
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),

      // New users in last 30 days
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),

      // New users in previous 30 days (for growth rate calculation)
      prisma.user.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),

      // Admin role count
      prisma.user.count({
        where: { role: { contains: "admin" } },
      }),

      // Moderator role count
      prisma.user.count({
        where: { role: { contains: "moderator" } },
      }),

      // App singleton config
      prisma.appConfig.findUnique({
        where: { id: "singleton" },
      }),

      // Recent users list (8 newest)
      prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          status: true,
          banned: true,
          emailVerified: true,
          twoFactorEnabled: true,
          createdAt: true,
        },
      }),

      // Recent active sessions (6 newest)
      prisma.session.findMany({
        take: 6,
        where: { expiresAt: { gt: now } },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
      }),

      // User registrations in the last 6 months for growth curves
      prisma.user.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
    ]);

    // 4. Calculate status distribution
    const statusMap: Record<UserStatus, number> = {
      [UserStatus.approved]: 0,
      [UserStatus.pendingapproval]: 0,
      [UserStatus.suspended]: 0,
      [UserStatus.banned]: 0,
    };

    for (const group of statusGroups) {
      if (group.status in statusMap) {
        statusMap[group.status] = group._count.id;
      }
    }

    const activeUsers = statusMap[UserStatus.approved] ?? 0;
    const pendingApproval = statusMap[UserStatus.pendingapproval] ?? 0;
    const suspendedUsers = statusMap[UserStatus.suspended] ?? 0;

    // Growth percentage calculation
    let growthPercentage = 0;
    if (newUsersPrevMonth === 0) {
      growthPercentage = newUsersThisMonth > 0 ? 100 : 0;
    } else {
      growthPercentage = Math.round(
        ((newUsersThisMonth - newUsersPrevMonth) / newUsersPrevMonth) * 100
      );
    }

    // Two-factor adoption rate
    const twoFactorAdoptionRate =
      totalUsers > 0 ? Math.round((twoFactorUsers / totalUsers) * 100) : 0;

    // Regular users count
    const regularUserCount = Math.max(0, totalUsers - adminCount - moderatorCount);

    // 5. Build daily 14-day growth trend data
    const daily14d: GrowthDataPoint[] = [];
    for (let i = 13; i >= 0; i--) {
      const dayStart = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayCount = growthUsersRaw.filter(
        (u) => u.createdAt >= dayStart && u.createdAt < dayEnd
      ).length;

      const dateLabel = dayStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      daily14d.push({
        date: dayStart.toISOString().split("T")[0],
        label: dateLabel,
        count: dayCount,
      });
    }

    // 6. Build monthly 6-month growth trend data
    const monthly6m: GrowthDataPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthCount = growthUsersRaw.filter(
        (u) => u.createdAt >= monthDate && u.createdAt < nextMonthDate
      ).length;

      const monthLabel = monthDate.toLocaleDateString("en-US", {
        month: "short",
      });

      monthly6m.push({
        date: monthDate.toISOString().slice(0, 7),
        label: monthLabel,
        count: monthCount,
      });
    }

    // 7. Format recent users
    const recentUsers: RecentUser[] = recentUsersRaw.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      status: u.status,
      banned: !!u.banned,
      emailVerified: !!u.emailVerified,
      twoFactorEnabled: !!u.twoFactorEnabled,
      createdAt: u.createdAt.toISOString(),
    }));

    // 8. Format recent sessions
    const recentSessions: RecentSession[] = recentSessionsRaw.map((s) => ({
      id: s.id,
      userId: s.userId,
      userName: s.user?.name || "Unknown User",
      userEmail: s.user?.email || "",
      userImage: s.user?.image || null,
      userRole: s.user?.role || "user",
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
    }));

    // 9. Documents by type
    const documentsByType = documentTypeGroups.map((g) => ({
      type: g.documentType,
      count: g._count.id,
    }));

    // 10. System health summary
    const systemHealth: SystemHealth = {
      database: dbStatus,
      databaseLatencyMs: dbLatencyMs,
      smtpConfigured: !!(appConfig?.smtpHost && appConfig?.smtpUser),
      oauthGoogleConfigured: !!appConfig?.googleClientId,
      oauthDiscordConfigured: !!appConfig?.discordClientId,
      environment: envServer.NODE_ENV || "development",
      uptimeSeconds: Math.floor(process.uptime()),
      lastChecked: now.toISOString(),
    };

    return {
      userMetrics: {
        totalUsers,
        activeUsers,
        pendingApproval,
        suspendedUsers,
        bannedUsers,
        adminCount,
        moderatorCount,
        regularUserCount,
        verifiedEmailsCount: verifiedEmails,
        newUsersThisWeek,
        newUsersThisMonth,
        growthPercentage,
      },
      securityMetrics: {
        activeSessionsCount,
        twoFactorUsersCount: twoFactorUsers,
        passkeyUsersCount: passkeysCount,
        twoFactorAdoptionRate,
      },
      storageMetrics: {
        totalDocuments,
        documentsByType,
      },
      systemHealth,
      recentUsers,
      recentSessions,
      growthTrends: {
        daily14d,
        monthly6m,
      },
    };
  });
}

/**
 * Revoke an active session by session ID from the Admin Dashboard.
 */
export async function adminRevokeSession(sessionId: string) {
  return safeAction(async () => {
    await requirePermission("session", "revoke");

    await prisma.session.delete({
      where: { id: sessionId },
    });

    return { success: true };
  });
}

/**
 * Checks for available system updates on GitHub.
 */
export async function checkSystemUpdateAction(): Promise<{
  success: boolean;
  data?: SystemUpdateStatus;
  error?: string;
}> {
  return safeAction(async () => {
    await requirePermission("config", "read");
    return checkForUpdates();
  });
}

/**
 * Applies the system update directly from the application.
 */
export async function applySystemUpdateAction(): Promise<{
  success: boolean;
  data?: ApplyUpdateResult;
  error?: string;
}> {
  return safeAction(async () => {
    await requirePermission("config", "update");
    const result = await applyAppUpdate();
    if (!result.success) {
      throw new Error(result.message || "Failed to complete update process.");
    }
    return result;
  });
}

