"use server";

import { auth, getSetupSignature } from "@/lib/auth/auth";
import { envServer } from "@/lib/config/env";
import { ForbiddenError } from "@/lib/errors/app-error";
import { UserRole, UserStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

const setupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  token: z.string().optional(),
  setupToken: z.string().optional(),
});

export async function setupAdmin(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validatedData = setupSchema.parse(rawData);

  // N-3: Enforce SETUP_TOKEN from environment if configured
  if (envServer.SETUP_TOKEN) {
    const providedToken = validatedData.token || validatedData.setupToken;
    if (!providedToken || providedToken !== envServer.SETUP_TOKEN) {
      throw new ForbiddenError("Invalid setup token");
    }
  }

  // 1. Initial check: verify no users exist
  const initialUserCount = await prisma.user.count();
  if (initialUserCount > 0) {
    redirect("/login");
  }

  // 2. N-3: Atomic claim in PostgreSQL using unique primary key in verification table.
  // Exactly one concurrent setup transaction can succeed; others fail immediately with a unique constraint violation.
  try {
    await prisma.verification.create({
      data: {
        id: "setup_admin_claim",
        identifier: "setup_claim",
        value: "in_progress",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minute reservation window
      },
    });
  } catch {
    // Another concurrent setup process won the race or setup is already complete
    redirect("/login");
  }

  let user: any = null;
  try {
    // 3. Create the user using Better Auth with authenticated internal setup signature
    user = await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name,
        username: validatedData.username,
      },
      headers: new Headers({
        "x-setup-token": getSetupSignature(),
      }),
    });

    if (!user?.user?.id) {
      throw new Error("Failed to create admin user");
    }

    // 4. Update the user to be admin, verified, and approved
    await prisma.user.update({
      where: { id: user.user.id },
      data: {
        role: UserRole.admin,
        emailVerified: true,
        status: UserStatus.approved,
      },
    });

    // Mark setup as permanently completed
    await prisma.verification.update({
      where: { id: "setup_admin_claim" },
      data: { value: "completed" },
    }).catch(() => {});
  } catch (error) {
    // On failure during user creation, clean up claim to allow legitimate administrator to fix inputs and retry
    if (!user) {
      await prisma.verification.delete({
        where: { id: "setup_admin_claim" },
      }).catch(() => {});
    }
    throw error;
  }

  redirect("/login");
}
