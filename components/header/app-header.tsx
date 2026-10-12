"use client";

import type { HeaderConfig, HeaderMenuItem } from "@/components/header/header-config";
import { envClient } from "@/lib/env.client";
import { tran } from "@/lib/languages/i18n";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { motion } from "framer-motion";
import { ArrowLeft, EllipsisVertical, Menu, X } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useNavItems } from "../navbar/use-nav-items";
import { useHeader, useSetHeaderConfig } from "../providers/header-provider";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import ProfileAvatar from "../user/profile-avatar";

export interface AppHeaderProps {
  title?: string;
  description?: string;
  backUrl?: Route | string;
  showBack?: boolean;
  showProfile?: boolean;
  showMobileNav?: boolean;
  menuItems?: HeaderMenuItem[];
  rightAction?: ReactNode;
}

/**
 * AppHeader component:
 * 1. When rendered in RootLayout (without explicit override props), it acts as the persistent
 *    layout header that automatically stays visible across all pages and loading states.
 * 2. When rendered inside a page with props (e.g. <AppHeader title="..." />), it updates
 *    the persistent header configuration without rendering duplicate DOM nodes.
 */
export function AppHeader(props: AppHeaderProps) {
  const ctx = useHeader();

  const isOverrideCall =
    props.title !== undefined ||
    props.description !== undefined ||
    props.backUrl !== undefined ||
    props.showBack !== undefined ||
    props.showProfile !== undefined ||
    props.showMobileNav !== undefined ||
    props.menuItems !== undefined ||
    props.rightAction !== undefined;

  // When used inside a child page/component to set custom configuration
  useSetHeaderConfig(isOverrideCall ? props : {});

  // If inside HeaderProvider and used as an override caller from a page, don't duplicate header in DOM
  if (ctx && isOverrideCall) {
    return null;
  }

  return <AppHeaderContent standaloneProps={!ctx ? props : undefined} />;
}

function AppHeaderContent({ standaloneProps }: { standaloneProps?: AppHeaderProps }) {
  const ctx = useHeader();
  const router = useRouter();
  const pathname = usePathname();
  const navItems = useNavItems();

  const config: HeaderConfig = standaloneProps || ctx?.headerConfig || {};

  const handleBack = () => {
    if (config.backUrl) {
      router.push(config.backUrl as any);
    } else {
      router.back();
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="sticky top-0 z-30 h-14 sm:h-16 flex items-center justify-between bg-background/80 backdrop-blur-md text-foreground px-4 sm:px-6 border-b border-border shadow-sm"
    >
      <div className="w-1/4 sm:w-1/3 flex items-center gap-2">
        {/* Left Section: Back Button or Mobile Logo */}
        {config.showBack ? (
          <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.92 }}>
            <Button
              onClick={handleBack}
              size="icon"
              variant="secondary"
              aria-label="Go back"
              className="h-9 w-9 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/50 shadow-sm transition-all text-foreground cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </motion.div>
        ) :
          config.showMobileNav ? (
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open menu"
                      className="hover:bg-accent hover:text-sidebar-accent-foreground rounded-xl"
                    >
                      <Menu size={22} />
                    </Button>
                  }
                />
                <SheetContent
                  side="left"
                  showCloseButton={false}
                  className="w-full sm:max-w-xs border-r p-4 px-6 flex flex-col overflow-hidden bg-background/95 backdrop-blur-md"
                >
                  <SheetHeader className="mb-6 px-0 p-0">
                    <SheetTitle className="flex items-center justify-between gap-3 text-sidebar-foreground font-black tracking-tighter text-2xl">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 flex items-center justify-center relative rounded-xl bg-sidebar-accent/10">
                          <Image src="/images/logo/light_logo.png" alt="Logo" width={28} height={28} className="dark:hidden" />
                          <Image src="/images/logo/dark_logo.png" alt="Logo" width={28} height={28} className="hidden dark:block" />
                        </div>
                        <span>{envClient.NEXT_PUBLIC_APP_NAME}</span>
                      </div>
                      <SheetClose
                        render={
                          <Button variant="ghost" size="icon" className="hover:bg-accent hover:text-sidebar-accent-foreground rounded-xl h-9 w-9 shrink-0">
                            <X size={20} />
                            <span className="sr-only">Close</span>
                          </Button>
                        }
                      />
                    </SheetTitle>
                  </SheetHeader>

                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const active =
                        pathname === item.href ||
                        pathname?.startsWith(`${item.href}/`);
                      return (
                        <SheetClose
                          key={item.href}
                          render={
                            <Link
                              key={item.href}
                              href={item.href as any}
                              className={clsx(
                                "group flex items-center gap-4 rounded-xl px-4 py-3 font-semibold transition-all duration-200",
                                active
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg shadow-indigo-500/10"
                                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                              )}
                            >
                              <span>{item.icon}</span>
                              <span className="text-sm tracking-wide">{item.label}</span>
                            </Link>
                          }
                        />
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
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
      </div>

      {/* Center Section: Gradient Title & Subtitle Badge */}
      <div className="flex-1 flex flex-col items-center justify-center min-w-0 mx-2 sm:mx-4">
        <div className="flex-1 flex justify-center overflow-hidden">
          <h1 className="text-xl font-black tracking-normal sm:text-2xl lg:text-3xl bg-linear-to-br from-foreground to-primary/80 bg-clip-text text-transparent">
            {config.title ? tran(config.title) : ""}
          </h1>
        </div>

        {config.description && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-0.5"
          >
            <Badge
              variant="secondary"
              className="h-5 rounded-full px-2.5 text-[9px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border-primary/20"
            >
              {tran(config.description)}
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Right Section: Actions Dropdown, Custom Right Action, Profile Avatar & Mobile Drawer */}
      <div className="w-1/4 sm:w-1/3 flex items-center justify-end gap-2">
        {/* Custom Right Action */}
        {config.rightAction}

        {/* Menu Items Dropdown */}
        {config.menuItems && config.menuItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label="Actions"
                  className="h-9 w-9 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/50 shadow-sm transition-all text-foreground flex items-center justify-center cursor-pointer"
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
    </motion.header >
  );
}
