"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import AuthCenterLayout from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { itemVariants } from "@/lib/animations";
import { authClient } from "@/lib/auth/auth-client";
import { AUTH_PAGES_COPY } from "@/lib/config/auth-error-copy";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copy = AUTH_PAGES_COPY.resetPassword;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [revokeSessions, setRevokeSessions] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or expired password reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!token) {
      setError("Invalid or expired password reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });

      if (result.error) {
        setError(result.error.message || "Failed to reset password.");
      } else {
        if (revokeSessions) {
          try {
            await authClient.signOut();
          } catch {
            // ignore if not logged in
          }
        }
        setSuccessMsg("Password successfully reset! Redirecting...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Try again.");
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
          Need help?{" "}
          <a href="mailto:support@example.app" className="font-bold text-primary hover:text-primary/80 transition-colors">
            Contact Support
          </a>
        </p>
      }
    >
      <div className="flex flex-col justify-center max-w-sm mx-auto w-full py-8 lg:py-0">
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-4xl font-bold tracking-tight mb-3">
            Reset Password
          </h2>
          <p className="text-muted-foreground text-lg font-medium">
            Create a new secure password for your account
          </p>
        </motion.div>

        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1 text-foreground/70">
                New Password
              </label>
              <div className="relative group">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-14 rounded-2xl pl-4 pr-12 transition-all duration-300 bg-muted/40 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!token}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors group-focus-within:text-primary cursor-pointer"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1 text-foreground/70">
                Confirm Password
              </label>
              <div className="relative group">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-14 rounded-2xl pl-4 pr-12 transition-all duration-300 bg-muted/40 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!token}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors group-focus-within:text-primary cursor-pointer"
                >
                  {showConfirm ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* End All Sessions Checkbox */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/40 transition-colors">
            <Checkbox
              id="revoke-sessions"
              checked={revokeSessions}
              onCheckedChange={(checked) => setRevokeSessions(Boolean(checked))}
              disabled={!token || loading}
              className="mt-0.5 size-5 rounded-lg border-2"
            />
            <div className="flex flex-col gap-0.5 select-none">
              <label
                htmlFor="revoke-sessions"
                className="text-sm font-semibold text-foreground/80 hover:text-foreground cursor-pointer transition-colors"
              >
                End all active sessions
              </label>
              <p className="text-xs text-muted-foreground font-medium">
                Log out of all devices and active sessions after resetting password
              </p>
            </div>
          </div>

          {/* Status Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-center gap-3"
              >
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p className="font-medium">{error}</p>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-3"
              >
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <p className="font-medium">{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            disabled={loading || !token}
            className="relative rounded-2xl h-14 w-full text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Resetting...
              </div>
            ) : "Reset Password"}
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
      </div>
    </AuthCenterLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-6">
        <div className="relative w-16 h-16 mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
          <div className="relative z-10 w-full h-full bg-background rounded-2xl border border-border/50 flex items-center justify-center shadow-sm">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-bold tracking-tight">Securing Connection</h2>
          <p className="text-sm text-muted-foreground animate-pulse">Initializing reset sequence...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
