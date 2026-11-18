import { BuildVersion } from "@/components/auth/build-version";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { getServerSession } from "@/lib/auth/auth";
import { envClient } from "@/lib/env.client";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LayoutDashboard,
  Layers,
  LogIn,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const session = await getServerSession();
  const appName = envClient.NEXT_PUBLIC_APP_NAME;
  const appDescription = envClient.NEXT_PUBLIC_APP_DESCRIPTION;

  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "Enterprise Authentication",
      description:
        "Comprehensive auth suite powered by Better Auth, supporting email/password, social OAuth (Google, Discord, Facebook), and multi-session management.",
    },
    {
      icon: <KeyRound className="w-6 h-6 text-primary" />,
      title: "Passkeys & 2FA Security",
      description:
        "FIDO2/WebAuthn biometric passkeys, TOTP authenticator apps, and email OTP verification for uncompromising account safety.",
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Role-Based Access Control",
      description:
        "Granular RBAC with admin capabilities, permission guards, user lifecycle management, and secure account impersonation.",
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "Modern Tech Stack",
      description:
        "Built with Next.js 16 (App Router), React 19, Prisma 7 ORM with PostgreSQL, and TanStack React Query v5 for lightning-fast queries.",
    },
    {
      icon: <Smartphone className="w-6 h-6 text-primary" />,
      title: "Native-Feeling PWA",
      description:
        "Installable Progressive Web App with optimized touch gestures, anti-pinch-zoom native feel, offline caching, and responsive bottom tabs.",
    },
    {
      icon: <Layers className="w-6 h-6 text-primary" />,
      title: "Hardened Security & Design",
      description:
        "Cloudflare Turnstile bot defense, CSRF origin verification, OWASP security headers, Tailwind CSS 4, and dynamic light/dark theming.",
    },
  ];

  const highlights = [
    "Next.js 16 (App Router)",
    "React 19",
    "Prisma 7 & PostgreSQL",
    "Better Auth + Passkeys",
    "TanStack Query v5",
    "Tailwind CSS 4",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 flex items-center justify-center relative rounded-xl bg-primary/10">
              <Image
                src="/images/logo/light_logo.png"
                alt="Logo"
                width={26}
                height={26}
                className="dark:hidden"
              />
              <Image
                src="/images/logo/dark_logo.png"
                alt="Logo"
                width={26}
                height={26}
                className="hidden dark:block"
              />
            </div>
            <span className="font-extrabold text-lg tracking-tight">
              {appName}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {session ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-xl font-semibold gap-1.5 shadow-sm"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-xl font-semibold gap-1.5 shadow-sm"
                )}
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col gap-16">
        {/* Hero Section */}
        <section className="text-center flex flex-col items-center max-w-3xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 animate-in fade-in slide-in-from-top-3 duration-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to the Official Application</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Explore <span className="text-primary">{appName}</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {appDescription ||
              "A robust, production-grade template featuring enterprise-level authentication, granular access controls, native PWA capabilities, and modern full-stack architecture."}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-2">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full sm:w-auto rounded-2xl px-8 h-12 text-sm font-bold shadow-lg shadow-primary/25 gap-2"
              )}
            >
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {session ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto rounded-2xl px-6 h-12 text-sm font-semibold border-border/80"
                )}
              >
                Continue to Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto rounded-2xl px-6 h-12 text-sm font-semibold border-border/80"
                )}
              >
                Create Account
              </Link>
            )}
          </div>

          {/* Tech Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {highlights.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-muted/60 text-muted-foreground border border-border/50"
              >
                <CheckCircle2 className="w-3 h-3 text-primary" />
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* Feature Grid / Application Details */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Application Architecture & Capabilities
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Everything configured in this application to ensure speed, security, and developer productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-3xl bg-card border border-border/60 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col gap-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Card */}
        <section className="rounded-3xl p-8 sm:p-10 bg-linear-to-br from-primary/10 via-primary/5 to-background border border-primary/20 text-center flex flex-col items-center gap-4">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ready to get started?
          </h3>
          <p className="text-muted-foreground max-w-lg text-sm sm:text-base">
            Sign in with your credentials or register a new account to experience the full feature set.
          </p>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-2xl px-8 h-12 text-sm font-bold shadow-md shadow-primary/20 gap-2 mt-2"
            )}
          >
            <span>Sign In to {appName}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} {appName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Login
            </Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>

      <BuildVersion />
    </div>
  );
}
