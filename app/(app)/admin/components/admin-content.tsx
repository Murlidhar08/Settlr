"use client";

import AppTabs from "@/components/tab/app-tabs";
import { tran } from "@/lib/languages/i18n";
import { Database, Settings as SettingsIcon, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { AdminSkeleton } from "./admin-skeleton";
import { UserTab } from "./user-tab/user-tab";

const AppSettingsTab = dynamic(() => import("./application-tab/app-settings-tab").then((mod) => mod.AppSettingsTab),
    { loading: () => <AdminSkeleton /> }
);

const AdminStorageManager = dynamic(() => import("./storage-manager").then((mod) => mod.AdminStorageManager),
    { loading: () => <AdminSkeleton /> }
);

export function AdminContent() {
    return (
        <div className="flex-1 px-4 pb-34 pt-6 max-w-7xl mx-auto w-full">
            <AppTabs
                defaultTab="user-management"
                tabs={[
                    {
                        id: "user-management",
                        label: tran("admin.user_mng.title"),
                        icon: <Users size={20} />,
                        content: <UserTab />
                    },
                    {
                        id: "application-settings",
                        label: tran("admin.app_config.title"),
                        icon: <SettingsIcon size={20} />,
                        content: <AppSettingsTab />
                    },
                    {
                        id: "storage-manager",
                        label: tran("admin.storage_mng.title"),
                        icon: <Database size={20} />,
                        content: <AdminStorageManager />
                    },
                ]}
            />
        </div>
    );
}
