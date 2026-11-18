export {
  getInitials,
  getRoleBadgeColor,
  sendWhatsappMessage,
  getUniqueUserName,
} from "@/lib/utils/user";

export function toTitleCase(value: string): string {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}