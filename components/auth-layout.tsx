"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ComponentType, type ReactNode, Suspense } from "react";

import { containerVariants, floatAnimate, floatTransition, itemVariants } from "@/lib/animations";
import { formatCopy } from "@/lib/config/auth-error-copy";
import { envClient } from "@/lib/env.client";
import { cn } from "@/lib/utils";

export type AuthLayoutColorTheme =
  | "primary"
  | "destructive"
  | "red"
  | "amber"
  | "yellow"
  | "emerald"
  | "green"
  | "rose"
  | "slate"
  | "gray"
  | "zinc"
  | "blue"
  | "indigo"
  | "purple";

export interface AuthHeroCopy {
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
  title?: string;
  label?: string;
}

export interface AuthLayoutProps {
  children: ReactNode;
  /**
   * Page labels copy dictionary containing `.hero` or `.title`/`.description` or the hero object itself.
   */
  labelsList?: { hero?: AuthHeroCopy; footer?: ReactNode; title?: string; description?: string } | AuthHeroCopy | any;
  /**
   * Direct hero configuration (overrides labelsList.hero if provided).
   */
  hero?: AuthHeroCopy;
  /**
   * Direct title or label for right hero panel (shortcut for titleLine1).
   */
  title?: string;
  /**
   * Optional title line 2 on right hero panel (rendered with gradient accent).
   */
  titleLine2?: string;
  /**
   * Optional description text on right hero panel.
   */
  description?: string;
  /**
   * Custom icon in the floating hero card on the right side.
   * Can be a React node (e.g. `<ShieldAlert size={64} className="..." />`) or a Lucide icon component.
   * If omitted, defaults to the application logo.
   */
  icon?: ReactNode | ComponentType<{ size?: number; className?: string }>;
  /**
   * Optional color preset for background gradients and accents.
   * Supported presets: "primary", "red", "yellow", "amber", "green", "emerald", "rose", "slate", "blue", "purple".
   * Can also be a custom Tailwind background class string.
   */
  colorTheme?: AuthLayoutColorTheme | string;
  /**
   * Alias for colorTheme.
   */
  color?: AuthLayoutColorTheme | string;
  /**
   * Optional footer element or string rendered at the bottom of the left column.
   */
  footer?: ReactNode;
  /**
   * Optional class name for the outer container.
   */
  className?: string;
  /**
   * Optional class name to customize or extend the left side column.
   */
  leftClassName?: string;
  /**
   * Optional class name to customize or extend the right side column.
   */
  rightClassName?: string;
  /**
   * Optional class name for the inner content container wrapping children.
   */
  contentClassName?: string;
  /**
   * Optional target URL when clicking the logo. Defaults to "/".
   */
  homeUrl?: string;
}

const THEME_STYLES: Record<
  string,
  {
    leftBg: string;
    logoGlow: string;
    logoBorderHover: string;
    rightBg: string;
  }
