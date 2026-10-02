import { Currency } from "@/lib/generated/prisma/enums";
import { UserSettingsInput } from "@/types/user/UserSettingsInput";
import { getCurrencySymbol } from "./currency-fn";

let globalUserConfig: UserSettingsInput = {
    dateFormat: "dd MMM, yyyy",
    timeFormat: "hh:mm a",
    currency: Currency.INR,
    currencySymbol: "₹",
    locale: "en-IN"
};

/**
 * Set the global user configuration for hook-free formatting.
 */
export function setGlobalUserConfig(config: Partial<UserSettingsInput>) {
    if (config.dateFormat)
        globalUserConfig.dateFormat = config.dateFormat;

    if (config.timeFormat)
        globalUserConfig.timeFormat = config.timeFormat;

    if (config.currency) {
        globalUserConfig.currency = config.currency;
        globalUserConfig.currencySymbol = getCurrencySymbol(config.currency);
    }

    if (config.locale)
        globalUserConfig.locale = config.locale;
}

/**
 * Retrieve the active global user config preferences.
 */
export function getGlobalUserConfig(): UserSettingsInput {
    return globalUserConfig;
}