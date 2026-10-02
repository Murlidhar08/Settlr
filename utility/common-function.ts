import { getRoleBadgeClasses } from "./users-fn";

export function getInitials(name?: string | null) {
    if (!name) return "?";

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
        return parts[0][0]?.toUpperCase() ?? "?";
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function getRoleBadgeColor(role: string) {
    return getRoleBadgeClasses(role);
}

export function sendWhatsappMessage(phone: string, message?: string): string {
    if (!phone) return "";
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    return `https://wa.me/${cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function getUniqueUserName(name?: string): string {
    const base = name ? name.toLowerCase().replace(/\s+/g, '_') : 'user';
    const random = Math.floor(Math.random() * 10000);
    return `${base}_${Date.now().toString().slice(-6)}${random}`;
}