import type { UserSettingsInput } from "@/types/user";
import {
  setClientPreferences,
  getActivePreferences,
} from "@/lib/utils/formatters";

/**
 * Set the user configuration for client-side formatting.
 * Safe against SSR module pollution.
 */
export function setGlobalUserConfig(config: Partial<UserSettingsInput>) {
  setClientPreferences(config);
}

/**
 * Retrieve active user config preferences.
 */
export function getGlobalUserConfig(): UserSettingsInput {
  return getActivePreferences();
}