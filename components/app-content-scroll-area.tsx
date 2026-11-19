"use client";

import { envClient } from "@/lib/env.client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

export function AppContentScrollArea({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // When navigating to a new route, reset the scroll position of the center content area
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div
      ref={scrollRef}
      className={cn("w-full h-full overflow-y-auto overflow-x-hidden relative p-4 md:p-6",
        envClient.NEXT_PUBLIC_BOTTOM_NAV ? "pb-32" : ""
      )}
    >
      {children}
    </div>
  );
}
