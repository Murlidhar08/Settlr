"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import AuthCenterLayout from "@/components/auth-layout";
import { itemVariants } from "@/lib/animations";
import { AUTH_PAGES_COPY } from "@/lib/config/auth-error-copy";
import { BackupCodeTab } from "./backup-code-tab";
import { TotpForm } from "./totp-form";

export default function TwoFactorClient() {
  const [showBackup, setShowBackup] = useState(false);

  return (
    <AuthCenterLayout
      labelsList={AUTH_PAGES_COPY.twoFactor}
      footer={
        <div className="text-center">
          <p className="text-muted-foreground text-sm font-medium">
            Need help?{" "}
            <a href="mailto:support@example.app" className="font-bold text-primary hover:text-primary/80 transition-colors">
              Contact Support
            </a>
          </p>
        </div>
      }
    >
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
                      className="bg-background px-4 py-2 rounded-full text-muted-foreground font-bold tracking-widest border border-border/50 shadow-xs hover:bg-muted transition-colors cursor-pointer"
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
                    className="text-primary font-bold hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    Back to Security Code
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AuthCenterLayout>
  );
}
