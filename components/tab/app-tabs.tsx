"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LoadingScreen } from "../loading-screen";
import { TabItem } from "../navbar/tab-item";
import MobileNav from "./mobile-tab";

interface AppTabsProps {
    tabs: TabItem[];
    defaultTab?: string;
    className?: string;
}

const SPRING_TRANSITION = { type: "spring", stiffness: 400, damping: 30 } as const;

export default function AppTabs({ tabs, defaultTab, className = "w-full" }: AppTabsProps) {
    const [activeTab, setActiveTab] = useState<string>(
        defaultTab || (tabs && tabs.length > 0 ? tabs[0].id : "")
    );

    const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

    useIsomorphicLayoutEffect(() => {
        const handleHashChange = () => {
            if (typeof window !== "undefined") {
                const rawHash = window.location.hash.replace("#", "");
                const tabId = rawHash.split("?")[0];
                if (tabId && tabs.some((tab) => tab.id === tabId)) {
                    setActiveTab(tabId);
                }
            }
        };

        handleHashChange();
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [tabs]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        window.history.replaceState(null, "", `#${value}`);
    };

    // Drag to scroll logic
    const tabsListRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!tabsListRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - tabsListRef.current.offsetLeft);
        setScrollLeft(tabsListRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !tabsListRef.current) return;
        e.preventDefault();
        const x = e.pageX - tabsListRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        tabsListRef.current.scrollLeft = scrollLeft - walk;
    };

    if (!tabs || tabs.length === 0) return null;

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className={cn("w-full", className)}>
            {/* Nav Desktop Container */}
            <div className="mb-8 hidden lg:block">
                <TabsList
                    ref={tabsListRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className={cn(
                        "relative w-full flex items-center justify-start h-auto p-1.5 bg-slate-100/30 dark:bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-x-auto scrollbar-hide no-scrollbar flex-nowrap shrink-0 transition-all select-none",
                        isDragging ? "cursor-grabbing" : "cursor-grab"
                    )}
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <TabsTrigger
                                hidden={tab.hidden}
                                key={tab.id}
                                value={tab.id}
                                className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-muted-foreground data-[state=active]:text-primary font-black text-[10px] tracking-widest transition-all uppercase whitespace-nowrap bg-transparent z-10 border-none shadow-none ring-0 focus-visible:ring-0 shrink-0 flex-none"
                            >
                                <span className={cn("transition-all duration-300 [&>svg]:size-4", isActive && "scale-110 text-primary")}>
                                    {tab.icon}
                                </span>

                                <span className="relative">
                                    {tab.label}
                                    {!!tab.badgeCount && (
                                        <div className="absolute -top-3 -right-5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white shadow-lg shadow-primary/20 ring-2 ring-white dark:ring-slate-900 animate-in zoom-in duration-300">
                                            {tab.badgeCount > 99 ? '99+' : tab.badgeCount}
                                        </div>
                                    )}
                                </span>

                                {isActive && (
                                    <motion.div
                                        layoutId="tabBackground"
                                        className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-xs z-[-1]"
                                        transition={SPRING_TRANSITION}
                                    />
                                )}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </div>

            {/* Mobile Nav */}
            <MobileNav
                onChange={handleTabChange}
                navItems={tabs.map(tab => ({
                    ...tab,
                    href: `#${tab.id}`,
                    active: activeTab === tab.id
                }))}
            />

            {/* Tab content */}
            {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="space-y-6 mt-0">
                    <Suspense fallback={<LoadingScreen />}>
                        {tab.content}
                    </Suspense>
                </TabsContent>
            ))}
        </Tabs>
    );
}
