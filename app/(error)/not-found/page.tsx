"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { containerVariants, floatAnimate, floatTransition, itemVariants } from "@/lib/animations";
import { ERROR_PAGES_COPY, formatCopy } from "@/lib/config/auth-error-copy";
import { envClient } from "@/lib/env.client";

export default function NotFoundPage() {
    const router = useRouter();
    const copy = ERROR_PAGES_COPY.notFound;

    return (
        <div className="h-screen w-full flex flex-col lg:flex-row select-none bg-background overflow-hidden relative">
            {/* LEFT SIDE: DETAILS */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col justify-between w-full lg:w-1/2 px-6 sm:px-12 lg:px-8 py-8 relative z-10 h-full overflow-y-auto scrollbar-none bg-linear-to-b from-primary/12 via-background to-background backdrop-blur-sm border-r border-border/50"
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
                    <motion.div variants={itemVariants} className="mb-8 text-center lg:text-left">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-inner">
                            <Compass className="w-8 h-8 text-primary animate-pulse" />
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
                                href="/"
                                className="w-full h-13 flex items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest text-xs bg-foreground text-background hover:opacity-90 transition-all duration-300 active:scale-98 shadow-lg shadow-black/5"
                            >
                                <ArrowLeft size={16} />
                                {copy.buttons.backToHome}
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* FOOTER */}
                <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-border/50">
                    <p className="text-center text-xs text-muted-foreground font-semibold">
                        {copy.footer}
                    </p>
                </motion.div>
            </motion.div>

            {/* RIGHT SIDE: ILLUSTRATION & DETAIL */}
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
                        <Compass size={64} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500 stroke-[1.5]" />
                    </motion.div>

                    <div className="space-y-6">
                        <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tight leading-tight">
                            {copy.hero.titleLine1} <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">{copy.hero.titleLine2}</span>
                        </h2>

                        <p className="text-white/80 text-xl font-medium max-w-lg mx-auto leading-relaxed">
                            {formatCopy(copy.hero.description)}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
