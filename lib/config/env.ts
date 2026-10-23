import { z } from "zod";

/**
 * Server-side Environment Variables Schema
 */
const serverEnvSchema = z.object({
  // Runtime environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Application metadata
  NEXT_PUBLIC_APP_NAME: z.string().min(1, "NEXT_PUBLIC_APP_NAME is required"),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().min(1, "NEXT_PUBLIC_APP_DESCRIPTION is required"),
  ADVANCE_PASS_CHECK: z.enum(["true", "false"]).default("false").optional(),

  // Database Connection
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Better Auth Core
  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET must be at least 16 characters long"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),

  // OAuth Providers (Optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),

  // Cloudflare Turnstile Captcha (Optional)
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Bundle analysis
  ANALYZE: z.string().optional(),
});

/**
 * Client-safe Environment Variables Schema
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1, "NEXT_PUBLIC_APP_NAME is required"),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().min(1, "NEXT_PUBLIC_APP_DESCRIPTION is required"),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validates and extracts server-side environment variables with descriptive error output.
 */
function validateServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((issue) => `  - [${issue.path.join(".")}]: ${issue.message}`)
      .join("\n");

    const message = `❌ Invalid or missing Server Environment Variables:\n${formattedErrors}\n\nPlease check your .env or .env.local file.`;
    console.error(message);
    throw new Error(message);
  }

  return result.data;
}

/**
 * Validates and extracts client-side environment variables.
 */
function validateClientEnv(): ClientEnv {
  const clientValues = {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  };

  const result = clientEnvSchema.safeParse(clientValues);

  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((issue) => `  - [${issue.path.join(".")}]: ${issue.message}`)
      .join("\n");

    const message = `❌ Invalid or missing Client Environment Variables:\n${formattedErrors}`;
    console.error(message);
    throw new Error(message);
  }

  return result.data;
}

// Lazy/cached access for environment variables
let parsedServerEnv: ServerEnv | null = null;
let parsedClientEnv: ClientEnv | null = null;

export const env = {
  get server(): ServerEnv {
    if (!parsedServerEnv) {
      parsedServerEnv = validateServerEnv();
    }
    return parsedServerEnv;
  },
  get client(): ClientEnv {
    if (!parsedClientEnv) {
      parsedClientEnv = validateClientEnv();
    }
    return parsedClientEnv;
  },
};

// Aliases for backward compatibility
export const envServer = typeof window === "undefined" ? env.server : ({} as ServerEnv);
export const envClient = env.client;
