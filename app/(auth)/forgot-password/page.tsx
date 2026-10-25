"use client";

import AuthCenterLayout from "@/components/auth-layout";
import { TurnstileWidget, type TurnstileInstance } from "@/components/auth/turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { itemVariants } from "@/lib/animations";
import { authClient } from "@/lib/auth/auth-client";
import { AUTH_PAGES_COPY, formatCopy } from "@/lib/config/auth-error-copy";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, ShieldAlert, ShieldCheck } from "lucide-react";
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
  const copy = AUTH_PAGES_COPY.forgotPassword;

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
        setError(result.error.message || copy.messages.failedToSend);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      turnstileRef.current?.reset();
      setCaptchaToken(null);
      setError(copy.messages.genericError);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCenterLayout
      labelsList={copy}
      footer={
        <p className="text-center text-muted-foreground text-sm">
          {copy.footer.needHelp} <a href="mailto:support@example.app" className="font-bold text-primary hover:text-primary/80 transition-colors">{copy.footer.contactSupport}</a>
        </p>
      }
    >
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
                  {copy.form.title}
                </h2>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                  {formatCopy(copy.form.subtitle)}
                </p>
              </motion.div>

              <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1 text-foreground/70">{copy.form.emailLabel}</label>
                  <div className="relative group">
                    <Input
                      type="email"
                      placeholder={copy.form.emailPlaceholder}
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
                      {copy.form.sendingButton}
                    </div>
                  ) : copy.form.submitButton}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-primary font-bold hover:text-primary/80 transition-colors"
                  >
                    {copy.form.backToSignIn}
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
                <h2 className="text-3xl font-bold tracking-tight">{copy.success.title}</h2>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto font-medium">
                  {formatCopy(copy.success.subtitle, { email })}
                </p>
              </div>

              <Button
                className="rounded-2xl h-14 w-full font-bold text-lg shadow-lg shadow-primary/20"
                onClick={() => router.push("/login")}
              >
                {copy.success.returnToLoginButton}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthCenterLayout>
  );
}
