export type Language = "en" | "hi";

import en from "./en/en";
import hi from "./hi/hi";

export const translations: Record<Language, any> = {
    en,
    hi,
};

// Define your primary default fallback language
const FALLBACK_LANGUAGE: Language = "en";
let activeLanguage: Language = "en";

export function setActiveLanguage(lang: string) {
    // Only switch if the language is supported, otherwise default to active
    if (lang in translations) {
        activeLanguage = lang as Language;
    }
}

export function getActiveLanguage(): Language {
    return activeLanguage;
}

/**
 * Internal helper to safely resolve a nested dot-notation key from a translation object.
 * Returns undefined if the key chain does not exist or does not resolve to a string.
 */
function resolveKey(key: string, lang: Language): string | undefined {
    const keys = key.split(".");
    let value = translations[lang];

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return undefined;
        }
    }

    return typeof value === 'string' ? value : undefined;
}

/**
 * Main translation utility. Looks up a key in the targeted language.
 * Falls back to the primary language (en) if missing, then to the raw key string.
 */
export const t = (key: string, lang?: Language, params?: Record<string, string>): string => {
    const targetLanguage = lang || activeLanguage;

    // 1. Try resolving in the requested language
    let value = resolveKey(key, targetLanguage);

    // 2. If missing and we aren't already looking at the fallback language, try the fallback language
    if (value === undefined && targetLanguage !== FALLBACK_LANGUAGE) {
        value = resolveKey(key, FALLBACK_LANGUAGE);
    }

    // 3. Final structural fallback: if it's completely missing everywhere, return the raw key string
    if (value === undefined) {
        return key;
    }

    // Replace parameter placeholders if they are provided
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            value = (value as string).replace(`{${k}}`, v);
        });
    }

    return value;
};

/**
 * Helper to check if a specific key exists anywhere in the valid translation pipeline.
 */
export function hasTranslationKey(key: string, lang?: Language): boolean {
    const targetLanguage = lang || activeLanguage;
    return (
        resolveKey(key, targetLanguage) !== undefined ||
        resolveKey(key, FALLBACK_LANGUAGE) !== undefined
    );
}

// Cleaned up alias function mapping cleanly to t()
export function tran(key: string, params?: Record<string, string>): string {
    return t(key, activeLanguage, params);
}
