"use client";

import { envClient } from "@/lib/env.client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface TurnstileContextType {
  siteKey?: string;
  isConfigured: boolean;
}

const TurnstileContext = createContext<TurnstileContextType>({
  siteKey: undefined,
  isConfigured: false,
});

export function useTurnstileContext() {
  return useContext(TurnstileContext);
}

export function TurnstileProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const siteKey = envClient.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  return (
    <TurnstileContext.Provider
      value={{
        siteKey: mounted ? siteKey : undefined,
        isConfigured: Boolean(siteKey),
      }}
    >
      {children}
    </TurnstileContext.Provider>
  );
}

// Backward compatibility alias
export { TurnstileProvider as ReCaptchaProvider };
