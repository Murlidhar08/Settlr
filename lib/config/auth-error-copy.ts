import { envClient } from "@/lib/env.client";

/**
 * ==============================================================================
 * Centralized Copy Configuration for Error & Auth Pages
 * ==============================================================================
 * 
 * All labels, descriptions, badge texts, button labels, placeholders, and hero 
 * banner content for pages under `app/(error)` and `app/(auth)` are centralized here.
 * 
 * Edit this file to easily customize or white-label copy without modifying page JSX.
 * 
 * Note: Placeholders like `{appName}` and `{email}` are dynamically interpolated
 * via the `formatCopy(text, vars)` helper function.
 */

// ------------------------------------------------------------------------------
// Helper: formatCopy
// Replaces {appName} with current envClient.NEXT_PUBLIC_APP_NAME and any dynamic variables
// ------------------------------------------------------------------------------
export function formatCopy(
  template: string,
  variables?: Record<string, string | number>
): string {
  let result = template.replace(
    /\{appName\}/g,
    envClient.NEXT_PUBLIC_APP_NAME || "App"
  );
  if (variables) {
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    }
  }
  return result;
}

// ------------------------------------------------------------------------------
// Error Pages Copy (`app/(error)`)
// ------------------------------------------------------------------------------
export const ERROR_PAGES_COPY = {
  banned: {
    title: "Account Banned",
    description:
      "Your account has been permanently banned due to a violation of our platform policies. If you believe this action was taken in error, please contact our support team.",
    reasonLabel: "Enforcement Reason",
    buttons: {
      support: "Contact Support",
      backToLogin: "Back to Login",
      redirecting: "Redirecting...",
    },
    footer: "Security & Terms of Service Enforcement",
    hero: {
      titleLine1: "Access",
      titleLine2: "Restricted.",
      description:
        "This account has been flagged and suspended for violating our platform's terms of use.",
    },
  },

  expired: {
    title: "Link Expired",
    description:
      "The security token or access link you clicked is no longer valid. This usually happens if the link has already been used, expired due to time limits, or is malformed.",
    buttons: {
      backToLogin: "Back to Login",
    },
    footer: "Link Lifecycle Protection",
    hero: {
      titleLine1: "Access Link",
      titleLine2: "Expired.",
      description:
        "For security purposes, verification links are single-use and have short lifespans.",
    },
  },

  notFound: {
    title: "Page Not Found",
    description:
      "Oops! The page you are looking for does not exist, has been removed, or has had its name changed. Let's get you back on track.",
    buttons: {
      backToHome: "Go Back",
    },
    footer: "404 Error - Resource Finder",
    hero: {
      titleLine1: "Lost in",
      titleLine2: "Space?",
      description: "It seems you've wandered off the grid. Let's guide you back.",
    },
  },

  pendingApproval: {
    title: "Awaiting Approval",
    description:
      "Your account registration is complete, but is currently awaiting administrator review. An administrator will verify your details and activate your access shortly.",
    buttons: {
      backToLogin: "Back to Login",
      redirecting: "Redirecting...",
    },
    footer: "Account Activation Pending Review",
    hero: {
      titleLine1: "Verification",
      titleLine2: "In Progress.",
      description:
        "We're currently reviewing your credentials to maintain platform security.",
    },
  },

  serverError: {
    title: "Server Error",
    description:
      "Our servers are experiencing an unexpected issue (500 Internal Server Error). We are already working to resolve this. Please refresh the page or try again in a few minutes.",
    buttons: {
      refresh: "Refresh Page",
      refreshing: "Refreshing...",
      backToHome: "Go Back Home",
    },
    footer: "System Integrity Protection",
    hero: {
      titleLine1: "System",
      titleLine2: "Interrupted.",
      description:
        "Our servers encountered an unexpected failure. Please try again shortly or return home.",
    },
  },

  suspended: {
    title: "Account Suspended",
    description:
      "Your account access has been temporarily suspended by an administrator. This is usually due to missing verification, policy updates, or administrative holds. Please reach out to support for more details.",
    buttons: {
      support: "Contact Support",
      backToLogin: "Back to Login",
      redirecting: "Redirecting...",
    },
    footer: "Administrative Access Control",
    hero: {
      titleLine1: "Access",
      titleLine2: "Suspended.",
      description:
        "This account is temporarily suspended. Please contact us to resolve this block.",
    },
  },

  unauthorized: {
    title: "Access Denied",
    description:
      "Hold up! You don't have the required administrative role or security permissions (403 Forbidden) to access this directory or resource.",
    buttons: {
      backToSafety: "Back to Safety",
    },
    footer: "Role-Based Access Control Enforcement",
    hero: {
      titleLine1: "Access",
      titleLine2: "Restricted.",
      description:
        "This resource requires higher security clearance or a different administrative level.",
    },
  },
} as const;

