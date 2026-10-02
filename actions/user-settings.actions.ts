"use server";

import { auth, getUserSession } from "@/lib/auth/auth";
import { Currency, ThemeMode } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/prisma";
import packageJson from "@/package.json";
import { UserSettingsInput } from "@/types/user/UserSettingsInput";
import { setGlobalUserConfig } from "@/utility/global-user-config";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function upsertUserSettings(data: UserSettingsInput) {
  const session = await getUserSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const result = await prisma.userSettings.upsert({
    where: { userId },
    create: {
      userId: userId,
      dateFormat: data.dateFormat ?? "dd MMM, yyyy",
      timeFormat: data.timeFormat ?? "hh:mm a",
      language: data.language ?? "en",
      theme: data.theme ?? ThemeMode.LIGHT,
      currency: data.currency ?? Currency.INR,
      locale: data.locale ?? "en-IN"
    },
    update: {
      dateFormat: data.dateFormat,
      timeFormat: data.timeFormat,
      language: data.language,
      theme: data.theme,
      currency: data.currency,
      locale: data.locale
    },
  });

  setGlobalUserConfig(data);
  revalidatePath("/");
  return result;
}

export async function getUserSettings() {
  const session = await getUserSession();
  if (!session?.user?.id) return null;

  return prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });
}

export async function getListUserAccounts() {
  return await auth.api.listUserAccounts({ headers: await headers() })
}

export async function getListSessions() {
  return await auth.api.listSessions({
    headers: await headers(),
  });
}

export async function getAppVersion() {
  return packageJson.version;
}

export async function getEnabledOAuthProviders() {
  const { envServer } = await import("@/lib/env.server");
  return {
    google: !!(envServer.GOOGLE_CLIENT_ID && envServer.GOOGLE_CLIENT_SECRET),
    discord: !!(envServer.DISCORD_CLIENT_ID && envServer.DISCORD_CLIENT_SECRET),
    facebook: !!(envServer.FACEBOOK_CLIENT_ID && envServer.FACEBOOK_CLIENT_SECRET),
  };
}
