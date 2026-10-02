"use client"

import { BackHeader } from "@/components/header/back-header"
import { useConfirm } from "@/components/providers/confirm-provider"
import { useUserConfig } from "@/components/providers/user-config-provider"
import { AddTransactionModal } from "@/components/transaction/add-transaction-modal"
import { FormattedDate, FormattedTime } from "@/components/ui/date-time"
import { useDeleteTransaction } from "@/tanstacks/cashbook"
import { TransactionDirection } from "@/types/transaction/TransactionDirection"
import { formatAmount, formatDate, formatTime } from "@/utility/transaction"
import { motion } from "framer-motion"
import { ArrowDownLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, Clock, Hash, History, Pencil, PenSquareIcon, Phone, Trash2, User } from "lucide-react"
import { toast } from "sonner"

import { tran } from "@/lib/languages/i18n"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface TransactionDetailViewProps {
    transaction: any
    isIn: boolean
}

export function TransactionDetailView({ transaction, isIn }: TransactionDetailViewProps) {
    const { dateFormat, timeFormat } = useUserConfig()
    const confirm = useConfirm()
    const router = useRouter()
    const [isEditOpen, setIsEditOpen] = useState(false)

    const deleteTransactionMutation = useDeleteTransaction()

    const onDelete = async () => {
        const confirmed = await confirm({
            title: tran("transactions.delete_title"),
            description: tran("transactions.delete_desc"),
            confirmText: tran("transactions.yes_delete"),
            cancelText: tran("common.cancel"),
            destructive: true
        })

        if (confirmed) {
            deleteTransactionMutation.mutate(
                { id: transaction.id },
                {
                    onSuccess: () => {
                        toast.success(tran("transactions.msg.deleted"))
                        router.back()
                    },
                    onError: () => {
                        toast.error(tran("transactions.msg.delete_failed"))
                    }
                }
            )
        }
    }

    return (
        <div className="min-h-full bg-background relative selection:bg-primary/10">
            {/* Optimized Background Components (Reduced complexity) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden isolate">
                <div className={cn(
                    "absolute -top-1/4 -right-1/4 w-[80%] h-[80%] rounded-full opacity-10 blur-[100px] transition-colors duration-1000",
                    isIn ? "bg-emerald-500" : "bg-rose-500"
                )} />
                <div className="absolute -bottom-1/4 -left-1/4 w-[80%] h-[80%] rounded-full opacity-5 blur-[100px] bg-indigo-500" />
            </div>

            <BackHeader
                title={tran("transactions.details")}
                showProfile={false}
                menuItems={[
                    {
                        icon: <Pencil size={18} />,
                        label: tran("transactions.edit_entry"),
                        onClick: () => setIsEditOpen(true),
                        destructive: false
                    },
                    {
                        icon: <Trash2 size={18} />,
                        label: tran("transactions.delete_permanent"),
                        onClick: async () => await onDelete(),
                        destructive: true
                    }
                ]}
            />

            <main className="relative z-10 mx-auto max-w-6xl px-4 pb-32 pt-4 md:px-8">
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT COLUMN: BADGE & AMOUNT (Sticky) */}
                    <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28 h-fit">
                        {/* STATUS HERO */}
                        <motion.section
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4"
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className={cn(
                                    "flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl relative group",
                                    isIn ? "bg-emerald-500 text-white shadow-emerald-500/30" : "bg-rose-500 text-white shadow-rose-500/30"
                                )}
                            >
                                <Check className="h-8 w-8 relative z-10 stroke-3" />
                            </motion.div>

                            <div className="space-y-1">
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tighter leading-tight text-foreground">
                                    {tran("transactions.audit")}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border/10">
                                        <CalendarDays className="h-3 w-3 text-primary/60" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60" suppressHydrationWarning>
                                            <FormattedDate date={transaction.date} />
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border/10">
                                        <Clock className="h-3 w-3 text-primary/60" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60" suppressHydrationWarning>
                                            <FormattedTime date={transaction.date} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* AMOUNT CARD */}
                        <motion.section
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05, duration: 0.3 }}
                            className="relative group overflow-hidden rounded-[2.5rem] border border-border/40 bg-card p-6 lg:p-8 text-center lg:text-left shadow-lg transition-all active:scale-[0.99]"
                        >
                            <div className={cn("absolute top-0 left-0 w-1.5 h-full", isIn ? "bg-emerald-500" : "bg-rose-500")} />

                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] transition-transform duration-700">
                                {isIn ? <ArrowDownLeft size={120} /> : <ArrowUpRight size={120} />}
                            </div>

                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-4">
                                {tran("transactions.net_impact")}
                            </p>

                            <div className="space-y-4 relative z-10">
                                <p className={cn(
                                    "text-4xl sm:text-5xl font-black tracking-tighter tabular-nums",
                                    isIn ? "text-emerald-600" : "text-rose-600"
                                )}>
                                    {formatAmount(transaction.amount, true, isIn ? 'IN' : 'OUT')}
                                </p>

                                <div className="pt-2 flex justify-center lg:justify-start">
                                    <div className={cn(
                                        "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] shadow-md",
                                        isIn
                                            ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                            : "bg-rose-500 text-white shadow-rose-500/20"
                                    )}>
                                        {isIn ? <ArrowDownLeft className="h-4 w-4 stroke-3" /> : <ArrowUpRight className="h-4 w-4 stroke-3" />}
                                        {isIn ? tran("transactions.inward") : tran("transactions.outward")}
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    </div>

                    {/* RIGHT COLUMN: DATA GRID */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Transaction Flow */}
                        <motion.section
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="rounded-[2.5rem] border border-border/40 bg-card/40 backdrop-blur-md p-5 sm:p-6 shadow-md"
                        >
                            <div className="mb-4 flex items-center gap-2 px-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/70">{tran("transactions.flow_pathway")}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10 p-4 sm:p-5 rounded-3xl border border-border/10 relative">
                                {/* From Account*/}
                                <AccountNode
                                    account={transaction.fromAccount}
                                    label={tran("transactions.origin")}
                                    isSource={true}
                                    side={isIn ? "left" : "right"}
                                />

                                {/* Arrow */}
                                <div className="relative shrink-0">
                                    <div className="h-10 w-10 rounded-xl bg-background border-2 border-border/60 flex items-center justify-center shadow-lg relative z-10 rotate-45">
                                        <ArrowRight className="h-5 w-5 text-primary -rotate-45" />
                                    </div>
                                </div>

                                {/* To Account */}
                                <AccountNode
                                    account={transaction.toAccount}
                                    label={tran("transactions.destination")}
                                    isSource={false}
                                    side={isIn ? "right" : "left"}
                                />
                            </div>
                        </motion.section>

                        {/* Audit Details */}
                        <motion.section
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.3 }}
                            className="rounded-[2.5rem] border border-border/40 bg-card/40 backdrop-blur-md p-5 sm:p-6 shadow-md"
                        >
                            <div className="mb-6 flex items-center gap-2 px-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/70">{tran("transactions.audit_trail")}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-1">
                                <DetailRow icon={<Hash className="h-5 w-5 text-indigo-500" />} label={tran("transactions.ref_number")}>
                                    <span className="font-mono font-black text-foreground/80 text-[13px] break-all select-all">
                                        {transaction.id}
                                    </span>
                                </DetailRow>

                                <Divider />

                                {transaction.party && (
                                    <>
                                        <DetailRow icon={<User className="h-5 w-5 text-blue-500" />} label={tran("transactions.entity_relation")}>
                                            <div className="text-right">
                                                <p className="font-black text-xl tracking-tight text-primary">{transaction.party.name}</p>
                                                {transaction.party.contactNo && (
                                                    <div className="flex items-center justify-end gap-2 mt-1 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                                                        <Phone size={10} className="text-primary/60" />
                                                        <span className="text-[10px] font-black text-primary/80">{transaction.party.contactNo}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </DetailRow>
                                        <Divider />
                                    </>
                                )}

                                <DetailRow icon={<PenSquareIcon className="h-5 w-5 text-emerald-500" />} label={tran("transactions.log_originator")}>
                                    <div className="flex items-center justify-start md:justify-end gap-3 text-right">
                                        <span className="font-black text-lg text-foreground/80">{transaction.user.name}</span>
                                    </div>
                                </DetailRow>

                                <Divider />

                                <DetailRow icon={<CalendarDays className="h-5 w-5 text-amber-500" />} label={tran("transactions.recorded_at")}>
                                    <div className="text-start md:text-right flex flex-col items-start md:items-end">
                                        <span className="font-black text-[14px] text-foreground/80">
                                            {formatDate(transaction.createdAt, dateFormat)}
                                        </span>
                                        <span className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest">{formatTime(transaction.createdAt, timeFormat)}</span>
                                    </div>
                                </DetailRow>

                                {transaction.updatedAt > transaction.createdAt && (
                                    <>
                                        <Divider />
                                        <DetailRow icon={<History className="h-5 w-5 text-rose-500" />} label={tran("transactions.modified_history")}>
                                            <div className="text-start md:text-right flex flex-col items-start md:items-end opacity-60">
                                                <span className="font-black text-[14px]">
                                                    {formatDate(transaction.updatedAt, dateFormat)}
                                                </span>
                                                <span className="text-[11px] font-bold uppercase tracking-widest">
                                                    {formatTime(transaction.updatedAt, timeFormat)}
                                                </span>
                                            </div>
                                        </DetailRow>
                                    </>
                                )}
                            </div>
                        </motion.section>

                        {/* Description Box */}
                        {transaction.description && (
                            <motion.section
                                initial={{ opacity: 0, scale: 0.99 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                                className="group relative"
                            >
                                <div className="relative rounded-[2.5rem] border border-border/40 bg-card/60 backdrop-blur-md p-6 sm:p-8 shadow-md">
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/70">{tran("transactions.narrative")}</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -top-4 -left-2 text-[80px] font-black italic text-primary/5 pointer-events-none select-none leading-none">“</div>
                                        <p className="text-lg sm:text-xl font-semibold italic text-foreground/80 leading-relaxed relative z-10 pl-3 border-l-2 border-primary/20">
                                            {transaction.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.section>
                        )}
                    </div>
                </div>
            </main>

            <AddTransactionModal
                title={tran("transactions.edit_entry_audit")}
                transactionData={transaction}
                direction={isIn ? TransactionDirection.IN : TransactionDirection.OUT}
                partyId={transaction.partyId}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            >
                <></>
            </AddTransactionModal>
        </div>
    )
}

function Divider() {
    return <div className="h-px w-full bg-linear-to-r from-transparent via-border/40 to-transparent my-3" />
}

function AccountNode({ account, label, isSource, side }: { account: any, label: string, isSource: boolean, side: 'left' | 'right' }) {
    const targetHref = account?.party?.id
        ? `/parties/${account.party.id}`
        : account?.partyId
            ? `/parties/${account.partyId}`
            : account?.id
                ? `/accounts/${account.id}`
                : null

    const nodeContent = (
        <div className={cn(
            "relative p-3 rounded-2xl w-full flex items-center justify-center shadow-md border-2 transition-all group hover:scale-[1.02] hover:shadow-lg",
            isSource
                ? "bg-background border-border/60 hover:border-primary/40"
                : "bg-primary/5 border-primary/20 hover:border-primary/50"
        )}>
            <div className="flex flex-col items-center gap-1 overflow-hidden">
                <span className="font-black text-[13px] tracking-tighter text-foreground group-hover:text-primary transition-colors truncate w-full px-1">
                    {account?.party?.name || account?.name}
                </span>
                <div className="px-1.5 py-0.5 rounded-full bg-muted/40 border border-border/10">
                    <span className="text-[7.5px] font-black uppercase tracking-widest text-muted-foreground/60 block truncate max-w-20">
                        {account.categoryType || account.moneyType || account.type}
                    </span>
                </div>
            </div>

            <div className={cn(
                "absolute top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full",
                side === 'left' ? "-left-px bg-primary/20" : "-right-px bg-primary/20"
            )} />
        </div>
    )

    return (
        <div className="flex flex-col items-center text-center space-y-2 flex-1 px-2 max-w-45">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 leading-none">{label}</span>
            {targetHref ? (
                <Link href={targetHref as any} className="w-full">
                    {nodeContent}
                </Link>
            ) : (
                nodeContent
            )}
        </div>
    )
}

function DetailRow({
    label,
    icon,
    children,
}: {
    label: string
    icon: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col sm:flex-row items-start md:items-center justify-between gap-2 px-1 py-1 group/row hover:bg-muted/5 rounded-3xl transition-colors">
            <div className="flex items-start md:items-center gap-5">
                <div className="p-2 rounded-2xl bg-muted/50 border border-border/10 shadow-inner transition-transform duration-300">
                    {icon}
                </div>
                <span className="text-[12px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 transition-colors leading-none">{label}</span>
            </div>
            <div className="w-full sm:w-auto text-start md:text-center overflow-hidden">
                {children}
            </div>
        </div>
    )
}
