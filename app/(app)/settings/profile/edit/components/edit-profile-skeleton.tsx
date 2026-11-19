"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function EditProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col items-center py-10 space-y-4">
        <Skeleton className="h-32 w-32 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="mx-auto max-w-lg space-y-6 px-4 sm:px-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

