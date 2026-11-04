"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                <div className="w-5 h-5" />
            </Button>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full w-10 h-10 relative overflow-hidden bg-muted/50 hover:bg-muted transition-colors"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme}
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex items-center justify-center"
                >
                    {theme === "light" ? (
                        <Sun className="h-5 w-5 hover:text-amber-500" />
                    ) : (
                        <Moon className="h-5 w-5 hover:text-blue-400" />
                    )}
                </motion.div>
            </AnimatePresence>
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}