"use client";

import { motion } from "framer-motion";

export function LayoutTransitions({ children }: { children: React.ReactNode }) {
    // const pathname = usePathname();

    return (
        <motion.main
            className="flex-1 flex flex-col bg-background w-full"
        >
            {children}
        </motion.main>
    );
}
