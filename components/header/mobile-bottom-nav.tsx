"use client";

import { useAppVersion } from "@/hooks/queries";
import { APP } from "@/lib/config/repo";
import clsx from "clsx";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { TabItem } from "../navbar/tab-item";
import { useNavItems } from "../navbar/use-nav-items";
import { useSidebar } from "../providers/sidebar-provider";
import { Button } from "../ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "../ui/sheet";

interface MobileBottomNavProps {
    navPropItems?: TabItem[];
}

export default function MobileBottomNav({ navPropItems }: MobileBottomNavProps) {
    const pathname = usePathname();
    const navItems = navPropItems ?? useNavItems();
    const { isMobileOpen, setIsMobileOpen } = useSidebar();
    const { data: version } = useAppVersion();

    const displayVersion = `v${version || "0.0.1"}`;

    // Close mobile drawer whenever the pathname changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname, setIsMobileOpen]);

    return (
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetContent
                side="left"
                showCloseButton={false}
                className="w-full sm:max-w-xs border-r border-sidebar-border p-0 flex flex-col overflow-hidden bg-sidebar text-sidebar-foreground shadow-2xl"
            >
                {/* Header: Logo + App Name + Version + Close aligned with AppHeader */}
                <SheetHeader className="h-14 sm:h-16 px-3 sm:px-6 border-b border-sidebar-border flex flex-row items-center justify-between shrink-0 m-0 space-y-0">
                    <SheetTitle className="flex items-center gap-3 text-sidebar-foreground m-0 p-0 font-normal">
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
                        <div className="flex flex-col text-left">
                            <span className="text-sm font-bold text-sidebar-foreground tracking-tight leading-tight">
                                {APP.NAME}
                            </span>
                            <span className="text-xs text-muted-foreground font-normal leading-tight mt-0.5">
                                {displayVersion}
                            </span>
                        </div>
                    </SheetTitle>
                    <SheetClose
                        render={
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileOpen(false)}
                                className="h-9 w-9 rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/20 shrink-0 cursor-pointer"
                            >
                                <X className="h-4.5 w-4.5" />
                                <span className="sr-only">Close</span>
                            </Button>
                        }
                    />
                </SheetHeader>

                {/* Flat nav list matching desktop sidebar */}
                <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const active =
                            pathname === item.href ||
                            pathname?.startsWith(`${item.href}/`);
                        return (
                            <SheetClose
                                key={item.href}
                                render={
                                    <Link
                                        key={item.href}
                                        href={item.href as any}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={clsx(
                                            "group relative flex items-center gap-3 rounded-lg text-sm transition-all duration-200 px-3 py-2.5 h-10 cursor-pointer",
                                            active
                                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-xs"
                                                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground font-normal"
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
                                        <span className="leading-none">{item.label}</span>
                                    </Link>
                                }
                            />
                        );
                    })}
                </nav>
            </SheetContent>
        </Sheet>
    );
}
