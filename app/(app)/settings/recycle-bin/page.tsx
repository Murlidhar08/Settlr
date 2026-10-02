"use client";

import { DeletedItem, emptyRecycleBin, getDeletedItems, permanentlyDeleteItem, restoreItem } from "@/actions/recycle-bin.actions";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
    Building2,
    Calendar,
    Filter,
    History,
    Receipt,
    RefreshCcw,
    Search,
    Trash2,
    Users,
    Wallet
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSetHeaderConfig } from "@/components/providers/header-provider";

export default function RecycleBinPage() {
    const router = useRouter();
    const confirm = useConfirm();
    const [items, setItems] = useState<DeletedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadItems();
    }, []);

    async function loadItems() {
        setLoading(true);
        try {
            const data = await getDeletedItems();
            setItems(data);
        } catch (error) {
            toast.error("Failed to load deleted items");
        } finally {
            setLoading(false);
        }
    }

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.details?.toLowerCase().includes(search.toLowerCase()) ?? false);
        const matchesType = filterType === "all" || item.type === filterType;
        return matchesSearch && matchesType;
    });

    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
    }, {} as Record<string, DeletedItem[]>);

    async function handleRestore(item: DeletedItem) {
        setActionLoading(item.id);
        const promise = restoreItem(item.id, item.type);
        toast.promise(promise, {
            loading: `Restoring ${item.type}...`,
            success: `${item.type} restored`,
            error: "Failed to restore"
        });
        try {
            await promise;
            await loadItems();
        } finally {
            setActionLoading(null);
        }
    }

    async function handlePermanentDelete(item: DeletedItem) {
        const isConfirmed = await confirm({
            title: "Permanently Delete",
            description: `Are you sure you want to permanently delete this ${item.type}? This action cannot be undone.`,
            confirmText: "Delete Permanently",
            destructive: true
        });

        if (!isConfirmed) return;

        setActionLoading(item.id);
        try {
            await permanentlyDeleteItem(item.id, item.type);
            toast.success("Item permanently deleted");
            await loadItems();
        } catch (error) {
            toast.error("Failed to delete item");
        } finally {
            setActionLoading(null);
        }
    }

    async function handleEmptyBin() {
        if (items.length === 0) return;

        const isConfirmed = await confirm({
            title: "Empty Recycle Bin",
            description: "Are you sure you want to permanently delete ALL items in the recycle bin? This action is IRREVERSIBLE.",
            confirmText: "Empty Bin",
            destructive: true
        });

        if (!isConfirmed) return;

        setLoading(true);
        try {
            await emptyRecycleBin();
            toast.success("Recycle bin emptied successfully");
            await loadItems();
        } catch (error) {
            toast.error("Failed to empty recycle bin");
            setLoading(false);
        }
    }

    const getTypeConfig = (type: string) => {
        switch (type) {
            case "Business":
                return { icon: Building2, color: "indigo", bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-indigo-500/20" };
            case "FinancialAccount":
                return { icon: Wallet, color: "emerald", bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20" };
            case "Party":
                return { icon: Users, color: "amber", bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20" };
            case "Transaction":
                return { icon: Receipt, color: "rose", bg: "bg-rose-500/10", text: "text-rose-600", border: "border-rose-500/20" };
            default:
                return { icon: History, color: "slate", bg: "bg-slate-500/10", text: "text-slate-600", border: "border-slate-500/20" };
        }
    };

    useSetHeaderConfig({
        rightAction: items.length > 0 ? (
            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-2xl gap-2 font-black text-[10px] uppercase tracking-widest text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={handleEmptyBin}
                            disabled={loading}
                        >
                            <Trash2 size={14} />
                            Empty Bin
                        </Button>
                    }
                />
                <TooltipContent className="rounded-xl font-bold text-[10px] uppercase tracking-widest border-none text-white">
                    Delete all items permanently
                </TooltipContent>
            </Tooltip>
        ) : undefined,
    });

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-background pb-32">
                <div className="mx-auto max-w-4xl px-6 pt-6 space-y-6">
                    {/* Search & Filter */}
                    <div className="p-4 sm:p-5 rounded-[2rem] bg-card border shadow-xl shadow-primary/5 flex flex-col sm:flex-row gap-4">
                        <div className="relative group flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-all" />
                            <Input
                                placeholder="Search deleted items..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-11 h-11 rounded-2xl border-none bg-muted/40 shadow-inner focus-visible:ring-primary/20 text-sm font-bold"
                            />
                        </div>

                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button variant="outline" className="h-11 rounded-2xl gap-2 px-6 border-2 border-primary/5 bg-background hover:bg-primary/5 text-[10px] font-black uppercase tracking-widest">
                                            <Filter className="h-3.5 w-3.5" />
                                            {filterType === "all" ? "ALL ITEMS" : filterType}
                                        </Button>
                                    }
                                />
                                <DropdownMenuContent className="rounded-2xl w-48 p-2 border-2 border-primary/5 shadow-2xl">
                                    <DropdownMenuItem onClick={() => setFilterType("all")} className="rounded-xl font-bold p-3">ALL ITEMS</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterType("Business")} className="rounded-xl font-bold p-3 text-indigo-600">BUSINESS</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterType("FinancialAccount")} className="rounded-xl font-bold p-3 text-emerald-600">ACCOUNTS</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterType("Party")} className="rounded-xl font-bold p-3 text-amber-600">PARTIES</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterType("Transaction")} className="rounded-xl font-bold p-3 text-rose-600">TRANSACTIONS</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger
                                    render={
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-11 w-11 rounded-2xl border-2 border-primary/5 shadow-sm active:scale-95 transition-all"
                                            onClick={loadItems}
                                            disabled={loading}
                                        >
                                            <RefreshCcw size={16} className={cn(loading && "animate-spin text-primary")} />
                                        </Button>
                                    }
                                />
                                <TooltipContent className="rounded-xl font-bold text-[10px] uppercase tracking-widest">
                                    Refresh List
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {loading && items.length === 0 ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-28 rounded-[2rem] bg-muted/20 animate-pulse" />
                            ))}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-24 bg-card/40 rounded-[3rem] border-2 border-dashed border-border/40">
                            <div className="mx-auto h-20 w-20 rounded-full bg-muted/10 flex items-center justify-center mb-6">
                                <History className="h-10 w-10 text-muted-foreground/20" />
                            </div>
                            <p className="text-muted-foreground/60 text-sm font-black uppercase tracking-[0.3em]">
                                {items.length === 0 ? "RECYCLE BIN IS EMPTY" : "NO MATCHES FOUND"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-10 pb-10">
                            {Object.entries(groupedItems).map(([type, typeItems]) => {
                                const config = getTypeConfig(type);
                                const Icon = config.icon;
                                return (
                                    <div key={type} className="space-y-4">
                                        <div className="flex items-center gap-4 px-2">
                                            <div className={cn("p-2 rounded-xl", config.bg, config.text)}>
                                                <Icon size={14} />
                                            </div>
                                            <h2 className={cn("text-[10px] font-black uppercase tracking-[0.3em]", config.text)}>
                                                {type === "FinancialAccount" ? "Accounts" : type} ({typeItems.length})
                                            </h2>
                                            <div className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
                                        </div>

                                        <div className="grid gap-3">
                                            <AnimatePresence mode="popLayout">
                                                {typeItems.map((item) => (
                                                    <motion.div
                                                        key={item.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="group relative flex items-center justify-between p-5 sm:p-6 rounded-[2.2rem] border-2 border-border/40 bg-card hover:bg-card hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
                                                    >
                                                        <div className="flex items-center gap-5 min-w-0">
                                                            <div className={cn("h-14 w-14 rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm border", config.bg, config.text, config.border)}>
                                                                <Icon size={24} strokeWidth={2.5} />
                                                            </div>
                                                            <div className="flex flex-col gap-1.5 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-black text-[17px] tracking-tight truncate">
                                                                        {item.name}
                                                                    </span>
                                                                    {item.category && (
                                                                        <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest border-2", config.bg, config.text, config.border)}>
                                                                            {item.category}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                                    <div className="flex items-center gap-1.5 text-muted-foreground/50">
                                                                        <Calendar size={12} />
                                                                        <span className="text-[11px] font-bold">Deleted {format(item.deletedAt, "dd MMM, h:mm a")}</span>
                                                                    </div>
                                                                    {item.details && (
                                                                        <div className="flex items-center gap-1.5 text-muted-foreground/40 italic">
                                                                            <div className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                                                                            <span className="text-[11px] font-medium truncate max-w-[200px]">{item.details}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    render={
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-10 w-10 rounded-full text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 transition-all"
                                                                            onClick={() => handleRestore(item)}
                                                                            disabled={actionLoading === item.id}
                                                                        >
                                                                            <RefreshCcw size={18} strokeWidth={2.5} />
                                                                        </Button>
                                                                    }
                                                                />
                                                                <TooltipContent className="rounded-xl font-bold text-[10px] uppercase tracking-widest bg-emerald-600 border-none text-white shadow-xl">
                                                                    Restore Item
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    render={
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-10 w-10 rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 active:scale-95 transition-all"
                                                                            onClick={() => handlePermanentDelete(item)}
                                                                            disabled={actionLoading === item.id}
                                                                        >
                                                                            <Trash2 size={18} strokeWidth={2.5} />
                                                                        </Button>
                                                                    }
                                                                />
                                                                <TooltipContent className="rounded-xl font-bold text-[10px] uppercase tracking-widest bg-rose-600 border-none text-white shadow-xl">
                                                                    Delete Forever
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}
