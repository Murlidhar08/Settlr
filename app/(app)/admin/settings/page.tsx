"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAppConfig } from "@/tanstacks/admin";
import { AppSettingsForm } from "./components/app-settings-form";

export default function AdminSettingsPage() {
    const { data: config, isLoading } = useAppConfig();

    if (isLoading) {
        return (
            <div className="flex-1 px-4 pb-34 pt-6 max-w-7xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
                <Skeleton className="h-125 w-full rounded-2xl" />
            </div>
        );
    }

    if (!config) return null;

    return (
        <div className="flex-1 px-4 pb-34 pt-6 max-w-7xl mx-auto w-full">
            <AppSettingsForm initialData={config} />
        </div>
    );
}
