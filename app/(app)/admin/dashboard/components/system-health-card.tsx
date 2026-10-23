"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SystemHealth } from "@/types/admin-dashboard";
import { CheckCircle2, Cpu, Database, Mail, Server, ShieldCheck, Wrench, XCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

interface SystemHealthCardProps {
  health: SystemHealth;
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function SystemHealthCard({ health }: SystemHealthCardProps) {
  const isDbHealthy = health.database === "healthy";
  const isDbDegraded = health.database === "degraded";

  const services = [
    {
      name: "PostgreSQL Database",
      description: `Latency: ${health.databaseLatencyMs}ms`,
      icon: <Database className="h-4 w-4" />,
      status: isDbHealthy ? "Operational" : isDbDegraded ? "Degraded" : "Offline",
      isHealthy: isDbHealthy,
      isWarning: isDbDegraded,
      color: isDbHealthy ? "text-emerald-500" : isDbDegraded ? "text-amber-500" : "text-rose-500",
      bgColor: isDbHealthy
        ? "bg-emerald-500/10 border-emerald-500/20"
        : isDbDegraded
          ? "bg-amber-500/10 border-amber-500/20"
          : "bg-rose-500/10 border-rose-500/20",
    },
    {
      name: "Authentication Engine",
      description: "Better Auth + RBAC + Passkeys",
      icon: <ShieldCheck className="h-4 w-4" />,
      status: "Active",
      isHealthy: true,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "SMTP Transactional Mailer",
      description: health.smtpConfigured ? "Ready for verification & password emails" : "Requires setup in settings",
      icon: <Mail className="h-4 w-4" />,
      status: health.smtpConfigured ? "Connected" : "Not Configured",
      isHealthy: health.smtpConfigured,
      isWarning: !health.smtpConfigured,
      color: health.smtpConfigured ? "text-emerald-500" : "text-amber-500",
      bgColor: health.smtpConfigured
        ? "bg-emerald-500/10 border-emerald-500/20"
        : "bg-amber-500/10 border-amber-500/20",
      actionUrl: !health.smtpConfigured ? ("/admin/settings" as Route) : undefined,
    },
    {
      name: "Social OAuth Providers",
      description: `Google: ${health.oauthGoogleConfigured ? "Enabled" : "Disabled"} • Discord: ${health.oauthDiscordConfigured ? "Enabled" : "Disabled"}`,
      icon: <Server className="h-4 w-4" />,
      status: health.oauthGoogleConfigured || health.oauthDiscordConfigured ? "Operational" : "Optional",
      isHealthy: health.oauthGoogleConfigured || health.oauthDiscordConfigured,
      isNeutral: !health.oauthGoogleConfigured && !health.oauthDiscordConfigured,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            Infrastructure Diagnostics
          </h3>
          <p className="text-xs text-muted-foreground">
            Server details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono font-medium">
            Node.js ({health.environment})
          </Badge>
          <Badge variant="secondary" className="text-xs font-mono font-medium">
            Uptime: {formatUptime(health.uptimeSeconds)}
          </Badge>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {services.map((service, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between p-4 rounded-xl border border-border/40 bg-muted/10 space-y-1"
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                  service.bgColor,
                  service.color
                )}
              >
                {service.icon}
              </div>

              <div className="space-y-0.5">
                <div className="text-xs sm:text-sm font-bold text-foreground">
                  {service.name}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {service.description}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border",
                  service.isHealthy
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : service.isWarning
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      : "bg-muted text-muted-foreground border-border/50"
                )}
              >
                {service.status}
              </span>

              {service.actionUrl && (
                <Link href={service.actionUrl}>
                  <Button variant="link" size="sm" className="h-6 p-0 text-[10px] text-primary">
                    Configure
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
