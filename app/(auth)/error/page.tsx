"use client";

import { Button } from "@/components/ui/button";
import { containerVariants, floatAnimate, floatTransition, itemVariants } from "@/lib/animations";
import { AUTH_PAGES_COPY } from "@/lib/config/auth-error-copy";
import { envClient } from "@/lib/env.client";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copy = AUTH_PAGES_COPY.error;
  const title = searchParams.get("title") || copy.defaultTitle;
  const description = searchParams.get("description") || copy.defaultDescription;

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row select-none bg-background overflow-hidden relative">
      {/* LEFT SIDE: CONTENT */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col justify-between w-full lg:w-1/2 px-6 sm:px-12 lg:px-6 py-8 relative z-10 h-full overflow-y-auto scrollbar-none bg-linear-to-b from-rose-500/12 via-background to-background backdrop-blur-sm border-r border-border/50"
      >
        {/* LOGO + BRAND */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 mb-12 group cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-rose-500/10 rounded-2xl blur-lg group-hover:bg-rose-500/20 transition-colors" />
            <div className="relative z-10 p-2 bg-background rounded-2xl border border-border/50 shadow-sm group-hover:border-rose-500/50 transition-colors">
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

        {/* CENTER CONTENT AREA */}
        <div className="flex flex-col justify-center max-w-sm md:max-w-xl mx-auto w-full py-4 lg:py-0">
          <motion.div variants={itemVariants} className="mb-8 flex md:flex-row flex-col gap-6">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-6 ring-8 ring-rose-500/5">
              <AlertCircle className="w-10 h-10 text-rose-500" />
            </div>
            <div>
              <h2 className="text-[clamp(1.5rem,5vw,2.5rem)] font-bold tracking-tight mb-3 text-rose-500">
                {title}
              </h2>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                {copy.defaultSubtitle}
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-muted/40 border border-border/50 p-6 rounded-3xl relative overflow-hidden group hover:bg-muted/60 transition-all duration-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
                {copy.detailBadge}
              </h3>
              <p className="text-foreground text-lg font-medium leading-relaxed">
                {description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                className="h-14 rounded-2xl bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold uppercase tracking-widest text-xs shadow-[0_10px_40px_rgba(225,29,72,0.3)] hover:shadow-[0_15px_50px_rgba(225,29,72,0.4)] transition-all active:scale-[0.98] border-t border-white/20"
              >
                <Link className="flex" href="/dashboard">
                  <Home className="mr-2 h-5 w-5" />
                  {copy.buttons.returnHome}
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-14 rounded-2xl border-2 border-rose-500/20 bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/40 font-bold uppercase tracking-widest text-xs transition-all active:scale-[0.98] group"
              >
                <Link className="flex" href="/login">
                  <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  {copy.buttons.backToSignIn}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* FOOTER */}
        <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">
            {copy.footerUnit}
          </p>
          <p className="text-muted-foreground text-xs font-medium">
            &copy; {new Date().getFullYear()} {envClient.NEXT_PUBLIC_APP_NAME}
          </p>
        </motion.div>
      </motion.div>

      {/* RIGHT PANEL - Unified Design */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:flex flex-1 p-12 items-center justify-center bg-linear-to-br from-rose-500 via-rose-600 to-rose-700 relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-200 h-200 bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-150 h-150 bg-black/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

        {/* Abstract Grid Pattern */}
        <div className="absolute inset-0 opacity-10 mask-[radial-gradient(ellipse_at_center,black,transparent)]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 w-full max-w-2xl text-center text-white space-y-12">
          <motion.div
            animate={floatAnimate}
            transition={floatTransition}
            className="w-32 h-32 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-2xl mx-auto relative group"
          >
            <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Image
              src="/images/logo/dark_logo.png"
              alt={envClient.NEXT_PUBLIC_APP_NAME}
              loading="eager"
              width={80}
              height={80}
              className="relative z-10 group-hover:scale-110 transition-transform duration-500"
            />
          </motion.div>

          <div className="space-y-6">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight leading-tight"
            >
              {copy.hero.titleLine1} <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">
                {copy.hero.titleLine2}
              </span>
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 text-xl font-medium max-w-lg mx-auto leading-relaxed"
            >
              {copy.hero.description}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
