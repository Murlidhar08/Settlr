"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DangerSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-4xl p-6 mt-6 space-y-6">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-[2rem]" />
        <Skeleton className="h-96 w-full rounded-[2.5rem]" />
      </div>
    </div>
  );
}

