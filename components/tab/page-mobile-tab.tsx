"use client";

import type { MobileTabConfig } from "./mobile-tab-config";
import { useSetMobileTabConfig } from "../providers/mobile-tab-provider";

export interface PageMobileTabProps extends MobileTabConfig {}

/**
 * PageMobileTab
 *
 * Declare page-level mobile tab configuration anywhere inside a page component.
 * It configures the persistent layout AppMobileTab in `app/(app)/layout.tsx`
 * and renders nothing directly into the page's DOM.
 *
 * Examples:
 *
 * 1. Hide the persistent mobile tab:
 *    <PageMobileTab hidden />
 *
 * 2. Provide custom tab items for a specific page:
 *    <PageMobileTab navItems={customTabs} onChange={(id) => handleTabChange(id)} />
 */
export function PageMobileTab(props: PageMobileTabProps) {
  useSetMobileTabConfig(props);

  return null;
}

