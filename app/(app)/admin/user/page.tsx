"use client";

import { FooterButtons } from "@/components/footer-buttons";
import { Button } from "@/components/ui/button";
import { useUserManagement } from "@/hooks/use-user-management";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminSkeleton } from "../components/admin-skeleton";
import { AdminStats } from "./components/admin-stats";
import { UserList } from "./components/user-list";

interface UserTabProps {
    totalUsers?: number;
    activeUsers?: number;
    bannedUsers?: number;
    adminUsers?: number;
}

function UserTab({
    totalUsers: propTotal,
    activeUsers: propActive,
    bannedUsers: propBanned,
    adminUsers: propAdmin,
}: UserTabProps = {}) {
    const router = useRouter();
    const { stats, isLoading } = useUserManagement();

    if (isLoading && propTotal === undefined) {
        return <AdminSkeleton />;
    }

    const totalUsers = propTotal ?? stats.totalUsers;
    const adminUsers = propAdmin ?? stats.adminUsers;
    const bannedUsers = propBanned ?? stats.bannedUsers;
    const activeUsers = propActive ?? stats.activeUsers;

    const handleNavigateToAddUser = () => {
        router.push("/admin/user/add" as any);
    };

    return (
        <div className="flex-1 px-4 pb-34 pt-6 max-w-7xl mx-auto w-full space-y-6">
            <AdminStats
                totalUsers={totalUsers}
                activeUsers={activeUsers}
                bannedUsers={bannedUsers}
                adminUsers={adminUsers}
            />

            <UserList />

            <FooterButtons bottomSpace={true}>
                <Button
                    onClick={handleNavigateToAddUser}
                    className="h-14 w-14 md:w-auto md:px-12 rounded-full md:gap-3 font-semibold uppercase bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 p-0 md:py-2"
                >
                    <Plus className="size-5 md:size-6" />
                    <span className="hidden md:block text-center font-black tracking-[0.2em] text-sm">
                        Add User
                    </span>
                </Button>
            </FooterButtons>
        </div>
    );
}

export default function UserManagementPage() {
    return <UserTab />;
}
