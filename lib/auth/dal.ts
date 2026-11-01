import { getServerSession } from "./auth";
import { requirePermission, Resource, PermissionsStatement } from "./guard";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { UserStatus } from "@/lib/generated/prisma/enums";
import { hasAnyRole, Role } from "./permissions";

/**
 * Data Access Layer (DAL) Session Guard.
 * Retrieves current server session and enforces that the account is active:
 * not banned, not suspended, and not pending approval.
 */
export async function requireActiveSession() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new UnauthorizedError("You must be logged in to perform this action");
  }

  const user = session.user;
  const isBanned = user.banned || user.status === UserStatus.banned;
  const isSuspended = user.status === UserStatus.suspended;
  const isPending = user.status === UserStatus.pendingapproval;

  if (isBanned) {
    throw new ForbiddenError("Your account has been banned. Access denied.");
  }

  if (isSuspended) {
    throw new ForbiddenError("Your account has been suspended. Access denied.");
  }

  if (isPending) {
    throw new ForbiddenError("Your account is pending administrator approval.");
  }

  return session;
}

/**
 * Retrieves the currently active user or throws an authorization error.
 */
export async function requireActiveUser() {
  const session = await requireActiveSession();
  return session.user;
}

/**
 * Enforces that the session user is either accessing their own resource (targetUserId)
 * or holds the specified RBAC permission (e.g. administrator).
 */
export async function requireSelfOrPermission<R extends Resource>(
  targetUserId: string,
  resource: R,
  action: PermissionsStatement[R][number]
) {
  const session = await requireActiveSession();

  if (session.user.id === targetUserId) {
    return session;
  }

  await requirePermission(resource, action);
  return session;
}

/**
 * Enforces that the user has at least one of the specified roles.
 */
export async function requireRoles(allowedRoles: (Role | string)[]) {
  const session = await requireActiveSession();

  if (!hasAnyRole(session.user.role, allowedRoles)) {
    throw new ForbiddenError("Insufficient permissions for this operation");
  }

  return session;
}