"use client";

import { authClient, purgeClientCaches } from "./auth-client";
import { onIdentityChange } from "./identity-sync";
import { signOutCurrentAccount } from "@/actions/user.actions";
import type { QueryClient } from "@tanstack/react-query";

/**
 * Signs out ONLY the currently active account on this device (F1).
 * Better Auth promotes the next available valid session, or clears the session
 * if no other accounts remain on this device.
 */
export async function signOutThisAccount(queryClient?: QueryClient | null) {
  try {
    await purgeClientCaches();
    await signOutCurrentAccount();
  } catch (err) {
    console.warn("Server action signOutCurrentAccount failed, falling back to client revoke:", err);
    try {
      const session = await authClient.getSession();
      if (session?.data?.session?.token) {
        await authClient.multiSession.revoke({ sessionToken: session.data.session.token });
      }
    } catch (fallbackErr) {
      console.error("Fallback client session revocation failed:", fallbackErr);
    }
  } finally {
    onIdentityChange(queryClient);
    // Hard navigate to dashboard. If another account exists, layout loads that account.
    // If no accounts remain, server-side auth guard sends user to /login.
    window.location.assign("/dashboard");
  }
}

/**
 * Signs out of ALL accounts on this device (F1, F9).
 * Deletes all multi-session cookies and device sessions from database.
 */
export async function signOutAllAccounts(queryClient?: QueryClient | null) {
  try {
    await purgeClientCaches();
    await authClient.signOut();
  } catch (err) {
    console.error("Sign out all accounts failed:", err);
  } finally {
    onIdentityChange(queryClient);
    window.location.assign("/login");
  }
}

