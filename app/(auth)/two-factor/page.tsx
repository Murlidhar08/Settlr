import { auth } from "@/lib/auth/auth";
import { cookies, headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import TwoFactorClient from "./two-factor-client";

export default async function TwoFactorPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  // 1. If user is already fully authenticated -> redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  // 2. Check for temporary 2FA token cookie on the SERVER (Server Components CAN read HttpOnly cookies)
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const has2faCookie = allCookies.some(
    (c) =>
      c.name.startsWith("better-auth.two_factor") ||
      c.name.startsWith("__Secure-better-auth.two_factor")
  );

  // 3. If no 2FA token cookie exists -> user hasn't entered credentials -> redirect to login
  if (!has2faCookie) {
    redirect("/login", RedirectType.replace);
  }

  return <TwoFactorClient />;
}
