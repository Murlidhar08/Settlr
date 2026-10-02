"use client";

import { TurnstileWidget, type TurnstileInstance } from "@/components/auth/turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { containerVariants, floatAnimate, floatTransition, itemVariants } from "@/lib/animations";
import { authClient } from "@/lib/auth/auth-client";
import { envClient } from "@/lib/env.client";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      let fetchOptions: { headers?: Record<string, string> } = {};

      let token = captchaToken;
      if (!token && turnstileRef.current) {
        try {
          token = (await turnstileRef.current.getResponsePromise(4000)) || null;
        } catch {
          // Token retrieval timed out or unavailable
        }
      }

      if (token) {
        fetchOptions = {
          headers: { "x-captcha-response": token },
        };
      }

      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      }, fetchOptions);

      if (result.error) {
        turnstileRef.current?.reset();
        setCaptchaToken(null);
        setError(result.error.message || "Failed to send reset email");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      turnstileRef.current?.reset();
      setCaptchaToken(null);
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <motion.div variants={itemVariants}>
                  <h2 className="text-4xl font-bold tracking-tight mb-3">
                    Forgot Password?
                  </h2>
                  <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                    Enter your email to receive a secure password recovery link.
                  </p>
                </motion.div>

                <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1 text-foreground/70">Email Address</label>
                    <div className="relative group">
                      <Input
                        type="email"
                        placeholder="name@company.com"
                        className="h-14 rounded-2xl pl-4 pr-12 transition-all duration-300 bg-muted/40 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                    </div>
                    <TurnstileWidget
                      ref={turnstileRef}
                      action="forgot_password"
                      onSuccess={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken(null)}
                      onError={() => setCaptchaToken(null)}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 flex items-center gap-3"
                      >
                        <ShieldAlert className="w-5 h-5 shrink-0" />
                        <p className="font-medium">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    className="relative rounded-2xl h-14 w-full text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98]"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : "Send Reset Link"}
                  </Button>

                  <div className="text-center">
                    <Link
                      href="/login"
                      className="text-primary font-bold hover:text-primary/80 transition-colors"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </motion.form>
              </motion.div>
            ) : (
              /* SUCCESS STATE */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 text-center"
              >
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center shadow-inner border border-emerald-500/20"
                  >
                    <ShieldCheck className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                  </motion.div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight">Check your email</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto font-medium">
                    If an account exists with <strong>{email}</strong>, a reset link
                    has been sent. Follow the instructions to set a new password.
                  </p>
                </div>

                <Button
                  className="rounded-2xl h-14 w-full font-bold text-lg shadow-lg shadow-primary/20"
                  onClick={() => router.push("/login")}
                >
                  Return to Login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM DECORATION / FOOTER */}
        <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-border/50">
          <p className="text-center text-muted-foreground text-sm">
            Need help? <a href="mailto:support@example.app" className="font-bold text-primary hover:text-primary/80 transition-colors">Contact Support</a>
          </p>
        </motion.div>
      </motion.div>

      {/* RIGHT SIDE: ILLUSTRATION & FEATURES */}
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
              className="text-5xl font-black tracking-tight leading-tight"
            >
              Secure Identity <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">Protection.</span>
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 text-xl font-medium max-w-lg mx-auto leading-relaxed"
            >
              {envClient.NEXT_PUBLIC_APP_NAME} uses multi-layer encryption to ensure your account remains under your control, always.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
