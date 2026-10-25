"use client";

import { confirmDeleteAccountWithToken } from "@/actions/user.actions";
import AuthCenterLayout, { type AuthLayoutColorTheme } from "@/components/auth-layout";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { itemVariants } from "@/lib/animations";
import { AUTH_PAGES_COPY } from "@/lib/config/auth-error-copy";
import { tran } from "@/lib/languages/i18n";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Home, ShieldAlert, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

function ConfirmDeleteAccountContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const delLabels = AUTH_PAGES_COPY.confirmDeleteAccount;

    const [isPending, startTransition] = useTransition();
    const [deleted, setDeleted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError(tran("danger.invalid_token_desc"));
        }
    }, [token]);

    const handleConfirmDelete = () => {
        if (!token) return;
        startTransition(async () => {
            setError(null);
            const res = await confirmDeleteAccountWithToken(token);
            if (res.success) {
                setDeleted(true);
                toast.success(tran("danger.msg.account_deleted"));
            } else {
                setError(res.error || tran("danger.invalid_token_desc"));
                toast.error(res.error || tran("danger.invalid_token_desc"));
            }
        });
    };

    const heroCopy = deleted
        ? delLabels.hero.deleted
        : error
            ? delLabels.hero.expired
            : delLabels.hero.confirm;

    const heroIcon = deleted ? (
        <CheckCircle2 size={64} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />
    ) : error ? (
        <AlertTriangle size={64} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />
    ) : (
        <Trash2 size={64} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />
    );

    const theme: AuthLayoutColorTheme = deleted ? "emerald" : error ? "amber" : "destructive";

    return (
        <AuthCenterLayout
            hero={heroCopy}
            icon={heroIcon}
            colorTheme={theme}
            footer={delLabels.footer}
        >
            <div className="flex flex-col justify-center max-w-md mx-auto w-full py-8 lg:py-0">
                {deleted ? (
                    /* SUCCESS STATE */
                    <motion.div variants={itemVariants} className="space-y-6 text-center lg:text-left">
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-inner">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight text-foreground">
                                {delLabels.success.title}
                            </h2>
                            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                {delLabels.success.description}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-emerald-500/5 p-5 text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex flex-col gap-1.5 text-left">
                            <span className="font-black text-[10px] uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60">
                                {delLabels.success.badge}
                            </span>
                            <p className="font-semibold leading-relaxed">
                                {delLabels.success.text}
                            </p>
                        </div>

                        <div className="pt-2">
                            <motion.button
                                onClick={() => router.push("/")}
                                whileTap={{ scale: 0.98 }}
                                className="w-full h-13 flex items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest text-xs bg-foreground text-background hover:opacity-90 transition-all duration-300 active:scale-98 shadow-lg shadow-black/5 cursor-pointer"
                            >
                                <Home size={16} />
                                {delLabels.success.returnHomeButton}
                            </motion.button>
                        </div>
                    </motion.div>
                ) : error ? (
                    /* ERROR STATE */
                    <motion.div variants={itemVariants} className="space-y-6 text-center lg:text-left">
                        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-inner">
                            <AlertTriangle className="w-8 h-8" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight text-foreground">
                                {delLabels.error.title}
                            </h2>
                            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                {error}
                            </p>
                        </div>

                        <div className="pt-2">
                            <motion.button
                                onClick={() => router.push("/")}
                                whileTap={{ scale: 0.98 }}
                                className="w-full h-13 flex items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest text-xs bg-foreground text-background hover:opacity-90 transition-all duration-300 active:scale-98 shadow-lg shadow-black/5 cursor-pointer"
                            >
                                <Home size={16} />
                                {delLabels.error.returnHomeButton}
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    /* CONFIRMATION STATE */
                    <motion.div variants={itemVariants} className="space-y-6 text-center lg:text-left">
                        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-inner">
                            <ShieldAlert className="w-8 h-8 text-destructive animate-pulse" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight text-foreground">
                                {delLabels.confirmation.title}
                            </h2>
                            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                {delLabels.confirmation.description}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-destructive/5 p-5 text-sm text-destructive border border-destructive/20 flex flex-col gap-1.5 text-left">
                            <span className="font-black text-[10px] uppercase tracking-widest text-destructive/60">
                                {delLabels.confirmation.warningBadge}
                            </span>
                            <p className="font-semibold leading-relaxed">
                                {delLabels.confirmation.warningText}
                            </p>
                        </div>

                        <div className="space-y-3 pt-2">
                            <motion.button
                                onClick={handleConfirmDelete}
                                disabled={isPending}
                                whileTap={{ scale: isPending ? 1 : 0.98 }}
                                className={`w-full h-13 flex items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 active:scale-98 shadow-lg shadow-destructive/20 text-white
                                    ${isPending
                                        ? "bg-destructive/50 cursor-not-allowed"
                                        : "bg-destructive hover:bg-destructive/90 cursor-pointer"
                                    }`}
                            >
                                <LoadingSwap isLoading={isPending} className="flex items-center gap-2">
                                    <Trash2 size={16} />
                                    {delLabels.confirmation.deleteButton}
                                </LoadingSwap>
                            </motion.button>

                            <button
                                type="button"
                                onClick={() => router.push("/dashboard")}
                                disabled={isPending}
                                className="w-full h-13 flex items-center justify-center gap-3 rounded-2xl font-bold text-sm bg-muted/40 hover:bg-muted text-foreground border border-border/50 hover:border-border transition-all duration-300 active:scale-98 cursor-pointer"
                            >
                                {delLabels.confirmation.cancelButton}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </AuthCenterLayout>
    );
}

export default function ConfirmDeleteAccountPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <ConfirmDeleteAccountContent />
        </Suspense>
    );
}
