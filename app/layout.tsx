// Packages
import { Toaster } from "@/components/ui/sonner";
import type { Metadata, Viewport } from "next";
import { Geist_Mono, Nunito_Sans } from "next/font/google";

// Style
import "./globals.css";

// Lib
import { envClient } from "@/lib/env.client";
import { envServer } from "@/lib/env.server";

import AppIconsMetaTags from "@/components/app-icons-metatags";
import { ImpersonationIndicator } from "@/components/auth/impersonation-indicator";
import { AppProviders } from "@/components/providers";
import NextTopLoader from 'nextjs-toploader';


const nunitoSans = Nunito_Sans({
  variable: '--font-sans',
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(envServer.BETTER_AUTH_URL),
  title: envClient.NEXT_PUBLIC_APP_NAME,
  description: envClient.NEXT_PUBLIC_APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: envClient.NEXT_PUBLIC_APP_NAME,
  },
  icons: {
    icon: [
      { url: "/images/app-icon/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/app-icon/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/logo/maskable_icon_x192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/logo/maskable_icon_x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/images/app-icon/apple-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: envServer.NODE_ENV === "development" ? {} : {
    title: envClient.NEXT_PUBLIC_APP_NAME,
    description: envClient.NEXT_PUBLIC_APP_DESCRIPTION,
    siteName: envClient.NEXT_PUBLIC_APP_NAME,
    images: [
      {
        url: '/images/og/og-banner.png',
        width: 1200,
        height: 630,
        alt: `${envClient.NEXT_PUBLIC_APP_NAME} - ${envClient.NEXT_PUBLIC_APP_DESCRIPTION}`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: envServer.NODE_ENV === "development" ? {} : {
    card: 'summary_large_image',
    title: envClient.NEXT_PUBLIC_APP_NAME,
    description: envClient.NEXT_PUBLIC_APP_DESCRIPTION,
    images: ['/images/og/twitter-banner.png'],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={nunitoSans.variable} suppressHydrationWarning>
      <head>
        <AppIconsMetaTags />
      </head>
      <body className={`${geistMono.variable} font-sans antialiased bg-background`}>

        <NextTopLoader
          color="oklch(0.541 0.281 293.009)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px oklch(0.541 0.281 293.009),0 0 5px oklch(0.541 0.281 293.009)"
        />

        <AppProviders>
          {children}
        </AppProviders>

        {/* Toast Container */}
        <Toaster
          position="top-center"
          expand={false}
          richColors
          closeButton
          theme="light"
        />

        {/* Only when admin is impersonating */}
        <ImpersonationIndicator />
      </body>
    </html >
  );
}


