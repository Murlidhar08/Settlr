"use client";

import { AtSign, CheckCircle2, Mail, Phone, ShieldAlert, User } from "lucide-react";
import { tran } from "@/lib/languages/i18n";

interface ProfileDetailsListProps {
  user?: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
    contactNo?: string | null;
    contactVerified?: boolean | null;
  } | null;
}

export function ProfileDetailsList({ user }: ProfileDetailsListProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <DetailRow
        icon={User}
        label={tran("profile.full_name")}
        value={user?.name || tran("profile.not_set")}
      />
      <DetailRow
        icon={AtSign}
        label="Username"
        value={user?.username ? `@${user?.username}` : tran("profile.not_set")}
      />
      <DetailRow
        icon={Mail}
        label={tran("profile.email_address")}
        value={user?.email || tran("profile.not_set")}
      />
      <DetailRow
        icon={Phone}
        label={tran("profile.phone_number")}
        value={user?.contactNo || tran("profile.not_set")}
        badge={
          user?.contactNo ? (
            user.contactVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
                <ShieldAlert className="w-3.5 h-3.5" />
                Unverified
              </span>
            )
          ) : null
        }
      />
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-3xl bg-card/50 border shadow-xs group hover:bg-card hover:shadow-md transition-all duration-300 gap-3">
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shrink-0">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">{label}</p>
          <p className="font-bold text-sm sm:text-base leading-tight truncate">{value}</p>
        </div>
      </div>
      {badge && <div className="self-start sm:self-auto shrink-0 sm:ml-2">{badge}</div>}
    </div>
  );
}

