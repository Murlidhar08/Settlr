"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

import AuthCenterLayout from "@/components/auth-layout";
import { itemVariants } from "@/lib/animations";
import { ERROR_PAGES_COPY } from "@/lib/config/auth-error-copy";

export default function UnauthorizedPage() {
    const copy = ERROR_PAGES_COPY.unauthorized;

    return (
        <AuthCenterLayout
            labelsList={copy}
            colorTheme="amber"
            icon={<Lock size={64} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />}
            footer="Role-Based Access Control Enforcement"
        >
            {/* CENTER AREA */}
            <div className="flex flex-col justify-center max-w-md mx-auto w-full py-8 lg:py-0">
                <motion.div variants={itemVariants} className="mb-8 text-center lg:text-left">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-inner">
                        <Lock className="w-8 h-8 text-amber-500 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-3">
                        Access Denied
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                        Hold up! You don&apos;t have the required administrative role or security permissions (403 Forbidden) to access this directory or resource.
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="w-full h-13 flex items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest text-xs bg-foreground text-background hover:opacity-90 transition-all duration-300 active:scale-98 shadow-lg shadow-black/5"
                        >
                            <ArrowLeft size={16} />
                            Back to Safety
                        </Link>
                    </div>
                </motion.div>
            </div>
        </AuthCenterLayout>
    );
}
