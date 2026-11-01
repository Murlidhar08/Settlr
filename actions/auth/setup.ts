"use server";

import { auth } from "@/lib/auth/auth";
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

const setupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
});

export async function setupAdmin(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validatedData = setupSchema.parse(rawData);

  // M-8: Acquire PostgreSQL transaction advisory lock to prevent first-run setup race conditions
  const canProceed = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(849204)`;
    const userCount = await tx.user.count();
    return userCount === 0;
  });

  if (!canProceed) {
    redirect("/login");
  }

  // 2. Create the user using Better Auth to handle password hashing
  const user = await auth.api.signUpEmail({
    body: {
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
      username: validatedData.username,
    }
  });

  if (!user) {
    throw new Error("Failed to create admin user");
  }

  // 3. Update the user to be admin, verified, and approved
  await prisma.user.update({
    where: { id: user.user.id },
    data: {
      role: UserRole.admin,
      emailVerified: true,
      status: UserStatus.approved
    },
  });

  redirect("/login");
}
