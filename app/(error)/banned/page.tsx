"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Mail, ShieldAlert } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import AuthCenterLayout from "@/components/auth-layout";
import { itemVariants } from "@/lib/animations";
import { authClient } from "@/lib/auth/auth-client";
import { ERROR_PAGES_COPY } from "@/lib/config/auth-error-copy";
import { UserStatus } from "@/lib/generated/prisma/enums";

function BannedAccountContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const reason = searchParams.get("reason");
    const copy = ERROR_PAGES_COPY.banned;

    useEffect(() => {
        authClient.getSession().then((session) => {
            if (!session.data) {
                router.replace("/login");
                return;
            }
            const user = session.data.user;
            if (!user.banned && user.status === UserStatus.approved) {
                router.replace("/dashboard");
            }
        });
    }, [router]);

    const handleLogout = async () => {
        if (loading) return;

        setLoading(true);
        try {
            await authClient.signOut();
            router.push("/login");
        } catch (err) {
            console.error("Sign out failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCenterLayout
            labelsList={copy}
            colorTheme="destructive"
            icon={<ShieldAlert size={64} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />}
            footer="Security & Terms of Service Enforcement"
        >
            {/* CENTER CONTENT */}
            <div className="flex flex-col justify-center max-w-md mx-auto w-full py-8 lg:py-0">
                <motion.div variants={itemVariants} className="mb-6 text-center lg:text-left">
                    <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-inner">
                        <ShieldAlert className="w-8 h-8 text-destructive animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-3">
                        Account Banned
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                        Your account has been permanently banned due to a violation of our platform policies. If you believe this action was taken in error, please contact our support team.
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                    <AnimatePresence mode="wait">
                        {reason && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="rounded-2xl bg-destructive/5 p-5 text-sm text-destructive border border-destructive/20 flex flex-col gap-1.5"
                            >
                                <span className="font-black text-[10px] uppercase tracking-widest text-destructive/60">Enforcement Reason</span>
                                <p className="font-semibold leading-relaxed">{reason}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-4">
                        <a
                            href="mailto:support@company.com"
                            className="w-full h-13 flex items-center justify-center gap-3 rounded-2xl font-bold text-sm bg-muted/40 hover:bg-muted text-foreground border border-border/50 hover:border-border transition-all duration-300 active:scale-98"
                        >
                            <Mail size={18} className="text-muted-foreground" />
                            Contact Support
                        </a>

                        <motion.button
                            onClick={handleLogout}
                            disabled={loading}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            className={`w-full h-13 flex items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 active:scale-98 shadow-lg shadow-black/5
                                ${loading
                                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                                    : "bg-foreground text-background hover:opacity-90 cursor-pointer"
                                }`}
                        >
                            <LogOut size={16} />
                            {loading ? "Redirecting..." : "Back to Login"}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AuthCenterLayout>
    );
}

export default function BannedAccountPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-destructive/30 border-t-destructive rounded-full animate-spin" />
            </div>
        }>
            <BannedAccountContent />
        </Suspense>
    );
}
