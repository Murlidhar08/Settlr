import type { NextConfig } from "next";
import withPWA from '@ducanh2912/next-pwa';
import nextBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withPWAConfig = withPWA({
  dest: 'public',                              // where to output SW file (in public/)
  disable: process.env.NODE_ENV === 'development', // disable in dev
  register: true,                              // auto-register SW
  // skipWaiting: true,                           // activate SW immediately
  // (you can add workboxOptions, runtimeCaching, fallbacks, etc. here)
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingExcludes: {
    '*': [
      './uploads/**/*',
    ],
  },
  compress: true,
  poweredByHeader: false,
  typedRoutes: true,
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "nodemailer",
    "pg",
    "jimp",
  ],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
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

// let finalConfig = nextConfig;

// if (process.env.ANALYZE === 'true') {
//   finalConfig = withBundleAnalyzer(finalConfig);
// }

// // Only apply PWA in production to speed up development
// if (process.env.NODE_ENV === 'production') {
//   finalConfig = withPWAConfig(finalConfig);
// }

export default withBundleAnalyzer(withPWAConfig(nextConfig));
