"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl pb-32 mt-6 space-y-8 px-4 sm:px-6 animate-pulse">
        {/* Profile Card Skeleton */}
        <div className="h-28 w-full rounded-[2rem] bg-muted/10 border border-border/50 p-6 flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="h-10 w-10 rounded-full bg-muted/20" />
        </div>

        {/* Sections Skeletons */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-4 w-28 ml-2 bg-muted/20 rounded-md" />
            <div className="rounded-2xl border bg-muted/5 divide-y divide-border/20">
              {[...Array(i === 2 ? 4 : 3)].map((_, j) => (
                <div key={j} className="h-16 flex items-center px-4 gap-4">
                  <div className="h-8 w-8 rounded-full bg-muted/20" />
                  <div className="h-4 flex-1 bg-muted/20 rounded-md" />
                  <div className="h-10 w-28 rounded-xl bg-muted/20" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

