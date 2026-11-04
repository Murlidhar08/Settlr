"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { AUTH_CHANNEL_NAME, AUTH_STORAGE_KEY, getTabId } from "@/lib/auth/identity-sync";

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

    const currentTabId = getTabId();

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
          // Ignore messages broadcast by THIS tab/window to prevent self-reloading
          if (
            event.data?.type === "AUTH_IDENTITY_CHANGED" &&
            event.data?.senderId &&
            event.data.senderId !== currentTabId
          ) {
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
        try {
          const data = JSON.parse(event.newValue);
          // Ignore events originating from this tab
          if (data?.senderId && data.senderId === currentTabId) {
            return;
          }
        } catch {
          // Fallback if legacy raw timestamp
        }
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
