"use client"

import { BackHeader } from "@/components/header/back-header"
import { useConfirm } from "@/components/providers/confirm-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CountUp } from "@/components/ui/count-up"
import { Input } from "@/components/ui/input"
import { containerVariants, itemVariants } from "@/lib/animations"
import { useSession } from "@/lib/auth/auth-client"
import { tran } from "@/lib/languages/i18n"
import { cn } from "@/lib/utils"
import { useBusinessDetails, useDeleteBusiness, useSwitchBusiness, useUpdateBusiness } from "@/tanstacks/business"
import { motion } from "framer-motion"
import {
    Briefcase,
    Building2,
    Calendar,
    Check,
    ChevronRight,
    Hash,
    HelpCircle,
    Loader2,
    Pencil,
    ShieldAlert,
    Trash2,
    Truck,
    UserCheck,
    X
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function BusinessDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session, refetch: refetchSession } = useSession()

    const confirm = useConfirm()

    const businessId = params.businessId as string
    const activeId = session?.user?.activeBusinessId || null

    const { data, isLoading } = useBusinessDetails(businessId)

    const updateBusinessMutation = useUpdateBusiness()
    const deleteBusinessMutation = useDeleteBusiness()
    const switchBusinessMutation = useSwitchBusiness()

    const isSubmitting = updateBusinessMutation.isPending || deleteBusinessMutation.isPending || switchBusinessMutation.isPending

    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState("")

    if (isLoading) {
        return (
            <div className="w-full bg-background min-h-screen pb-34">
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-muted-foreground font-medium">{tran("common.loading")}</p>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="w-full bg-background min-h-screen pb-34">
                <div className="text-center py-20 space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center text-2xl">⚠️</div>
                    <p className="text-muted-foreground font-medium">Business not found</p>
                    <Button onClick={() => router.push("/business")}>Back to Businesses</Button>
                </div>
            </div>
        )
    }

    const { business, counts, accounts, stats } = data
    const isCurrentlyActive = activeId === business.id

    const handleSwitchActive = async () => {
        if (isCurrentlyActive || isSubmitting) return
        switchBusinessMutation.mutate({ businessId: business.id }, {
            onSuccess: async () => {
                await refetchSession()
                toast.success(tran("business.msg.switched"))
                router.push("/dashboard")
            },
            onError: () => {
                toast.error(tran("business.msg.switch_failed"))
            }
        })
    }

    const handleUpdateName = async () => {
        if (!editName.trim() || isSubmitting) return
        updateBusinessMutation.mutate({ id: business.id, name: editName }, {
            onSuccess: () => {
                setIsEditing(false)
                toast.success(tran("business.msg.updated"))
            },
            onError: (error: any) => {
                toast.error(error.message || tran("business.msg.update_failed"))
            }
        })
    }

    const handleDelete = async () => {
        if (isSubmitting) return

        const res = await confirm({
            title: tran("business.hold_on"),
            description: tran("business.delete_confirm", { name: business.name }),
            confirmText: tran("common.delete"),
            cancelText: tran("common.cancel"),
            destructive: true
        })
        if (!res) return

        deleteBusinessMutation.mutate(business.id, {
            onSuccess: () => {
                toast.success(tran("business.msg.deleted"))
                router.push("/business")
            },
            onError: (error: any) => {
                toast.error(error.message || tran("business.msg.delete_failed"))
            }
        })
    }

    return (
        <div className="w-full bg-background min-h-screen pb-34">
            <BackHeader
                title={business.name}
                menuItems={[{
                    icon: <Trash2 />,
                    onClick: handleDelete,
                    destructive: true,
                    label: tran("common.delete")
                }]}
            />

            <motion.div
                variants={containerVariants}
                animate="show"
                className="mx-auto max-w-4xl p-4 sm:p-6 space-y-8"
            >
                {/* Header Information Card */}
                <motion.div variants={itemVariants}>
                    <Card className="p-6 border-2 relative overflow-hidden bg-card shadow-sm hover:shadow-md transition-all duration-300 rounded-[2.5rem]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Building2 size={24} />
                                    </div>
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <div className="flex gap-2 max-w-md">
                                                <Input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                                                    autoFocus
                                                    className="h-10 font-bold text-lg rounded-xl"
                                                />
                                                <Button size="icon" onClick={handleUpdateName} className="h-10 w-10 shrink-0 rounded-xl"><Check size={18} /></Button>
                                                <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)} className="h-10 w-10 shrink-0 rounded-xl"><X size={18} /></Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-2xl font-black tracking-tight">{business.name}</h2>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg hover:bg-muted"
                                                    onClick={() => {
                                                        setEditName(business.name)
                                                        setIsEditing(true)
                                                    }}
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Hash size={14} />{business.id}</span>
                                    <span className="flex items-center gap-1"><Calendar size={14} /> Created: {new Date(business.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 flex-wrap">
                                {isCurrentlyActive ? (
                                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">
                                        <Check size={14} strokeWidth={3} /> {tran("business.active")}
                                    </span>
                                ) : (
                                    <Button
                                        onClick={handleSwitchActive}
                                        disabled={isSubmitting}
                                        className="rounded-2xl px-5 font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                                        Mark as Active
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Financial Summary Stats - Dashboard Style Cards */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Liquid Cash - Premium Card */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 dark:bg-indigo-500/90 group p-6 sm:p-8 text-white shadow-2xl shadow-indigo-500/20 transition-all hover:-translate-y-1 hover:scale-[1.01] hover:shadow-indigo-500/30 border border-white/10 backdrop-blur-md duration-300">
                        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/20 blur-3xl group-hover:bg-white/30 transition-all duration-700" />
                        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl transition-all duration-700" />
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Liquid Cash</span>
                                <p className="text-sm sm:text-3xl font-black tracking-tighter leading-none">
                                    <CountUp value={stats.liquidCash} />
                                </p>
                                <p className="text-[11px] font-bold text-white/50">Money accounts total</p>
                            </div>
                        </div>
                    </div>

                    {/* Receivable - Emerald Card */}
                    <div className="group relative overflow-hidden rounded-[2.5rem] border p-6 sm:p-8 shadow-xs transition-all hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] bg-emerald-50/30 border-emerald-100/50 dark:bg-emerald-500/5 dark:border-emerald-500/10 hover:border-emerald-500/30 hover:shadow-emerald-500/10 duration-300">
                        <div className="flex items-center justify-between relative z-10">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Receivable</p>
                                <div className="text-2xl sm:text-3xl font-black tracking-tighter tabular-nums leading-none text-emerald-600 dark:text-emerald-400">
                                    <CountUp value={stats.receivable} />
                                </div>
                                <p className="text-[11px] font-bold text-muted-foreground/40 italic">To collect from parties</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 bg-emerald-400" />
                    </div>

                    {/* Payable - Rose Card */}
                    <div className="group relative overflow-hidden rounded-[2.5rem] border p-6 sm:p-8 shadow-xs transition-all hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] bg-rose-50/30 border-rose-100/50 dark:bg-rose-500/5 dark:border-rose-500/10 hover:border-rose-500/30 hover:shadow-rose-500/10 duration-300">
                        <div className="flex items-center justify-between relative z-10">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Payable</p>
                                <div className="text-2xl sm:text-3xl font-black tracking-tighter tabular-nums leading-none text-rose-600 dark:text-rose-400">
                                    <CountUp value={stats.payable} />
                                </div>
                                <p className="text-[11px] font-bold text-muted-foreground/40 italic">To pay to parties</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 bg-rose-400" />
                    </div>

                    {/* Net Worth - Premium Slate Card */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 group dark:bg-slate-950 p-6 sm:p-8 text-white shadow-2xl shadow-indigo-500/10 transition-all hover:-translate-y-1 hover:scale-[1.01] border border-white/5 duration-300">
                        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Net Worth</span>
                                <p className="text-2xl sm:text-3xl font-black tracking-tighter leading-none text-white">
                                    <CountUp value={stats.netWorth} />
                                </p>
                                <p className="text-[11px] font-bold text-white/40">Total standing</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Directory & Entity Counts */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Directory & Contacts</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            {
                                label: "Customers",
                                count: counts.customer,
                                icon: <UserCheck size={18} />,
                                colorClass: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-100/50 dark:border-blue-500/20",
                                hoverBorder: "hover:border-blue-500/30 hover:shadow-blue-500/5",
                                glowBg: "bg-blue-400"
                            },
                            {
                                label: "Suppliers",
                                count: counts.supplier,
                                icon: <Truck size={18} />,
                                colorClass: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-100/50 dark:border-amber-500/20",
                                hoverBorder: "hover:border-amber-500/30 hover:shadow-amber-500/5",
                                glowBg: "bg-amber-400"
                            },
                            {
                                label: "Employees",
                                count: counts.employee,
                                icon: <Briefcase size={18} />,
                                colorClass: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-100/50 dark:border-violet-500/20",
                                hoverBorder: "hover:border-violet-500/30 hover:shadow-violet-500/5",
                                glowBg: "bg-violet-400"
                            },
                            {
                                label: "Other",
                                count: counts.other,
                                icon: <HelpCircle size={18} />,
                                colorClass: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-100/50 dark:border-rose-500/20",
                                hoverBorder: "hover:border-rose-500/30 hover:shadow-rose-500/5",
                                glowBg: "bg-rose-400"
                            }
                        ].map((item, i) => (
                            <Card key={i} className={cn("p-8 flex flex-row items-center justify-between border-2 bg-card group relative overflow-hidden transition-all duration-300 rounded-[2rem] shadow-xs hover:scale-[1.02]", item.hoverBorder)}>
                                <div className="space-y-1 relative z-10">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50">{item.label}</p>
                                    <h4 className="text-2xl font-black tracking-tight">{item.count}</h4>
                                </div>
                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 relative z-10", item.colorClass)}>
                                    {item.icon}
                                </div>
                                <div className={cn("absolute -bottom-10 -left-10 h-24 w-24 rounded-full blur-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-500", item.glowBg)} />
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* Additional Stats Section */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className={cn(
                        "p-10 flex flex-row items-center justify-between border-2 bg-card group relative overflow-hidden transition-all duration-300 rounded-[2rem] hover:scale-[1.01] hover:border-emerald-500/30 hover:shadow-emerald-500/5"
                    )}>
                        <div className="space-y-1 relative z-10">
                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50">Total Transactions</p>
                            <h4 className="text-2xl font-black tracking-tight">{counts.transaction}</h4>
                        </div>
                        <div className={cn(
                            "h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 relative z-10"
                        )}>
                            <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                        </div>
                        <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full blur-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-500 bg-emerald-400" />
                    </Card>

                    <Card className={cn(
                        "p-10 flex flex-row items-center justify-between border-2 bg-card group relative overflow-hidden transition-all duration-300 rounded-[2rem] hover:scale-[1.01] hover:border-blue-500/30 hover:shadow-blue-500/5"
                    )}>
                        <div className="space-y-1 relative z-10">
                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50">Total Accounts</p>
                            <h4 className="text-2xl font-black tracking-tight">{counts.accounts}</h4>
                        </div>
                        <div className={cn(
                            "h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 relative z-10"
                        )}>
                            <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                        </div>
                        <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full blur-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-500 bg-blue-400" />
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    )
}
