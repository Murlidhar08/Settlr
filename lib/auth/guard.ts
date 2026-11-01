import { headers } from "next/headers";
import { auth } from "./auth";
import { checkUserPermission, statement } from "./permissions";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { UserStatus } from "@/lib/generated/prisma/enums";

export type PermissionsStatement = typeof statement;
export type Resource = keyof PermissionsStatement;

/**
 * Check if the currently authenticated user has the required permission.
 * Returns true if authorized, false otherwise. Does not throw.
 */
export async function hasPermission<R extends Resource>(
    resource: R,
    action: PermissionsStatement[R][number]
): Promise<boolean> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return false;
        }

        const user = session.user as any;
        if (user.banned || user.status === UserStatus.banned || user.status === UserStatus.suspended || user.status === UserStatus.pendingapproval) {
            return false;
        }

        return checkUserPermission(session.user.role, {
            [resource]: [action],
        } as any);
    } catch {
        return false;
    }
}

/**
 * Require permission for a server action or route.
 * Throws typed UnauthorizedError or ForbiddenError if authorization fails.
 */
export async function requirePermission<R extends Resource>(
    resource: R,
    action: PermissionsStatement[R][number]
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new UnauthorizedError("You must be logged in to perform this action");
    }

    const user = session.user as any;
    if (user.banned || user.status === UserStatus.banned) {
        throw new ForbiddenError("Your account has been banned");
    }
    if (user.status === UserStatus.suspended) {
        throw new ForbiddenError("Your account has been suspended");
    }
    if (user.status === UserStatus.pendingapproval) {
        throw new ForbiddenError("Your account is pending administrator approval");
    }

    const isAuthorized = checkUserPermission(session.user.role, {
        [resource]: [action],
    } as any);

    if (!isAuthorized) {
        throw new ForbiddenError("You do not have permission to perform this action");
    }

    return { session, user: session.user };
}
