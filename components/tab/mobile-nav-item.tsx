"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import React from "react";

const SPRING_TRANSITION = { type: "spring", stiffness: 400, damping: 30 } as const;

export interface MobileNavItemProps {
  id?: string;
  icon?: React.ReactNode;
  label: string;
  active: boolean;
  href?: string;
  onChange?: (value: string) => void;
  badgeCount?: number;
  hidden?: boolean;
}

export function MobileNavItem({
  icon,
  label,
  active,
  href,
  onChange,
  badgeCount,
  hidden,
}: MobileNavItemProps) {
  if (hidden) return null;

  const isHash = href?.startsWith("#");

  const handleClick = (e: React.MouseEvent) => {
    if (isHash && href && onChange) {
      e.preventDefault();
      onChange(href.replace("#", ""));
    } else if (onChange && href) {
      onChange(href);
    }
  };

  return (
    <Link
      href={(href || "#") as any}
      onClick={handleClick}
      aria-label={label}
      className="relative flex-1 flex items-center justify-center h-full group"
    >
      <div
        className={clsx(
          "relative z-10 flex items-center justify-center transition-all duration-300",
          active
            ? "text-primary scale-110"
            : "text-muted-foreground hover:text-foreground active:scale-90"
        )}
      >
        <div className="flex items-center justify-center [&>svg]:size-5 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={active ? "active" : "inactive"}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {icon}
            </motion.div>
          </AnimatePresence>
          {!!badgeCount && (
            <div className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white shadow-lg shadow-primary/20 ring-2 ring-white dark:ring-slate-900 animate-in zoom-in duration-300">
              {badgeCount > 99 ? "99+" : badgeCount}
            </div>
          )}
        </div>
      </div>

      {/* Sliding Active Background Indicator */}
      {active && (
        <motion.div
          layoutId="mobile-nav-active"
          className="absolute inset-x-1 inset-y-0.5 bg-primary/10 dark:bg-primary/20 rounded-2xl z-0"
          transition={SPRING_TRANSITION}
        />
      )}

      {/* Tiny active dot */}
      {active && (
        <motion.div
          layoutId="mobile-nav-dot"
          className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"
          transition={SPRING_TRANSITION}
        />
      )}
    </Link>
  );
}

