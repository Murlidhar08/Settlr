"use client";

import { useConfirm } from '@/components/providers/confirm-provider';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Skeleton } from "@/components/ui/skeleton";
import { containerVariants, itemVariants } from '@/lib/animations';
import { authClient, useSession } from "@/lib/auth/auth-client";
import { tran } from "@/lib/languages/i18n";
import { cn, getFileUrl } from "@/lib/utils";
import { getInitials } from "@/utility/common-function";
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertOctagon,
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    FileText,
    KeyRound,
    Laptop,
    Mail,
    MailCheck,
    RotateCcw,
    ShieldAlert,
    Trash2,
    User
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DangerPage() {
    const { data: session, isPending } = useSession();
    const confirm = useConfirm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    if (isPending) {
        return <DangerSkeleton />;
    }

    const deleteUserAccount = async () => {
        if (isSubmitting) return;

        const confirmed = await confirm({
            title: tran("danger.confirm_delete_title"),
            description: tran("danger.delete_account_description"),
            confirmText: tran("danger.confirm_delete_button"),
            cancelText: tran("common.cancel"),
            destructive: true,
        });

        if (!confirmed) return;

        setIsSubmitting(true);
        try {
            const data = await authClient.deleteUser({
                callbackURL: '/',
            });

            if (data.error) {
                toast.error(data?.error?.message || "Something went wrong");
            } else {
                setEmailSent(true);
                toast.success(tran("danger.msg.delete_confirmation_email_sent"));
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to initiate deletion");
        } finally {
            setIsSubmitting(false);
        }
    };

    const userEmail = session?.user?.email || "";
    const userName = session?.user?.name || "User";
    const userRole = (session?.user as any)?.role || "user";

    const deletionCategories = [
        {
            icon: <User className="size-5 text-rose-500" />,
            title: tran("danger.item_profile"),
            desc: tran("danger.item_profile_desc"),
        },
        {
            icon: <FileText className="size-5 text-rose-500" />,
            title: tran("danger.item_documents"),
            desc: tran("danger.item_documents_desc"),
        },
        {
            icon: <KeyRound className="size-5 text-rose-500" />,
            title: tran("danger.item_security"),
            desc: tran("danger.item_security_desc"),
        },
        {
            icon: <Laptop className="size-5 text-rose-500" />,
            title: tran("danger.item_sessions"),
            desc: tran("danger.item_sessions_desc"),
        },
    ];

    const workflowSteps = [
        {
            num: "1",
            title: tran("danger.step_1"),
            desc: tran("danger.step_1_desc"),
            icon: <AlertTriangle className="size-4 text-rose-500" />,
        },
        {
            num: "2",
            title: tran("danger.step_2"),
            desc: tran("danger.step_2_desc"),
            icon: <Mail className="size-4 text-rose-500" />,
        },
        {
            num: "3",
            title: tran("danger.step_3"),
            desc: tran("danger.step_3_desc"),
            icon: <Trash2 className="size-4 text-rose-500" />,
        },
    ];

    return (
        <div className="min-h-screen bg-background pb-24">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-4xl mt-6 space-y-8 px-4 sm:px-6"
            >
                {/* SECTION HEADER */}
                <motion.div variants={itemVariants} className="flex items-center gap-2 ml-2">
                    <span className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
                        <AlertOctagon size={16} />
                    </span>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-destructive">
                        {tran("danger.title")}
                    </h3>
                </motion.div>

                {/* CURRENT ACCOUNT CARD */}
                {session?.user && (
                    <motion.div
                        variants={itemVariants}
                        className="p-6 rounded-[2rem] bg-card/60 border border-border/60 shadow-xs relative overflow-hidden backdrop-blur-sm"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-14 border-2 border-background shadow-md ring-2 ring-destructive/20">
                                    <AvatarImage src={getFileUrl(session.user.image)} alt={userName} />
                                    <AvatarFallback className="bg-destructive/10 text-destructive font-black uppercase text-lg">
                                        {getInitials(userName)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-lg tracking-tight text-foreground">{userName}</span>
                                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                            {userRole}
                                        </Badge>
                                    </div>
                                    <p className="text-xs font-semibold text-muted-foreground">{userEmail}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold">
                                <ShieldAlert size={14} className="shrink-0" />
                                <span>{tran("danger.current_account")}</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* EMAIL SENT STATUS BANNER (ACTIVE IF DISPATCHED) */}
                <AnimatePresence>
                    {emailSent && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-6 rounded-[2rem] bg-emerald-500/10 border-2 border-emerald-500/20 text-foreground shadow-lg shadow-emerald-500/5 space-y-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <MailCheck size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-base text-emerald-700 dark:text-emerald-400">
                                        {tran("danger.email_sent_title")}
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {tran("danger.email_sent_desc", { email: userEmail })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={deleteUserAccount}
                                    disabled={isSubmitting}
                                    className="h-10 rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs gap-2"
                                >
                                    <RotateCcw size={14} />
                                    {tran("danger.resend_btn")}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* MAIN DESTRUCTION CARD */}
                <motion.div
                    variants={itemVariants}
                    className="p-8 rounded-[2.5rem] bg-card border border-destructive/20 shadow-xl shadow-destructive/5 relative overflow-hidden group space-y-8"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/5 dark:bg-destructive/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-destructive/10 transition-colors pointer-events-none" />

                    {/* TOP WARNING BANNER */}
                    <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 shadow-inner">
                            <ShieldAlert size={28} className="animate-pulse" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="font-black text-xl text-destructive tracking-tight">
                                {tran("danger.irreversible_actions")}
                            </h3>
                            <p className="text-[11px] font-black uppercase tracking-widest text-destructive/70 italic">
                                {tran("danger.permanent_deletion")}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                                {tran("danger.delete_account_description")}
                            </p>
                        </div>
                    </div>

                    {/* WHAT WILL BE DELETED BREAKDOWN GRID */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground ml-1">
                            {tran("danger.what_will_be_deleted")}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {deletionCategories.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 hover:border-destructive/20 transition-all flex items-start gap-3.5"
                                >
                                    <div className="p-2 rounded-xl bg-background border border-destructive/15 shrink-0 shadow-xs">
                                        {item.icon}
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="font-bold text-sm text-foreground">{item.title}</span>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3-STEP WORKFLOW INDICATOR */}
                    <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                            {tran("danger.how_it_works")}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {workflowSteps.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40">
                                    <div className="size-8 rounded-lg bg-destructive/10 text-destructive font-black text-xs flex items-center justify-center shrink-0">
                                        {step.num}
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                        <span className="font-bold text-xs text-foreground block truncate">{step.title}</span>
                                        <span className="text-[11px] text-muted-foreground block truncate">{step.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CONFIRMATION EMAIL NOTICE */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/5 border border-destructive/15">
                        <Mail size={18} className="text-destructive shrink-0" />
                        <p className="text-xs text-destructive font-bold leading-relaxed">
                            {tran("danger.msg.delete_confirmation_email")}
                        </p>
                    </div>

                    {/* ACTION TRIGGER BUTTON */}
                    <div className="pt-2">
                        <Button
                            onClick={deleteUserAccount}
                            disabled={isSubmitting}
                            variant="destructive"
                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-destructive/20 hover:shadow-2xl hover:shadow-destructive/30 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            <LoadingSwap isLoading={isSubmitting} className="flex items-center justify-center gap-2">
                                <Trash2 className="size-5 mr-1" />
                                {tran("danger.terminate_account")}
                            </LoadingSwap>
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

function DangerSkeleton() {
    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="mx-auto max-w-4xl p-6 mt-6 space-y-6">
                <Skeleton className="h-6 w-36 rounded-lg" />
                <Skeleton className="h-24 w-full rounded-[2rem]" />
                <Skeleton className="h-96 w-full rounded-[2.5rem]" />
            </div>
        </div>
    );
}
