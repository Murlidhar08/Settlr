import type { QueryClient } from "@tanstack/react-query";

export const AUTH_CHANNEL_NAME = "auth_identity_sync";
export const AUTH_STORAGE_KEY = "auth_identity_timestamp";

/**
 * Notifies all tabs and local React Query cache that the active user identity has changed (F6, F7).
 * Clears query cache, purges local session artifacts, and broadcasts an identity-change event
 * so all other tabs refresh their authentication state and in-memory caches.
 */
export function onIdentityChange(queryClient?: QueryClient | null) {
  if (queryClient) {
    try {
      queryClient.clear();
    } catch (err) {
      console.warn("Failed to clear local queryClient during identity change:", err);
    }
  }

  if (typeof window !== "undefined") {
    const timestamp = Date.now().toString();

    // 1. BroadcastChannel for modern browsers (same-origin tabs/windows)
    if ("BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
        channel.postMessage({ type: "AUTH_IDENTITY_CHANGED", timestamp });
        channel.close();
      } catch (err) {
        console.warn("BroadcastChannel error during identity change:", err);
      }
    }

    // 2. Storage event fallback for older browsers or background cross-tab sync
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, timestamp);
    } catch {
      // Ignore localStorage access failures in private mode
    }
  }
}

