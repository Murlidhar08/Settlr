"use server";

import { requireActiveSession, requireSelfOrPermission } from "@/lib/auth/dal";
import { requirePermission } from "@/lib/auth/guard";
import { auth } from "@/lib/auth/auth";
import { parseRoles, stringifyRoles } from "@/lib/auth/permissions";
import { deleteFile, uploadFile } from "@/lib/file-operations";
import { UserStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/prisma";
import { deleteUserAndAllData } from "@/lib/user-cleanup";
import { cookies, headers } from "next/headers";
import { NotFoundError, ValidationError } from "@/lib/errors";
import path from "path";
import crypto from "crypto";
import { z } from "zod";

const ALLOWED_IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);
const ALLOWED_DOCUMENT_EXTENSIONS = new Set(["pdf", "png", "jpg", "jpeg", "webp"]);

const adminCreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  emailVerified: z.union([z.boolean(), z.string()]).transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true" || val === "yes";
  }).default(false),
  contactNo: z.string().nullable().optional(),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain alphanumeric characters, underscores, and dashes").nullable().optional(),
  status: z.nativeEnum(UserStatus).default(UserStatus.pendingapproval),
  occupation: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  role: z.string().optional(),
  roles: z.union([z.string(), z.array(z.string())]).optional(),
});

const adminUpdateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  emailVerified: z.union([z.boolean(), z.string()]).transform((val) => {
    if (typeof val === "boolean") return val;
    return val === "true" || val === "yes";
  }).optional(),
  contactNo: z.string().nullable().optional(),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain alphanumeric characters, underscores, and dashes").nullable().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  occupation: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  role: z.string().optional(),
  roles: z.union([z.string(), z.array(z.string())]).optional(),
});

export async function getCurrentUser() {
    const session = await requireActiveSession();

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            contactNo: true,
            role: true,
            createdAt: true,
            username: true,
        }
    });

    return user;
}

export async function getDeviceSessions() {
    await requireActiveSession();

    return await auth.api.listDeviceSessions({
        headers: await headers()
    });
}

export async function setActiveSession(sessionToken: string) {
    await requireActiveSession();

    return await auth.api.setActiveSession({
        body: { sessionToken },
        headers: await headers(),
    });
}

export async function revokeSession(sessionToken: string) {
    await requireActiveSession();

    return await auth.api.revokeDeviceSession({
        body: { sessionToken },
        headers: await headers(),
    });
}

export async function uploadProfileImage(formData: FormData, userId?: string) {
    const session = await requireActiveSession();

    // Only administrators or moderators with user:update can supply an arbitrary target userId
    let targetUserId = session.user.id;
    if (userId && userId !== session.user.id) {
        await requirePermission("user", "update");
        targetUserId = userId;
    }

    if (!targetUserId || targetUserId.includes("/") || targetUserId.includes("\\") || targetUserId.includes("..")) {
        throw new ValidationError("Invalid target user ID");
    }

    const file = formData.get("file") as File;
    if (!file) throw new ValidationError("No file uploaded");

    // 1. Strict allow-list of image extensions
    const rawExt = (file.name.split(".").pop() || "png").toLowerCase();
    if (!ALLOWED_IMAGE_EXTENSIONS.has(rawExt)) {
        throw new ValidationError("Invalid image type. Permitted formats: PNG, JPG, JPEG, WEBP");
    }
    const ext = rawExt;

    // 2. Find existing user to verify existence before touching filesystem
    const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, image: true }
    });
    if (!user) throw new NotFoundError("Target user not found");

    // 3. Delete existing file if local storage
    if (user.image && !user.image.startsWith("http")) {
        const oldRelativePath = user.image.replace("/api/files/", "").split("?")[0];
        try {
            await deleteFile(oldRelativePath);
        } catch (e) {
            console.error("Failed to delete old profile image:", e);
        }
    }

    // 4. Safe deterministic filename sanitized via path.basename
    const safeBaseName = path.basename(`${targetUserId}.${ext}`);
    const relativePath = await uploadFile(file, "profile", safeBaseName);
    const dbPath = `${relativePath}?v=${Date.now()}`;

    // 5. Update user image in Database
    await prisma.user.update({
        where: { id: targetUserId },
        data: { image: dbPath }
    });

    return { filePath: dbPath };
}

