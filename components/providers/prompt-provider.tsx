"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { createContext, ReactNode, useContext, useState } from "react"

/* ========================================================= */
/* TYPES */
/* ========================================================= */

type PromptOptions = {
    title?: string
    description?: string
    placeholder?: string
    initialValue?: string
    confirmText?: string
    cancelText?: string
    destructive?: boolean
}

type PromptContextType = {
    prompt: (options?: PromptOptions) => Promise<string | null>
}

/* ========================================================= */
/* CONTEXT */
/* ========================================================= */

const PromptContext = createContext<PromptContextType | null>(null)

/* ========================================================= */
/* PROVIDER */
/* ========================================================= */

export function PromptProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [options, setOptions] = useState<PromptOptions>({})
    const [resolver, setResolver] =
        useState<((value: string | null) => void) | null>(null)

    const promptUser = (opts: PromptOptions = {}) => {
        setOptions(opts)
        setValue(opts.initialValue ?? "")
        setOpen(true)

        return new Promise<string | null>((resolve) => {
            setResolver(() => resolve)
        })
    }

    const handleCancel = () => {
        setOpen(false)
        resolver?.(null)
    }

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault()
        setOpen(false)
        resolver?.(value)
    }

    return (
        <PromptContext.Provider value={{ prompt: promptUser }}>
            {children}

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-100 max-h-[90vh] overflow-y-auto border-none bg-background/80 backdrop-blur-2xl rounded-3xl sm:rounded-[3rem] p-0 shadow-2xl overflow-hidden">
                    <form onSubmit={handleConfirm} className="relative p-6 sm:p-8 pt-8 sm:pt-10 space-y-6 flex flex-col justify-between min-h-0">
                        {/* Decorative background element */}
                        <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none",
                            options.destructive ? "bg-rose-500" : "bg-primary"
                        )} />

                        <div className="space-y-4 relative z-10">
                            <AlertDialogHeader className="space-y-3 text-center">
                                <AlertDialogTitle className="text-2xl font-black tracking-tight text-foreground">
                                    {options.title ?? "Input Required"}
                                </AlertDialogTitle>

                                {options.description && (
                                    <AlertDialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed px-2">
                                        {options.description}
                                    </AlertDialogDescription>
                                )}
                            </AlertDialogHeader>

                            <div className="pt-2">
                                <Input
                                    autoFocus
                                    placeholder={options.placeholder ?? "Type here..."}
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="h-14 rounded-2xl bg-muted/30 border-none shadow-inner text-center font-bold placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
                                />
                            </div>
                        </div>

                        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-3 relative z-10 pt-2 shrink-0">
                            <AlertDialogCancel
                                type="button"
                                onClick={handleCancel}
                                className="w-full sm:flex-1 shrink-0 h-12 min-h-12 rounded-2xl border-none bg-muted/50 hover:bg-muted text-foreground font-bold transition-all active:scale-95"
                            >
                                {options.cancelText ?? "Cancel"}
                            </AlertDialogCancel>

                            <AlertDialogAction
                                type="submit"
                                className={cn(
                                    "w-full sm:flex-1 shrink-0 h-12 min-h-12 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                                    options.destructive
                                        ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                                )}
                            >
                                {options.confirmText ?? "Submit"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </PromptContext.Provider >
    )
}

/* ========================================================= */
/* HOOK */
/* ========================================================= */

export function usePrompt() {
    const ctx = useContext(PromptContext)

    if (!ctx) {
        throw new Error("usePrompt must be used inside PromptProvider")
    }

    return ctx.prompt
}
