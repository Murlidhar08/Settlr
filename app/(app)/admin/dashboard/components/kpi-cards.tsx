"use client";

import { cn } from "@/lib/utils";
import type { SecurityMetrics, StorageMetrics, UserMetrics } from "@/types/admin-dashboard";
import { Activity, ArrowDownRight, ArrowUpRight, FileText, KeyRound, Users } from "lucide-react";

interface KpiCardsProps {
  userMetrics: UserMetrics;
  securityMetrics: SecurityMetrics;
  storageMetrics: StorageMetrics;
}

export function KpiCards({ userMetrics, securityMetrics, storageMetrics }: KpiCardsProps) {
  const isPositiveGrowth = userMetrics.growthPercentage >= 0;

  const cards = [
    {
      title: "Total Registered Users",
      value: userMetrics.totalUsers.toLocaleString(),
      subtitle: `${userMetrics.newUsersThisMonth} new this month`,
      icon: <Users className="h-5 w-5 text-indigo-400" />,
      subtext: (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-semibold text-emerald-500">{userMetrics.activeUsers}</span> active •{" "}
          <span className="font-semibold text-amber-500">{userMetrics.pendingApproval}</span> pending
        </span>
      ),
      gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
      borderGlow: "group-hover:border-indigo-500/40",
      iconBg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500",
    },
    {
      title: "2FA & Identity Security",
      value: `${securityMetrics.twoFactorAdoptionRate}%`,
      subtitle: `${securityMetrics.twoFactorUsersCount} users with 2FA enabled`,
      icon: <KeyRound className="h-5 w-5 text-emerald-400" />,
      subtext: (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{userMetrics.verifiedEmailsCount}</span> verified emails
        </span>
      ),
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      borderGlow: "group-hover:border-emerald-500/40",
      iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    },
    {
      title: "Active Device Sessions",
      value: securityMetrics.activeSessionsCount.toLocaleString(),
      subtitle: "Concurrent authenticated devices",
      icon: <Activity className="h-5 w-5 text-sky-400" />,
      subtext: (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{userMetrics.adminCount}</span> admin sessions active
        </span>
      ),
      gradient: "from-sky-500/10 via-sky-500/5 to-transparent",
      borderGlow: "group-hover:border-sky-500/40",
      iconBg: "bg-sky-500/10 border-sky-500/20 text-sky-500",
    },
    {
      title: "Documents & User Assets",
      value: storageMetrics.totalDocuments.toLocaleString(),
      subtitle: "Uploaded verification documents",
      icon: <FileText className="h-5 w-5 text-amber-400" />,
      subtext: (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Encrypted physical & cloud records
        </span>
      ),
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      borderGlow: "group-hover:border-amber-500/40",
      iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
            card.borderGlow
          )}
        >
          {/* Subtle background gradient glow */}
          <div
            className={cn(
              "absolute inset-0 bg-linear-to-br opacity-50 transition-opacity duration-500 group-hover:opacity-100",
              card.gradient
            )}
          />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-foreground">
                    {card.value}
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110",
                  card.iconBg
                )}
              >
                {card.icon}
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
              <div className="truncate">{card.subtext}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
