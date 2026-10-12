import { parseRoles, Role, ROLES, ALL_ROLES } from "@/lib/auth/permissions";
import { LucideIcon, Shield, User, UserCheck } from "lucide-react";

export interface UserRoleConfig {
  id: Role | string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  colors: {
    badge: string;
    accent: string;
    text: string;
    border: string;
    bg: string;
  };
}

export const USER_ROLE_CONFIGS: Record<string, UserRoleConfig> = {
  [ROLES.ADMIN]: {
    id: ROLES.ADMIN,
    label: "Admin",
    description: "Full system administration and control",
    icon: Shield,
    accent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    colors: {
      badge: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
      accent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      text: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-500/20",
      bg: "bg-indigo-500/10",
    },
  },
  [ROLES.MODERATOR]: {
    id: ROLES.MODERATOR,
    label: "Moderator",
    description: "Inspect content, moderate users, and manage active sessions",
    icon: UserCheck,
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    colors: {
      badge: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
      accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
    },
  },
  [ROLES.USER]: {
    id: ROLES.USER,
    label: "User",
    description: "Standard self-service application access",
    icon: User,
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    colors: {
      badge: "bg-muted text-muted-foreground border border-border/40",
      accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500/20",
      bg: "bg-blue-500/10",
    },
  },
};

export const USER_ROLE_OPTIONS: UserRoleConfig[] = [
  USER_ROLE_CONFIGS[ROLES.ADMIN],
  USER_ROLE_CONFIGS[ROLES.MODERATOR],
  USER_ROLE_CONFIGS[ROLES.USER],
];

export function getRoleConfig(role?: string | null): UserRoleConfig {
  if (!role) return USER_ROLE_CONFIGS[ROLES.USER];
  const normalized = role.trim().toLowerCase();
  if (USER_ROLE_CONFIGS[normalized]) {
    return USER_ROLE_CONFIGS[normalized];
  }
  const formattedLabel = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return {
    id: normalized,
    label: formattedLabel,
    description: `${formattedLabel} role permissions`,
    icon: User,
    accent: "bg-muted text-muted-foreground",
    colors: {
      badge: "bg-muted text-muted-foreground border border-border/40",
      accent: "bg-muted text-muted-foreground",
      text: "text-muted-foreground",
      border: "border-border/40",
      bg: "bg-muted",
    },
  };
}

export function getRoleLabel(role?: string | null): string {
  return getRoleConfig(role).label;
}

export function getRoleBadgeClasses(role?: string | null): string {
  return getRoleConfig(role).colors.badge;
}

export function getRoleBadgeColor(role?: string | null): string {
  return getRoleBadgeClasses(role);
}

export function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() ?? "?";
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function sendWhatsappMessage(phone: string, message?: string): string {
  if (!phone) return "";
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  return `https://wa.me/${cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function getUniqueUserName(name?: string): string {
  const base = name ? name.toLowerCase().replace(/\s+/g, "_") : "user";
  const random = Math.floor(Math.random() * 10000);
  return `${base}_${Date.now().toString().slice(-6)}${random}`;
}

// Re-export role helpers for convenience
export { ALL_ROLES, parseRoles, type Role, ROLES };