> = {
  primary: {
    leftBg: "bg-linear-to-b from-primary/12 via-background to-background",
    logoGlow: "bg-primary/10 group-hover:bg-primary/20",
    logoBorderHover: "group-hover:border-primary/50",
    rightBg: "bg-linear-to-br from-primary via-primary/90 to-primary/80",
  },
  destructive: {
    leftBg: "bg-linear-to-b from-destructive/12 via-background to-background",
    logoGlow: "bg-destructive/10 group-hover:bg-destructive/20",
    logoBorderHover: "group-hover:border-destructive/50",
    rightBg: "bg-linear-to-br from-destructive via-destructive/90 to-destructive/80",
  },
  red: {
    leftBg: "bg-linear-to-b from-destructive/12 via-background to-background",
    logoGlow: "bg-destructive/10 group-hover:bg-destructive/20",
    logoBorderHover: "group-hover:border-destructive/50",
    rightBg: "bg-linear-to-br from-destructive via-destructive/90 to-destructive/80",
  },
  amber: {
    leftBg: "bg-linear-to-b from-amber-500/12 via-background to-background",
    logoGlow: "bg-amber-500/10 group-hover:bg-amber-500/20",
    logoBorderHover: "group-hover:border-amber-500/50",
    rightBg: "bg-linear-to-br from-amber-500 via-amber-600 to-amber-700",
  },
  yellow: {
    leftBg: "bg-linear-to-b from-amber-500/12 via-background to-background",
    logoGlow: "bg-amber-500/10 group-hover:bg-amber-500/20",
    logoBorderHover: "group-hover:border-amber-500/50",
    rightBg: "bg-linear-to-br from-amber-500 via-amber-600 to-amber-700",
  },
  emerald: {
    leftBg: "bg-linear-to-b from-emerald-500/12 via-background to-background",
    logoGlow: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    logoBorderHover: "group-hover:border-emerald-500/50",
    rightBg: "bg-linear-to-br from-emerald-600 via-emerald-600/90 to-emerald-700/80",
  },
  green: {
    leftBg: "bg-linear-to-b from-emerald-500/12 via-background to-background",
    logoGlow: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    logoBorderHover: "group-hover:border-emerald-500/50",
    rightBg: "bg-linear-to-br from-emerald-600 via-emerald-600/90 to-emerald-700/80",
  },
  rose: {
    leftBg: "bg-linear-to-b from-rose-500/12 via-background to-background",
    logoGlow: "bg-rose-500/10 group-hover:bg-rose-500/20",
    logoBorderHover: "group-hover:border-rose-500/50",
    rightBg: "bg-linear-to-br from-rose-500 via-rose-600 to-rose-700",
  },
  slate: {
    leftBg: "bg-linear-to-b from-slate-500/12 via-background to-background",
    logoGlow: "bg-slate-500/10 group-hover:bg-slate-500/20",
    logoBorderHover: "group-hover:border-slate-500/50",
    rightBg: "bg-linear-to-br from-slate-700 via-slate-800 to-slate-900",
  },
  gray: {
    leftBg: "bg-linear-to-b from-slate-500/12 via-background to-background",
    logoGlow: "bg-slate-500/10 group-hover:bg-slate-500/20",
    logoBorderHover: "group-hover:border-slate-500/50",
    rightBg: "bg-linear-to-br from-slate-700 via-slate-800 to-slate-900",
  },
  zinc: {
    leftBg: "bg-linear-to-b from-zinc-500/12 via-background to-background",
    logoGlow: "bg-zinc-500/10 group-hover:bg-zinc-500/20",
    logoBorderHover: "group-hover:border-zinc-500/50",
    rightBg: "bg-linear-to-br from-zinc-700 via-zinc-800 to-zinc-900",
  },
  blue: {
    leftBg: "bg-linear-to-b from-blue-500/12 via-background to-background",
    logoGlow: "bg-blue-500/10 group-hover:bg-blue-500/20",
    logoBorderHover: "group-hover:border-blue-500/50",
    rightBg: "bg-linear-to-br from-blue-600 via-blue-700 to-blue-800",
  },
  indigo: {
    leftBg: "bg-linear-to-b from-indigo-500/12 via-background to-background",
    logoGlow: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
    logoBorderHover: "group-hover:border-indigo-500/50",
    rightBg: "bg-linear-to-br from-indigo-600 via-indigo-700 to-indigo-800",
  },
  purple: {
    leftBg: "bg-linear-to-b from-purple-500/12 via-background to-background",
    logoGlow: "bg-purple-500/10 group-hover:bg-purple-500/20",
    logoBorderHover: "group-hover:border-purple-500/50",
    rightBg: "bg-linear-to-br from-purple-600 via-purple-700 to-purple-800",
  },
};

