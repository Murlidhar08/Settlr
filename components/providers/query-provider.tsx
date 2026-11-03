"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { AUTH_CHANNEL_NAME, AUTH_STORAGE_KEY } from "@/lib/auth/identity-sync";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleIdentitySync = () => {
      queryClient.clear();
      window.location.reload();
    };

    // 1. BroadcastChannel listener (F6, F7)
    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event.data?.type === "AUTH_IDENTITY_CHANGED") {
            handleIdentitySync();
          }
        };
      } catch (e) {
        console.warn("Failed to attach BroadcastChannel:", e);
      }
    }

    // 2. Storage event listener fallback (F7)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === AUTH_STORAGE_KEY && event.newValue) {
        handleIdentitySync();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (channel) {
        channel.close();
      }
      window.removeEventListener("storage", handleStorage);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
