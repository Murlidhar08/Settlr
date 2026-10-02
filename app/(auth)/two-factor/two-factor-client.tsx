"use client";

import { containerVariants, floatAnimate, floatTransition, itemVariants } from "@/lib/animations";
import { envClient } from "@/lib/env.client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackupCodeTab } from "./components/backup-code-tab";
import { TotpForm } from "./components/totp-form";

export default function TwoFactorClient() {
  const router = useRouter();
  const [showBackup, setShowBackup] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row select-none bg-background overflow-hidden relative">
      {/* LEFT SIDE: FORM */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col justify-between w-full lg:w-1/2 px-6 sm:px-12 lg:px-6 py-8 relative z-10 h-full overflow-y-auto scrollbar-none bg-linear-to-b from-primary/12 via-background to-background backdrop-blur-sm border-r border-border/50"
      >
        {/* LOGO + BRAND */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 mb-12 group cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-lg group-hover:bg-primary/20 transition-colors" />
            <div className="relative z-10 p-2 bg-background rounded-2xl border border-border/50 shadow-sm group-hover:border-primary/50 transition-colors">
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

        {/* CENTER FORM AREA */}
        <div className="flex flex-col justify-center max-w-sm mx-auto w-full py-8 lg:py-0">
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-4xl font-bold tracking-tight mb-3">
              {showBackup ? "Backup Access" : "Security Check"}
            </h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
              {showBackup
                ? "Enter one of your emergency recovery codes to sign in."
                : "Your account is protected with two-factor authentication."}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-muted/40 border border-border/50 p-6 sm:p-8 rounded-[2rem] shadow-sm backdrop-blur-sm overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {!showBackup ? (
                <motion.div
                  key="totp"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <TotpForm />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <button
                        onClick={() => setShowBackup(true)}
                        className="bg-background px-4 py-2 rounded-full text-muted-foreground font-bold tracking-widest border border-border/50 shadow-xs hover:bg-muted transition-colors"
                      >
                        Use backup code
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="backup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <BackupCodeTab />

                  <div className="text-center">
                    <button
                      onClick={() => setShowBackup(false)}
                      className="text-primary font-bold hover:text-primary/80 transition-colors"
                    >
                      Back to Security Code
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* BOTTOM DECORATION / FOOTER */}
        <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-border/50 text-center">
          <p className="text-muted-foreground text-sm font-medium">
            Need help? <a href="mailto:support@example.app" className="font-bold text-primary hover:text-primary/80 transition-colors">Contact Support</a>
          </p>
        </motion.div>
      </motion.div>

      {/* RIGHT PANEL: ILLUSTRATION & FEATURES */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:flex flex-1 p-12 items-center justify-center bg-linear-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden"
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
              className="text-4xl font-black tracking-tight leading-tight"
            >
              Extra Layer of <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">Protection.</span>
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 text-xl font-medium max-w-lg mx-auto leading-relaxed"
            >
              By enabling 2FA, you ensure that only you can access your account, even if someone else knows your password.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
