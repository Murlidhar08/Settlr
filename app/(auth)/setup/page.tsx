"use client";

// Lib
import { setupAdmin } from "@/actions/auth/setup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { containerVariants, floatAnimate, floatTransition, itemVariants } from "@/lib/animations";
import { AUTH_PAGES_COPY, formatCopy } from "@/lib/config/auth-error-copy";
import { envClient } from "@/lib/env.client";
import { AnimatePresence, motion } from "framer-motion";
import { AtSign, Eye, EyeOff, Mail, ShieldCheck, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SetupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError(AUTH_PAGES_COPY.setup.messages.usernameValidation);
      return;
    }

    if (username.length < 3) {
      setError(AUTH_PAGES_COPY.setup.messages.usernameMinLength);
      return;
    }

    if (password !== confirmPassword) {
      setError(AUTH_PAGES_COPY.setup.messages.passwordMismatch);
      return;
    }

    if (password.length < 8) {
      setError(AUTH_PAGES_COPY.setup.messages.passwordMinLength);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);

      await setupAdmin(formData);
      toast.success(AUTH_PAGES_COPY.setup.messages.successToast);
      router.push("/login");
    } catch (err: any) {
      setError(err.message || AUTH_PAGES_COPY.setup.messages.failedError);
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
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider mb-4 border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              {AUTH_PAGES_COPY.setup.badge}
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              {AUTH_PAGES_COPY.setup.title}
            </h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
              {formatCopy(AUTH_PAGES_COPY.setup.subtitle, { appName: envClient.NEXT_PUBLIC_APP_NAME })}
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
                <label className="text-sm font-semibold ml-1 text-foreground/70">
                  {AUTH_PAGES_COPY.setup.fields.nameLabel}
                </label>
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder={AUTH_PAGES_COPY.setup.fields.namePlaceholder}
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
                <label className="text-sm font-semibold ml-1 text-foreground/70">
                  {AUTH_PAGES_COPY.setup.fields.usernameLabel}
                </label>
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder={AUTH_PAGES_COPY.setup.fields.usernamePlaceholder}
                    className="h-13 rounded-2xl pl-4 pr-12 transition-all duration-300 bg-muted/40 border-border/50 focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    required
                  />
                  <AtSign className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold ml-1 text-foreground/70">
                  {AUTH_PAGES_COPY.setup.fields.emailLabel}
                </label>
                <div className="relative group">
                  <Input
                    type="email"
                    placeholder={AUTH_PAGES_COPY.setup.fields.emailPlaceholder}
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
                  <label className="text-sm font-semibold ml-1 text-foreground/70">
                    {AUTH_PAGES_COPY.setup.fields.passwordLabel}
                  </label>
                  <div className="relative group">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={AUTH_PAGES_COPY.setup.fields.passwordPlaceholder}
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
                    {AUTH_PAGES_COPY.setup.fields.confirmPasswordLabel}
                  </label>
                  <div className="relative group">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder={AUTH_PAGES_COPY.setup.fields.confirmPasswordPlaceholder}
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
            </div>

            <Button
              disabled={loading}
              type="submit"
              className="relative rounded-2xl h-14 w-full text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98] mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {AUTH_PAGES_COPY.setup.buttons.loading}
                </div>
              ) : AUTH_PAGES_COPY.setup.buttons.submit}
            </Button>
          </motion.form>
        </div>

        {/* BOTTOM DECORATION */}
        <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-border/50">
          <p className="text-center text-muted-foreground text-sm font-medium">
            {formatCopy(AUTH_PAGES_COPY.setup.footer, { appName: envClient.NEXT_PUBLIC_APP_NAME })}
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
              className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight leading-tight"
            >
              {AUTH_PAGES_COPY.setup.hero.titleLine1} <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">
                {AUTH_PAGES_COPY.setup.hero.titleLine2}
              </span>
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 text-xl font-medium max-w-lg mx-auto leading-relaxed"
            >
              {AUTH_PAGES_COPY.setup.hero.description}
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

