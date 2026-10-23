"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/utils";
import { formatCompactTimeAgo, formatDateDifferenceToNow } from "@/lib/utils/formatters";
import type { RecentSession } from "@/types/admin-dashboard";
import { Laptop, LogOut, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActiveSessionsCardProps {
  sessions: RecentSession[];
  onRevokeSession: (sessionId: string, userName: string) => void;
  isRevokingSession: boolean;
  currentSessionId?: string;
}

function parseDevice(userAgent?: string | null) {
  if (!userAgent) return { device: "Unknown Device", isMobile: false };
  const ua = userAgent.toLowerCase();

  let browser = "Browser";
  if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("edg")) browser = "Edge";
  else if (ua.includes("chrome")) browser = "Chrome";
  else if (ua.includes("safari")) browser = "Safari";

  let os = "Device";
  const isMobile = ua.includes("mobile") || ua.includes("android") || ua.includes("iphone");

  if (ua.includes("win")) os = "Windows";
  else if (ua.includes("mac")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";

  return { device: `${browser} on ${os}`, isMobile };
}

export function ActiveSessionsCard({
  sessions,
  onRevokeSession,
  isRevokingSession,
  currentSessionId,
}: ActiveSessionsCardProps) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Laptop className="h-4 w-4 text-sky-500" />
            Live Device Sessions
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 self-start sm:self-auto">
          {sessions.length} active devices
        </span>
      </div>

      {/* Sessions List */}
      <div className="space-y-2">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-muted/10 rounded-xl border border-border/40">
            No active device sessions detected.
          </div>
        ) : (
          sessions.map((session) => {
            const { device, isMobile } = parseDevice(session.userAgent);
            const isCurrentSession = Boolean(
              (currentSessionId && session.id === currentSessionId) || session.isCurrent
            );
            const initials = session.userName
              ? session.userName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
              : "U";

            return (
              <div
                key={session.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/admin/user/${session.userId}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/admin/user/${session.userId}`);
                  }
                }}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-border/40 bg-card/60 hover:bg-muted/30 hover:border-border/70 transition-all duration-200 gap-3 cursor-pointer select-none active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 shadow-xs"
              >
                {/* User avatar & device info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 rounded-xl border border-border/50">
                      {session.userImage && (
                        <AvatarImage src={session.userImage} alt={session.userName} />
                      )}
                      <AvatarFallback className="rounded-xl font-bold text-xs bg-sky-500/10 text-sky-500">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Current session indicator dot */}
                    {isCurrentSession && (
                      <span
                        title="Your Current Session"
                        className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {session.userName}
                      </span>
                      {session.userRole !== ROLES.USER && (
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border-border/60 bg-muted/20"
                        >
                          {session.userRole}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate font-medium">
                      <span className="flex items-center gap-1">
                        {isMobile ? (
                          <Smartphone className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <Laptop className="h-3 w-3 text-muted-foreground" />
                        )}
                        {device}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expiration & Revocation */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 shrink-0">
                  {/* Compact session start time */}
                  <span
                    title={`Started ${formatDateDifferenceToNow(session.createdAt)} • Expires ${formatDateDifferenceToNow(session.expiresAt)}`}
                    className="text-[11px] font-mono font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-lg border border-border/30 whitespace-nowrap"
                  >
                    {formatCompactTimeAgo(session.createdAt)}
                  </span>

                  {isCurrentSession ? (
                    <Badge
                      variant="outline"
                      className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    >
                      Current
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRevokeSession(session.id, session.userName);
                      }}
                      disabled={isRevokingSession}
                      className="h-7 px-2.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30 transition-all cursor-pointer rounded-lg"
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      {isRevokingSession ? "Revoking..." : "Revoke"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
