"use client";

import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, ServerCrash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import AuthCenterLayout from "@/components/auth-layout";
import { itemVariants } from "@/lib/animations";
import { ERROR_PAGES_COPY, formatCopy } from "@/lib/config/auth-error-copy";

export default function ServerErrorPage() {
    const [refreshing, setRefreshing] = useState(false);
    const copy = ERROR_PAGES_COPY.serverError;

    const handleRefresh = () => {
        setRefreshing(true);
        window.location.reload();
    };

    return (
        <AuthCenterLayout
            labelsList={copy}
            colorTheme="slate"
            icon={<ServerCrash size={64} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />}
            footer={copy.footer}
        >
            {/* CENTER AREA */}
            <div className="flex flex-col justify-center max-w-md mx-auto w-full py-8 lg:py-0">
                <motion.div variants={itemVariants} className="mb-8 text-center lg:text-left">
                    <div className="w-16 h-16 bg-slate-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-inner">
                        <ServerCrash className="w-8 h-8 text-slate-600 dark:text-slate-400 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-3">
                        {copy.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                        {formatCopy(copy.description)}
                    </p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex-1 h-13 flex items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest text-xs bg-foreground text-background hover:opacity-90 transition-all duration-300 active:scale-98 shadow-lg shadow-black/5 cursor-pointer"
                        >
                            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                            {refreshing ? copy.buttons.refreshing : copy.buttons.refresh}
                        </button>

                        <Link
                            href="/"
                            className="flex-1 h-13 flex items-center justify-center gap-3 rounded-2xl font-bold text-sm bg-muted/40 hover:bg-muted text-foreground border border-border/50 hover:border-border transition-all duration-300 active:scale-98"
                        >
                            <ArrowLeft size={16} className="text-muted-foreground" />
                            {copy.buttons.backToHome}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </AuthCenterLayout>
    );
}
