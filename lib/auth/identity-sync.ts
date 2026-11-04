import type { QueryClient } from "@tanstack/react-query";

export const AUTH_CHANNEL_NAME = "auth_identity_sync";
export const AUTH_STORAGE_KEY = "auth_identity_timestamp";

declare global {
  interface Window {
    __APP_TAB_ID__?: string;
  }
}

/**
 * Returns a persistent unique identifier for the current browser tab.
 */
export function getTabId(): string {
  if (typeof window === "undefined") return "";

  if (!window.__APP_TAB_ID__) {
    try {
      let tabId = sessionStorage.getItem("app_tab_id");
      if (!tabId) {
        tabId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        sessionStorage.setItem("app_tab_id", tabId);
      }
      window.__APP_TAB_ID__ = tabId;
    } catch {
      window.__APP_TAB_ID__ = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
  }

  return window.__APP_TAB_ID__;
}

/**
 * Notifies all other tabs and local React Query cache that the active user identity has changed (F6, F7).
 * Clears local query cache and broadcasts an identity-change event so OTHER tabs refresh
 * their authentication state, while preventing the current tab from reloading itself.
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
    const senderId = getTabId();

    // 1. BroadcastChannel for modern browsers (same-origin tabs/windows)
    if ("BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
        channel.postMessage({
          type: "AUTH_IDENTITY_CHANGED",
          senderId,
          timestamp,
        });
        channel.close();
      } catch (err) {
        console.warn("BroadcastChannel error during identity change:", err);
      }
    }

    // 2. Storage event fallback for older browsers or background cross-tab sync
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ timestamp, senderId })
      );
    } catch {
      // Ignore localStorage access failures in private mode
    }
  }
}
