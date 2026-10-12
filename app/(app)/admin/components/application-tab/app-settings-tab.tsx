"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAppConfig } from "@/tanstacks/admin";
import { AppSettingsForm } from "./app-settings-form";

export function AppSettingsTab() {
    const { data: config, isLoading } = useAppConfig();

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <Skeleton className="h-125 w-full rounded-2xl" />
            </div>
        );
    }

    if (!config) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <AppSettingsForm initialData={config} />
        </div>
    );
}
