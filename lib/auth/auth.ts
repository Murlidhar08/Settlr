// Packages
import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, customSession, haveIBeenPwned, lastLoginMethod, multiSession, twoFactor, username, captcha } from "better-auth/plugins";
import { redirect } from "next/navigation";
import crypto from "crypto";

// Lib
import { sendMail } from "../nodemailer";
import { prisma } from "../prisma/prisma";
import { ac, parseRoles, roles } from "./permissions";
import { deleteUserPhysicalFiles } from "../user-cleanup";

// Template
import { headers } from "next/headers";
import { envServer } from "../env.server";
import { Currency, ThemeMode, UserStatus } from "../generated/prisma/enums";
import { getDeleteAccountEmailHtml } from "../templates/email-delete-account";
import { getPasswordResetSuccessEmailHtml } from "../templates/email-password-reseted";
import { getResetPasswordEmailHtml } from "../templates/email-reset-password";
import { getVerificationEmailHtml } from "../templates/email-verification";

/**
 * Generates an HMAC signature for authenticating internal admin setup calls.
 */
export const getSetupSignature = () => {
  return crypto
    .createHmac("sha256", envServer.BETTER_AUTH_SECRET)
    .update("internal-admin-setup")
    .digest("hex");
};

export const auth = betterAuth({
  appName: envServer.NEXT_PUBLIC_APP_NAME,
  baseURL: envServer.BETTER_AUTH_URL,
  secret: envServer.BETTER_AUTH_SECRET,
  errorPage: "/error",
  trustedOrigins: [
    envServer.BETTER_AUTH_URL,
    ...(envServer.BETTER_AUTH_TRUSTED_ORIGINS ? envServer.BETTER_AUTH_TRUSTED_ORIGINS.split(",") : []),
  ],
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: "database",
    modelName: "rateLimit",
    customRules: {
      "/sign-in/*": { window: 60, max: 5 },
      "/sign-up/*": { window: 60, max: 5 },
      "/two-factor/*": { window: 60, max: 5 },
      "/forget-password": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "cf-connecting-ip", "x-real-ip"],
      trustedProxies: [
        "127.0.0.1",
        "::1",
        "10.0.0.0/8",
        "172.16.0.0/12",
        "192.168.0.0/16",
        ...(envServer.TRUSTED_PROXIES ? envServer.TRUSTED_PROXIES.split(",").map((s) => s.trim()).filter(Boolean) : []),
      ],
    },
  },

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      contactNo: {
        type: "string",
        required: false
      },
      address: {
        type: "string",
        required: false
      }
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }: any) => {
        try {
          const confirmUrl = token ? `${envServer.BETTER_AUTH_URL}/confirm-delete-account?token=${token}` : url;
          const emailHtml = getDeleteAccountEmailHtml(user.email, confirmUrl);

          // Dev-only helper
          if (envServer.NODE_ENV === "development") {
            console.log("Delete confirmation URL (dev only):", confirmUrl);
          }

          const { data, error } = await sendMail({
            sendTo: user.email,
            subject: "Confirm Account Deletion",
            htmlContent: emailHtml
          });

          if (error) {
            console.error("Failed to send delete account email:", error);
            throw new Error("Failed to send delete account email");
          }

          console.log("Delete account confirmation email sent to:", user.email);
          console.log("Email ID:", data?.id);
        } catch (error) {
          console.error("Error in sendDeleteAccountVerification:", error);
          throw error;
        }
      },
      beforeDelete: async (user: any) => {
        try {
          if (user?.id) {
            await deleteUserPhysicalFiles(user.id);
          }
        } catch (e) {
          console.error("Error cleaning up user files before delete:", e);
        }
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    // Send password reset mail
    sendResetPassword: async ({ user, url }) => {
      try {
        // In development, also log the URL for easy testing
        if (envServer.NODE_ENV === "development") {
          console.log("Reset URL (dev only):", url)
        }

        const emailHtml = getResetPasswordEmailHtml(user.email, url)
        const { data, error } = await sendMail({
          sendTo: user.email,
          subject: "Reset Your Password",
          htmlContent: emailHtml
        });

        if (error) {
          console.error("Failed to send reset password email:", error)
          throw new Error("Failed to send reset password email")
        }
        console.log("Reset password email sent successfully to:", user.email)
        console.log("Email data:", data)
      } catch (error) {
        console.error("Error in sendResetPassword:", error)
        throw error
      }
    },

    // Send password reset successfully mail
    onPasswordReset: async ({ user }) => {
      try {
        // M-1: Unconditionally revoke all sessions for this user on password reset
        await prisma.session.deleteMany({
          where: {
            userId: user.id,
          },
        });
        console.log(`Successfully revoked all sessions for user ${user.email} on password reset.`);

        const appUrl = envServer.BETTER_AUTH_URL;
        const emailHtml = getPasswordResetSuccessEmailHtml(user.email, appUrl);

        const { data, error } = await sendMail({
          sendTo: user.email,
          subject: "Password Reset Successful",
          htmlContent: emailHtml
        });

        if (error) {
          console.error("Failed to send password reset success email:", error);
          throw new Error("Failed to send password reset success email");
        }

        console.log("Password reset success email sent to:", user.email);
        console.log("Email data:", data);
      } catch (err) {
        console.error("Error in onPasswordReset:", err);
        throw err;
      }
    }
  },
  emailVerification: {
    // After sign up verification link sended to mail
    sendVerificationEmail: async ({ user, url }) => {
      try {
        const emailHtml = getVerificationEmailHtml(user.email, url);

        // In development, also log the URL for easy testing
        if (envServer.NODE_ENV === "development") {
          console.log("verification URL (dev only):", url)
        }

        // Send the email
        const { data, error } = await sendMail({
          sendTo: user.email,
          subject: "Verify Email",
          htmlContent: emailHtml
        });

        if (error) {
          console.error("Failed to send verification password email:", error)
          throw new Error("Failed to send verification password email")
        }
        console.log("Verification password email sent successfully to:", user.email)
        console.log("Email ID:", data?.id)
      } catch (error) {
        console.error("Error in sendVerificationMail:", error)
        throw error
      }
    },
    afterEmailVerification: async (user) => {
      console.log(`${user.email} has been successfully verified!`);
    }
  },
  socialProviders: {
    ...(envServer.GOOGLE_CLIENT_ID && envServer.GOOGLE_CLIENT_SECRET ? {
      google: {
        clientId: envServer.GOOGLE_CLIENT_ID as string,
        clientSecret: envServer.GOOGLE_CLIENT_SECRET as string,
        prompt: "select_account",
      }
    } : {}),
    ...(envServer.DISCORD_CLIENT_ID && envServer.DISCORD_CLIENT_SECRET ? {
      discord: {
        clientId: envServer.DISCORD_CLIENT_ID as string,
        clientSecret: envServer.DISCORD_CLIENT_SECRET as string,
      }
    } : {}),
    ...(envServer.FACEBOOK_CLIENT_ID && envServer.FACEBOOK_CLIENT_SECRET ? {
      facebook: {
        clientId: envServer.FACEBOOK_CLIENT_ID as string,
        clientSecret: envServer.FACEBOOK_CLIENT_SECRET as string,
      }
    } : {}),
  },
  session: {
    cookieCache: {
      enabled: false,
    }
  },
  plugins: [
    adminPlugin({
      ac,
      roles,
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    twoFactor(),
    lastLoginMethod(),
    passkey(),
    customSession(async ({ user, session }) => {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          contactNo: true,
          address: true,
          twoFactorEnabled: true,
          role: true,
          banned: true,
          banReason: true,
          status: true,

          // current session context
          sessions: {
            where: { id: session.id },
            select: {
              id: true,
              impersonatedBy: true
            },
            take: 1,
          },

          // user preferences
          userSettings: {
            select: {
              currency: true,
              locale: true,
              dateFormat: true,
              timeFormat: true,
              language: true,
              theme: true,
              debug: true
            },
          },
        },
      })

      const settings = dbUser?.userSettings;
      const dbSession = dbUser?.sessions[0];
      const userRole = dbUser?.role ?? "user";

      return {
        session: {
          ...session,
          impersonatedBy: dbSession?.impersonatedBy ?? null,

          userSettings: {
            currency: settings?.currency ?? Currency.INR,
            locale: settings?.locale ?? "en-IN",
            dateFormat: settings?.dateFormat ?? "dd MMM, yyyy",
            timeFormat: settings?.timeFormat ?? "hh:mm a",
            language: settings?.language ?? "en",
            theme: settings?.theme ?? ThemeMode.LIGHT,
            debug: settings?.debug ?? false
          },
        },

        user: {
          ...user,
          status: dbUser?.status ?? UserStatus.pendingapproval,
          role: userRole,
          roles: parseRoles(userRole),
          contactNo: dbUser?.contactNo,
          address: dbUser?.address,
          twoFactorEnabled: dbUser?.twoFactorEnabled ?? false,
          banned: dbUser?.banned ?? false,
          banReason: dbUser?.banReason ?? null,
        },
      }
    }),
    multiSession({
      maximumSessions: 5,
    }),
    haveIBeenPwned({
      enabled: envServer.ADVANCE_PASS_CHECK === "true",
      customPasswordCompromisedMessage: "This password has appeared in data breaches. Please choose a stronger, unique password."
    }),
    username(),
    nextCookies(),
    ...((envServer.TURNSTILE_SECRET_KEY && envServer.NEXT_PUBLIC_TURNSTILE_SITE_KEY) ? [
      captcha({
        provider: "cloudflare-turnstile",
        secretKey: envServer.TURNSTILE_SECRET_KEY as string,
        endpoints: [
          "/sign-in/email",
          "/sign-in/username",
          "/sign-up/email",
          "/forget-password",
          "/request-password-reset",
        ],
      }),
    ] : []),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (_user, context) => {
          const setupHeader = context?.headers?.get("x-setup-token");
          const isSetupRequest = setupHeader === getSetupSignature();

          if (!isSetupRequest) {
            const adminCount = await prisma.user.count({
              where: {
                role: { contains: "admin" },
              },
            });

            if (adminCount === 0) {
              // N-3: Refuse public sign-up when no admin exists to prevent squatting and locking out setup
              return false;
            }
          }
        },
        after: async (user) => {
          // Perform any action after user is added to database
          console.log(`New user created: ${user.email}`);
        },
      },
    },
  },
});

export type Auth = typeof auth;

/**
 * Retrieves the current session safely without redirecting.
 * Recommended for API routes, handlers, and Server Actions.
 */
export const getServerSession = async () => {
  try {
    return await auth.api.getSession({
      headers: await headers()
    });
  } catch {
    return null;
  }
};

/**
 * Retrieves the current session and redirects to /login if unauthenticated.
 * Recommended for Server Components and protected pages.
 */
export const getUserSession = async () => {
  const session = await getServerSession();

  if (session == null) {
    redirect("/login" as any);
  }

  return session;
};
