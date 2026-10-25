"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Link2Off } from "lucide-react";
import Link from "next/link";

import AuthCenterLayout from "@/components/auth-layout";
import { itemVariants } from "@/lib/animations";
import { ERROR_PAGES_COPY, formatCopy } from "@/lib/config/auth-error-copy";

export default function ExpiredTokenPage() {
    const copy = ERROR_PAGES_COPY.expired;

    return (
        <AuthCenterLayout
            labelsList={copy}
            colorTheme="primary"
            icon={<Link2Off size={64} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />}
            footer={copy.footer}
        >
            {/* CENTER AREA */}
            <div className="flex flex-col justify-center max-w-md mx-auto w-full py-8 lg:py-0">
                <motion.div variants={itemVariants} className="mb-8 text-center lg:text-left">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-inner">
                        <Link2Off className="w-8 h-8 text-primary animate-pulse" />
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
                        <Link
                            href="/login"
                            className="w-full h-13 flex items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest text-xs bg-foreground text-background hover:opacity-90 transition-all duration-300 active:scale-98 shadow-lg shadow-black/5"
                        >
                            <ArrowLeft size={16} />
                            {copy.buttons.backToLogin}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </AuthCenterLayout>
    );
}
