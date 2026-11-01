"use server";

import { getAppConfig } from "@/lib/app-config";
import { requirePermission } from "@/lib/auth/guard";
import { testSmtpConfig as runTestSmtpConfig } from "@/lib/nodemailer";
import { prisma } from "@/lib/prisma/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MASKED_SECRET = "********";

const appConfigSchema = z.object({
  smtpHost: z.string().optional().nullable(),
  smtpPort: z.number().int().optional().nullable(),
  smtpUser: z.string().optional().nullable(),
  smtpPass: z.string().optional().nullable(),
  smtpSecure: z.boolean().default(false),
  fromEmail: z.string().optional().nullable().or(z.literal("")),
  googleClientId: z.string().optional().nullable(),
  googleClientSecret: z.string().optional().nullable(),
  discordClientId: z.string().optional().nullable(),
  discordClientSecret: z.string().optional().nullable(),
});

export async function getAdminAppConfig() {
  await requirePermission("config", "read");
  const config = await getAppConfig();
  if (!config) return config;

  // M-4: Mask sensitive credentials so they are not leaked in plaintext to the browser
  return {
    ...config,
    smtpPass: config.smtpPass ? MASKED_SECRET : null,
    googleClientSecret: config.googleClientSecret ? MASKED_SECRET : null,
    discordClientSecret: config.discordClientSecret ? MASKED_SECRET : null,
  };
}

export async function updateAppConfig(data: z.infer<typeof appConfigSchema>) {
  await requirePermission("config", "update");

  const validated = appConfigSchema.parse(data);

  // Retrieve existing configuration to preserve masked secrets when unmodified
  const existingConfig = await prisma.appConfig.findUnique({
    where: { id: "singleton" },
  });

  const preserveSecret = (newValue: string | null | undefined, existingValue: string | null | undefined) => {
    if (newValue === MASKED_SECRET) {
      return existingValue ?? null;
    }
    if (newValue === "" || newValue === undefined) {
      return null;
    }
    return newValue;
  };

  const dataToSave = {
    smtpHost: validated.smtpHost === "" ? null : validated.smtpHost,
    smtpPort: validated.smtpPort,
    smtpUser: validated.smtpUser === "" ? null : validated.smtpUser,
    smtpPass: preserveSecret(validated.smtpPass, existingConfig?.smtpPass),
    smtpSecure: validated.smtpSecure,
    fromEmail: validated.fromEmail === "" ? null : validated.fromEmail,
    googleClientId: validated.googleClientId === "" ? null : validated.googleClientId,
    googleClientSecret: preserveSecret(validated.googleClientSecret, existingConfig?.googleClientSecret),
    discordClientId: validated.discordClientId === "" ? null : validated.discordClientId,
    discordClientSecret: preserveSecret(validated.discordClientSecret, existingConfig?.discordClientSecret),
  };

  await prisma.appConfig.upsert({
    where: { id: "singleton" },
    update: dataToSave,
    create: {
      id: "singleton",
      ...dataToSave,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function testSmtpConfig(data: Parameters<typeof runTestSmtpConfig>[0]) {
  await requirePermission("config", "update");
  return runTestSmtpConfig(data);
}
