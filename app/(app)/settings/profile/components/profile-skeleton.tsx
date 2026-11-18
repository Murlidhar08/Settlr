"use client";

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-6 mt-8 space-y-8">
        <div className="h-64 w-full animate-pulse rounded-[2.5rem] bg-muted" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 w-full animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

