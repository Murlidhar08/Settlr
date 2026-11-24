
import { z } from "zod";
import { getPublicRuntimeConfig } from "./runtime";

/**
 * Known placeholder / development secrets that must never be used in production.
 */
const KNOWN_DEFAULT_SECRETS = new Set([
  "your-secret-key-must-be-changed",
]);

/**
 * Detects whether Next.js is executing during static build/compilation.
 */
function isBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build" ||
    process.env.IS_DOCKER_BUILD === "true"
  );
}

/**
 * Shared boolean environment variable parser.
 */
const booleanEnv = (defaultValue: boolean) =>
  z
    .enum(["true", "false"])
    .default(String(defaultValue) as "true" | "false")
    .transform((value) => value === "true");

/**
 * Server-side Environment Variables Schema.
 */
const serverEnvSchema = z.object({
  // Runtime environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  ADVANCE_PASS_CHECK: z.enum(["true", "false"]).default("false"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET must be at least 16 characters long"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
  TRUSTED_PROXIES: z.string().optional(),
  SETUP_TOKEN: z.string().optional(),

  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),

  // Cloudflare Turnstile
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Update webhook
  UPDATE_WEBHOOK_URL: z.string().optional(),

  // Bundle analysis
  ANALYZE: z.string().optional(),
});

/**
 * Client-safe Environment Variables Schema.
 *
 * Known variables receive validation and defaults.
 * Unknown NEXT_PUBLIC_* variables are automatically supported.
 */
const clientEnvSchema = z
  .object({
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional()
  })
  .catchall(z.union([z.string(), z.boolean()]));

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validates server environment variables.
 *
 * During build, safe placeholders are used for required variables.
 * Actual runtime values are validated when the container starts.
 */
function validateServerEnv(): ServerEnv {
  const isBuilding = isBuildPhase();

  const envToValidate = isBuilding
    ? {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://build_placeholder:build_placeholder@localhost:5432/build_placeholder",
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "build_dummy_secret_at_least_16_characters_long",
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    }
    : process.env;

  const result = serverEnvSchema.safeParse(envToValidate);

  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((issue) => `  - [${issue.path.join(".")}]: ${issue.message}`)
      .join("\n");

    const message =
      `❌ Invalid or missing Server Environment Variables:\n` +
      `${formattedErrors}\n\n` +
      "Please check your .env or container environment.";

    console.error(message);
    throw new Error(message);
  }

  const data = result.data;

  // Reject known default secrets in production.
  if (!isBuilding && data.NODE_ENV === "production" && KNOWN_DEFAULT_SECRETS.has(data.BETTER_AUTH_SECRET)) {
    throw new Error("❌ Insecure BETTER_AUTH_SECRET: Please generate a unique random secret.");
  }

  // Reject invalid production hostnames.
  if (!isBuilding && data.NODE_ENV === "production") {
    const hostname = new URL(data.BETTER_AUTH_URL).hostname;

    if (hostname === "0.0.0.0" || hostname === "[::]") {
      throw new Error("❌ Invalid BETTER_AUTH_URL: Hostname cannot be 0.0.0.0 or [::] in production.");
    }
  }

  return data;
}

/**
 * Validates public runtime configuration dynamically.
 *
 * New NEXT_PUBLIC_* variables are automatically supported
 * without modifying this schema.
 */
function validateClientEnv(): ClientEnv {
  const runtimeConfig = getPublicRuntimeConfig();

  const result = clientEnvSchema.safeParse(runtimeConfig);

  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((issue) => `  - [${issue.path.join(".")}]: ${issue.message}`)
      .join("\n");

    throw new Error(
      `❌ Invalid Public Runtime Configuration:\n${formattedErrors}`
    );
  }

  return result.data;
}

/**
 * Lazy/cached environment access.
 */
let parsedServerEnv: ServerEnv | null = null;

export const env = {
  get server(): ServerEnv {
    if (typeof window !== "undefined") {
      throw new Error("Server environment cannot be accessed in the browser.");
    }

    if (!parsedServerEnv) {
      parsedServerEnv = validateServerEnv();
    }

    return parsedServerEnv;
  },

  get client(): ClientEnv {
    return validateClientEnv();
  },
};

/**
 * Lazy server-side environment proxy.
 */
export const envServer: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, prop: string | symbol) {
    if (typeof window !== "undefined" || typeof prop !== "string") {
      return undefined;
    }

    return env.server[prop as keyof ServerEnv];
  },
});

/**
 * Dynamic client environment proxy.
 *
 * Supports both known and newly added public environment variables.
 */
export const envClient: ClientEnv = new Proxy({} as ClientEnv, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== "string") {
      return undefined;
    }

    return env.client[prop];
  },
});
