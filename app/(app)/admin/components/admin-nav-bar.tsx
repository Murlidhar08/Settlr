"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  FilesIcon,
  LayoutDashboard,
  Settings,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
  const router = useRouter();

  const activeItem =
    navItems.find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
    ) || navItems[0];

  const ActiveIcon = activeItem.icon;

  return (
    <>
      {/* 1. Small devices: Dropdown on top */}
      <div className="lg:hidden shrink-0 pb-2.5 bg-card/95 dark:bg-[#0f1115] border-b border-border dark:border-zinc-800/80 sticky top-0 z-30 transition-colors">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Select admin section"
                className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-border/80 bg-background hover:bg-muted/60 dark:bg-zinc-900/80 dark:hover:bg-zinc-800/60 text-foreground text-sm font-medium shadow-xs active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0 truncate">
                  <ActiveIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate font-semibold text-foreground">
                    {activeItem.title}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200" />
              </button>
            }
          />
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="w-(--anchor-width) min-w-[200px] p-1.5 rounded-xl border border-border/80 shadow-xl bg-popover text-popover-foreground z-50"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

              return (
                <DropdownMenuItem
                  key={item.href}
                  onClick={() => router.push(item.href as any)}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer select-none",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-950 dark:bg-zinc-800/90 dark:text-white font-semibold border border-emerald-500/20 dark:border-zinc-700/60 shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40 font-medium"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 truncate">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground group-hover:text-foreground dark:text-zinc-400"
                      )}
                    />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {isActive && (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-auto" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. Large devices: Desktop fixed sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col justify-between",
          "bg-card/95 dark:bg-[#0f1115] text-muted-foreground dark:text-zinc-300",
          "border-r border-border dark:border-zinc-800/80",
          "lg:w-60 lg:min-h-full lg:shrink-0 transition-all duration-300"
        )}
      >
        <div className="flex flex-col h-full">
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
