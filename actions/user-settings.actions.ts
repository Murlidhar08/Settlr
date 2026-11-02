"use server";

import { auth } from "@/lib/auth/auth";
import { requireActiveSession } from "@/lib/auth/dal";
import { Currency, ThemeMode } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/prisma";
import packageJson from "@/package.json";
import { UserSettingsInput } from "@/types/user/UserSettingsInput";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function upsertUserSettings(data: UserSettingsInput) {
  const session = await requireActiveSession();
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
      locale: data.locale ?? "en-IN",
      debug: data.debug ?? false,
    },
    update: {
      dateFormat: data.dateFormat,
      timeFormat: data.timeFormat,
      language: data.language,
      theme: data.theme,
      currency: data.currency,
      locale: data.locale,
      debug: data.debug,
    },
  });

  revalidatePath("/");
  return result;
}

export async function getUserSettings() {
  const session = await requireActiveSession();

  return prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });
}

export async function getListUserAccounts() {
  await requireActiveSession();
  return await auth.api.listUserAccounts({ headers: await headers() });
}

export async function getListSessions() {
  await requireActiveSession();
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
