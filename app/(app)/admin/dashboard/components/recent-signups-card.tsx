"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/lib/generated/prisma/enums";
import { ROLES, USER_ROLE_OPTIONS } from "@/lib/utils";
import { formatCompactTimeAgo, formatDateDifferenceToNow } from "@/lib/utils/formatters";
import type { RecentUser } from "@/types/admin-dashboard";
import { CheckCircle2, KeyRound, Search, UserCheck, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface RecentSignupsCardProps {
  users: RecentUser[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onApproveUser: (userId: string, userName: string) => void;
  isUpdatingStatus: boolean;
}

export function RecentSignupsCard({
  users,
  searchQuery,
  onSearchChange,
  onApproveUser,
  isUpdatingStatus,
}: RecentSignupsCardProps) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Recent Registrations
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search recent users..."
              className="h-8 pl-8 text-xs rounded-xl bg-muted/40 border-border/50"
            />
          </div>
        </div>
      </div>

      {/* Users Table / List */}
      <div className="space-y-2">
        {users.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-muted/10 rounded-xl border border-border/40">
            No users match the search criteria.
          </div>
        ) : (
          users.map((user) => {
            const initials = user.name
              ? user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
              : "U";

            const isPending = user.status === "pendingapproval";
            const isApproved = user.status === "approved";
            const isSuspended = user.status === "suspended";
            const isBanned = user.banned;

            return (
              <div
                key={user.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/admin/user/${user.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/admin/user/${user.id}`);
                  }
                }}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-border/40 bg-card/60 hover:bg-muted/30 hover:border-border/70 transition-all duration-200 gap-3 cursor-pointer select-none active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 shadow-xs"
              >
                {/* User avatar & identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 rounded-xl border border-border/50">
                      {user.image && <AvatarImage src={user.image} alt={user.name} />}
                      <AvatarFallback className="rounded-xl font-bold text-xs bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Verified badge on avatar top right */}
                    {user.emailVerified && (
                      <span
                        title="Verified Email"
                        className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-background ring-2 ring-background shadow-xs text-emerald-500"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-500 text-background" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {user.name}
                      </span>
                      {user.twoFactorEnabled && (
                        <span title="2FA Protected" className="inline-flex items-center">
                          <KeyRound className="h-3 w-3 text-indigo-500 shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate font-medium">
                      {user.email}
                    </div>
                  </div>
                </div>

                {/* Badges & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 shrink-0">
                  {/* Role pill */}
                  {user.role !== ROLES.USER && (
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border-border/60 bg-muted/20"
                    >
                      {user.role}
                    </Badge>
                  )}

                  {/* Status badge */}
                  {isBanned ? (
                    <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                      Banned
                    </Badge>
                  ) : isPending ? (
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                      Pending
                    </Badge>
                  ) : isSuspended ? (
                    <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                      Suspended
                    </Badge>
                  ) : isApproved ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                      Active
                    </Badge>
                  ) : null}

                  {/* Compact registration time */}
                  <span
                    title={`Registered ${formatDateDifferenceToNow(user.createdAt)}`}
                    className="text-[11px] font-mono font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-lg border border-border/30 whitespace-nowrap"
                  >
                    {formatCompactTimeAgo(user.createdAt)}
                  </span>

                  {/* Inline quick approve action */}
                  {isPending && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApproveUser(user.id, user.name);
                      }}
                      disabled={isUpdatingStatus}
                      className="h-7 px-2.5 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30 cursor-pointer rounded-lg transition-all"
                    >
                      <UserCheck className="h-3 w-3 mr-1" />
                      Approve
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
