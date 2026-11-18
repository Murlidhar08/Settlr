"use client";

import { envClient } from "@/lib/env.client";
import { useAppVersion } from "@/hooks/queries";
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
                className="w-full sm:max-w-xs border-r p-4 px-5 flex flex-col overflow-hidden bg-background/95 backdrop-blur-md"
            >
                {/* Header: Logo + App Name + Version + Close */}
                <SheetHeader className="mb-4 px-0 p-0 border-b border-border/80 pb-3">
                    <SheetTitle className="flex items-center justify-between gap-3 text-sidebar-foreground">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 shrink-0 flex items-center justify-center relative rounded-lg bg-sidebar-accent/10 border border-border/40">
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
                                <span className="text-sm font-bold text-foreground tracking-tight leading-tight">
                                    {envClient.NEXT_PUBLIC_APP_NAME}
                                </span>
                                <span className="text-xs text-muted-foreground font-normal leading-tight mt-0.5">
                                    {displayVersion}
                                </span>
                            </div>
                        </div>
                        <SheetClose
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMobileOpen(false)}
                                    className="hover:bg-accent hover:text-sidebar-accent-foreground rounded-lg h-8 w-8 shrink-0 cursor-pointer"
                                >
                                    <X size={18} />
                                    <span className="sr-only">Close</span>
                                </Button>
                            }
                        />
                    </SheetTitle>
                </SheetHeader>

                {/* Flat nav list without groups */}
                <nav className="space-y-1 overflow-y-auto">
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
                                            "group flex items-center gap-3 rounded-lg px-3 py-2.5 font-normal transition-all duration-200 cursor-pointer text-sm",
                                            active
                                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-xs"
                                                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
                                        )}
                                    >
                                        <span className="shrink-0">{item.icon}</span>
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
