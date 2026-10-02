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
import { cn } from "@/lib/utils"
import { createContext, ReactNode, useContext, useState } from "react"

/* ========================================================= */
/* TYPES */
/* ========================================================= */

type ConfirmOptions = {
  title?: string
  description?: ReactNode
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

type ConfirmContextType = {
  confirm: (options?: ConfirmOptions) => Promise<boolean>
}

/**
 * Safely parses basic inline formatting tags (strong, b, em, i) into React elements
 */
function parseFormattedText(text: string): ReactNode {
  const tokens = text.split(/(<\/?(?:strong|b|i|em)(?:\s[^>]*)?>)/gi);
  if (tokens.length === 1) {
    return text;
  }

  let isBold = false;
  let isItalic = false;

  return tokens.map((token, index) => {
    const isOpeningTag = /^<(strong|b|i|em)(?:\s[^>]*)?>$/i.test(token);
    const isClosingTag = /^<\/(strong|b|i|em)>$/i.test(token);

    if (isOpeningTag) {
      const tag = token.replace(/<([a-z]+)[\s\S]*>/i, "$1").toLowerCase();
      if (tag === "strong" || tag === "b") isBold = true;
      if (tag === "i" || tag === "em") isItalic = true;
      return null;
    }

    if (isClosingTag) {
      const tag = token.replace(/<\/([a-z]+)>/i, "$1").toLowerCase();
      if (tag === "strong" || tag === "b") isBold = false;
      if (tag === "i" || tag === "em") isItalic = false;
      return null;
    }

    if (!token) return null;

    if (isBold && isItalic) {
      return (
        <strong key={index} className="font-bold text-foreground italic">
          {token}
        </strong>
      );
    }
    if (isBold) {
      return (
        <strong key={index} className="font-bold text-foreground">
          {token}
        </strong>
      );
    }
    if (isItalic) {
      return (
        <em key={index} className="italic text-foreground/90">
          {token}
        </em>
      );
    }
    return token;
  });
}

/* ========================================================= */
/* CONTEXT */
/* ========================================================= */

const ConfirmContext = createContext<ConfirmContextType | null>(null)

/* ========================================================= */
/* PROVIDER */
/* ========================================================= */

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({})
  const [resolver, setResolver] =
    useState<((value: boolean) => void) | null>(null)

  const confirm = (opts: ConfirmOptions = {}) => {
    setOptions(opts)
    setOpen(true)

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve)
    })
  }

  const handleCancel = () => {
    setOpen(false)
    resolver?.(false)
  }

  const handleConfirm = () => {
    setOpen(false)
    resolver?.(true)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-100 border-none bg-background/80 backdrop-blur-2xl rounded-[3rem] p-0 overflow-hidden shadow-2xl">
          <div className="relative p-8 pt-10 space-y-6">
            {/* Decorative background element */}
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2",
              options.destructive ? "bg-rose-500" : "bg-primary"
            )} />

            <div className="space-y-4 text-center relative z-10">
              <AlertDialogHeader className="space-y-3">
                <AlertDialogTitle className="text-2xl font-black tracking-tight text-foreground">
                  {options.title ?? "Are you sure?"}
                </AlertDialogTitle>

                {options.description && (
                  <AlertDialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed px-2">
                    {typeof options.description === "string"
                      ? parseFormattedText(options.description)
                      : options.description}
                  </AlertDialogDescription>
                )}
              </AlertDialogHeader>
            </div>

            <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 relative z-10 pt-2">
              <AlertDialogCancel
                onClick={handleCancel}
                className="flex-1 h-12 rounded-2xl border-none bg-muted/50 hover:bg-muted text-foreground font-bold transition-all active:scale-95"
              >
                {options.cancelText ?? "Cancel"}
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleConfirm}
                className={cn(
                  "flex-1 h-12 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                  options.destructive
                    ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                )}
              >
                {options.confirmText ?? options.destructive ? "Delete" : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider >
  )
}

/* ========================================================= */
/* HOOK */
/* ========================================================= */

export function useConfirm() {
  const ctx = useContext(ConfirmContext)

  if (!ctx) {
    throw new Error("useConfirm must be used inside ConfirmProvider")
  }

  return ctx.confirm
}
