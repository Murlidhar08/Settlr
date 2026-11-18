"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

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
      className="w-full h-full overflow-y-auto overflow-x-hidden relative p-4 md:p-6"
    >
      {children}
    </div>
  );
}
