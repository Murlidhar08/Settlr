"use client";

import { ThemeMode } from "@/lib/generated/prisma/enums";
import { useEffect } from "react";

type Props = {
  theme: ThemeMode;
  children: React.ReactNode;
};

export function ThemeProvider({ theme, children }: Props) {
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (mode: "light" | "dark") => {
      root.classList.toggle("dark", mode === "dark");
    };

    // Explicit theme
    if (theme === ThemeMode.DARK) {
      applyTheme("dark");
      return;
    }

    if (theme === ThemeMode.LIGHT) {
      applyTheme("light");
      return;
    }

    // AUTO → system theme
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    applyTheme(media.matches ? "dark" : "light");

    const listener = (e: MediaQueryListEvent) =>
      applyTheme(e.matches ? "dark" : "light");

    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [theme]);

  return <>{children}</>;
}
