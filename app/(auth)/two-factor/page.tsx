import { auth } from "@/lib/auth/auth";
import { cookies, headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import TwoFactorClient from "./components/two-factor-client";

export default async function TwoFactorPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  // 1. Check for pending 2FA token cookie on the SERVER first (F3)
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const has2faCookie = allCookies.some((c) => /two_factor/.test(c.name));

  // 2. If no 2FA pending challenge cookie exists -> redirect away
  if (!has2faCookie) {
    if (session) {
      redirect("/dashboard");
    }
    redirect("/login", RedirectType.replace);
  }

  // 3. 2FA challenge is present: render verification client
  return <TwoFactorClient />;
}