export async function getUserById(userId: string) {
    if (!userId || userId.includes("/") || userId.includes("\\") || userId.includes("..")) {
        throw new ValidationError("Invalid user ID");
    }
    await requireSelfOrPermission(userId, "user", "get");

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            accounts: {
                select: {
                    providerId: true
                }
            }
        }
    });

    if (!user) return null;

    return {
        ...user,
        banned: user.banned ?? false,
        banReason: user.banReason ?? null,
        roleTypes: parseRoles(user.role),
    };
}

export async function removeUserRole(userId: string, roleToRemove: string) {
    await requirePermission("user", "update");

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (!targetUser) throw new NotFoundError("User not found");

    const currentRoles = parseRoles(targetUser.role);
    const updatedRoles = currentRoles.filter((r) => r.toLowerCase() !== roleToRemove.toLowerCase());

    if (updatedRoles.length === 0) {
        // Removing the last role deletes the user completely - requires delete permission
        await requirePermission("user", "delete");
        await deleteUserAndAllData(userId);
        return { success: true, deletedUser: true };
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: updatedRoles.sort().join(",") }
    });

    return {
        success: true,
        deletedUser: false,
        remainingRoles: updatedRoles
    };
}

export async function deleteUser(userId: string) {
    await requirePermission("user", "delete");
    return await deleteUserAndAllData(userId);
}

