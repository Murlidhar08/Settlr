import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="w-full bg-background">
      <div className="mx-auto max-w-lg p-6 space-y-8 animate-in fade-in duration-500">
        {/* Profile Card Skeleton */}
        <div className="h-28 w-full rounded-[2.5rem] bg-muted/20 border border-border/10 flex items-center px-6 gap-4">
          <Skeleton className="h-16 w-16 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-4 w-48 rounded-md opacity-60" />
          </div>
        </div>

        {/* Section Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-24 rounded-full ml-2 opacity-50" />
          <div className="rounded-[2.5rem] bg-muted/10 border border-border/10 divide-y divide-border/5 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 flex items-center px-6 gap-4">
                <Skeleton className="h-8 w-8 rounded-full shrink-0 opacity-40" />
                <Skeleton className="h-4 flex-1 rounded-md opacity-60" />
                <Skeleton className="h-4 w-4 rounded-md opacity-30" />
              </div>
            ))}
          </div>
        </div>

        {/* Another Section Skeleton */}
        <div className="space-y-4 pt-2">
          <Skeleton className="h-4 w-32 rounded-full ml-2 opacity-50" />
          <Skeleton className="h-40 w-full rounded-[2.5rem] bg-muted/10 border border-border/10" />
        </div>
      </div>
    </div>
  );
}
