import { envClient } from "@/lib/env.client";
import { TabItem } from "../navbar/tab-item";

export interface MobileTabConfig {
  /**
   * Navigation items to render in the mobile bottom navigation bar.
   * If omitted or empty, defaults to the system navigation items (`useNavItems()`).
   */
  navItems?: (TabItem & { active?: boolean })[];
  /**
   * Callback invoked when a tab is selected.
   */
  onChange?: (value: string) => void;
  /**
   * When true, the persistent layout mobile tab is completely hidden for this page/route.
   */
  hidden?: boolean;
  /**
   * Additional CSS classes for the nav element.
   */
  className?: string;
  /**
   * Whether to show the bottom gradient shade behind the mobile tab bar (defaults to true).
   */
  showShade?: boolean;
}

export interface MobileTabRouteRule extends MobileTabConfig {
  pattern: string | RegExp;
}

/**
 * Route rules for mobile tab display.
 * Allows configuring or hiding the mobile bottom tab per route pattern.
 */
export const mobileTabRoutesConfig: MobileTabRouteRule[] = [];

/**
 * Resolves mobile tab configuration for a given pathname against registered route rules.
 */
export function getMobileTabConfigForPath(
  pathname: string,
  customRules?: MobileTabRouteRule[]
): MobileTabConfig {
  const rules = customRules || mobileTabRoutesConfig;

  for (const rule of rules) {
    if (typeof rule.pattern === "string") {
      if (rule.pattern === pathname) {
        return rule;
      }
    } else if (rule.pattern instanceof RegExp) {
      if (rule.pattern.test(pathname)) {
        return rule;
      }
    }
  }

  return {
    hidden: !envClient.NEXT_PUBLIC_BOTTOM_NAV,
    showShade: true,
  };
}

