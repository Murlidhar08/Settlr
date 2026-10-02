import { passkeyClient } from "@better-auth/passkey/client";
import { adminClient, customSessionClient, inferAdditionalFields, lastLoginMethodClient, multiSessionClient, twoFactorClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { Auth } from "./auth";
import { ac, roles } from "./permissions";

/**
 * Single source of truth for auth client
 */
export const authClient = createAuthClient({
  session: {
    cookieCache: {
      enabled: false,
    },
  },
  plugins: [
    customSessionClient<Auth>(),
    inferAdditionalFields<Auth>(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        window.location.href = "/two-factor"
      },
    }),
    lastLoginMethodClient(),
    adminClient({
      ac,
      roles,
    }),
    passkeyClient(),
    multiSessionClient(),
    usernameClient()
  ],
})

export * from "./permissions";

/**
 * Re-export helpers for convenience
 */
export const { signIn, signUp, signOut, useSession, getSession, resetPassword } = authClient

/**
 * Social providers
 */
type SocialProvider = "google" | "discord" | "facebook"

export const signInWithSocial = async (provider: SocialProvider) => {
  return await authClient.signIn.social({
    provider,
    callbackURL: "/dashboard"
  })
}

export const signInWithGoogle = async () => await signInWithSocial("google");
export const signInWithDiscord = async () => await signInWithSocial("discord");
export const signInWithFacebook = async () => await signInWithSocial("facebook");
