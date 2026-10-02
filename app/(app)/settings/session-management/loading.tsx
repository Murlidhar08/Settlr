import { Skeleton } from "@/components/ui/skeleton";

export default function SessionManagementLoading() {
    return (
        <div className="w-full bg-background">
            <div className="mx-auto max-w-lg p-6 mt-6 space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                    <Skeleton className="h-5 w-40 rounded-full" />
                    <Skeleton className="h-28 w-full rounded-[2.5rem] bg-muted/20" />
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-48 rounded-full" />
                        <Skeleton className="h-9 w-24 rounded-2xl" />
                    </div>
                    {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-[2.5rem] bg-muted/20" />
                    ))}
                </div>
            </div>
        </div>
    );
}
