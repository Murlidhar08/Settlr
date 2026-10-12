"use client";

import { FooterButtons } from "@/components/footer-buttons";
import { Button } from "@/components/ui/button";
import { hasRole } from "@/lib/auth/permissions";
import { useAdminUsers } from "@/tanstacks/admin";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { AdminSkeleton } from "../admin-skeleton";
import { AdminStats } from "./admin-stats";
import { UserList } from "./user-list";

interface UserTabProp {
    totalUsers?: number;
    activeUsers?: number;
    bannedUsers?: number;
    adminUsers?: number;
}

export function UserTab({
    totalUsers: propTotal,
    activeUsers: propActive,
    bannedUsers: propBanned,
    adminUsers: propAdmin,
}: UserTabProp = {}) {
    const { data: users, isLoading } = useAdminUsers();

    if (isLoading && propTotal === undefined) {
        return <AdminSkeleton />;
    }

    const totalUsers = propTotal ?? (users ? users.length : 0);
    const adminUsers = propAdmin ?? (users ? users.filter((u: any) => hasRole(u.role, "admin")).length : 0);
    const bannedUsers = propBanned ?? (users ? users.filter((u: any) => u.banned).length : 0);
    const activeUsers = propActive ?? (totalUsers - bannedUsers);

    return (
        <>
            <AdminStats
                totalUsers={totalUsers}
                activeUsers={activeUsers}
                bannedUsers={bannedUsers}
                adminUsers={adminUsers}
            />

            <UserList />

            <FooterButtons bottomSpace={true}>
                <Button onClick={() => { redirect('/admin/user/add' as any) }} className="h-14 w-14 md:w-auto md:px-12 rounded-full md:gap-3 font-semibold uppercase bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 p-0 md:py-2">
                    <Plus className="size-5 md:size-6" />
                    <span className="hidden md:block text-center font-black tracking-[0.2em] text-sm">
                        Add User
                    </span>
                </Button>
            </FooterButtons>
        </>
    );
}
