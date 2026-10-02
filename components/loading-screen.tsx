"use client";

import { AnimatePresence, motion, TargetAndTransition } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

const MESSAGES = [
    "Calculating your financial peace...",
    "Organizing the chaos...",
    "Polishing your balance sheet...",
    "Settling the scores...",
    "Securing your data with love...",
    "Dreaming of debt-free days...",
    "Syncing with the universe...",
    "Building your financial future...",
    "Counting the pennies...",
    "Optimizing your workflow...",
    "Preparing your dashboard...",
    "Gathering insights...",
    "Making things pretty...",
    "Almost there...",
    "Just a few more adjustments...",
    "Loading the magic...",
];

const ANIMATION_VARIANTS = [
    "bounce",
    "float",
    "pulse",
    "spin-slow",
] as const;

export function LoadingScreen() {
    const [message, setMessage] = useState(MESSAGES[0]);
    const [variant, setVariant] = useState<typeof ANIMATION_VARIANTS[number]>("float");
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
        setVariant(ANIMATION_VARIANTS[Math.floor(Math.random() * ANIMATION_VARIANTS.length)]);
    }, []);

    if (!mounted) return null;

    const isDark = resolvedTheme === "dark";
    const logoSrc = isDark ? "/images/logo/dark_logo.png" : "/images/logo/light_logo.png";

    const getLogoAnimation = (): TargetAndTransition => {
        switch (variant) {
            case "bounce":
                return {
                    y: [0, -20, 0],
                    transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
                };
            case "pulse":
                return {
                    scale: [1, 1.1, 1],
                    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                };
            case "spin-slow":
                return {
                    rotateY: [0, 180, 360],
                    transition: { duration: 4, repeat: Infinity, ease: "linear" }
                };
            case "float":
            default:
                return {
                    y: [0, -10, 0],
                    x: [0, 5, 0, -5, 0],
                    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                };
        }
    };

    return (
        <div className="relative flex-1 min-h-[50vh] w-full flex flex-col items-center justify-center bg-background overflow-hidden py-12 my-auto select-none">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -30, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]"
                />
            </div>

            <div className="relative flex flex-col items-center max-w-xs w-full px-6">
                {/* Logo Container */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="relative mb-12"
                >
                    <motion.div animate={getLogoAnimation()} className="relative z-10">
                        <Image
                            src={logoSrc}
                            alt="Logo"
                            width={120}
                            height={120}
                            loading="eager"
                            priority
                            className="h-24 w-24 md:h-32 md:w-32 drop-shadow-2xl"
                        />
                    </motion.div>

                    {/* Aesthetic rings */}
                    <motion.div
                        animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full border-2 border-primary/30"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.8], opacity: [0.2, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                        className="absolute inset-0 rounded-full border border-primary/20"
                    />
                </motion.div>

                {/* Text Area */}
                <div className="h-12 flex items-center justify-center mb-8 px-4">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={message}
                            initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
                            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                            exit={{ y: -20, opacity: 0, filter: "blur(10px)" }}
                            transition={{ duration: 0.6, ease: "circOut" }}
                            className="text-center text-lg font-medium text-foreground tracking-tight bg-linear-to-r from-foreground via-foreground/50 to-foreground bg-size-[200%_100%] animate-shimmer"
                            style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                        >
                            {message}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Modern Loading Indicator */}
                <div className="relative w-full h-1.5 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                        initial={{ left: "-100%" }}
                        animate={{ left: "100%" }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute top-0 bottom-0 w-1/2 bg-linear-to-r from-transparent via-primary to-transparent"
                    />
                </div>

                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-semibold"
                >
                    Initializing Secure Session
                </motion.span>
            </div>
        </div>
    );
}
