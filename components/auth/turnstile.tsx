"use client";

import { envClient } from "@/lib/env.client";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useTheme } from "next-themes";
import React, { forwardRef, useEffect, useId, useState } from "react";

export type { TurnstileInstance };

export interface TurnstileWidgetProps {
  action?: string;
  className?: string;
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  size?: "normal" | "compact" | "flexible" | "invisible";
  siteKey?: string;
}

export const TurnstileWidget = forwardRef<TurnstileInstance, TurnstileWidgetProps>(
  (
    {
      action,
      className = "",
      onSuccess,
      onError,
      onExpire,
      size = "flexible",
      siteKey: propSiteKey,
    },
    ref
  ) => {
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();
    const containerId = useId().replace(/:/g, "_");

    useEffect(() => {
      setMounted(true);
    }, []);

    const siteKey = propSiteKey || envClient.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!mounted || !siteKey) {
      return null;
    }

    const isInvisible = size === "invisible";
    const theme = resolvedTheme === "dark" ? "dark" : "light";

    return (
      <div
        className={`w-full ${isInvisible
          ? "hidden"
          : "flex items-center justify-center min-h-[65px] my-2 transition-all duration-200"
          } ${className}`}
      >
        <Turnstile
          id={`turnstile-${containerId}`}
          ref={ref}
          siteKey={siteKey}
          onSuccess={onSuccess}
          onError={onError}
          onExpire={onExpire}
          options={{
            action,
            theme,
            size,
            refreshExpired: "auto",
          }}
        />
      </div>
    );
  }
);

TurnstileWidget.displayName = "TurnstileWidget";

// Backward compatibility alias
export { TurnstileWidget as RecaptchaNotice };
