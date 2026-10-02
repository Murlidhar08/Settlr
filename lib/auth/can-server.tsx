import { hasPermission, Resource } from "./guard";
import { PermissionGateProps } from "./types";

export async function ServerCan<R extends Resource>({
    resource,
    action,
    children,
    fallback = null,
}: PermissionGateProps<R>) {
    const allowed = await hasPermission(resource, action);

    if (!allowed) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

export { hasPermission };