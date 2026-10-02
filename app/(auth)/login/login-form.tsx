"use client";

// Packages
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Mail, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

// Lib
import { authClient, signIn } from "@/lib/auth/auth-client";
import { envClient } from "@/lib/env.client";
import { tran } from "@/lib/languages/i18n";

// Components
import { TurnstileWidget, type TurnstileInstance } from "@/components/auth/turnstile";
import { Input } from "@/components/ui/input";
import { containerVariants, floatAnimate, floatTransition, itemVariants } from "@/lib/animations";
import DiscordAuth from "./components/discord-auth";
import EmailAuth from "./components/email-auth";
import FacebookAuth from "./components/facebook-auth";
import GoogleAuth from "./components/google-auth";
import PasskeyAuth from "./components/passkey-auth";

interface LoginFormProps {
  providers: {
    google: boolean;
    discord: boolean;
    facebook: boolean;
  };
}

function LoginFormContent({ providers }: LoginFormProps) {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lastLogin, setLastLogin] = useState("");
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isAddAccount, setIsAddAccount] = useState<boolean>(false);

  const hasSocialLogin = providers.google || providers.discord || providers.facebook;

  // Handle URL errors (like session expired)
  useEffect(() => {
    if (errorCode === "session_expired") {
      setError(tran("auth.msg.session_expired"));
    }
  }, [errorCode]);

  // Redirect to dashboard (skip if adding an account)
  useEffect(() => {
    const isAddAcc = searchParams.get("add_account") === "1";
    if (isAddAcc) {
      setLastLogin(authClient.getLastUsedLoginMethod() || "");
      setIsAddAccount(true);
      return;
    }

    // Redirect to banned
    authClient.getSession()
      .then((session) => {
        if (session.data) {
          if (session.data.user.banned)
            router.push(`/banned?reason=${encodeURIComponent(session.data.user.banReason || "")}`);
          else router.push("/dashboard");
        }
      });

    // Last Login Method
    setLastLogin(authClient.getLastUsedLoginMethod() || "");
  }, [router, searchParams])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
          headers: {
            "x-captcha-response": token,
          },
        };
      }

      const isEmail = emailOrUsername.includes("@");
      const result = isEmail
        ? await signIn.email({ email: emailOrUsername, password }, fetchOptions)
        : await signIn.username({ username: emailOrUsername, password }, fetchOptions);

      if (result.error) {
        turnstileRef.current?.reset();
        setCaptchaToken(null);
        if (result.error.code === "BANNED_USER") {
          router.push(`/banned?reason=${encodeURIComponent(result.error.message || "")}`);
          return;
        }
        setError(result.error.message || "Sign in failed");
      }
      else router.push("/dashboard");
    } catch (err) {
      turnstileRef.current?.reset();
      setCaptchaToken(null);
      setError("An error occurred during sign in");
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
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Welcome back
            </h2>
          </motion.div>

          <motion.form variants={itemVariants} onSubmit={handleEmailLogin} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {/* Email or Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold ml-1 text-foreground/70">Email or Username</label>
                <div className="relative group">
                  <Input
                    type="text"
                    tabIndex={1}
                    placeholder="name@company.com or username"
                    className="h-13 rounded-2xl pl-4 pr-12 transition-all duration-300 bg-muted/40 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    required
                    autoFocus={true}
                  />
                  {emailOrUsername.includes("@") ? (
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                  ) : (
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-foreground/70">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-13 rounded-2xl pl-4 pr-12 transition-all duration-300 bg-muted/40 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    tabIndex={2}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors group-focus-within:text-primary"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>

                <TurnstileWidget
                  ref={turnstileRef}
                  action="sign_in"
                  onSuccess={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaToken(null)}
                />
              </div>
            </div>

            <EmailAuth
              lastLogin={lastLogin}
              loading={loading}
            />

            <PasskeyAuth
              lastLogin={lastLogin}
              loading={loading}
              setLoading={setLoading}
            />
          </motion.form>

          {hasSocialLogin && (
            <>
              <motion.div variants={itemVariants} className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background/50 backdrop-blur-sm px-4 text-muted-foreground font-bold tracking-widest">
                    Or continue with
                  </span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className={`grid ${providers.google && providers.discord ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                {providers.google && (
                  <GoogleAuth
                    lastLogin={lastLogin}
                    loading={loading}
                    setLoading={setLoading} />
                )}

                {providers.discord && (
                  <DiscordAuth
                    lastLogin={lastLogin}
                    loading={loading}
                    setLoading={setLoading} />
                )}

                {providers.facebook && (
                  <FacebookAuth
                    lastLogin={lastLogin}
                    loading={loading}
                    setLoading={setLoading} />
                )}
              </motion.div>
            </>
          )}
        </div>

        {/* SIGN UP */}
        {!isAddAccount && (
          <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-border/50">
            <p className="text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link tabIndex={8} href="/signup" className="font-bold text-primary hover:text-primary/80 transition-colors">
                Get Started
              </Link>
            </p>
          </motion.div>
        )}
      </motion.div >

      {/* RIGHT SIDE: ILLUSTRATION & FEATURES */}
      < motion.div
        initial={{ opacity: 0 }
        }
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:flex flex-1 p-12 items-center justify-center bg-linear-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        < div className="absolute top-0 right-0 w-200 h-200 bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
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
              Master your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">financial destiny.</span>
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 text-xl font-medium max-w-lg mx-auto leading-relaxed"
            >
              Experience the next generation of finance management with real-time insights and enterprise security.
            </motion.p>
          </div>
        </div>
      </motion.div >
    </div >
  );
}

export default function LoginForm({ providers }: LoginFormProps) {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <LoginFormContent providers={providers} />
    </Suspense>
  );
}
