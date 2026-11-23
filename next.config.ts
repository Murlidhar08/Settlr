
import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";
import nextBundleAnalyzer from "@next/bundle-analyzer";

// ==========================================
// Environment
// ==========================================

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";
const isAnalyzeEnabled = process.env.ANALYZE === "true";

// ==========================================
// Bundle Analyzer
// ==========================================

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: isAnalyzeEnabled,
});

// ==========================================
// PWA Configuration
// ==========================================

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  disable: isDevelopment,

  workboxOptions: {
    disableDevLogs: true,

    runtimeCaching: [
      // Never cache API responses
      {
        urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
        handler: "NetworkOnly",
        options: {
          cacheName: "api-network-only"
        }
      },

      // Never cache uploaded files
      {
        urlPattern: ({ url }) => url.pathname.startsWith("/uploads/"),
        handler: "NetworkOnly",
        options: {
          cacheName: "uploads-network-only",
        }
      }
    ]
  }
});

// ==========================================
// Next.js Configuration
// ==========================================

const nextConfig: NextConfig = {
  // General
  reactStrictMode: true,
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  typedRoutes: true,

  // Server dependencies
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "nodemailer",
    "pg",
    "jimp",
  ],

  // Include additional runtime files in standalone output
  outputFileTracingIncludes: {
    "/*": [
      "./public/**/*",
      "./prisma/**/*",
      "./prisma7.config.ts",
      "./scripts/reset-password.js",
    ],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: isProduction
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // Package optimizations
  experimental: {
    optimizePackageImports: [
      "date-fns",
      "framer-motion",
      "@base-ui/react",
      "sonner",
      "react-day-picker",
      "@tanstack/react-query",
      "better-auth",
      "@better-auth/passkey",
    ],
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },
};

// ==========================================
// Export Composed Configuration
// ==========================================

export default withBundleAnalyzer(
  withPWAConfig(nextConfig)
);
