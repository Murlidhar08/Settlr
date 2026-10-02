import { Skeleton } from "@/components/ui/skeleton";

export default function DangerLoading() {
    return (
        <div className="w-full bg-background">
            <div className="mx-auto max-w-lg p-6 mt-6 space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-[2.5rem] bg-rose-50/50 border border-rose-100" />
                </div>
            </div>
        </div>
    );
}
