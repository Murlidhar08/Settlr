import { itemVariants } from "@/lib/animations";
import { tran } from "@/lib/languages/i18n";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { TwoFactorAuth } from "./two-factor-auth";

export function TwoFactorTab({ hasPasswordAccount, isTwoFactorEnabled }: { hasPasswordAccount: boolean, isTwoFactorEnabled: boolean }) {
    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            className="space-y-4"
        >
            <div className="rounded-2xl bg-card border shadow-xs p-8 space-y-6 relative overflow-hidden">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 mb-2">
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                            <ShieldCheck size={24} />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-base">{tran("security.two_factor.authenticator_app")}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {tran("security.two_factor.authenticator_description")}
                            </p>
                        </div>
                    </div>

                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        isTwoFactorEnabled ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-muted text-muted-foreground border-transparent"
                    )}>
                        {isTwoFactorEnabled ? tran("security.two_factor.enabled") : tran("security.two_factor.disabled")}
                    </div>
                </div>

                <div className="rounded-3xl bg-muted/30 p-2 border border-muted-foreground/5 shadow-inner">
                    {hasPasswordAccount === false ? (
                        <div className="p-6 text-center">
                            <p className="text-sm text-muted-foreground italic">
                                {tran("security.access.set_password_first")}
                            </p>
                        </div>
                    ) : (
                        <TwoFactorAuth isEnabled={isTwoFactorEnabled} />
                    )}
                </div>

                {!isTwoFactorEnabled && (
                    <div className="flex items-center gap-2 p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                        <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wide">
                            {tran("security.two_factor.recommended")}
                        </p>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/10 to-transparent" />
            </div>
        </motion.section>
    )
}
