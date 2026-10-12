import { format, formatDistanceToNow } from "date-fns";
import { Currency } from "@/lib/generated/prisma/enums";
import { DEFAULT_USER_SETTINGS, CURRENCY_SYMBOLS } from "@/lib/config/constants";
import type { UserSettingsInput } from "@/types/user";

// Client-only preference cache
let clientPreferences: UserSettingsInput = { ...DEFAULT_USER_SETTINGS };

/**
 * Updates browser-side formatting preferences. Only affects client session.
 */
export function setClientPreferences(config: Partial<UserSettingsInput>): void {
  if (typeof window === "undefined") return; // Never mutate in SSR!
  clientPreferences = { ...clientPreferences, ...config };
}

/**
 * Retrieves active formatting preferences.
 */
export function getActivePreferences(): UserSettingsInput {
  return typeof window !== "undefined" ? clientPreferences : DEFAULT_USER_SETTINGS;
}

/**
 * Formats a date difference relative to now (e.g. "5 minutes ago").
 */
export function formatDateDifferenceToNow(date: Date | string | number): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return String(date);
  }
}

/**
 * Formats a date using a custom pattern or the user's preferred date format.
 */
export function formatUserDate(
  date: Date | string | number,
  customFormat?: string,
  userConfig?: Partial<UserSettingsInput>
): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);

    const active = userConfig ?? getActivePreferences();
    const pattern = customFormat ?? active.dateFormat ?? DEFAULT_USER_SETTINGS.dateFormat;

    return format(d, pattern);
  } catch {
    return String(date);
  }
}

/**
 * Formats a time string according to user preferences (12/24 hour).
 */
export function formatUserTime(
  date: Date | string | number,
  customFormat?: string,
  userConfig?: Partial<UserSettingsInput>
): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);

    const active = userConfig ?? getActivePreferences();
    const pattern = customFormat ?? active.timeFormat ?? DEFAULT_USER_SETTINGS.timeFormat;

    return format(d, pattern);
  } catch {
    return String(date);
  }
}

/**
 * Formats both date and time into a cohesive string.
 */
export function formatUserDateTime(
  date: Date | string | number,
  separator: string = " • ",
  userConfig?: Partial<UserSettingsInput>
): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);

    const formattedDate = formatUserDate(d, undefined, userConfig);
    const formattedTime = formatUserTime(d, undefined, userConfig);

    return `${formattedDate}${separator}${formattedTime}`;
  } catch {
    return String(date);
  }
}

/**
 * Formats a numeric value into currency using Intl.NumberFormat.
 */
export function formatUserCurrency(
  value: number | string | bigint,
  customCurrency?: string,
  customLocale?: string,
  userConfig?: Partial<UserSettingsInput>
): string {
  try {
    const num = typeof value === "number" ? value : parseFloat(String(value));
    if (isNaN(num)) return String(value);

    const active = userConfig ?? getActivePreferences();
    const locale = customLocale || active.locale || DEFAULT_USER_SETTINGS.locale;
    const currency = customCurrency || active.currency || DEFAULT_USER_SETTINGS.currency;

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(num);
  } catch {
    return String(value);
  }
}

/**
 * Formats a numeric value without the currency symbol.
 */
export function formatUserNumber(
  value: number | string | bigint,
  customLocale?: string,
  userConfig?: Partial<UserSettingsInput>
): string {
  try {
    const num = typeof value === "number" ? value : parseFloat(String(value));
    if (isNaN(num)) return String(value);

    const active = userConfig ?? getActivePreferences();
    const locale = customLocale || active.locale || DEFAULT_USER_SETTINGS.locale;

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return String(value);
  }
}

/**
 * Formats raw amount into localized number.
 */
export function formatAmount(
  amount?: number | null,
  locale?: string,
  userConfig?: Partial<UserSettingsInput>
): string {
  if (amount == null) return "0";
  const active = userConfig ?? getActivePreferences();
  const targetLocale = locale || active.locale || DEFAULT_USER_SETTINGS.locale;
  return Math.abs(amount).toLocaleString(targetLocale);
}

/**
 * Resolves the currency symbol for a given Currency enum.
 */
export function getCurrencySymbol(currency?: Currency): string {
  if (currency && CURRENCY_SYMBOLS[currency]) {
    return CURRENCY_SYMBOLS[currency];
  }
  const active = getActivePreferences();
  return (active.currency && CURRENCY_SYMBOLS[active.currency]) || CURRENCY_SYMBOLS[Currency.INR];
}
