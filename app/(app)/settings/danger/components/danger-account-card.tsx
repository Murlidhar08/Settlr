"use client";

import { ShieldAlert } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { tran } from "@/lib/languages/i18n";
import { getFileUrl } from "@/lib/utils";
import { getInitials } from "@/utility/common-function";

interface DangerAccountCardProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
}

export function DangerAccountCard({ user }: DangerAccountCardProps) {
  if (!user) return null;

  const userName = user.name || "User";
  const userEmail = user.email || "";
  const userRole = user.role || "user";

  return (
    <div className="p-5 sm:p-6 rounded-[2rem] bg-card/60 border border-border/60 shadow-xs relative overflow-hidden backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Avatar className="size-12 sm:size-14 border-2 border-background shadow-md ring-2 ring-destructive/20 shrink-0">
            <AvatarImage src={getFileUrl(user.image)} alt={userName} />
            <AvatarFallback className="bg-destructive/10 text-destructive font-black uppercase text-base sm:text-lg">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-base sm:text-lg tracking-tight text-foreground truncate">
                {userName}
              </span>
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {userRole}
              </Badge>
            </div>
            <p className="text-xs font-semibold text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold shrink-0">
          <ShieldAlert size={14} className="shrink-0" />
          <span>{tran("danger.current_account")}</span>
        </div>
      </div>
    </div>
  );
}

