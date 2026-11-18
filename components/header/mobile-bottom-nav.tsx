"use client";

import { envClient } from "@/lib/env.client";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TabItem } from "../navbar/tab-item";
import { useNavItems } from "../navbar/use-nav-items";
import { Button } from "../ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../ui/sheet";

interface AppHeaderProps {
    navPropItems?: TabItem[]
}

export default function MobileBottomNav({ navPropItems }: AppHeaderProps) {
    const pathname = usePathname();
    const navItems = navPropItems ?? useNavItems();

    return (
        <Sheet>
            <SheetTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Open menu"
                        className="hover:bg-accent hover:text-sidebar-accent-foreground rounded-xl"
                    >
                        <Menu size={22} />
                    </Button>
                }
            />
            <SheetContent
                side="left"
                showCloseButton={false}
                className="w-full sm:max-w-xs border-r p-4 px-6 flex flex-col overflow-hidden bg-background/95 backdrop-blur-md"
            >
                <SheetHeader className="mb-6 px-0 p-0">
                    <SheetTitle className="flex items-center justify-between gap-3 text-sidebar-foreground font-black tracking-tighter text-2xl">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 flex items-center justify-center relative rounded-xl bg-sidebar-accent/10">
                                <Image src="/images/logo/light_logo.png" alt="Logo" width={28} height={28} className="dark:hidden" />
                                <Image src="/images/logo/dark_logo.png" alt="Logo" width={28} height={28} className="hidden dark:block" />
                            </div>
                            <span>{envClient.NEXT_PUBLIC_APP_NAME}</span>
                        </div>
                        <SheetClose
                            render={
                                <Button variant="ghost" size="icon" className="hover:bg-accent hover:text-sidebar-accent-foreground rounded-xl h-9 w-9 shrink-0">
                                    <X size={20} />
                                    <span className="sr-only">Close</span>
                                </Button>
                            }
                        />
                    </SheetTitle>
                </SheetHeader>

                <nav className="space-y-1">
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
                                        className={clsx(
                                            "group flex items-center gap-4 rounded-xl px-4 py-3 font-semibold transition-all duration-200",
                                            active
                                                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg shadow-indigo-500/10"
                                                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                        )}
                                    >
                                        <span>{item.icon}</span>
                                        <span className="text-sm tracking-wide">{item.label}</span>
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
