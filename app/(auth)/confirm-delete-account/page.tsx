"use client";

import { confirmDeleteAccountWithToken } from "@/actions/user.actions";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { containerVariants, floatAnimate, floatTransition, itemVariants } from "@/lib/animations";
import { envClient } from "@/lib/env.client";
import { tran } from "@/lib/languages/i18n";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Home, ShieldAlert, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

function ConfirmDeleteAccountContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

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

    return (
        <div className="h-screen w-full flex flex-col lg:flex-row select-none bg-background overflow-hidden relative">
            {/* LEFT SIDE: DETAILS & CONFIRMATION ACTIONS */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col justify-between w-full lg:w-1/2 px-6 sm:px-12 lg:px-8 py-8 relative z-10 h-full overflow-y-auto scrollbar-none bg-linear-to-b from-destructive/12 via-background to-background backdrop-blur-sm border-r border-border/50"
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

                {/* CENTER AREA */}
                <div className="flex flex-col justify-center max-w-md mx-auto w-full py-8 lg:py-0">
                    {deleted ? (
                        /* SUCCESS STATE */
                        <motion.div variants={itemVariants} className="space-y-6 text-center lg:text-left">
                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-inner">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-black tracking-tight text-foreground">
                                    {tran("danger.account_deleted_title")}
                                </h2>
                                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                    {tran("danger.account_deleted_desc")}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-emerald-500/5 p-5 text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex flex-col gap-1.5 text-left">
                                <span className="font-black text-[10px] uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60">
                                    Data Erased
                                </span>
                                <p className="font-semibold leading-relaxed">
                                    All your profile information, sessions, documents, and database records have been deleted permanently.
                                </p>
                            </div>

                            <div className="pt-2">
                                <motion.button
                                    onClick={() => router.push("/")}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full h-13 flex items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest text-xs bg-foreground text-background hover:opacity-90 transition-all duration-300 active:scale-98 shadow-lg shadow-black/5 cursor-pointer"
                                >
                                    <Home size={16} />
                                    {tran("danger.return_to_home")}
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
                                    {tran("danger.invalid_token_title")}
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
                                    {tran("danger.return_to_home")}
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
                                    {tran("danger.confirm_delete_page_title")}
                                </h2>
                                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                    {tran("danger.confirm_delete_page_desc")}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-destructive/5 p-5 text-sm text-destructive border border-destructive/20 flex flex-col gap-1.5 text-left">
                                <span className="font-black text-[10px] uppercase tracking-widest text-destructive/60">
                                    Permanent Action
                                </span>
                                <p className="font-semibold leading-relaxed">
                                    {tran("danger.delete_account_description")}
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
                                        {tran("danger.confirm_delete_page_button")}
                                    </LoadingSwap>
                                </motion.button>

                                <button
                                    type="button"
                                    onClick={() => router.push("/dashboard")}
                                    disabled={isPending}
                                    className="w-full h-13 flex items-center justify-center gap-3 rounded-2xl font-bold text-sm bg-muted/40 hover:bg-muted text-foreground border border-border/50 hover:border-border transition-all duration-300 active:scale-98 cursor-pointer"
                                >
                                    {tran("danger.confirm_delete_cancel")}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* FOOTER */}
                <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-border/50">
                    <p className="text-center text-xs text-muted-foreground font-semibold">
                        Security & Account Privacy Verification
                    </p>
                </motion.div>
            </motion.div>

            {/* RIGHT SIDE: ILLUSTRATION & DANGER BANNER */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className={`hidden lg:flex flex-1 p-12 items-center justify-center relative overflow-hidden transition-colors duration-700
                    ${deleted
                        ? "bg-linear-to-br from-emerald-600 via-emerald-600/90 to-emerald-700/80"
                        : "bg-linear-to-br from-destructive via-destructive/90 to-destructive/80"
                    }`}
            >
                {/* Animated Background Elements */}
                <div className="absolute top-0 right-0 w-200 h-200 bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-150 h-150 bg-black/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

                {/* Abstract Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-10 mask-[radial-gradient(ellipse_at_center,black,transparent)]"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
                />

                <div className="relative z-10 w-full max-w-2xl text-center text-white space-y-12">
                    <motion.div
                        animate={floatAnimate}
                        transition={floatTransition}
                        className="w-32 h-32 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-2xl mx-auto relative group"
                    >
                        <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        {deleted ? (
                            <CheckCircle2 size={64} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />
                        ) : error ? (
                            <AlertTriangle size={64} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />
                        ) : (
                            <Trash2 size={64} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />
                        )}
                    </motion.div>

                    <div className="space-y-6">
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight leading-tight"
                        >
                            {deleted ? (
                                <>
                                    Account <br />
                                    <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">Deleted.</span>
                                </>
                            ) : error ? (
                                <>
                                    Link <br />
                                    <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">Expired.</span>
                                </>
                            ) : (
                                <>
                                    Permanent <br />
                                    <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">Deletion.</span>
                                </>
                            )}
                        </motion.h2>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-white/80 text-xl font-medium max-w-lg mx-auto leading-relaxed"
                        >
                            {deleted
                                ? "All your data and active sessions have been safely removed from our platform."
                                : error
                                    ? "This deletion link is invalid or has expired."
                                    : "Confirming this action will permanently remove your account, profile, documents, and data."
                            }
                        </motion.p>
                    </div>
                </div>
            </motion.div>
        </div>
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
