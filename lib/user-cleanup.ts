import { deleteDirectory, deleteFile } from "@/lib/file-operations";
import { prisma } from "@/lib/prisma/prisma";

/**
 * Deletes all physical files associated with a user:
 * - Profile avatar image
 * - User documents
 * - User document folder (document/${userId})
 * - Party profile avatars belonging to user's businesses
 */
export async function deleteUserPhysicalFiles(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                image: true,
                userDocuments: {
                    select: { documentRelativePath: true }
                },
                createdBusinesses: {
                    select: {
                        parties: {
                            where: { profileUrl: { not: null } },
                            select: { profileUrl: true }
                        }
                    }
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

        // Delete party profile images if stored locally
        if (user.createdBusinesses && user.createdBusinesses.length > 0) {
            for (const business of user.createdBusinesses) {
                for (const party of business.parties) {
                    if (party.profileUrl && !party.profileUrl.startsWith("http")) {
                        const partyRelativePath = party.profileUrl.replace("/api/files/", "").split("?")[0];
                        try {
                            await deleteFile(partyRelativePath);
                        } catch (e) {
                            console.error("Failed to delete party profile image during cleanup:", e);
                        }
                    }
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
 * - Physical files on disk (profile image, user documents, party images, user folders)
 * - Verification tokens
 * - Application data (transactions, financial accounts, parties, businesses)
 * - User auth & profile data (documents, sessions, accounts, two-factor, passkeys, settings)
 * - User record
 */
export async function deleteUserAndAllData(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            username: true
        }
    });

    if (!user) return null;

    // 1. Delete physical files from disk
    await deleteUserPhysicalFiles(userId);

    // 2. Delete database records in a transaction
    return await prisma.$transaction(async (tx) => {
        // -------------------------------------------------------------
        // APPLICATION DATA CLEANUP
        // -------------------------------------------------------------
        // Find all businesses owned by this user
        const userBusinesses = await tx.business.findMany({
            where: { ownerId: userId },
            select: { id: true }
        });
        const businessIds = userBusinesses.map((b) => b.id);

        // A. Transactions
        // Must be deleted before financial accounts, parties, and user because of ON DELETE RESTRICT constraints:
        // - transaction.fromAccountId -> financialAccount (RESTRICT)
        // - transaction.toAccountId   -> financialAccount (RESTRICT)
        // - transaction.userId        -> user (RESTRICT)
        await tx.transaction.deleteMany({
            where: businessIds.length > 0
                ? { OR: [{ businessId: { in: businessIds } }, { userId }] }
                : { userId }
        });

        if (businessIds.length > 0) {
            // B. Clear default account references on businesses to avoid circular FK dependencies
            await tx.business.updateMany({
                where: { id: { in: businessIds } },
                data: {
                    defAccId: null,
                    defIncomeAccId: null,
                    defExpenseAccId: null
                }
            });

            // C. Financial Accounts
            // Belongs to businesses owned by this user
            await tx.financialAccount.deleteMany({
                where: { businessId: { in: businessIds } }
            });

            // D. Parties
            // Must be deleted before businesses because of party_businessId_fkey (ON DELETE RESTRICT)
            await tx.party.deleteMany({
                where: { businessId: { in: businessIds } }
            });

            // E. Clear activeBusinessId on any users currently pointing to these businesses
            await tx.user.updateMany({
                where: { activeBusinessId: { in: businessIds } },
                data: { activeBusinessId: null }
            });

            // F. Businesses
            // Must be deleted before user because of business_ownerId_fkey (ON DELETE RESTRICT)
            await tx.business.deleteMany({
                where: { id: { in: businessIds } }
            });
        }

        // -------------------------------------------------------------
        // USER AUTH & PROFILE DATA CLEANUP
        // -------------------------------------------------------------
        await tx.userDocument.deleteMany({ where: { userId } });
        await tx.account.deleteMany({ where: { userId } });
        await tx.session.deleteMany({ where: { userId } });
        await tx.twoFactor.deleteMany({ where: { userId } });
        await tx.passkey.deleteMany({ where: { userId } });
        await tx.userSettings.deleteMany({ where: { userId } });

        // Verification records (delete-account tokens, email verification, etc.)
        const verificationOrConditions: Array<{ value?: string; identifier?: string | { startsWith: string } }> = [
            { value: userId },
            { identifier: { startsWith: "delete-account-" }, value: userId }
        ];
        if (user.email) {
            verificationOrConditions.push({ identifier: user.email });
        }
        if (user.username) {
            verificationOrConditions.push({ identifier: user.username });
        }

        await tx.verification.deleteMany({
            where: {
                OR: verificationOrConditions
            }
        }).catch(() => { });

        // -------------------------------------------------------------
        // USER RECORD CLEANUP
        // -------------------------------------------------------------
        return await tx.user.delete({
            where: { id: userId }
        });
    }, {
        timeout: 15000,
        maxWait: 5000
    });
}
