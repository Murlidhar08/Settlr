import { Skeleton } from "@/components/ui/skeleton";

export default function LinkAccountLoading() {
    return (
        <div className="w-full bg-background">
            <div className="mx-auto max-w-lg p-6 mt-6 space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                    <Skeleton className="h-5 w-32 rounded-full" />
                    <Skeleton className="h-24 w-full rounded-[2.5rem] bg-muted/20" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-5 w-40 rounded-full" />
                    <Skeleton className="h-24 w-full rounded-[2.5rem] bg-muted/20" />
                    <Skeleton className="h-24 w-full rounded-[2.5rem] bg-muted/20" />
                </div>
            </div>
        </div>
    );
}
