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
      <div className="w-full md:w-64 lg:w-72 space-y-4">
        <Skeleton className="h-6 w-28 rounded-lg" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-6 w-24 rounded-lg" />
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
  backLabel = "Admin",
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

  // Active item resolution (supports id matching & alias matching)
  const activeItem = useMemo<SidePanelItem | undefined>(() => {
    if (currentPartParam) {
      const match = allItems.find(
        (i) => i.id === currentPartParam || i.aliases?.includes(currentPartParam)
      );
      if (match) return match;
    }
    if (defaultPart) {
      const match = allItems.find(
        (i) => i.id === defaultPart || i.aliases?.includes(defaultPart)
      );
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
                      <h3 className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest px-2.5 mb-1.5">
                        {group.title}
                      </h3>
                    )}

                    <div className="rounded-2xl border border-border/80 bg-card p-1.5 space-y-1 shadow-xs divide-y divide-border/40">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectPart(item.id)}
                          className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-secondary/60 dark:hover:bg-zinc-800/60 active:scale-[0.99] cursor-pointer first:border-none min-h-14"
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
                                  "text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border/40",
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
                className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer px-2.5 py-1.5 -ml-1 rounded-lg hover:bg-secondary/60 dark:hover:bg-zinc-800/60 active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{backLabel}</span>
              </button>

              {/* Main Content Card with Border and Proper Title Separator */}
              {activeItem && (
                <div className="rounded-2xl border border-border/80 dark:border-zinc-800/80 bg-card p-5 sm:p-6 shadow-xs space-y-6">
                  {!activeItem.hideHeader && (
                    <div className="pb-4 border-b border-border/70 dark:border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                          {activeItem.title}
                        </h2>
                        {activeItem.badge && (
                          <span
                            className={cn(
                              "text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0",
                              activeItem.badgeClassName ||
                                "bg-secondary text-foreground border-border/60"
                            )}
                          >
                            {activeItem.badge}
                          </span>
                        )}
                      </div>
                      {activeItem.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {activeItem.description}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-1">{activeItem.content}</div>
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
      <div className="hidden md:flex flex-row items-start gap-6 lg:gap-8">
        {/* Left Sidepanel */}
        <aside
          className={cn(
            "w-64 lg:w-72 shrink-0 space-y-6 py-1",
            sidePanelClassName
          )}
        >
          {normalizedGroups.map((group, groupIdx) => {
            if (!group.items || group.items.length === 0) return null;

            return (
              <div key={group.id || group.title || groupIdx} className="space-y-2">
                {group.title && (
                  <h3 className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest px-3 mb-2">
                    {group.title}
                  </h3>
                )}

                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const isActive =
                      activeItem?.id === item.id ||
                      (currentPartParam ? item.aliases?.includes(currentPartParam) : false);

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => handleSelectPart(item.id)}
                        className={cn(
                          /* Fixed height h-11 and permanent 1px border prevents shrink/grow jitter on select */
                          "group w-full h-11 flex items-center justify-between gap-3 px-3.5 rounded-xl text-sm transition-all duration-150 border cursor-pointer text-left select-none",
                          isActive
                            ? "bg-card dark:bg-zinc-800/90 text-foreground font-semibold border-border/80 dark:border-zinc-700/80 shadow-xs"
                            : "border-transparent text-muted-foreground/80 hover:text-foreground hover:bg-muted/60 dark:hover:bg-zinc-800/40 font-medium"
                        )}
                      >
                        {/* Icon & Label */}
                        <div className="flex items-center gap-3 min-w-0">
                          {item.icon && (
                            <span
                              className={cn(
                                "shrink-0 [&>svg]:size-4.5 transition-colors",
                                isActive
                                  ? "text-primary dark:text-zinc-100"
                                  : "text-muted-foreground/70 group-hover:text-foreground"
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
                              "text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 transition-colors",
                              item.badgeClassName ||
                                (isActive
                                  ? "bg-primary/10 text-primary border border-primary/20 dark:bg-zinc-700/60 dark:text-zinc-200 dark:border-zinc-600/60"
                                  : "bg-muted/70 text-muted-foreground border border-transparent")
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
        <div className="hidden md:block w-px self-stretch bg-border/40" aria-hidden="true" />

        {/* Right Main Content Window with Attractive Border and Header Separator */}
        <main className={cn("flex-1 min-w-0 py-1", contentClassName)}>
          {activeItem && (
            <div className="rounded-2xl border border-border/80 dark:border-zinc-800/80 bg-card p-6 sm:p-8 shadow-xs space-y-6 transition-all">
              {/* Header with Title, Description, and Proper Separator */}
              {!activeItem.hideHeader && (
                <div className="pb-5 border-b border-border/70 dark:border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        {activeItem.title}
                      </h2>
                      {activeItem.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {activeItem.description}
                        </p>
                      )}
                    </div>

                    {activeItem.badge && (
                      <span
                        className={cn(
                          "text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0",
                          activeItem.badgeClassName ||
                            "bg-secondary/70 text-foreground border-border/60"
                        )}
                      >
                        {activeItem.badge}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Main Content Body */}
              <div className={activeItem.hideHeader ? "" : "pt-1"}>
                {activeItem.content}
              </div>
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
