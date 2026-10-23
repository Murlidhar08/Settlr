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
  rightAction?: ReactNode;
  hidden?: boolean;
}

export interface HeaderRouteRule extends HeaderConfig {
  pattern: string | RegExp;
}

export const headerRoutesConfig: HeaderRouteRule[] = [
  // *********************
  //  Application Header
  // *********************
  {
    pattern: "/dashboard",
    title: "dashboard.title",
    showBack: false,
    showMobileNav: false,
  },
  // Cashbook root
  {
    pattern: "/cashbook",
    title: "cashbook.title",
    showBack: false,
    showMobileNav: false,
  },
  // Parties root
  {
    pattern: "/parties",
    title: "parties.title",
    showBack: false,
    showMobileNav: false,
  },
  // Party Public Statement
  {
    pattern: /^\/parties\/[^/]+\/statement$/,
    title: "Public Statement",
    showBack: true,
  },
  // Party Details (handled by BackHeader in party-details-content.tsx)
  {
    pattern: /^\/parties\/[^/]+$/,
    title: "parties.title",
    showBack: true,
    backUrl: "/parties",
    hidden: true,
  },
  // Accounts root
  {
    pattern: "/accounts",
    title: "accounts.title",
    showBack: false,
    showMobileNav: false,
  },
  // Account Details (handled by BackHeader in back-account-header-client.tsx)
  {
    pattern: /^\/accounts\/[^/]+$/,
    title: "accounts.title",
    showBack: true,
    backUrl: "/accounts",
    hidden: true,
  },
  // Business root
  {
    pattern: "/business",
    title: "business.manage_businesses",
    showBack: true,
    backUrl: "/dashboard",
    showMobileNav: false,
  },
  // Business Details (handled by BackHeader in business/[businessId]/page.tsx)
  {
    pattern: /^\/business\/[^/]+$/,
    title: "business.label",
    showBack: true,
    backUrl: "/business",
    hidden: true,
  },
  // Transactions Details (handled by BackHeader in transaction-detail-view.tsx)
  {
    pattern: /^\/transactions\/[^/]+$/,
    title: "transactions.details",
    showBack: true,
    backUrl: "/cashbook",
    hidden: true,
  },
  // Admin root
  {
    pattern: "/admin",
    title: "admin.title",
    showBack: true,
    backUrl: "/dashboard",
    showMobileNav: false,
  },
  // Admin Dashboard
  {
    pattern: "/admin/dashboard",
    title: "admin.dashboard.title",
    showBack: true,
    backUrl: "/dashboard",
  },
  // Admin User Management
  {
    pattern: "/admin/user",
    title: "admin.user_mng.title",
    showBack: true,
    backUrl: "/admin/dashboard",
  },
  // Admin Application Settings
  {
    pattern: "/admin/settings",
    title: "admin.app_config.title",
    showBack: true,
    backUrl: "/admin/dashboard",
  },
  // Admin Storage Manager
  {
    pattern: "/admin/storage",
    title: "admin.storage_mng.title",
    showBack: true,
    backUrl: "/admin/dashboard",
  },
  // Admin User Add
  {
    pattern: "/admin/user/add",
    title: "Add New User",
    showBack: true,
    backUrl: "/admin/user",
  },
  // Admin User Edit
  {
    pattern: /^\/admin\/user\/[^/]+\/edit$/,
    title: "Edit User (Admin)",
    showBack: true,
    backUrl: "/admin/user",
  },
  // Admin User Details (handled by BackHeader in user-header-action.tsx)
  {
    pattern: /^\/admin\/user\/[^/]+$/,
    title: "User Details",
    showBack: true,
    backUrl: "/admin/user",
  },
  // Settings Profile
  {
    pattern: "/settings/profile",
    title: "profile.title",
    showBack: true,
    backUrl: "/settings",
  },
  // Settings Profile Edit
  {
    pattern: "/settings/profile/edit",
    title: "profile.edit.title",
    showBack: true,
    backUrl: "/settings/profile",
  },
  // Settings Security
  {
    pattern: "/settings/security",
    title: "security.title",
    showBack: true,
    backUrl: "/settings",
  },
  // Settings Sessions
  {
    pattern: "/settings/session-management",
    title: "session.title",
    showBack: true,
    backUrl: "/settings",
  },
  // Settings Linked Accounts
  {
    pattern: "/settings/link-account",
    title: "linked_accounts.title",
    showBack: true,
    backUrl: "/settings",
  },
  // Settings Danger Zone
  {
    pattern: "/settings/danger",
    title: "danger.title",
    showBack: true,
    backUrl: "/settings",
  },
  // Settings Recycle Bin
  {
    pattern: "/settings/recycle-bin",
    title: "settings.recycle_bin",
    showBack: true,
    backUrl: "/settings",
  },
  // Logout
  {
    pattern: "/logout",
    title: "Logout",
    showBack: true,
    backUrl: "/dashboard",
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
  const isNested = segments.length > 1;
  const parentPath = isNested ? `/${segments.slice(0, -1).join("/")}` : "/dashboard";
  const rawTitle = segments[segments.length - 1] || "Dashboard";
  const formattedTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).replace(/-/g, " ");

  return {
    title: formattedTitle,
    showBack: isNested,
    backUrl: isNested ? parentPath : undefined,
    showMobileNav: !isNested,
    showProfile: true,
  };
}
