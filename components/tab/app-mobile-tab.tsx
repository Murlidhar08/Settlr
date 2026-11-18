"use client";

import { useNavItems } from "@/components/navbar/use-nav-items";
import {
  useMobileTabValue,
  useSetMobileTabConfig,
} from "@/components/providers/mobile-tab-provider";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileNavItem } from "./mobile-nav-item";
import type { MobileTabConfig } from "./mobile-tab-config";

export interface AppMobileTabProps extends MobileTabConfig {
  /**
   * When true, renders this mobile tab directly into the local DOM where placed,
   * completely independent of the global layout MobileTabProvider.
   */
  standalone?: boolean;
}

/**
 * AppMobileTab component:
 * 1. When rendered in (app)/layout.tsx (without override props), it acts as the persistent
 *    layout mobile bottom navigation bar that automatically stays visible across pages.
 * 2. When rendered inside a page with props (e.g. <AppMobileTab hidden /> or <AppMobileTab navItems={...} />),
 *    it updates the persistent mobile tab configuration without rendering duplicate DOM nodes.
 * 3. When `standalone` is true, renders directly in place.
 */
export function AppMobileTab(props: AppMobileTabProps = {}) {
  if (props.standalone) {
    return <MobileTabContent standaloneProps={props} />;
  }

  const isOverrideCall =
    props.navItems !== undefined ||
    props.hidden !== undefined ||
    props.onChange !== undefined ||
    props.className !== undefined ||
    props.showShade !== undefined;

  useSetMobileTabConfig(isOverrideCall ? props : {});

  if (isOverrideCall) {
    return null;
  }

  return <MobileTabContent />;
}

function MobileTabContent({ standaloneProps }: { standaloneProps?: AppMobileTabProps }) {
  const valueConfig = useMobileTabValue();
  const pathname = usePathname();
  const defaultNavItems = useNavItems();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const config: MobileTabConfig = standaloneProps || valueConfig || {};

  if (!mounted) return null;

  // If hidden is true, do not render any mobile tab markup
  if (config.hidden) {
    return null;
  }

  const navItems =
    config.navItems && config.navItems.length > 0
      ? config.navItems
      : defaultNavItems;

  const showShade = config.showShade ?? true;

  return (
    <>
      <div className="fixed bottom-2 left-0 right-0 z-50 flex justify-center lg:hidden px-6">
        <nav
          className={cn(
            "w-full max-w-110 h-16 p-2 bg-background/70 dark:bg-card/60 backdrop-blur-3xl border border-border/50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-3xl flex items-center justify-between relative overflow-hidden",
            config.className
          )}
        >
          {navItems.map((item) => {
            const active =
              item.active !== undefined
                ? item.active
                : item.href
                ? pathname === item.href
                : false;

            return (
              <MobileNavItem
                key={item.id || item.href || item.label}
                onChange={config.onChange}
                {...item}
                active={active}
              />
            );
          })}
        </nav>
      </div>

      {/* Mobile bottom shade */}
      {showShade && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-linear-to-t from-background via-background/80 to-transparent h-32 pointer-events-none lg:hidden opacity-80" />
      )}
    </>
  );
}

