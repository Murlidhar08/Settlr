import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

// 1. Define resources and allowable actions
export const statement = {
  ...defaultStatements,
  storage: ["read", "write", "delete", "move"],
  config: ["read", "update"]
} as const;

export type Statement = typeof statement;
export type ResourceStatement = typeof statement;
export const ac = createAccessControl(statement);

// 2. Define roles as permission bundles
export const userRole = ac.newRole({
  user: [],
  session: [],
});

export const moderatorRole = ac.newRole({
  user: ["get", "list"],
  session: ["list", "revoke"],
  storage: ["read"],
});

export const adminRole = ac.newRole({
  ...defaultStatements,
  config: ["read", "update"],
  storage: ["read", "write", "delete", "move"],
});

export const roles = {
  user: userRole,
  moderator: moderatorRole,
  admin: adminRole,
};

export type RoleName = keyof typeof roles;

// Backwards compatibility aliases
export const user = userRole;
export const moderator = moderatorRole;
export const admin = adminRole;

/**
 * Role Constants and Types
 */
export const ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  USER: "user"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
export const ALL_ROLES: Role[] = [ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER];

/**
 * Parse comma-separated role string into an array of roles.
 * Defaults to ["user"] if empty.
 */
export function parseRoles(roleString?: string | null): Role[] {
  if (!roleString || typeof roleString !== "string") {
    return [ROLES.USER];
  }

  const parsed = roleString
    .split(",")
    .sort()
    .map((r) => r.trim().toLowerCase())
    .filter((r): r is Role => ALL_ROLES.includes(r as Role));

  return parsed.length > 0 ? Array.from(new Set(parsed)) : [ROLES.USER];
}

/**
 * Formats an array of roles or role string into a normalized comma-separated string.
 */
export function stringifyRoles(rolesInput: (Role | string)[] | string): string {
  if (Array.isArray(rolesInput)) {
    const validRoles = rolesInput
      .sort()
      .map((r) => r.trim().toLowerCase())
      .filter((r): r is Role => ALL_ROLES.includes(r as Role));
    const unique = Array.from(new Set(validRoles));
    return unique.length > 0 ? unique.join(",") : ROLES.USER;
  }

  return parseRoles(rolesInput).join(",");
}

/**
 * Check if a user's role string contains a specific role.
 */
export function hasRole(roleString: string | null | undefined, targetRole: Role | string): boolean {
  const currentRoles = parseRoles(roleString);
  return (currentRoles as string[]).includes(targetRole.toLowerCase());
}

/**
 * Check if a user's role string contains ANY of the given target roles.
 */
export function hasAnyRole(roleString: string | null | undefined, targetRoles: (Role | string)[]): boolean {
  const currentRoles = parseRoles(roleString);
  const normalizedTargets = targetRoles.map((t) => t.toLowerCase());
  return (currentRoles as string[]).some((r) => normalizedTargets.includes(r));
}

/**
 * Check if a user's role string contains ALL of the given target roles.
 */
export function hasAllRoles(roleString: string | null | undefined, targetRoles: (Role | string)[]): boolean {
  const currentRoles = parseRoles(roleString);
  const normalizedTargets = targetRoles.map((t) => t.toLowerCase());
  return normalizedTargets.every((t) => (currentRoles as string[]).includes(t));
}

/**
 * Check whether a user's multi-roles satisfy a specific permission set.
 */
export type PermissionCheck = Parameters<(typeof adminRole)["authorize"]>[0];

export function checkUserPermission(
  roleString: string | null | undefined,
  permissions: PermissionCheck
): boolean {
  const currentRoles = parseRoles(roleString);
  for (const r of currentRoles) {
    const roleDef = (roles as Record<string, any>)[r];
    if (roleDef && roleDef.authorize(permissions).success) {
      return true;
    }
  }
  return false;
}
