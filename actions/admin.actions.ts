"use server";

import { deleteUser } from "@/actions/user.actions";
import { auth } from "@/lib/auth/auth";
import { assertNotLastAdmin } from "@/lib/auth/dal";
import { requirePermission } from "@/lib/auth/guard";
import { ForbiddenError } from "@/lib/errors";
import { UserStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/prisma";
import { logAudit } from "@/lib/audit";
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
            status: true,
        }
    });

    const users = filteredUsers.map((u: any) => {
        const counts = usersWithCounts.find(uc => uc.id === u.id);
        return {
            ...u,
            contactNo: counts?.contactNo,
            status: counts?.status ?? u.status,
        };
    });

    return users;
}

export async function comprehensiveDeleteUser(userId: string) {
    const { user: actor } = await requirePermission("user", "delete");

    // N-4: Prevent self-deletion and last-admin destruction
    if (actor.id === userId) {
        throw new ForbiddenError("Cannot delete your own account via administrative actions");
    }
    await assertNotLastAdmin(userId);

    try {
        await deleteUser(userId);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete user comprehensively:", error);
        return { error: error.message || "Failed to delete user" };
    }
}

export async function updateUserStatus(userId: string, status: UserStatus) {
    const { user: actor } = await requirePermission("user", "update");

    const isBanning = status === UserStatus.banned;
    const isSuspended = status === UserStatus.suspended;

    // N-4: Prevent self-lockout or disabling the last active admin
    if (isBanning || isSuspended) {
        if (actor.id === userId) {
            throw new ForbiddenError("Cannot ban or suspend your own account");
        }
        await assertNotLastAdmin(userId);
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            status,
            ...(isBanning ? { banned: true } : status === UserStatus.approved ? { banned: false } : {})
        }
    });

    // Invalidate active sessions immediately on ban or suspend
    if (isBanning || isSuspended) {
        await prisma.session.deleteMany({
            where: { userId }
        }).catch(() => {});
    }

    // N-6: Structured audit log
    await logAudit({
        actorId: actor.id,
        actorEmail: actor.email,
        action: "USER_STATUS_UPDATE",
        targetId: userId,
        metadata: { status, banned: isBanning, suspended: isSuspended }
    });

    return { success: true };
}