export function AuthCenterLayout({
  children,
  labelsList,
  hero,
  title,
  titleLine2,
  description,
  icon,
  colorTheme = "primary",
  color,
  footer,
  className,
  leftClassName,
  rightClassName,
  contentClassName,
  homeUrl = "/",
}: AuthLayoutProps) {
  const router = useRouter();

  // Resolve hero configuration with fallbacks across hero prop, labelsList.hero, direct props, and defaults
  const heroCandidate: AuthHeroCopy =
    hero ||
    (labelsList?.hero ? labelsList.hero : undefined) ||
    (labelsList && (labelsList.title || labelsList.description) ? labelsList : undefined) ||
    {};

  const resolvedLine1 =
    title ||
    heroCandidate.titleLine1 ||
    heroCandidate.title ||
    heroCandidate.label ||
    envClient.NEXT_PUBLIC_APP_NAME;

  const resolvedLine2 =
    titleLine2 ||
    heroCandidate.titleLine2 ||
    (title || heroCandidate.titleLine1 || heroCandidate.title ? "" : "Security");

  const resolvedDescription =
    description ||
    heroCandidate.description ||
    "Enterprise grade authentication and account security.";

  // Theme resolution: check if custom gradient class or known preset key
  const activeColorKey = (color || colorTheme || "primary").trim();
  const isCustomClass = activeColorKey.includes("bg-") || activeColorKey.includes("from-");

  const theme = isCustomClass
    ? {
        leftBg: "bg-linear-to-b from-primary/12 via-background to-background",
        logoGlow: "bg-primary/10 group-hover:bg-primary/20",
        logoBorderHover: "group-hover:border-primary/50",
        rightBg: activeColorKey,
      }
    : THEME_STYLES[activeColorKey.toLowerCase()] || THEME_STYLES.primary;

  // Resolve footer: explicit prop, or labelsList.footer if string or React element
  const resolvedFooter =
    footer !== undefined
      ? footer
      : typeof labelsList?.footer === "string" || (labelsList?.footer && typeof labelsList.footer === "object" && "props" in labelsList.footer)
        ? labelsList.footer
        : null;

  // Render floating card icon
  const renderIcon = () => {
    if (icon) {
      if (typeof icon === "function") {
        const IconComponent = icon as ComponentType<{ size?: number; className?: string }>;
        return (
          <IconComponent
            size={64}
            className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]"
          />
        );
      }
      return (
        <div className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
          {icon}
        </div>
      );
    }

    return (
      <Image
        src="/images/logo/dark_logo.png"
        alt={envClient.NEXT_PUBLIC_APP_NAME}
        loading="eager"
        width={80}
        height={80}
        className="relative z-10 group-hover:scale-110 transition-transform duration-500"
      />
    );
  };

  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <div
        className={cn(
          "h-screen w-full flex flex-col lg:flex-row select-none bg-background overflow-hidden relative",
          className
        )}
      >
        {/* LEFT SIDE: HEADER & CONTENT */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className={cn(
            "flex flex-col justify-between w-full lg:w-1/2 px-6 sm:px-12 lg:px-8 py-8 relative z-10 h-full overflow-y-auto scrollbar-none backdrop-blur-sm border-r border-border/50",
            theme.leftBg,
            leftClassName
          )}
        >
          {/* TOP LOGO + BRAND */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 mb-8 sm:mb-12 group cursor-pointer shrink-0"
            onClick={() => router.push(homeUrl as any)}
          >
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl blur-lg transition-colors",
                  theme.logoGlow
                )}
              />
              <div
                className={cn(
                  "relative z-10 p-2 bg-background rounded-2xl border border-border/50 shadow-sm transition-colors",
                  theme.logoBorderHover
                )}
              >
                <Image
                  src="/images/logo/light_logo.png"
                  alt={envClient.NEXT_PUBLIC_APP_NAME}
                  loading="eager"
                  width={32}
                  height={32}
                  className="dark:hidden group-hover:rotate-12 transition-transform duration-500"
                />
                <Image
                  src="/images/logo/dark_logo.png"
                  alt={envClient.NEXT_PUBLIC_APP_NAME}
                  loading="eager"
                  width={32}
                  height={32}
                  className="hidden dark:block group-hover:rotate-12 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="flex flex-col gap-0">
              <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-br from-foreground to-foreground/70 leading-none">
                {envClient.NEXT_PUBLIC_APP_NAME}
              </h1>
            </div>
          </motion.div>

          {/* PAGE CONTROLS / FORM CONTENT */}
          <div className={cn("flex-1 flex flex-col justify-center", contentClassName)}>
            {children}
          </div>

          {/* OPTIONAL FOOTER */}
          {resolvedFooter && (
            <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-border/50 shrink-0">
              {typeof resolvedFooter === "string" ? (
                <p className="text-center text-xs text-muted-foreground font-semibold">
                  {resolvedFooter}
                </p>
              ) : (
                resolvedFooter
              )}
            </motion.div>
          )}
        </motion.div>

        {/* RIGHT SIDE: HERO & ILLUSTRATION */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className={cn(
            "hidden lg:flex flex-1 p-12 items-center justify-center relative overflow-hidden transition-colors duration-700",
            theme.rightBg,
            rightClassName
          )}
        >
          {/* Animated Background Blobs */}
          <div className="absolute top-0 right-0 w-200 h-200 bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-150 h-150 bg-black/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

          {/* Radial Grid Pattern */}
          <div
            className="absolute inset-0 opacity-10 mask-[radial-gradient(ellipse_at_center,black,transparent)]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 w-full max-w-2xl text-center text-white space-y-12">
            {/* Floating Icon Card */}
            <motion.div
              animate={floatAnimate}
              transition={floatTransition}
              className="w-32 h-32 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-2xl mx-auto relative group"
            >
              <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {renderIcon()}
            </motion.div>

            {/* Hero Typography */}
            <div className="space-y-6">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight leading-tight"
              >
                {resolvedLine1}
                {resolvedLine2 ? (
                  <>
                    <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">
                      {resolvedLine2}
                    </span>
                  </>
                ) : null}
              </motion.h2>

              {resolvedDescription ? (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/80 text-xl font-medium max-w-lg mx-auto leading-relaxed"
                >
                  {formatCopy(resolvedDescription)}
                </motion.p>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </Suspense>
  );
}

export { AuthCenterLayout as AuthLayout };
export default AuthCenterLayout;
