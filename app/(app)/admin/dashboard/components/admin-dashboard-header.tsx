"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Settings, UserPlus, Users } from "lucide-react";
import Link from "next/link";

interface AdminDashboardHeaderProps {
  lastChecked?: string;
  isFetching: boolean;
  onRefresh: () => void;
}

export function AdminDashboardHeader({
  lastChecked,
  isFetching,
  onRefresh,
}: AdminDashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
      <div className="flex items-center flex-wrap gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
          className="h-9 px-3 text-xs font-semibold rounded-xl border-border/60 hover:bg-muted/60 transition-all cursor-pointer"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin text-primary" : ""}`}
          />
          {isFetching ? "Syncing..." : "Refresh"}
        </Button>

        <Link href="/admin/user/add">
          <Button
            size="sm"
            className="h-9 px-3.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Add User
          </Button>
        </Link>

        <Link href="/admin/user">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 text-xs font-semibold rounded-xl border-border/60 hover:bg-muted/60 transition-all cursor-pointer"
          >
            <Users className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Users
          </Button>
        </Link>

        <Link href="/admin/settings">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 text-xs font-semibold rounded-xl border-border/60 hover:bg-muted/60 transition-all cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}
