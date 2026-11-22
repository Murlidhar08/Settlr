import crypto from "node:crypto";
import { envServer } from "./config/env";
import { prisma } from "./prisma/prisma";

let lastLoggedToken: string | null = null;

/**
 * Formats and prints a prominent banner displaying the setup token.
 * Strictly outputs only to the server log/terminal stdout.
 */
export function printSetupTokenLog(token: string, source: string = "active setup session") {
  if (typeof window !== "undefined") {
    // Guard: Never log setup token in client/browser environments
    return;
  }

  const line = "═".repeat(68);
  const banner = [
    line,
    "                    FIRST-TIME INSTANCE SETUP                       ",
    "",
    "  A setup token is required to initialize the administrator account.",
    `  SETUP_TOKEN (${source}):`,
    "",
    `  ${token}`,
    "",
    "  Navigate to /setup and paste this token to complete installation.",
    line,
  ].join("\n");

  if (typeof process !== "undefined" && process.stdout?.write) {
    process.stdout.write(`\n${banner}\n\n`);
  } else {
    console.info(`\n${banner}\n`);
  }
}

/**
 * Retrieves the existing setup token or generates and persists a new random one.
 * Logs the token to the server log when generated, or when forceLog is enabled.
 */
export async function getOrGenerateSetupToken(forceLog: boolean = false): Promise<string> {
  // 1. If SETUP_TOKEN is explicitly configured in environment, prioritize it
  if (envServer.SETUP_TOKEN && envServer.SETUP_TOKEN.trim().length > 0) {
    const envToken = envServer.SETUP_TOKEN.trim();
    if (forceLog || lastLoggedToken !== envToken) {
      lastLoggedToken = envToken;
      printSetupTokenLog(envToken, "environment variable");
    }
    return envToken;
  }

  // 2. Check if a random token has already been generated and persisted in Verification table
  try {
    const existing = await prisma.verification.findUnique({
      where: { id: "setup_token" },
    });

    if (existing && existing.value && new Date(existing.expiresAt) > new Date()) {
      if (forceLog || lastLoggedToken !== existing.value) {
        lastLoggedToken = existing.value;
        printSetupTokenLog(existing.value, "active setup session");
      }
      return existing.value;
    }

    // 3. Generate a secure, user-friendly 32-character random hex token
    const generatedToken = crypto.randomBytes(16).toString("hex");

    await prisma.verification.upsert({
      where: { id: "setup_token" },
      update: {
        value: generatedToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours validity
      },
      create: {
        id: "setup_token",
        identifier: "setup_token",
        value: generatedToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    lastLoggedToken = generatedToken;
    printSetupTokenLog(generatedToken, "randomly generated");
    return generatedToken;
  } catch (error) {
    console.error("[SETUP] Failed to persist generated setup token in database:", error);
    // In-memory fallback if DB write fails temporarily
    const fallbackToken = crypto.randomBytes(16).toString("hex");
    if (forceLog || lastLoggedToken !== fallbackToken) {
      lastLoggedToken = fallbackToken;
      printSetupTokenLog(fallbackToken, "in-memory fallback");
    }
    return fallbackToken;
  }
}

/**
 * Validates provided token against the current active setup token using timing-safe comparison.
 */
export async function validateSetupToken(providedToken?: string | null): Promise<boolean> {
  if (!providedToken || typeof providedToken !== "string") {
    return false;
  }

  const expectedToken = await getOrGenerateSetupToken();
  const trimmedProvided = providedToken.trim();
  const trimmedExpected = expectedToken.trim();

  if (trimmedProvided.length !== trimmedExpected.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(trimmedProvided),
      Buffer.from(trimmedExpected)
    );
  } catch {
    return false;
  }
}

/**
 * Clears setup tokens from database after setup completes.
 */
export async function clearSetupToken(): Promise<void> {
  lastLoggedToken = null;
  try {
    await prisma.verification.delete({
      where: { id: "setup_token" },
    }).catch(() => { });
  } catch {
    // Ignore cleanup error
  }
}

export async function isSetupRequired(logTokenIfRequired: boolean = false) {
  try {
    const userCount = await prisma.user.count();
    const required = userCount === 0;
    if (required) {
      // Ensure token is generated and logged to server console
      await getOrGenerateSetupToken(logTokenIfRequired);
    }
    return required;
  } catch (error: any) {
    // Only log errors that aren't connection issues (common during build)
    if (error.code !== "ECONNREFUSED") {
      console.error("Error checking setup status:", error);
    }
    return false; // Default to false to avoid redirect loops on DB error
  }
}
