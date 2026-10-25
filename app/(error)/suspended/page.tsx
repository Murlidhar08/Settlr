"use client";

import { motion } from "framer-motion";
import { AlertTriangle, LogOut, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AuthCenterLayout from "@/components/auth-layout";
import { itemVariants } from "@/lib/animations";
import { authClient } from "@/lib/auth/auth-client";
import { ERROR_PAGES_COPY, formatCopy } from "@/lib/config/auth-error-copy";
import { UserStatus } from "@/lib/generated/prisma/enums";

export default function AccountSuspendedPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const copy = ERROR_PAGES_COPY.suspended;

    useEffect(() => {
        authClient.getSession().then((session) => {
            if (!session.data) {
                router.push("/login");
                return;
            }
            const user = session.data.user;
            if (!user.banned && user.status === UserStatus.approved) {
                router.push("/dashboard");
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
            colorTheme="amber"
            icon={<AlertTriangle size={64} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />}
            footer={copy.footer}
        >
            {/* CENTER AREA */}
            <div className="flex flex-col justify-center max-w-md mx-auto w-full py-8 lg:py-0">
                <motion.div variants={itemVariants} className="mb-8 text-center lg:text-left">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-inner">
                        <AlertTriangle className="w-8 h-8 text-amber-500 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-3">
                        {copy.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                        {formatCopy(copy.description)}
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="space-y-4">
                        <a
                            href="mailto:support@company.com"
                            className="w-full h-13 flex items-center justify-center gap-3 rounded-2xl font-bold text-sm bg-muted/40 hover:bg-muted text-foreground border border-border/50 hover:border-border transition-all duration-300 active:scale-98"
                        >
                            <Mail size={18} className="text-muted-foreground" />
                            {copy.buttons.support}
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
                            {loading ? copy.buttons.redirecting : copy.buttons.backToLogin}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AuthCenterLayout>
    );
}