export async function confirmDeleteAccountWithToken(token: string) {
    if (!token) {
        return { success: false, error: "Invalid or missing verification token" };
    }

    const verification = await prisma.verification.findFirst({
        where: {
            identifier: `delete-account-${token}`,
            expiresAt: { gt: new Date() }
        }
    });

    if (!verification) {
        return { success: false, error: "Invalid or expired deletion token" };
    }

    const userId = verification.value;

    try {
        await deleteUserAndAllData(userId);

        // Delete verification record
        await prisma.verification.delete({
            where: { id: verification.id }
        }).catch(() => { });

        // Clear session cookies
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        for (const cookie of allCookies) {
            if (cookie.name.includes("better-auth") || cookie.name.includes("session")) {
                cookieStore.delete(cookie.name);
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete account with token:", error);
        return { success: false, error: error.message || "Failed to delete account and data" };
    }
}

export async function createUser(data: any) {
    await requirePermission("user", "create");
    const validated = adminCreateUserSchema.parse(data);

    const userRole = stringifyRoles(validated.roles || validated.role || "user");

    const user = await prisma.user.create({
        data: {
            name: validated.name,
            email: validated.email,
            emailVerified: validated.emailVerified,
            contactNo: validated.contactNo || null,
            username: validated.username || null,
            status: validated.status,
            occupation: validated.occupation || null,
            address: validated.address || null,
            description: validated.description || null,
            role: userRole
        }
    });

    return user;
}

export async function updateUser(id: string, data: any) {
    await requirePermission("user", "update");
    if (!id || typeof id !== "string" || id.includes("/") || id.includes("\\") || id.includes("..")) {
        throw new ValidationError("Invalid user ID");
    }

    const validated = adminUpdateUserSchema.parse(data);
    const userRole = (validated.roles || validated.role) ? stringifyRoles(validated.roles || validated.role!) : undefined;

    const isBanning = validated.status === UserStatus.banned;
    const isSuspension = validated.status === UserStatus.suspended;

    const updateData: any = {
        ...(validated.name !== undefined ? { name: validated.name } : {}),
        ...(validated.email !== undefined ? { email: validated.email } : {}),
        ...(validated.emailVerified !== undefined ? { emailVerified: validated.emailVerified } : {}),
        ...(validated.contactNo !== undefined ? { contactNo: validated.contactNo || null } : {}),
        ...(validated.username !== undefined ? { username: validated.username || null } : {}),
        ...(validated.status !== undefined ? { status: validated.status } : {}),
        ...(isBanning ? { banned: true } : validated.status === UserStatus.approved ? { banned: false } : {}),
        ...(validated.occupation !== undefined ? { occupation: validated.occupation || null } : {}),
        ...(validated.address !== undefined ? { address: validated.address || null } : {}),
        ...(validated.description !== undefined ? { description: validated.description || null } : {}),
        ...(userRole !== undefined ? { role: userRole } : {}),
    };

    const user = await prisma.user.update({
        where: { id },
        data: updateData,
    });

    // Revoke sessions immediately if banned or suspended to cut off active attacker sessions
    if (isBanning || isSuspension) {
        await prisma.session.deleteMany({
            where: { userId: id }
        }).catch(() => {});
    }

    return user;
}

export async function checkUsernameUnique(username: string, excludeUserId?: string) {
    await requireActiveSession();

    const user = await prisma.user.findFirst({
        where: {
            username,
            id: excludeUserId ? { not: excludeUserId } : undefined
        }
    });
    return !user;
}

export async function uploadUserDocument(userId: string, formData: FormData) {
    const session = await requireSelfOrPermission(userId, "user", "update");

    if (!userId || userId.includes("/") || userId.includes("\\") || userId.includes("..")) {
        throw new ValidationError("Invalid user ID");
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });
    if (!targetUser) throw new NotFoundError("Target user not found");

    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as string;
    if (!file) throw new ValidationError("No file uploaded");

    // Allow-list document extensions only (SVG is strictly forbidden)
    const rawExt = (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_DOCUMENT_EXTENSIONS.has(rawExt)) {
        throw new ValidationError("Invalid document type. Permitted formats: PDF, PNG, JPG, JPEG, WEBP");
    }
    const ext = `.${rawExt}`;
    const safeRandomId = crypto.randomUUID();
    const uniqueName = `${Date.now()}_${safeRandomId}${ext}`;

    const safeUserId = path.basename(userId);
    const destinationDir = `document/${safeUserId}`;

    let relativePath: string;
    try {
        relativePath = await uploadFile(file, destinationDir, uniqueName);
    } catch {
        throw new ValidationError("Failed to upload document file");
    }

    try {
        return await prisma.userDocument.create({
            data: {
                userId,
                fileName: path.basename(file.name),
                extension: ext,
                documentRelativePath: relativePath,
                documentType: documentType as any,
                createdBy: session.user.id
            }
        });
    } catch (dbError) {
        // Atomic cleanup: delete written file if DB record insertion fails
        try {
            await deleteFile(relativePath);
        } catch {}
        throw dbError;
    }
}

export async function deleteUserDocument(documentId: string) {
    if (!documentId) throw new ValidationError("Document ID is required");

    const doc = await prisma.userDocument.findUnique({
        where: { id: documentId }
    });

    if (!doc) throw new NotFoundError("Document not found");

    await requireSelfOrPermission(doc.userId, "user", "delete");

    const relativePath = doc.documentRelativePath.replace("/api/files/", "");
    try {
        await deleteFile(relativePath);
    } catch (e) {
        console.error("Failed to delete physical file:", e);
    }

    return prisma.userDocument.delete({
        where: { id: documentId }
    });
}

export async function getUserDocuments(userId: string) {
    if (!userId || userId.includes("/") || userId.includes("\\") || userId.includes("..")) {
        throw new ValidationError("Invalid user ID");
    }

    await requireSelfOrPermission(userId, "user", "get");

    return prisma.userDocument.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });
}

export async function renameUserDocument(documentId: string, newName: string) {
    if (!documentId) throw new ValidationError("Document ID is required");
    if (!newName || newName.includes("/") || newName.includes("\\") || newName.includes("..")) {
        throw new ValidationError("Invalid file name: cannot contain path separators or parent directory references");
    }

    const doc = await prisma.userDocument.findUnique({
        where: { id: documentId }
    });

    if (!doc) throw new NotFoundError("Document not found");

    await requireSelfOrPermission(doc.userId, "user", "update");

    return prisma.userDocument.update({
        where: { id: documentId },
        data: { fileName: path.basename(newName) }
    });
}

export async function removeUserProfile(userId: string) {
    if (!userId || userId.includes("/") || userId.includes("\\") || userId.includes("..")) {
        throw new ValidationError("Invalid user ID");
    }

    await requireSelfOrPermission(userId, "user", "update");

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { image: true }
    });

    if (!user) return false;

    if (user.image && !user.image.startsWith("http")) {
        const oldRelativePath = user.image.replace("/api/files/", "").split("?")[0];
        try {
            await deleteFile(oldRelativePath);
        } catch (e) {
            console.error("Failed to delete old profile image:", e);
        }
    }

    await prisma.user.update({
        where: { id: userId },
        data: { image: null }
    });

    return true;
}
