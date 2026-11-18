"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LinkAccountSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg p-6 mt-6 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

