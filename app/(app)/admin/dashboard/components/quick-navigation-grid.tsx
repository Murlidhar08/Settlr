"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight, Database, Settings, ShieldCheck, UserPlus, Users } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

interface QuickLink {
  title: string;
  description?: string;
  href: Route;
  icon: React.ReactNode;
  gradient: string;
}

export function QuickNavigationGrid() {
  const links: QuickLink[] = [
    {
      title: "User Management",
      href: "/admin/user" as Route,
      icon: <Users className="h-5 w-5 text-indigo-500" />,
      gradient: "hover:border-indigo-500/40 hover:bg-indigo-500/5",
    },
    {
      title: "Add New User",
      href: "/admin/user/add" as Route,
      icon: <UserPlus className="h-5 w-5 text-emerald-500" />,
      gradient: "hover:border-emerald-500/40 hover:bg-emerald-500/5",
    },
    {
      title: "Application & Mail Config",
      href: "/admin/settings" as Route,
      icon: <Settings className="h-5 w-5 text-amber-500" />,
      gradient: "hover:border-amber-500/40 hover:bg-amber-500/5",
    },
    {
      title: "Storage & File Assets",
      href: "/admin/storage" as Route,
      icon: <Database className="h-5 w-5 text-sky-500" />,
      gradient: "hover:border-sky-500/40 hover:bg-sky-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {links.map((link, idx) => (
        <Link
          key={idx}
          href={link.href}
          className={cn(
            "group relative flex flex-col justify-between p-4 rounded-2xl border border-border/60 bg-card/60 transition-all duration-300 shadow-xs hover:shadow-md",
            link.gradient
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="p-2.5 rounded-xl bg-muted/60 border border-border/40 group-hover:scale-105 transition-transform duration-300">
              {link.icon}
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="mt-4 space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
              {link.title}
            </h4>

            {link.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {link.description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
