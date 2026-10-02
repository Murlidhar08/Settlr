"use client"

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { ConfirmProvider } from "./confirm-provider";
import { PromptProvider } from "./prompt-provider";
import { QueryProvider } from "./query-provider";

/* ========================================================= */
/* EXPORTS */
/* ========================================================= */

export * from "./confirm-provider";
export * from "./header-provider";
export * from "./prompt-provider";
export * from "./query-provider";
export * from "./recaptcha-provider";
export { TurnstileProvider, useTurnstileContext } from "./turnstile-provider";

/* ========================================================= */
/* GLOBAL PROVIDER */
/* ========================================================= */

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
            <QueryProvider>
                <ConfirmProvider>
                    <PromptProvider>
                        {children}
                    </PromptProvider>
                </ConfirmProvider>
            </QueryProvider>
        </ThemeProvider>
    )
}
