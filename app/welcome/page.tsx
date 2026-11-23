import { getUserSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  // Get session on the server
  const session = await getUserSession();
  if (!session)
    redirect("/login");

  if (session.user.banned) {
    redirect("/banned");
  }

  redirect("/dashboard");
}
