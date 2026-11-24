// Packages
import { Toaster } from "@/components/ui/sonner";
import type { Metadata, Viewport } from "next";
import { Geist_Mono, Nunito_Sans } from "next/font/google";

// Style
import "./globals.css";

// Lib
import { envServer } from "@/lib/env.server";

import AppIconsMetaTags from "@/components/app-icons-metatags";
import { ImpersonationIndicator } from "@/components/auth/impersonation-indicator";
import { PwaPinchZoomPreventer } from "@/components/pwa-pinch-zoom-preventer";
import { AppProviders } from "@/components/providers";
import NextTopLoader from 'nextjs-toploader';
import { APP } from "@/lib/config/repo";

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
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export const metadata: Metadata = {
  title: APP.NAME,
  metadataBase: new URL(envServer.BETTER_AUTH_URL),
  description: APP.DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP.NAME,
  },
  icons: {
    icon: [
      { url: "/images/app-icon/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/app-icon/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/logo/maskable_icon_x192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/logo/maskable_icon_x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/images/logo/maskable_icon_x192.png",
  },
  openGraph: envServer.NODE_ENV === "development" ? {} : {
    title: APP.NAME,
    description: APP.DESCRIPTION,
    siteName: APP.NAME,
    images: [
      {
        url: '/api/image?type=og',
        width: 1200,
        height: 630,
        alt: `${APP.NAME} - ${APP.DESCRIPTION}`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: envServer.NODE_ENV === "development" ? {} : {
    card: 'summary_large_image',
    title: APP.NAME,
    description: APP.DESCRIPTION,
    images: [
      {
        url: '/api/image?type=twitter',
        width: 1500,
        height: 500,
        alt: `${APP.NAME} - ${APP.DESCRIPTION}`,
      },
    ],
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

        {/* Prevent PWA pinch zooming for native feel */}
        <PwaPinchZoomPreventer />

        {/* Toast Container */}
        <Toaster
          position="top-center"
          expand={false}
          richColors
          closeButton
          theme="light"
          swipeDirections={["left", "right"]}
        />

        {/* Only when admin is impersonating */}
        <ImpersonationIndicator />
      </body>
    </html >
  );
}


