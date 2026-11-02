"use server";

import { getAppConfig } from "@/lib/app-config";
import { logAudit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/guard";
import { ValidationError } from "@/lib/errors";
import { testSmtpConfig as runTestSmtpConfig } from "@/lib/nodemailer";
import { prisma } from "@/lib/prisma/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MASKED_SECRET = "********";

/**
 * N-5: Validates SMTP host to forbid loopback, private ranges, and cloud metadata SSRF targets in production.
 */
function validateSmtpHost(host?: string | null): void {
  if (!host) return;
  const trimmed = host.trim().toLowerCase();
  if (process.env.NODE_ENV === "production") {
    if (
      trimmed === "localhost" ||
      trimmed === "127.0.0.1" ||
      trimmed === "::1" ||
      trimmed === "0.0.0.0" ||
      trimmed.startsWith("127.") ||
      trimmed.startsWith("10.") ||
      trimmed.startsWith("192.168.") ||
      trimmed.startsWith("169.254.") || // AWS / GCP / Azure metadata service
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(trimmed)
    ) {
      throw new ValidationError("Configuring internal or private network hosts as SMTP servers is restricted in production");
    }
  }
}

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
  const { user: actor } = await requirePermission("config", "update");

  const validated = appConfigSchema.parse(data);
  validateSmtpHost(validated.smtpHost);

  // Retrieve existing configuration to preserve masked secrets when unmodified
  const existingConfig = await prisma.appConfig.findUnique({
    where: { id: "singleton" },
  });

  // N-11: Treat omitted (undefined) or masked secrets as unchanged; only null or explicit empty string clears them
  const preserveSecret = (newValue: string | null | undefined, existingValue: string | null | undefined) => {
    if (newValue === MASKED_SECRET || newValue === undefined) {
      return existingValue ?? null;
    }
    if (newValue === "" || newValue === null) {
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

  // N-6: Privileged audit log
  await logAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "APP_CONFIG_UPDATE",
    metadata: {
      smtpHost: dataToSave.smtpHost,
      smtpPort: dataToSave.smtpPort,
      fromEmail: dataToSave.fromEmail,
      hasSmtpPass: !!dataToSave.smtpPass,
      hasGoogleSecret: !!dataToSave.googleClientSecret,
      hasDiscordSecret: !!dataToSave.discordClientSecret,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function testSmtpConfig(data: Parameters<typeof runTestSmtpConfig>[0]) {
  await requirePermission("config", "update");
  validateSmtpHost(data?.smtpHost);
  return runTestSmtpConfig(data);
}
