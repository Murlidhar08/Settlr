import { headers } from "next/headers";
import { auth } from "./auth";
import { checkUserPermission, statement } from "./permissions";

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

        return checkUserPermission(session.user.role, {
            [resource]: [action],
        } as any);
    } catch {
        return false;
    }
}

/**
 * Require permission for a server action or route.
 * Throws "UNAUTHORIZED" or "FORBIDDEN" if authorization fails.
 */
export async function requirePermission<R extends Resource>(
    resource: R,
    action: PermissionsStatement[R][number]
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("UNAUTHORIZED");
    }

    const isAuthorized = checkUserPermission(session.user.role, {
        [resource]: [action],
    } as any);

    if (!isAuthorized) {
        throw new Error("FORBIDDEN");
    }

    return { session, user: session.user };
}