"use client";

import AuthCenterLayout from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { itemVariants } from "@/lib/animations";
import { AUTH_PAGES_COPY } from "@/lib/config/auth-error-copy";
import { envClient } from "@/lib/env.client";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const copy = AUTH_PAGES_COPY.error;
  const title = searchParams.get("title") || "Error";
  const description = searchParams.get("description") || "Something went wrong.";

  return (
    <AuthCenterLayout
      labelsList={copy}
      colorTheme="rose"
      footer={
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">
            System Reliability Unit
          </p>
          <p className="text-muted-foreground text-xs font-medium">
            &copy; {new Date().getFullYear()} {envClient.NEXT_PUBLIC_APP_NAME}
          </p>
        </div>
      }
    >
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
              An unexpected condition was encountered.
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-muted/40 border border-border/50 p-6 rounded-3xl relative overflow-hidden group hover:bg-muted/60 transition-all duration-500">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
              Detailed Information
            </h3>
            <p className="text-foreground text-lg font-medium leading-relaxed">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              className="h-14 rounded-2xl bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold uppercase tracking-widest text-xs shadow-[0_10px_40px_rgba(225,29,72,0.3)] hover:shadow-[0_15px_50px_rgba(225,29,72,0.4)] transition-all active:scale-[0.98] border-t border-white/20"
            >
              <Link className="flex items-center" href="/dashboard">
                <Home className="mr-2 h-5 w-5" />
                Return Home
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-14 rounded-2xl border-2 border-rose-500/20 bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/40 font-bold uppercase tracking-widest text-xs transition-all active:scale-[0.98] group"
            >
              <Link className="flex items-center" href="/login">
                <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </AuthCenterLayout>
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
