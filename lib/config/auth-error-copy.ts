import { envClient } from "@/lib/env.client";

/**
 * ==============================================================================
 * Centralized Copy Configuration for Error & Auth Pages
 * ==============================================================================
 * 
 * Brand and hero messaging for pages under `app/(error)` and `app/(auth)`
 * are centralized here. General UI labels, buttons, and validation messages
 * live directly inside their respective page components.
 * 
 * Placeholders like `{appName}` and `{email}` are dynamically interpolated
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
    envClient.NEXT_PUBLIC_APP_NAME
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
    hero: {
      titleLine1: "Access",
      titleLine2: "Restricted.",
      description: "This account has been flagged and suspended for violating our platform's terms of use.",
    },
  },

  expired: {
    hero: {
      titleLine1: "Access Link",
      titleLine2: "Expired.",
      description: "For security purposes, verification links are single-use and have short lifespans.",
    },
  },

  notFound: {
    hero: {
      titleLine1: "Lost in",
      titleLine2: "Space?",
      description: "It seems you've wandered off the grid. Let's guide you back.",
    },
  },

  pendingApproval: {
    hero: {
      titleLine1: "Verification",
      titleLine2: "In Progress.",
      description: "We're currently reviewing your credentials to maintain platform security.",
    },
  },

  serverError: {
    hero: {
      titleLine1: "System",
      titleLine2: "Interrupted.",
      description: "Our servers encountered an unexpected failure. Please try again shortly or return home.",
    },
  },

  suspended: {
    hero: {
      titleLine1: "Access",
      titleLine2: "Suspended.",
      description: "This account is temporarily suspended. Please contact us to resolve this block.",
    },
  },

  unauthorized: {
    hero: {
      titleLine1: "Access",
      titleLine2: "Restricted.",
      description: "This resource requires higher security clearance or a different administrative level.",
    },
  },
} as const;

// ------------------------------------------------------------------------------
// Auth Pages Copy (`app/(auth)`)
// ------------------------------------------------------------------------------
export const AUTH_PAGES_COPY = {
  login: {
    hero: {
      titleLine1: "Master your",
      titleLine2: "financial destiny.",
      description: "Experience the next generation of finance management with real-time insights and enterprise security.",
    },
  },

  signup: {
    subtitle: "Start your financial journey with {appName} today.",
    hero: {
      titleLine1: "The future of",
      titleLine2: "wealth management.",
      description: "Join thousands of professionals using {appName} to streamline their financial operations.",
    },
  },

  forgotPassword: {
    hero: {
      titleLine1: "Secure Identity",
      titleLine2: "Protection.",
      description: "{appName} uses multi-layer encryption to ensure your account remains under your control, always.",
    },
  },

  resetPassword: {
    hero: {
      titleLine1: "Account Security",
      titleLine2: "Restored.",
      description: "Once you reset your password, your sessions will be updated across all devices for maximum protection.",
    },
  },

  twoFactor: {
    hero: {
      titleLine1: "Extra Layer of",
      titleLine2: "Protection.",
      description: "By enabling 2FA, you ensure that only you can access your account, even if someone else knows your password.",
    },
  },

  confirmDeleteAccount: {
    hero: {
      confirm: {
        titleLine1: "Permanent",
        titleLine2: "Deletion.",
        description: "Confirming this action will permanently remove your account, profile, documents, and data.",
      },
      deleted: {
        titleLine1: "Account",
        titleLine2: "Deleted.",
        description: "All your data and active sessions have been safely removed from our platform.",
      },
      expired: {
        titleLine1: "Link",
        titleLine2: "Expired.",
        description: "This deletion link is invalid or has expired.",
      },
    },
  },

  setup: {
    subtitle: "Create the primary root account to secure your {appName} instance.",
    footer: "Self-hosted instance of {appName}",
    hero: {
      titleLine1: "Deployment",
      titleLine2: "Successful.",
      description: "You are just one step away from launching your private financial architect platform.",
    },
  },

  error: {
    hero: {
      titleLine1: "Excellence in",
      titleLine2: "Digital Finance.",
      description: "Our infrastructure is built for ultimate resilience, ensuring your data stays protected and accessible.",
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
