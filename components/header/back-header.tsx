"use client";

import type { HeaderMenuItem } from "@/components/header/header-config";
import type { Route } from "next";
import { AppHeader } from "./app-header";

export interface HeaderProps {
  title?: string;
  backUrl?: Route | string;
  description?: string;
  menuItems?: HeaderMenuItem[];
  showProfile?: boolean
}

/**
 * Backwards-compatible BackHeader adapter.
 * Seamlessly hooks into the persistent AppHeader system.
 */
export function BackHeader({
  title,
  description,
  backUrl,
  menuItems,
  showProfile,
}: HeaderProps) {
  return (
    <AppHeader
      title={title}
      description={description}
      backUrl={backUrl}
      showBack={true}
      menuItems={menuItems}
      showProfile={showProfile}
    />
  );
}
