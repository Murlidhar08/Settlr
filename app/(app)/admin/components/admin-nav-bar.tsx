"use client";

import { cn } from "@/lib/utils";
import {
  FilesIcon,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface AdminNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: AdminNavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users", href: "/admin/user", icon: ShieldCheck },
  { title: "Storage", href: "/admin/storage", icon: FilesIcon },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminNavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header (Light and Dark theme compatible) */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-card dark:bg-[#0d0f12] text-foreground dark:text-zinc-100 border-b border-border dark:border-zinc-800/80 sticky top-0 z-40 transition-colors">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 dark:bg-black/70 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Navigation Sidebar (Desktop fixed left, Mobile off-canvas drawer) */}
      <aside
        className={cn(
          "bg-card/95 dark:bg-[#0f1115] text-muted-foreground dark:text-zinc-300 border-r border-border dark:border-zinc-800/80 flex flex-col justify-between transition-all duration-300",
          "lg:w-60 lg:min-h-full lg:shrink-0 lg:static lg:translate-x-0",
          // Mobile drawer classes
          "fixed top-0 bottom-0 left-0 z-50 w-64 shadow-2xl lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Drawer Header */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3.5 border-b border-border dark:border-zinc-800/80">
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav items list */}
          <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all group cursor-pointer",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-950 dark:bg-zinc-800/90 dark:text-white font-semibold border border-emerald-500/20 dark:border-zinc-700/60 shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground group-hover:text-foreground dark:text-zinc-400 dark:group-hover:text-zinc-200"
                    )}
                  />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
