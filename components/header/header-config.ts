import { envClient } from "@/lib/env.client";
import { hasTranslationKey, tran } from "@/lib/languages/i18n";
import { toTitleCase } from "@/utility/common-function";
import type { Route } from "next";
import { ReactNode } from "react";

export interface HeaderMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

export interface HeaderConfig {
  title?: string;
  description?: string;
  showBack?: boolean;
  backUrl?: Route | string;
  showProfile?: boolean;
  showMobileNav?: boolean;
  menuItems?: HeaderMenuItem[];
  /** When true, the persistent layout header is completely hidden for this page */
  hidden?: boolean;
  /** Additional CSS classes for the header element */
  className?: string;
}

export interface HeaderRouteRule extends HeaderConfig {
  pattern: string | RegExp;
}

export const headerRoutesConfig: HeaderRouteRule[] = [
  // User Routes
  {
    pattern: /^\/admin\/user\/[^/]+$/,
    title: "User Details",
    showBack: false,
    backUrl: "/admin/user",
  },
  {
    pattern: /^\/admin\/user\/[^/]+\/edit$/,
    title: "Edit User (Admin)",
    showBack: false,
    backUrl: "/admin/user",
  },
];

/**
 * Resolves header configuration for a given pathname against registered route rules
 */
export function getHeaderConfigForPath(pathname: string, customRules?: HeaderRouteRule[]): HeaderConfig {
  const rules = customRules || headerRoutesConfig;

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

  // Fallback heuristic for unlisted paths inside (app)
  const segments = pathname.split("/").filter(Boolean);
  const rawTitle = segments[segments.length - 1];
  const slug = rawTitle.replace(/-/g, "_");

  // Return the translation key (e.g. "title.dashboard") so AppHeader translates it dynamically using the activeLanguage,
  // or fallback to humanized text if not present in the dictionary.
  const formattedTitle = hasTranslationKey(`title.${slug}`)
    ? tran(`title.${slug}`)
    : toTitleCase(rawTitle);

  return {
    title: formattedTitle,
    showBack: false,
    backUrl: undefined,
    showMobileNav: envClient.NEXT_PUBLIC_SLIDE_NAV,
    showProfile: true,
  };
}
