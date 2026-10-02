import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { tran } from "@/lib/languages/i18n";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
};

export function SecureTab({ email, hasPasswordAccount }: { email: string, hasPasswordAccount?: boolean }) {
    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            className="space-y-4"
        >
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">
                {tran("security.access.title")}
            </h3>
            <div className="rounded-[2.5rem] bg-card border shadow-xs p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

                {hasPasswordAccount === undefined ? (
                    <div className="space-y-4">
                        <div className="h-4 w-32 animate-pulse bg-muted rounded" />
                        <div className="h-12 w-full animate-pulse bg-muted rounded-2xl" />
                        <div className="h-12 w-full animate-pulse bg-muted rounded-2xl" />
                    </div>
                ) : hasPasswordAccount ? (
                    <ChangePasswordForm />
                ) : (
                    <SetPasswordForm />
                )}
            </div>
        </motion.section>
    )
}

// Internal components for the tab
type ChangePasswordFormValues = {
    currentPassword: string
    newPassword: string
    revokeOtherSessions: boolean
}

function ChangePasswordForm() {
    const { data: session } = authClient.useSession()
    const userEmail = session?.user?.email || ""

    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting }, setValue } = useForm<ChangePasswordFormValues>({
        defaultValues: { currentPassword: "", newPassword: "", revokeOtherSessions: false },
    })

    async function onSubmit(values: ChangePasswordFormValues) {
        await authClient.changePassword(values, {
            onSuccess: () => {
                toast.success(tran("security.access.msg.password_updated"))
                reset()
            },
            onError: (error) => {
                toast.error(error?.error?.message ?? tran("security.access.msg.password_update_failed"))
            },
        })
    }

    return (
        <div className="space-y-8 relative z-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6">
                    <div className="space-y-2">
                        <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">
                            {tran("security.access.current_password")}
                        </label>
                        <Input
                            {...register("currentPassword", { required: tran("security.access.required") })}
                            type="password"
                            className="h-14 rounded-2xl bg-muted/10 border-muted-foreground/10 focus:bg-background transition-all"
                        />
                        {errors.currentPassword && <p className="ml-1 text-xs font-bold text-rose-500 italic">
                            {tran("security.access.msg.enter_current_password")}
                        </p>}
                    </div>

                    <div className="space-y-2">
                        <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">
                            {tran("security.access.new_password")}
                        </label>
                        <Input
                            {...register("newPassword", { required: tran("security.access.required"), minLength: 8 })}
                            type="password"
                            className="h-14 rounded-2xl bg-muted/10 border-muted-foreground/10 focus:bg-background transition-all"
                        />
                        {errors.newPassword && <p className="ml-1 text-xs font-bold text-rose-500 italic">
                            {tran("security.access.min_length_8")}
                        </p>}
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-muted-foreground/5 cursor-pointer hover:bg-muted/30 transition-colors group">
                    <Checkbox
                        checked={watch("revokeOtherSessions")}
                        onCheckedChange={(checked) => setValue("revokeOtherSessions", Boolean(checked))}
                        id="revoke-sessions"
                        className="size-5 rounded-lg border-2"
                    />
                    <label htmlFor="revoke-sessions" className="text-sm font-bold text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors">
                        {tran("security.access.revoke_others_label")}
                    </label>
                </div>

                <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-2xl transition-all active:scale-[0.98]"
                    disabled={isSubmitting}
                >
                    <LoadingSwap isLoading={isSubmitting}>{tran("security.access.update_password")}</LoadingSwap>
                </Button>
            </form>

            <div className="pt-2 space-y-4">
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted-foreground/10" />
                    </div>
                    <span className="relative bg-card px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {tran("security.access.or_forgot_password")}
                    </span>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1 text-center sm:text-left">
                        <p className="font-bold text-sm text-foreground">
                            {tran("security.access.forgot_password_title")}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {tran("security.access.forgot_password_description")}
                        </p>
                    </div>

                    <BetterAuthActionButton
                        type="button"
                        variant="outline"
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5 transition-all text-primary"
                        successMessage={tran("security.access.msg.recovery_link_sent")}
                        action={() => authClient.requestPasswordReset({ email: userEmail, redirectTo: "/reset-password" })}
                    >
                        <Mail className="size-4 mr-2" />
                        {tran("security.access.send_reset_link")}
                    </BetterAuthActionButton>
                </div>
            </div>
        </div>
    )
}

function SetPasswordForm() {
    const { data: session } = authClient.useSession()
    const userEmail = session?.user?.email || ""

    return (
        <div className="space-y-6 relative z-10 text-center sm:text-left">
            <div className="space-y-2">
                <p className="font-bold text-lg text-foreground">{tran("security.access.password_not_set")}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {tran("security.access.password_not_set_description")}
                </p>
            </div>

            <BetterAuthActionButton
                type="button"
                variant="outline"
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5 transition-all text-primary"
                successMessage={tran("security.access.msg.recovery_link_sent")}
                action={() => authClient.requestPasswordReset({ email: userEmail, redirectTo: "/reset-password" })}
            >
                <Mail className="size-4 mr-2" />
                {tran("security.access.initialize_password_setup")}
            </BetterAuthActionButton>
        </div>
    )
}