// ------------------------------------------------------------------------------
// Auth Pages Copy (`app/(auth)`)
// ------------------------------------------------------------------------------
export const AUTH_PAGES_COPY = {
  login: {
    title: "Welcome back",
    fields: {
      emailOrUsernameLabel: "Email or Username",
      emailOrUsernamePlaceholder: "name@company.com or username",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      forgotPasswordLink: "Forgot Password?",
    },
    socialDivider: "Or continue with",
    buttons: {
      signIn: "Sign In",
      authenticating: "Authenticating...",
      lastUsed: "Last used",
      passkey: "Sign In with Passkey",
      google: "Sign In with Google",
      discord: "Sign In with Discord",
      facebook: "Sign In with Facebook",
    },
    footer: {
      noAccountPrompt: "Don't have an account?",
      signUpLink: "Get Started",
    },
    hero: {
      titleLine1: "Master your",
      titleLine2: "financial destiny.",
      description:
        "Experience the next generation of finance management with real-time insights and enterprise security.",
    },
  },

  signup: {
    title: "Create account",
    subtitle: "Start your financial journey with {appName} today.",
    fields: {
      nameLabel: "Full Name",
      namePlaceholder: "John Doe",
      usernameLabel: "Username",
      usernamePlaceholder: "johndoe",
      emailLabel: "Email Address",
      emailPlaceholder: "name@company.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
    },
    buttons: {
      submit: "Create Account",
      loading: "Creating account...",
    },
    footer: {
      alreadyHaveAccountPrompt: "Already have an account?",
      signInLink: "Sign in",
      termsNotice:
        "By signing up, you agree to our Terms of Service and Privacy Policy",
    },
    messages: {
      successToast:
        "Registration successful! Please check your email for a link to confirm your account.",
      genericError: "An error occurred during signup",
    },
    hero: {
      titleLine1: "The future of",
      titleLine2: "wealth management.",
      description:
        "Join thousands of professionals using {appName} to streamline their financial operations.",
    },
  },

  forgotPassword: {
    form: {
      title: "Forgot Password?",
      subtitle:
        "Enter your email to receive a secure password recovery link.",
      emailLabel: "Email Address",
      emailPlaceholder: "name@company.com",
      submitButton: "Send Reset Link",
      sendingButton: "Sending...",
      backToSignIn: "Back to Sign In",
    },
    success: {
      title: "Check your email",
      subtitle:
        "If an account exists with {email}, a reset link has been sent. Follow the instructions to set a new password.",
      returnToLoginButton: "Return to Login",
    },
    footer: {
      needHelp: "Need help?",
      contactSupport: "Contact Support",
    },
    hero: {
      titleLine1: "Secure Identity",
      titleLine2: "Protection.",
      description:
        "{appName} uses multi-layer encryption to ensure your account remains under your control, always.",
    },
  },

  resetPassword: {
    title: "Reset Password",
    subtitle: "Create a new secure password for your account",
    fields: {
      newPasswordLabel: "New Password",
      newPasswordPlaceholder: "••••••••",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "••••••••",
      revokeSessionsLabel: "End all active sessions",
      revokeSessionsDescription:
        "Log out of all devices and active sessions after resetting password",
    },
    requirements: {
      minLength: "At least 8 characters",
      number: "Contains a number",
      specialChar: "Contains a special character",
    },
    buttons: {
      submit: "Reset Password",
      loading: "Resetting...",
      backToSignIn: "Back to Sign In",
    },
    footer: {
      needHelp: "Need help?",
      contactSupport: "Contact Support",
    },
    loadingFallback: {
      title: "Securing Connection",
      subtitle: "Initializing reset sequence...",
    },
    hero: {
      titleLine1: "Account Security",
      titleLine2: "Restored.",
      description:
        "Once you reset your password, your sessions will be updated across all devices for maximum protection.",
    },
  },

  twoFactor: {
    totp: {
      title: "Security Check",
      subtitle: "Your account is protected with two-factor authentication.",
      codeLabel: "Authenticator Code",
      codePlaceholder: "000 000",
      verifyButton: "Verify & Continue",
      verifyingButton: "Verifying...",
      useBackupButton: "Use backup code",
      successToast: "Identity verified successfully!",
    },
    backup: {
      title: "Backup Access",
      subtitle: "Enter one of your emergency recovery codes to sign in.",
      codeLabel: "Backup Code",
      codePlaceholder: "XXXX-XXXX",
      verifyButton: "Verify Backup Code",
      verifyingButton: "Verifying...",
      backToTotpButton: "Back to Security Code",
      successToast: "Security bypass successful!",
    },
    footer: {
      needHelp: "Need help?",
      contactSupport: "Contact Support",
    },
    hero: {
      titleLine1: "Extra Layer of",
      titleLine2: "Protection.",
      description:
        "By enabling 2FA, you ensure that only you can access your account, even if someone else knows your password.",
    },
  },

  confirmDeleteAccount: {
    confirmation: {
      title: "Confirm Account Deletion",
      description:
        "You are about to permanently delete your account and all associated data. This action is irreversible and cannot be recovered.",
      warningBadge: "Permanent Action",
      warningText:
        "Deleting your account will permanently remove all your data, including businesses, transactions, documents, and settings. This action cannot be undone.",
      deleteButton: "Permanently Delete Account & Data",
      cancelButton: "Cancel & Keep Account",
    },
    success: {
      title: "Account Successfully Deleted",
      description:
        "Your account and all associated data have been permanently removed from our system.",
      badge: "Data Erased",
      text:
        "All your profile information, sessions, documents, and database records have been deleted permanently.",
      returnHomeButton: "Return to Homepage",
    },
    error: {
      title: "Invalid or Expired Link",
      description:
        "This deletion confirmation link is invalid or has expired. If you still wish to delete your account, please request a new link from your security settings.",
      returnHomeButton: "Return to Homepage",
    },
    footer: "Security & Account Privacy Verification",
    hero: {
      confirm: {
        titleLine1: "Permanent",
        titleLine2: "Deletion.",
        description:
          "Confirming this action will permanently remove your account, profile, documents, and data.",
      },
      deleted: {
        titleLine1: "Account",
        titleLine2: "Deleted.",
        description:
          "All your data and active sessions have been safely removed from our platform.",
      },
      expired: {
        titleLine1: "Link",
        titleLine2: "Expired.",
        description: "This deletion link is invalid or has expired.",
      },
    },
  },

  setup: {
    badge: "Instance Configuration",
    title: "Configure Administrator",
    subtitle:
      "Create the primary root account to secure your {appName} instance.",
    fields: {
      nameLabel: "Full Name",
      namePlaceholder: "Administrator Name",
      usernameLabel: "Username",
      usernamePlaceholder: "admin",
      emailLabel: "Email",
      emailPlaceholder: "admin@company.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      confirmPasswordLabel: "Confirm Password",
      confirmPasswordPlaceholder: "••••••••",
    },
    buttons: {
      submit: "Complete Setup",
      loading: "Initializing...",
    },
    messages: {
      successToast:
        "Setup completed successfully! Please login with your new credentials.",
      usernameValidation:
        "Username can only contain letters, numbers, underscores, and hyphens",
      usernameMinLength: "Username must be at least 3 characters long",
      passwordMismatch: "Passwords do not match",
      passwordMinLength: "Password must be at least 8 characters long",
      failedError: "Setup failed",
    },
    footer: "Self-hosted instance of {appName}",
    hero: {
      titleLine1: "Deployment",
      titleLine2: "Successful.",
      description:
        "You are just one step away from launching your private financial architect platform.",
    },
  },

  error: {
    defaultTitle: "Error",
    defaultSubtitle: "An unexpected condition was encountered.",
    detailBadge: "Detailed Information",
    defaultDescription: "Something went wrong.",
    buttons: {
      returnHome: "Return Home",
      backToSignIn: "Back to Sign In",
    },
    footerUnit: "System Reliability Unit",
    hero: {
      titleLine1: "Excellence in",
      titleLine2: "Digital Finance.",
      description:
        "Our infrastructure is built for ultimate resilience, ensuring your data stays protected and accessible.",
    },
  },
} as const;

// ------------------------------------------------------------------------------
// Type Definitions
// ------------------------------------------------------------------------------
export type ErrorPagesCopy = typeof ERROR_PAGES_COPY;
export type AuthPagesCopy = typeof AUTH_PAGES_COPY;
export type ErrorPageKey = keyof ErrorPagesCopy;
export type AuthPageKey = keyof AuthPagesCopy;
