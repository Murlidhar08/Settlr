"use client";

import { Currency, ThemeMode } from "@/lib/generated/prisma/enums";
import { getActiveLanguage, setActiveLanguage } from "@/lib/languages/i18n";
import { setGlobalUserConfig } from "@/utility/global-user-config";
import { useTheme } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";

export interface UserSettingsContextValue {
  dateFormat: string;
  timeFormat: string;
  language: string;
  theme: ThemeMode;
  currency: Currency;
  locale: string;
  defAccId?: string | null;
  defIncomeAccId?: string | null;
  defExpenseAccId?: string | null;
  debug: boolean;
  setTheme: (theme: ThemeMode) => void;
  updateConfig: (updates: Partial<Omit<UserSettingsContextValue, "setTheme" | "updateConfig">>) => void;
}

const UserConfigContext = createContext<UserSettingsContextValue | null>(null);

export const useUserConfig = (): UserSettingsContextValue => {
  const ctx = useContext(UserConfigContext);
  if (!ctx) {
    throw new Error("useUserConfig must be used inside UserConfigProvider");
  }
  return ctx;
};

export interface UserConfigProviderProps {
  config: Omit<UserSettingsContextValue, "setTheme" | "updateConfig">;
  children: React.ReactNode;
}

export function UserConfigProvider({ config, children }: UserConfigProviderProps) {
  const [state, setState] = useState(config);
  const [theme, setThemeState] = useState<ThemeMode>(config.theme);
  const { setTheme: setNextTheme } = useTheme();

  // Synchronously set active language and preferences before children render
  if (config?.language && getActiveLanguage() !== config.language) {
    setActiveLanguage(config.language);
    setGlobalUserConfig(config);
  }

  // Sync state with server config when it updates
  useEffect(() => {
    setState(config);
    setThemeState(config.theme);
  }, [config]);

  // Synchronize client formatting and localization preferences
  useEffect(() => {
    setActiveLanguage(state.language);
    setGlobalUserConfig(state);
  }, [state]);

  // Synchronize next-themes mode
  useEffect(() => {
    if (theme) {
      const themeMap: Record<ThemeMode, string> = {
        [ThemeMode.AUTO]: "system",
        [ThemeMode.LIGHT]: "light",
        [ThemeMode.DARK]: "dark",
      };
      setNextTheme(themeMap[theme]);
    }
  }, [theme, setNextTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    setState((prev) => ({ ...prev, theme: newTheme }));
  };

  const updateConfig = (
    updates: Partial<Omit<UserSettingsContextValue, "setTheme" | "updateConfig">>
  ) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      setActiveLanguage(next.language);
      setGlobalUserConfig(next);
      return next;
    });
  };

  return (
    <UserConfigContext.Provider value={{ ...state, theme, setTheme, updateConfig }}>
      {children}
    </UserConfigContext.Provider>
  );
}
