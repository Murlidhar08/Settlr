"use client";

import { useAppVersion } from "@/hooks/queries";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../providers/sidebar-provider";
import { useNavItems } from "./use-nav-items";
import { APP } from "@/lib/config/repo";

const NavBar = () => {
    const { isCollapsed: collapsed, setIsCollapsed: setCollapsed } = useSidebar();
    const pathname = usePathname();
    const navItems = useNavItems();
    const { data: version } = useAppVersion();

    const displayVersion = `v${version || "0.0.1"}`;

    return (
        <>
            {/* ================= Desktop Sidebar ================= */}
            <aside
                className={clsx(
                    "hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-xs",
                    "transition-[width] duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
                    collapsed ? "w-16" : "w-64"
                )}
            >
                {/* Header: Logo + App Name + Version with clean divider border */}
                <div
                    className={clsx(
                        "flex items-center h-14.5 border-b border-sidebar-border shrink-0 transition-all duration-300",
                        collapsed
                            ? "justify-center px-2"
                            : "gap-3 px-4 "
                    )}
                >
                    <div className="h-9 w-9 shrink-0 flex items-center justify-center relative rounded-lg bg-sidebar-accent/10 border border-sidebar-border/40">
                        <Image
                            src="/images/logo/light_logo.png"
                            alt="Logo"
                            width={24}
                            height={24}
                            className="dark:hidden"
                        />
                        <Image
                            src="/images/logo/dark_logo.png"
                            alt="Logo"
                            width={24}
                            height={24}
                            className="hidden dark:block"
                        />
                    </div>

                    {!collapsed && (
                        <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
                            <span className="text-sm font-bold text-sidebar-foreground tracking-tight truncate leading-tight">
                                {APP.NAME}
                            </span>
                            <span className="text-xs text-muted-foreground font-normal leading-tight mt-0.5">
                                {displayVersion}
                            </span>
                        </div>
                    )}
                </div>

                {/* Navigation: Flat list without groups per requirements */}
                <nav className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                    <div className="flex-1 py-3 px-2 space-y-1">
                        {navItems.map((item) => {
                            const active =
                                pathname === item.href ||
                                pathname?.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href as any}
                                    className={clsx(
                                        "group relative flex items-center gap-3 rounded-lg text-sm transition-all duration-200",
                                        active
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-xs"
                                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground font-normal",
                                        collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2.5 h-10"
                                    )}
                                >
                                    <div
                                        className={clsx(
                                            "shrink-0 transition-transform duration-200",
                                            active
                                                ? "text-sidebar-accent-foreground"
                                                : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                                        )}
                                    >
                                        {item.icon}
                                    </div>

                                    {!collapsed && (
                                        <span className="truncate leading-none">
                                            {item.label}
                                        </span>
                                    )}

                                    {/* Tooltip for collapsed mode */}
                                    {collapsed && (
                                        <div className="fixed left-16 z-50 ml-2 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs font-medium rounded-md shadow-md whitespace-nowrap pointer-events-none opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 border border-border">
                                            {item.label}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </aside>

            {/* Spacer matching sidebar width */}
            <div
                className={clsx(
                    "hidden lg:block shrink-0 transition-[width] duration-300",
                    collapsed ? "w-16" : "w-64"
                )}
            />
        </>
    );
};

export { NavBar };
