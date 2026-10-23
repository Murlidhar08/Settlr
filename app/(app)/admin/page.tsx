import { getUserSession } from "@/lib/auth/auth";
import { hasAnyRole } from "@/lib/auth/permissions";
import { UserRole } from "@/lib/generated/prisma/enums";
import { redirect } from "next/navigation";
import { Restricted } from "./components/restricted";

export default async function AdminPage() {
    const session = await getUserSession();

    // Guard: Only admins and moderators can access this page
    if (!hasAnyRole(session?.user?.role, [UserRole.admin, UserRole.moderator])) {
        return <Restricted />;
    }

    // Protect /admin page by default redirect to /admin/dashboard page
    redirect("/admin/dashboard");
}

