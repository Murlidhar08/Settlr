import { getUserSession } from "@/lib/auth/auth";
import { hasAnyRole } from "@/lib/auth/permissions";
import { UserRole } from "@/lib/generated/prisma/enums";
import { Restricted } from "./components/restricted";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();

  // Guard: Only users with admin or moderator role can access administrative sections
  if (!hasAnyRole(session?.user?.role, [UserRole.admin, UserRole.moderator])) {
    return <Restricted />;
  }

  return <>{children}</>;
}
