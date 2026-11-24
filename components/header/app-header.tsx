"use client";

import type { HeaderConfig } from "@/components/header/header-config";
import { DEFAULT_CONFIG } from "@/lib/config/repo";
import { tran } from "@/lib/languages/i18n";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { EllipsisVertical, PanelLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useHeaderValue, useSetHeaderConfig } from "../providers/header-provider";
import { useSidebar } from "../providers/sidebar-provider";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import ProfileAvatar from "../user/profile-avatar";
import { HeaderBreadcrumb } from "./header-breadcrumb";
import MobileBottomNav from "./mobile-bottom-nav";

export interface AppHeaderProps extends HeaderConfig {
  /**
   * When true, renders this header directly into the local DOM where placed,
   * completely independent of the global layout HeaderProvider.
   * Useful when a page sets `hidden` on the global header and wants to render
   * a header locally in its own custom place.
   */
  standalone?: boolean;
}

/**
 * AppHeader component:
 * 1. When rendered in RootLayout (without explicit override props), it acts as the persistent
 *    layout header that automatically stays visible across all pages and loading states.
 * 2. When rendered inside a page with props (e.g. <AppHeader title="..." />), it updates
 *    the persistent header configuration without rendering duplicate DOM nodes.
 * 3. When `standalone` is true, renders directly in place.
 */
export function AppHeader(props: AppHeaderProps = {}) {
  // If explicitly standalone, render directly in DOM without affecting global layout context
  if (props.standalone) {
    return <AppHeaderContent standaloneProps={props} />;
  }

  const isOverrideCall =
    props.title !== undefined ||
    props.description !== undefined ||
    props.backUrl !== undefined ||
    props.showBack !== undefined ||
    props.showProfile !== undefined ||
    props.showMobileNav !== undefined ||
    props.menuItems !== undefined ||
    props.hidden !== undefined ||
    props.className !== undefined;

  // When used inside a child page/component to set custom configuration
  useSetHeaderConfig(isOverrideCall ? props : {});

  // If inside HeaderProvider and used as an override caller from a page, don't duplicate header in DOM
  if (isOverrideCall) {
    return null;
  }

  return <AppHeaderContent />;
}

function AppHeaderContent({ standaloneProps }: { standaloneProps?: AppHeaderProps }) {
  const valueConfig = useHeaderValue();
  const config: HeaderConfig = standaloneProps || valueConfig || {};
  const { toggleSidebar } = useSidebar();
  const showSidebar = DEFAULT_CONFIG.SLIDE_NAV;

  // If hidden is true, do not render any header markup!
  if (config.hidden) {
    return null;
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "sticky top-0 z-30 h-16 flex items-center justify-between bg-background/80 backdrop-blur-md text-foreground px-3 sm:px-6 border-b border-border shadow-sm gap-2 sm:gap-4",
        config.className
      )}
    >
      {/* Left Section: PanelLeft Toggle Icon | Divider | Breadcrumbs */}
      <div className="flex items-center min-w-0 flex-1 overflow-hidden mr-2">
        {/* Toggle Button for mobile menu / desktop sidebar */}
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          size="icon"
          aria-label="Toggle navigation menu"
          className={cn("h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/10 dark:hover:bg-accent/40 cursor-pointer shrink-0 transition-colors items-center justify-center",
            showSidebar ? "flex" : "hidden md:flex"
          )}
        >
          <PanelLeft className="h-4.5 w-4.5" />
        </Button>

        {/* Show LOGO */}
        {!showSidebar && (
          <Link href="/dashboard" className="lg:hidden flex items-center">
            <div className="h-9 w-9 shrink-0 flex items-center justify-center relative rounded-xl bg-accent/10 border border-border/50">
              <Image
                src="/images/logo/light_logo.png"
                alt="Logo"
                width={22}
                height={22}
                className="dark:hidden"
              />
              <Image
                src="/images/logo/dark_logo.png"
                alt="Logo"
                width={22}
                height={22}
                className="hidden dark:block"
              />
            </div>
          </Link>
        )}

        {/* Vertical Separator */}
        <div className={cn("h-4 w-px bg-border/80 mx-1.5 sm:mx-2.5 shrink-0 flex")} aria-hidden="true" />

        {/* URL-based Breadcrumb Navigation */}
        <HeaderBreadcrumb customTitle={config.title ? tran(config.title) : undefined} />

        {/* Optional Description Badge */}
        {config.description && (
          <div className="hidden md:flex ml-2 shrink-0">
            <Badge
              variant="secondary"
              className="h-5 rounded-full px-2 text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/20"
            >
              {tran(config.description)}
            </Badge>
          </div>
        )}
      </div>

      {/* Right Section: Actions Dropdown & Profile Avatar */}
      <div className="flex items-center justify-end gap-2 shrink-0">
        {/* Menu Items Dropdown */}
        {config.menuItems && config.menuItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label="Actions"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/50 shadow-sm transition-all text-foreground flex items-center justify-center cursor-pointer"
                >
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl p-2 mt-2 shadow-2xl border-border/50"
            >
              {config.menuItems.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={item.onClick}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-bold transition-all focus:scale-[0.98] active:scale-95 cursor-pointer",
                    item.destructive && "text-rose-600 focus:text-rose-600"
                  )}
                >
                  {item.icon && (
                    <span className="mr-2 opacity-80 group-focus/dropdown-menu-item:opacity-100 transition-opacity">
                      {item.icon}
                    </span>
                  )}
                  <span
                    className={cn(
                      item.destructive && "text-rose-600 focus:text-rose-600"
                    )}
                  >
                    {tran(item.label)}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Profile Avatar */}
        {config.showProfile !== false && <ProfileAvatar />}
      </div>

      {/* Mobile Navigation Drawer Sheet (controlled via isMobileOpen) */}
      <MobileBottomNav />
    </motion.header>
  );
}
