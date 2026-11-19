import { AdminNavBar } from "./components/admin-nav-bar";
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

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-w-0 h-full overflow-hidden">
      <AdminNavBar />
      <div className="flex-1 overflow-y-auto mx-auto pt-2 md:p-6">{children}</div>
    </div>
  );
}
