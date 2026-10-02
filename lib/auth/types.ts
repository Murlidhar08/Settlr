import { ReactNode } from "react";
import { statement } from "./permissions";

export type PermissionsStatement = typeof statement;
export type Resource = keyof PermissionsStatement;

export interface PermissionGateProps<R extends Resource = Resource> {
    resource: R;
    action: PermissionsStatement[R][number];
    children: ReactNode;
    fallback?: ReactNode; // Rendered when access is denied (defaults to null)
    loadingFallback?: ReactNode; // Rendered on client while session is loading (defaults to null)
}