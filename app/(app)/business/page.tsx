"use client"

import { FooterButtons } from "@/components/footer-buttons"
import { useUserConfig } from "@/components/providers/user-config-provider"
import MobileNav from "@/components/tab/mobile-tab"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useBusinessManagement } from "@/hooks/use-business-management"
import { useSession } from "@/lib/auth/auth-client"
import { tran } from "@/lib/languages/i18n"
import { cn, formatAmount, getCurrencySymbol } from "@/lib/utils"
import type { PeriodFilter } from "@/types"
import { periodItems } from "@/types/common-enums"
import { AnimatePresence, motion } from "framer-motion"
import {
    Briefcase,
    Building2,
    Check,
    ChevronRight,
    Loader2,
    Pencil,
    Plus,
    Scale,
    TrendingDown,
    TrendingUp,
    X,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function BusinessPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const activeId = session?.user?.activeBusinessId || null
    const { currency } = useUserConfig()
    const symbol = getCurrencySymbol(currency)

    const {
        period,
        setPeriod,
        businesses,
        isLoading,
        editingId,
        setEditingId,
        editName,
        setEditName,
        isAddOpen,
        setIsAddOpen,
        newName,
        setNewName,
        handleAdd,
        handleUpdate,
        isSubmitting,
    } = useBusinessManagement("month")

    return (
        <div className="flex-1 w-full bg-background pb-34">
            <div className="mx-auto w-full max-w-4xl px-6 py-8">
                {/* Header with Title and Period Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex flex-col">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50 ml-1 mb-1">
                            {tran("business.label")}
                        </h2>
                        <div className="flex items-center gap-4">
                            <p className="text-3xl font-black tracking-tight">
                                {businesses.length} {tran("business.your_businesses")}
                            </p>
                        </div>
                    </div>

                    {/* Period Filter Segmented Tabs */}
                    <div className="flex items-center bg-muted/60 p-1 rounded-2xl border border-border/40 shadow-xs self-start sm:self-auto">
                        {periodItems.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setPeriod(item.value as PeriodFilter)}
                                className={cn(
                                    "px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 capitalize cursor-pointer",
                                    period === item.value
                                        ? "bg-background text-foreground shadow-xs font-black ring-1 ring-border/20"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tran(item.label)}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-64 w-full bg-muted/40 animate-pulse border-2 border-dashed border-muted rounded-[2rem] sm:rounded-[2.5rem]"
                            />
                        ))}
                    </div>
                ) : businesses.length === 0 ? (
                    <div className="py-32 text-center space-y-6">
                        <div className="mx-auto w-24 h-24 rounded-[2.5rem] bg-muted/10 flex items-center justify-center text-muted-foreground/40 border-2 border-dashed border-muted relative">
                            <Building2 size={48} className="stroke-[1.5]" />
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground border-4 border-background">
                                <Plus size={16} className="stroke-3" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-black">{tran("business.no_businesses")}</p>
                            <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                                {tran("business.manage_and_organize")}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="h-12 rounded-xl border-2 font-bold px-6"
                            onClick={() => setIsAddOpen(true)}
                        >
                            {tran("business.add_new")}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence mode="popLayout">
                            {businesses.map((business, index) => (
                                <motion.div
                                    key={business.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    onClick={() => router.push(`/business/${business.id}`)}
                                    className={cn(
                                        "group relative overflow-hidden p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border-2 shadow-sm transition-all duration-300 cursor-pointer bg-card text-foreground border-border/50",
                                        "hover:border-primary/50 hover:shadow-md",
                                        activeId === business.id && "border-primary/80 ring-1 ring-primary/20 bg-primary/5"
                                    )}
                                >
                                    <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                        {/* Card Header: Building Icon, Name, and Controls */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div
                                                    className={cn(
                                                        "h-11 w-11 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300",
                                                        activeId === business.id
                                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                                            : "bg-primary/10 text-primary group-hover:bg-primary/15"
                                                    )}
                                                >
                                                    <Building2 className="size-5 sm:size-6" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    {editingId === business.id ? (
                                                        <div
                                                            className="flex gap-1.5 items-center w-full"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Input
                                                                value={editName}
                                                                onChange={(e) => setEditName(e.target.value)}
                                                                onKeyDown={(e) =>
                                                                    e.key === "Enter" && handleUpdate(business.id)
                                                                }
                                                                autoFocus
                                                                className="h-8 font-bold text-sm rounded-lg py-1 px-2"
                                                            />
                                                            <Button
                                                                size="icon"
                                                                onClick={() => handleUpdate(business.id)}
                                                                className="h-8 w-8 shrink-0 rounded-lg"
                                                            >
                                                                <Check size={12} />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() => setEditingId(null)}
                                                                className="h-8 w-8 shrink-0 rounded-lg"
                                                            >
                                                                <X size={12} />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-0.5">
                                                            <h3 className="text-lg sm:text-xl font-black tracking-tight leading-snug group-hover:text-primary transition-colors truncate">
                                                                {business.name}
                                                            </h3>
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                                                {activeId === business.id
                                                                    ? tran("business.active")
                                                                    : tran("business.label")}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div
                                                className="flex items-center gap-1.5 shrink-0"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {activeId === business.id && (
                                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                        <Check size={10} strokeWidth={3} />
                                                        {tran("business.active")}
                                                    </div>
                                                )}
                                                {!editingId && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-xl bg-muted/60 hover:bg-primary hover:text-primary-foreground opacity-70 group-hover:opacity-100 transition-all"
                                                        onClick={() => {
                                                            setEditingId(business.id)
                                                            setEditName(business.name)
                                                        }}
                                                    >
                                                        <Pencil size={12} strokeWidth={2.5} />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Financial Category Stats (Income & Expense based on month/year/all filter) */}
                                        <div className="pt-3 border-t border-border/40 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Income Category Card */}
                                                <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 flex flex-col justify-between transition-all group-hover:border-emerald-500/30">
                                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                                                        <TrendingUp size={12} className="stroke-[2.5]" />
                                                        {tran("common.income")}
                                                    </span>
                                                    <div className="text-base sm:text-lg font-black tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums truncate">
                                                        +{symbol}
                                                        {formatAmount(business.categoryStats.income)}
                                                    </div>
                                                </div>

                                                {/* Expense Category Card */}
                                                <div className="p-3 sm:p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/15 flex flex-col justify-between transition-all group-hover:border-rose-500/30">
                                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 flex items-center gap-1 mb-1">
                                                        <TrendingDown size={12} className="stroke-[2.5]" />
                                                        {tran("common.expense")}
                                                    </span>
                                                    <div className="text-base sm:text-lg font-black tracking-tight text-rose-600 dark:text-rose-400 tabular-nums truncate">
                                                        -{symbol}
                                                        {formatAmount(business.categoryStats.expense)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Net Impact & Chevron */}
                                            <div className="flex items-center justify-between px-1 text-xs pt-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                        {tran("reports.net_impact")}:
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "text-xs font-black tabular-nums",
                                                            business.categoryStats.net >= 0
                                                                ? "text-emerald-600 dark:text-emerald-400"
                                                                : "text-rose-600 dark:text-rose-400"
                                                        )}
                                                    >
                                                        {business.categoryStats.net >= 0 ? "+" : "-"}
                                                        {symbol}
                                                        {formatAmount(Math.abs(business.categoryStats.net))}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
                                                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 group-hover:opacity-100">
                                                        {tran("business.manage")}
                                                    </span>
                                                    <ChevronRight
                                                        size={13}
                                                        className="stroke-3 group-hover:translate-x-0.5 transition-transform"
                                                    />
                                                </div>
                                            </div>

                                            {/* Secondary Category Badges (Asset, Equity) if non-zero */}
                                            {(business.categoryStats.asset > 0 ||
                                                business.categoryStats.equity > 0) && (
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {business.categoryStats.asset > 0 && (
                                                            <div className="px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[9px] font-bold flex items-center gap-1">
                                                                <Briefcase size={10} />
                                                                <span>
                                                                    {tran("common.asset")}: {symbol}
                                                                    {formatAmount(business.categoryStats.asset)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {business.categoryStats.equity > 0 && (
                                                            <div className="px-2 py-0.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 text-[9px] font-bold flex items-center gap-1">
                                                                <Scale size={10} />
                                                                <span>
                                                                    {tran("common.equity")}: {symbol}
                                                                    {formatAmount(business.categoryStats.equity)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <FooterButtons bottomSpace={true}>
                <Button
                    className="h-14 w-14 md:w-auto md:px-12 rounded-full md:gap-3 font-semibold uppercase bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 p-0 md:py-2"
                    onClick={() => setIsAddOpen(true)}
                >
                    <Plus className="size-6 sm:size-5" />
                    <span className="hidden md:block text-center font-black tracking-[0.2em] text-sm">
                        {tran("business.add_new")}
                    </span>
                </Button>
            </FooterButtons>

            <MobileNav />

            {/* Add Business Modal */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="rounded-[2.5rem] border-muted/20 shadow-2xl max-w-md p-8">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-2xl font-black tracking-tight">
                            {tran("business.new_business")}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium text-sm">
                            {tran("business.manage_and_organize")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <Input
                            placeholder={tran("business.enter_name")}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            autoFocus
                            className="h-12 text-lg font-medium rounded-2xl border-2 focus-visible:ring-primary/20"
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setIsAddOpen(false)}
                            className="h-12 rounded-2xl font-bold border-none bg-muted hover:bg-muted/80"
                        >
                            {tran("common.cancel")}
                        </Button>
                        <Button
                            onClick={handleAdd}
                            disabled={isSubmitting || !newName.trim()}
                            className="h-12 px-6 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                            {tran("business.create")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
