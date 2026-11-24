/**
 * Public Runtime Configuration
 *
 * Provides dynamic, container-startup environment variables to both server
 * and client contexts without embedding values during Docker image build time.
 */

export type PublicRuntimeConfig = Record<string, string | boolean>;

export const DEFAULT_PUBLIC_CONFIG: PublicRuntimeConfig = {
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: ""
};

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: PublicRuntimeConfig;
  }
}

/**
 * Converts environment string values into appropriate types.
 * "true"  -> true
 * "false" -> false
 * Other values remain strings.
 */
function parseEnvValue(value: string | undefined): string | boolean {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "true") return true;
  if (normalized === "false") return false;

  return value ?? "";
}

/**
 * Reads public runtime configuration.
 *
 * Browser: Reads from window.__RUNTIME_CONFIG__.
 * Server: Reads dynamically from process.env.
 */
export function getPublicRuntimeConfig(): PublicRuntimeConfig {
  // Browser context
  if (typeof window !== "undefined") {
    return window.__RUNTIME_CONFIG__ ?? DEFAULT_PUBLIC_CONFIG;
  }

  // Server context
  const runtimeConfig = Object.fromEntries(
    Object.entries(process.env)
      .filter(([key]) => key.startsWith("NEXT_PUBLIC_"))
      .map(([key, value]) => [key, parseEnvValue(value)])
  );

  return {
    ...DEFAULT_PUBLIC_CONFIG,
    ...runtimeConfig,
  };
}
