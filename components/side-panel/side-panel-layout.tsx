"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo } from "react";
import type { SidePanelGroup, SidePanelItem, SidePanelLayoutProps } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

function SidePanelLayoutSkeleton() {
  return (
    <div className="w-full flex flex-col md:flex-row gap-6 animate-pulse">
      <div className="w-full md:w-72 lg:w-80 space-y-4">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
      <div className="flex-1 space-y-4">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function SidePanelLayoutContent({
  groups,
  items,
  defaultPart,
  backLabel = "Settings",
  paramName = "part",
  className,
  sidePanelClassName,
  contentClassName,
  onPartChange,
}: SidePanelLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Normalize groups & items into standardized groups
  const normalizedGroups = useMemo<SidePanelGroup[]>(() => {
    if (groups && groups.length > 0) {
      return groups.map((g) => ({
        ...g,
        items: g.items.filter((item) => !item.hidden),
      }));
    }
    if (items && items.length > 0) {
      return [
        {
          items: items.filter((item) => !item.hidden),
        },
      ];
    }
    return [];
  }, [groups, items]);

  // Flattened list of visible items
  const allItems = useMemo<SidePanelItem[]>(() => {
    return normalizedGroups.flatMap((g) => g.items);
  }, [normalizedGroups]);

  // Current query parameter value from URL
  const currentPartParam = searchParams?.get(paramName);

  // Active item resolution
  const activeItem = useMemo<SidePanelItem | undefined>(() => {
    if (currentPartParam) {
      const match = allItems.find((i) => i.id === currentPartParam);
      if (match) return match;
    }
    if (defaultPart) {
      const match = allItems.find((i) => i.id === defaultPart);
      if (match) return match;
    }
    return allItems[0];
  }, [currentPartParam, defaultPart, allItems]);

  // Whether small devices should show the detail view
  // (true if `part` is present in URL)
  const isMobileDetailView = Boolean(currentPartParam && activeItem);

  const createQueryString = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set(key, value);
      return params.toString();
    },
    [searchParams]
  );

  const removeQueryParam = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.delete(key);
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [searchParams, pathname]
  );

  const handleSelectPart = useCallback(
    (partId: string) => {
      const qs = createQueryString(paramName, partId);
      router.push(`${pathname}?${qs}` as any, { scroll: false });
      onPartChange?.(partId);
    },
    [createQueryString, paramName, pathname, router, onPartChange]
  );

  const handleBackToMobileList = useCallback(() => {
    const targetUrl = removeQueryParam(paramName);
    router.push(targetUrl as any, { scroll: false });
  }, [removeQueryParam, paramName, router]);

  if (allItems.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full transition-all duration-300", className)}>
      {/* ========================================================= */}
      {/* SMALL DEVICES VIEW (< md)                                 */}
      {/* ========================================================= */}
      <div className="block md:hidden">
        <AnimatePresence mode="wait">
          {!isMobileDetailView ? (
            /* Image 2: List of sidepanel items on small devices */
            <motion.div
              key="mobile-list"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {normalizedGroups.map((group, groupIdx) => {
                if (!group.items || group.items.length === 0) return null;

                return (
                  <div key={group.id || group.title || groupIdx} className="space-y-2">
                    {group.title && (
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
                        {group.title}
                      </h3>
                    )}

                    <div className="rounded-2xl border border-border/80 bg-card p-1.5 space-y-1 shadow-xs divide-y divide-border/40">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectPart(item.id)}
                          className="flex items-center justify-between p-2.5 rounded-xl transition-colors hover:bg-secondary/60 dark:hover:bg-zinc-800/60 active:scale-[0.99] cursor-pointer pt-2.5 first:border-none"
                        >
                          {/* Left: Icon in box + Title */}
                          <div className="flex items-center gap-3 min-w-0">
                            {item.icon && (
                              <div className="h-10 w-10 rounded-xl bg-secondary dark:bg-zinc-800 border border-border/60 flex items-center justify-center shrink-0 text-foreground [&>svg]:size-5">
                                {item.icon}
                              </div>
                            )}
                            <span className="text-sm font-semibold text-foreground truncate">
                              {item.title}
                            </span>
                          </div>

                          {/* Right: Badge + Chevron */}
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            {item.badge && (
                              <span
                                className={cn(
                                  "text-xs text-muted-foreground font-medium",
                                  item.badgeClassName
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            /* Image 3: Detail view on small devices with back button */
            <motion.div
              key="mobile-detail"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Back Button */}
              <button
                type="button"
                onClick={handleBackToMobileList}
                className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer px-2 py-1.5 -ml-2 rounded-lg hover:bg-secondary/60 dark:hover:bg-zinc-800/60 active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{backLabel}</span>
              </button>

              {/* Main Content Card */}
              {activeItem && (
                <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {activeItem.title}
                    </h2>
                    {activeItem.description && (
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {activeItem.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">{activeItem.content}</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================= */}
      {/* DESKTOP VIEW (>= md)                                      */}
      {/* Image 1: Sidepanel (left) + Main Content (right)           */}
      {/* ========================================================= */}
      <div className="hidden md:flex flex-row items-start gap-8 lg:gap-10">
        {/* Left Sidepanel */}
        <aside
          className={cn(
            "w-72 lg:w-80 shrink-0 space-y-6 py-1",
            sidePanelClassName
          )}
        >
          {normalizedGroups.map((group, groupIdx) => {
            if (!group.items || group.items.length === 0) return null;

            return (
              <div key={group.id || group.title || groupIdx} className="space-y-2">
                {group.title && (
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3">
                    {group.title}
                  </h3>
                )}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = activeItem?.id === item.id;

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => handleSelectPart(item.id)}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer text-left select-none",
                          isActive
                            ? "bg-secondary dark:bg-zinc-800 text-foreground font-semibold border border-border/60 dark:border-zinc-700/60 shadow-xs"
                            : "text-muted-foreground/80 hover:text-foreground font-medium hover:bg-secondary/50 dark:hover:bg-zinc-800/40"
                        )}
                      >
                        {/* Icon & Label */}
                        <div className="flex items-center gap-3 min-w-0">
                          {item.icon && (
                            <span
                              className={cn(
                                "shrink-0 [&>svg]:size-4.5 transition-colors",
                                isActive
                                  ? "text-foreground"
                                  : "text-muted-foreground/80 group-hover:text-foreground"
                              )}
                            >
                              {item.icon}
                            </span>
                          )}
                          <span className="truncate">{item.title}</span>
                        </div>

                        {/* Optional Badge */}
                        {item.badge && (
                          <span
                            className={cn(
                              "text-xs font-medium shrink-0",
                              item.badgeClassName || "text-muted-foreground"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </aside>

        {/* Vertical Divider Line */}
        <div className="hidden md:block w-px self-stretch bg-border/60" aria-hidden="true" />

        {/* Right Main Content Window */}
        <main className={cn("flex-1 min-w-0 py-1", contentClassName)}>
          {activeItem && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {activeItem.title}
                </h2>
                {activeItem.description && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {activeItem.description}
                  </p>
                )}
              </div>

              <div className="pt-2">{activeItem.content}</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export function SidePanelLayout(props: SidePanelLayoutProps) {
  return (
    <Suspense fallback={<SidePanelLayoutSkeleton />}>
      <SidePanelLayoutContent {...props} />
    </Suspense>
  );
}
export default SidePanelLayout;
