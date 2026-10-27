"use client";

import type { HeaderConfig } from "./header-config";
import { useSetHeaderConfig } from "../providers/header-provider";

export interface PageHeaderProps extends HeaderConfig { }

/**
 * PageHeader
 *
 * Declare page-level header configuration anywhere inside a page component
 * (works seamlessly in both React Server Components and Client Components).
 *
 * It configures the persistent layout AppHeader in `app/(app)/layout.tsx`
 * and renders nothing directly into the page's DOM.
 *
 * Examples:
 *
 * 1. Custom Title & Description badge:
 *    <PageHeader title="Users" description="System Accounts" />
 *
 * 2. Back button with navigation target:
 *    <PageHeader title="Edit Profile" showBack backUrl="/settings/profile" />
 *
 * 3. Hide the global layout header (so the page can render its own custom header or layout):
 *    <PageHeader hidden />
 *
 * 4. Custom center elements (search bar, tabs, etc.):
 *    <PageHeader>
 *      <SearchBar />
 *    </PageHeader>
 */
export function PageHeader(props: PageHeaderProps) {
  useSetHeaderConfig(props);

  return null;
}
