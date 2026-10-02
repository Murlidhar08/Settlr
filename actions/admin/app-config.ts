"use server";

import { getAppConfig } from "@/lib/app-config";
import { requirePermission } from "@/lib/auth/guard";
import { testSmtpConfig as runTestSmtpConfig } from "@/lib/nodemailer";
import { prisma } from "@/lib/prisma/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
  return await getAppConfig();
}

export async function updateAppConfig(data: z.infer<typeof appConfigSchema>) {
  await requirePermission("config", "update");

  const validated = appConfigSchema.parse(data);

  // Convert empty strings to null before saving
  const dataToSave = Object.fromEntries(
    Object.entries(validated).map(([key, value]) => [
      key,
      value === "" ? null : value
    ])
  );

  await prisma.appConfig.upsert({
    where: { id: "singleton" },
    update: dataToSave,
    create: {
      id: "singleton",
      ...dataToSave,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function testSmtpConfig(data: Parameters<typeof runTestSmtpConfig>[0]) {
  return runTestSmtpConfig(data);
}
