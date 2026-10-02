"use server";

import { deleteUser } from "@/actions/user.actions";
import { auth } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/guard";
import { UserStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/prisma";
import { headers } from "next/headers";

export async function getAdminUsers() {
    const { user } = await requirePermission("user", "list");

    const usersList = await auth.api.listUsers({
        headers: await headers(),
        query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
    });

    const filteredUsers = usersList.users.filter((u: any) => u.id !== user.id);

    const usersWithCounts = await prisma.user.findMany({
        where: { id: { in: filteredUsers.map((u: any) => u.id) } },
        select: {
            id: true,
            contactNo: true,
        }
    });

    const users = filteredUsers.map((u: any) => {
        const counts = usersWithCounts.find(uc => uc.id === u.id);
        return {
            ...u,
            contactNo: counts?.contactNo,
        };
    });

    return users;
}

export async function comprehensiveDeleteUser(userId: string) {
    await requirePermission("user", "delete");

    try {
        await deleteUser(userId);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete user comprehensively:", error);
        return { error: error.message || "Failed to delete user" };
    }
}

export async function updateUserStatus(userId: string, status: UserStatus) {
    await requirePermission("user", "update");

    await prisma.user.update({
        where: { id: userId },
        data: { status }
    });

    return { success: true };
}
