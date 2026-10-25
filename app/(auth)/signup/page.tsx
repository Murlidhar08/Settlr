"use client";

// Lib
import AuthCenterLayout from "@/components/auth-layout";
import { TurnstileWidget, type TurnstileInstance } from "@/components/auth/turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { itemVariants } from "@/lib/animations";
import { authClient } from "@/lib/auth/auth-client";
import { AUTH_PAGES_COPY, formatCopy } from "@/lib/config/auth-error-copy";
import { usernameRegex } from "@/lib/constants/regex-list";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, EyeOff, Loader2, Mail, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const copy = AUTH_PAGES_COPY.signup;
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    authClient.getSession()
      .then((session) => {
        if (session.data) {
          if (session.data.user.banned) router.push("/banned" as any);
          else router.push("/dashboard" as any);
        }
      });
  }, [router])

  // Debounced username availability check
  useEffect(() => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }

    if (username.length < 3) {
      setUsernameAvailable(false);
      return;
    }

    if (!usernameRegex.test(username)) {
      setUsernameAvailable(false);
      return;
    }

    const checkAvailability = async () => {
      setCheckingUsername(true);
      try {
        const result = await authClient.isUsernameAvailable({ username });
        setUsernameAvailable(!!result.data?.available);
      } catch (err) {
        console.error("Error checking username availability:", err);
        setUsernameAvailable(false);
      } finally {
        setCheckingUsername(false);
      }
    };

    const delayDebounceFn = setTimeout(checkAvailability, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!usernameRegex.test(username)) {
      setError("Username can only contain letters, numbers, underscores, and hyphens");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    if (checkingUsername) {
      setError("Checking username availability...");
      return;
    }

    if (usernameAvailable === false) {
      setError("Please choose an available username");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

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

      const result = await authClient.signUp.email({
        email,
        name,
        password,
        username,
      }, fetchOptions);

      if (result.error) {
        turnstileRef.current?.reset();
        setCaptchaToken(null);
        setError(result.error.message || "Signup failed");
      } else {
        toast.success(formatCopy("Registration successful! Please check your email for a link to confirm your account."));
        router.push("/login");
      }
    } catch (err) {
      turnstileRef.current?.reset();
      setCaptchaToken(null);
      setError("An error occurred during signup");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <AuthCenterLayout
      labelsList={copy}
      footer={
        <p className="text-center text-muted-foreground">
          {"Already have an account?"}{" "}
          <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
            Sign In
          </Link>
        </p>
      }
    >
      {/* CENTER FORM AREA */}
      <div className="flex flex-col justify-center max-w-sm mx-auto w-full py-8 lg:py-0">
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-4xl font-bold tracking-tight mb-3">
            Create account
          </h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed">
            {formatCopy(copy.subtitle)}
          </p>
        </motion.div>

        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
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
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold ml-1 text-foreground/70">Full Name</label>
              <div className="relative group">
                <Input
                  type="text"
                  placeholder="John Doe"
                  className="h-13 rounded-2xl pl-4 pr-12 transition-all duration-300 bg-muted/40 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold ml-1 text-foreground/70">Username</label>
              <div className="relative group">
                <Input
                  type="text"
                  placeholder="johndoe"
                  className="h-13 rounded-2xl pl-4 pr-12 transition-all duration-300 bg-muted/40 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {checkingUsername && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                  {!checkingUsername && usernameAvailable === true && <Check className="w-5 h-5 text-emerald-500 animate-in fade-in zoom-in-50 duration-200" />}
                  {!checkingUsername && usernameAvailable === false && <X className="w-5 h-5 text-destructive animate-in fade-in zoom-in-50 duration-200" />}
                  {!checkingUsername && usernameAvailable === null && <User className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />}
                </div>
              </div>
              {username && (
                <div className="text-xs ml-1 transition-all duration-200">
                  {checkingUsername && (
                    <span className="text-muted-foreground animate-pulse">
                      Checking username availability...
                    </span>
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <span className="text-emerald-500 font-medium">
                      Username is available!
                    </span>
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <span className="text-destructive font-medium">
                      {username.length < 3
                        ? "Username must be at least 3 characters"
                        : !usernameRegex.test(username)
                          ? "Only alphanumeric characters, underscores, and hyphens allowed"
                          : "Username is already taken"}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold ml-1 text-foreground/70">Email Address</label>
              <div className="relative group">
                <Input
                  type="email"
                  placeholder="name@company.com"
                  className="h-13 rounded-2xl pl-4 pr-12 transition-all duration-300 bg-muted/40 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold ml-1 text-foreground/70">Password</label>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-13 rounded-2xl pl-4 pr-12 transition-all duration-300 bg-muted/40 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold ml-1 text-foreground/70">
                  Confirm
                </label>
                <div className="relative group">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-13 rounded-2xl pl-4 pr-12 transition-all duration-300 bg-muted/40 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors group-focus-within:text-primary"
                  >
                    {showConfirm ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            <TurnstileWidget
              ref={turnstileRef}
              action="sign_up"
              onSuccess={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />
          </div>

          <Button
            disabled={loading}
            type="submit"
            className="relative rounded-2xl h-14 w-full text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98] mt-4"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Creating account...
              </div>
            ) : "Create Account"}
          </Button>
        </motion.form>
      </div>
    </AuthCenterLayout>
  );
}
