import { getUserSession } from "@/lib/auth/auth";
import { hasAnyRole } from "@/lib/auth/permissions";
import { UserRole } from "@/lib/generated/prisma/enums";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Restricted } from "../components/restricted";
import { AdminDashboardContent } from "./components/admin-dashboard-content";
import { AdminDashboardSkeleton } from "./components/admin-dashboard-skeleton";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administrative control center for telemetry, user analytics, security postures, and system diagnostics.",
};

export default async function AdminDashboardPage() {
  const session = await getUserSession();

  // Guard: Only admins and moderators can access administrative dashboards
  if (!hasAnyRole(session?.user?.role, [UserRole.admin, UserRole.moderator])) {
    return <Restricted />;
  }

  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
