"use client";

import { Fragment, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { hasTranslationKey, tran } from "@/lib/languages/i18n";
import { toTitleCase } from "@/utility/common-function";

export interface HeaderBreadcrumbProps {
  customTitle?: string;
  className?: string;
}

interface BreadcrumbSegment {
  href: string;
  label: string;
  isLast: boolean;
}

export function HeaderBreadcrumb({
  customTitle,
  className,
}: HeaderBreadcrumbProps) {
  const pathname = usePathname();

  const items = useMemo<BreadcrumbSegment[]>(() => {
    if (!pathname || pathname === "/") {
      return [
        {
          href: "/dashboard",
          label: customTitle || tran("title.dashboard"),
          isLast: true,
        },
      ];
    }

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return [
        {
          href: "/dashboard",
          label: customTitle || tran("title.dashboard"),
          isLast: true,
        },
      ];
    }

    return segments.map((seg, idx) => {
      const isLast = idx === segments.length - 1;
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const slug = seg.replace(/-/g, "_").toLowerCase();

      let label = "";

      if (isLast && customTitle) {
        label = customTitle;
      } else if (hasTranslationKey(`title.${slug}`)) {
        label = tran(`title.${slug}`);
      } else if (hasTranslationKey(`nav.${slug}`)) {
        label = tran(`nav.${slug}`);
      } else {
        // Check if segment is an ID (CUID, UUID, numeric or hex hash)
        const isId =
          /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(seg) ||
          /^c[a-z0-9]{20,}$/i.test(seg) ||
          /^\d+$/.test(seg) ||
          (seg.length > 18 && /\d/.test(seg));

        if (isId) {
          if (idx > 0 && segments[idx - 1] === "user") {
            label = isLast && customTitle ? customTitle : "User Details";
          } else {
            label = isLast && customTitle ? customTitle : "Details";
          }
        } else {
          label = toTitleCase(seg.replace(/[-_]/g, " "));
        }
      }

      return {
        href,
        label,
        isLast,
      };
    });
  }, [pathname, customTitle]);

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-nowrap whitespace-nowrap overflow-x-auto scrollbar-none py-0.5">
        {items.map((item, index) => (
          <Fragment key={item.href}>
            {index > 0 && (
              <BreadcrumbSeparator className="text-muted-foreground/50 shrink-0 [&>svg]:size-3 sm:[&>svg]:size-3.5" />
            )}
            <BreadcrumbItem className="shrink-0">
              {item.isLast ? (
                <BreadcrumbPage className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-[280px]">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  render={
                    <Link
                      href={item.href as any}
                      className="font-medium text-muted-foreground hover:text-foreground transition-colors truncate max-w-[110px] sm:max-w-[190px]"
                    >
                      {item.label}
                    </Link>
                  }
                />
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
