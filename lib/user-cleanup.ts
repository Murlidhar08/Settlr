import { deleteDirectory, deleteFile } from "@/lib/file-operations";
import { prisma } from "@/lib/prisma/prisma";

/**
 * Deletes all physical files associated with a user:
 * - Profile avatar image
 * - User documents
 * - User document folder (document/${userId})
 */
export async function deleteUserPhysicalFiles(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                image: true,
                userDocuments: {
                    select: { documentRelativePath: true }
                }
            }
        });

        if (!user) return;

        // Delete profile image file if stored locally
        if (user.image && !user.image.startsWith("http")) {
            const oldRelativePath = user.image.replace("/api/files/", "").split("?")[0];
            try {
                await deleteFile(oldRelativePath);
            } catch (e) {
                console.error("Failed to delete user profile image during cleanup:", e);
            }
        }

        // Delete user document files stored locally
        if (user.userDocuments && user.userDocuments.length > 0) {
            for (const doc of user.userDocuments) {
                const docRelativePath = doc.documentRelativePath.replace("/api/files/", "").split("?")[0];
                try {
                    await deleteFile(docRelativePath);
                } catch (e) {
                    console.error("Failed to delete user document file during cleanup:", e);
                }
            }
        }

        // Delete entire user document folder (document/${userId})
        try {
            await deleteDirectory(`document/${userId}`);
        } catch (e) {
            console.error("Failed to delete user document folder during cleanup:", e);
        }
    } catch (e) {
        console.error("Error during deleteUserPhysicalFiles:", e);
    }
}

/**
 * Completely and comprehensively deletes a user and ALL their data:
 * - Physical files on disk
 * - Verification tokens
 * - Documents, sessions, accounts, two-factor, passkeys, settings
 * - User record
 */
export async function deleteUserAndAllData(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
    });

    // 1. Delete physical files from disk
    await deleteUserPhysicalFiles(userId);

    // 2. Delete database records in a transaction
    return await prisma.$transaction(async (tx) => {
        // Delete any verification records associated with this user
        if (user?.email) {
            await tx.verification.deleteMany({
                where: {
                    OR: [
                        { value: userId },
                        { identifier: user.email },
                        { identifier: { startsWith: "delete-account-" }, value: userId }
                    ]
                }
            }).catch(() => {});
        }

        await tx.userDocument.deleteMany({ where: { userId } });
        await tx.account.deleteMany({ where: { userId } });
        await tx.session.deleteMany({ where: { userId } });
        await tx.twoFactor.deleteMany({ where: { userId } });
        await tx.passkey.deleteMany({ where: { userId } });
        await tx.userSettings.deleteMany({ where: { userId } });

        return tx.user.delete({
            where: { id: userId }
        });
    });
}
