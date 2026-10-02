"use client"

import { FooterButtons } from "@/components/footer-buttons"
import MobileNav from "@/components/tab/mobile-tab"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useSession } from "@/lib/auth/auth-client"
import { Business } from "@/lib/generated/prisma/client"
import { tran } from "@/lib/languages/i18n"
import { cn } from "@/lib/utils"
import { useAddBusiness, useBusinessList, useUpdateBusiness } from "@/tanstacks/business"
import { AnimatePresence, motion } from "framer-motion"
import { Building2, Check, ChevronRight, Loader2, Pencil, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function BusinessPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const activeId = session?.user?.activeBusinessId || null

    const { data, isLoading } = useBusinessList()
    const businesses = data ?? [] as Business[]

    const addBusinessMutation = useAddBusiness()
    const updateBusinessMutation = useUpdateBusiness()
    const isSubmitting = addBusinessMutation.isPending || updateBusinessMutation.isPending

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newName, setNewName] = useState("")

    const handleAdd = async () => {
        if (!newName.trim() || isSubmitting) return
        addBusinessMutation.mutate(newName, {
            onSuccess: () => {
                setNewName("")
                setIsAddOpen(false)
                toast.success(tran("business.msg.created"))
            },
            onError: (error: any) => {
                toast.error(error.message || tran("business.msg.create_failed"))
            }
        })
    }

    const handleUpdate = async (id: string) => {
        if (!editName.trim() || isSubmitting) return
        updateBusinessMutation.mutate({ id, name: editName }, {
            onSuccess: () => {
                setEditingId(null)
                toast.success(tran("business.msg.updated"))
            },
            onError: (error: any) => {
                toast.error(error.message || tran("business.msg.update_failed"))
            }
        })
    }

    return (
        <div className="flex-1 w-full bg-background pb-34">
            <div className="mx-auto w-full max-w-4xl px-6 py-8">
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
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map(i => (
                            <div key={i} className="h-44 w-full bg-muted/40 border-2 border-dashed border-muted rounded-[2.5rem]" />
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
                            <p className="text-muted-foreground font-medium max-w-xs mx-auto">{tran("business.manage_and_organize")}</p>
                        </div>
                        <Button variant="outline" className="h-12 rounded-xl border-2 font-bold px-6" onClick={() => setIsAddOpen(true)}>
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
                                    <div className="relative z-10 flex flex-col h-full justify-between gap-8 sm:gap-12">
                                        <div className="flex items-start justify-between">
                                            <div className={cn(
                                                "h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500",
                                                activeId === business.id ? "bg-primary text-white" : "bg-primary/5 text-primary group-hover:bg-primary/10"
                                            )}>
                                                <Building2 className="size-5 sm:size-6" />
                                            </div>

                                            {activeId === business.id && (
                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                    <Check size={8} className="sm:size-2.5" strokeWidth={3} />
                                                    {tran("business.active")}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                            <div className="space-y-1 max-w-full sm:max-w-[70%]">
                                                {editingId === business.id ? (
                                                    <div className="flex gap-1.5 items-center w-full" onClick={(e) => e.stopPropagation()}>
                                                        <Input
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(business.id)}
                                                            autoFocus
                                                            className="h-8 font-bold text-sm rounded-lg py-1 px-2"
                                                        />
                                                        <Button size="icon" onClick={() => handleUpdate(business.id)} className="h-8 w-8 shrink-0 rounded-lg">
                                                            <Check size={12} />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8 shrink-0 rounded-lg">
                                                            <X size={12} />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h3 className="text-lg sm:text-xl font-black tracking-tight leading-none group-hover:translate-x-0.5 transition-transform truncate">
                                                            {business.name}
                                                        </h3>
                                                    </>
                                                )}
                                            </div>

                                            {!editingId && (
                                                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                                    <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-lg sm:rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
                                                            onClick={() => {
                                                                setEditingId(business.id)
                                                                setEditName(business.name)
                                                            }}
                                                        >
                                                            <Pencil size={12} className="sm:size-3.5 stroke-2" />
                                                        </Button>
                                                    </div>
                                                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-muted/50 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300 shrink-0">
                                                        <ChevronRight size={12} className="sm:size-3.5 stroke-3 group-hover:translate-x-0.5 transition-transform" />
                                                    </div>
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
                        <DialogTitle className="text-2xl font-black tracking-tight">{tran("business.new_business")}</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium text-sm">
                            {tran("business.manage_and_organize")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <Input
                            placeholder={tran("business.enter_name")}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            autoFocus
                            className="h-12 text-lg font-medium rounded-2xl border-2 focus-visible:ring-primary/20"
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="h-12 rounded-2xl font-bold border-none bg-muted hover:bg-muted/80">
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
