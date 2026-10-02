"use client";

import { authClient } from "@/lib/auth/auth-client";
import { PermissionsStatement, Resource } from "./guard";
import { PermissionGateProps } from "./types";

export function useCan<R extends Resource>(
    resource: R,
    action: PermissionsStatement[R][number]
) {
    const { data: session, isPending } = authClient.useSession();

    if (isPending || !session?.user) {
        return { isAllowed: false, isPending, role: session?.user?.role };
    }

    try {
        const role = session.user.role ?? "user";
        const isAllowed = !!authClient.admin.checkRolePermission({
            role: role as any,
            permissions: {
                [resource]: [action],
            } as any,
        });

        return { isAllowed, isPending: false, role };
    } catch {
        return { isAllowed: false, isPending: false, role: session?.user?.role };
    }
}

export function ClientCan<R extends Resource>({
    resource,
    action,
    children,
    fallback = null,
    loadingFallback = null,
}: PermissionGateProps<R>) {
    const { isAllowed, isPending } = useCan(resource, action);

    if (isPending) {
        return <>{loadingFallback}</>;
    }

    if (!isAllowed) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}