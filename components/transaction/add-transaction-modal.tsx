"use client"

// Packages
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { ArrowDownLeft, ArrowUpRight, CalendarIcon, CheckCircle2, ChevronDownIcon, Clock, Eye, FileImage, FileText, Loader2, Paperclip, Receipt, Trash2, UploadCloud, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

// Components
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { DocumentPreview } from "@/components/document-preview"

// Actions
import { addTransaction, uploadTransactionFile, deleteTransactionFile } from "@/actions/transaction.actions"

// Library
import { CategoryType, FinancialAccountType } from "@/lib/generated/prisma/enums"
import { tran } from "@/lib/languages/i18n"
import { cn } from "@/lib/utils"
import { getFileUrl } from "@/lib/utils/file"

// Types
import { getFinancialAccounts } from "@/actions/financial-account.actions"
import { itemVariants } from "@/lib/animations"
import { ModalMode } from "@/types/transaction/ModalMode"
import { TransactionDirection } from "@/types/transaction/TransactionDirection"
import { getCurrencySymbol } from "@/utility/transaction"
import { useUserConfig } from "../providers/user-config-provider"

interface TransactionProps {
  title: string
  children: ReactNode
  partyId?: string | null
  accountId?: string | null
  transactionData?: any
  direction?: TransactionDirection
  path?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const EMPTY_ACCOUNTS: any[] = [];

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const AddTransactionModal = ({
  title,
  partyId,
  accountId,
  transactionData,
  direction,
  path,
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: TransactionProps) => {
  const router = useRouter()
  const { defAccId, defIncomeAccId, defExpenseAccId } = useUserConfig()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (val: boolean) => {
    if (setControlledOpen) {
      setControlledOpen(val)
    } else {
      setInternalOpen(val)
    }
  }

  const [dateOpen, setDateOpen] = useState(false)
  const [currentDirection, setCurrentDirection] = useState<TransactionDirection>(direction || TransactionDirection.OUT)
  const isOut = currentDirection === TransactionDirection.OUT;
  const userConfig = useUserConfig()

  // TanStack Query for accounts
  const { data: allAccounts = EMPTY_ACCOUNTS, isLoading: loadingAccounts } = useQuery({
    queryKey: ["financial-accounts"],
    queryFn: () => getFinancialAccounts(),
    enabled: !!open,
  });

  // Selected IDs
  const [moneyAccountId, setMoneyAccountId] = useState<string>("")
  const [partnerAccountId, setPartnerAccountId] = useState<string>("")

  const [data, setData] = useState<any>({
    id: undefined,
    businessId: "",
    amount: "",
    date: format(transactionData?.date ? new Date(transactionData.date) : new Date(), "yyyy-MM-dd"),
    time: format(transactionData?.date ? new Date(transactionData.date) : new Date(), "HH:mm"),
    description: "",
    partyId: partyId || null,
    fromAccountId: "",
    toAccountId: "",
    userId: "",
    documents: transactionData?.documents || [],
  })

  // Document Upload & Preview States
  const [uploadingCount, setUploadingCount] = useState(0)
  const isUploading = uploadingCount > 0
  const [isDragging, setIsDragging] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<{ url: string; fileName: string } | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mode Detection
  const [mode, setMode] = useState<ModalMode>(ModalMode.CASHBOOK)

  const lastInitializedRef = useRef<string>("")

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];
    const validFiles: File[] = [];

    for (const file of fileArray) {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        toast.error(`Invalid format for ${file.name}. Only JPG, PNG, and PDF files are allowed.`);
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 15MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploadingCount(prev => prev + validFiles.length);

    for (const file of validFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const uploaded = await uploadTransactionFile(formData);

        setData((prev: any) => ({
          ...prev,
          documents: [
            ...(prev.documents || []),
            uploaded
          ]
        }));
        toast.success(`Attached ${file.name}`);
      } catch (err: any) {
        toast.error(err?.message || `Failed to upload ${file.name}`);
      } finally {
        setUploadingCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleRemoveDocument = async (indexToRemove: number) => {
    const docToRemove = data.documents?.[indexToRemove];
    setData((prev: any) => ({
      ...prev,
      documents: (prev.documents || []).filter((_: any, idx: number) => idx !== indexToRemove)
    }));

    // If doc was freshly uploaded and not yet saved in DB, clean up file on server
    if (docToRemove?.documentRelativePath && !docToRemove?.id) {
      try {
        await deleteTransactionFile(docToRemove.documentRelativePath);
      } catch {
        // Silently ignore cleanup error
      }
    }
  };

  const handlePreviewDocument = (doc: any) => {
    if (!doc?.documentRelativePath) return;
    setPreviewDoc({
      url: getFileUrl(doc.documentRelativePath),
      fileName: doc.fileName || "Document",
    });
    setPreviewOpen(true);
  };

  useEffect(() => {
    if (open && !loadingAccounts && allAccounts.length > 0) {
      const initializationKey = `${currentDirection}-${transactionData?.id}-${accountId}-${partyId}`

      if (lastInitializedRef.current !== initializationKey) {
        if (transactionData) {
          setData((pre: any) => ({
            ...pre,
            ...transactionData,
            amount: Number(transactionData.amount).toFixed(2),
            date: format(transactionData?.date ? new Date(transactionData.date) : new Date(), "yyyy-MM-dd"),
            time: format(transactionData?.date ? new Date(transactionData.date) : new Date(), "HH:mm"),
            documents: transactionData?.documents || [],
          }))

          const from = allAccounts.find(a => a.id === transactionData.fromAccountId)
          if (from?.type === FinancialAccountType.MONEY) {
            setMoneyAccountId(from.id)
            setPartnerAccountId(transactionData.toAccountId)
          } else {
            setMoneyAccountId(transactionData.toAccountId)
            setPartnerAccountId(transactionData.fromAccountId)
          }
        } else {
          let inferredMode: ModalMode = ModalMode.CASHBOOK
          let initialMoneyAcc = ""
          let initialPartnerAcc = ""

          const currentAcc = allAccounts.find(a => a.id === accountId)
          const partyAcc = partyId ? allAccounts.find(a => a.partyId === partyId) : null

          if (partyId || (currentAcc && currentAcc.type === FinancialAccountType.PARTY)) {
            inferredMode = ModalMode.PARTY
            const partyAccount = partyAcc || currentAcc
            initialPartnerAcc = partyAccount?.id || ""

            // USE DEFAULT MONEY ACCOUNT FOR PARTIES TOO
            initialMoneyAcc = defAccId || allAccounts.find(a => a.type === FinancialAccountType.MONEY)?.id || ""
          } else if (currentAcc && currentAcc.type === FinancialAccountType.MONEY) {
            inferredMode = ModalMode.ACCOUNT
            initialMoneyAcc = currentAcc.id
            initialPartnerAcc = allAccounts.find(a => a.id !== currentAcc.id && a.partyId === null)?.id || ""
          } else if (currentAcc && currentAcc.type === FinancialAccountType.CATEGORY && currentAcc.categoryType === CategoryType.ADJUSTMENT) {
            inferredMode = ModalMode.ACCOUNT
            initialMoneyAcc = currentAcc.id
            initialPartnerAcc = allAccounts.find(a => a.id !== currentAcc.id && a.partyId === null && !(a.type === FinancialAccountType.CATEGORY && a.categoryType === CategoryType.ADJUSTMENT))?.id || ""
          } else if (currentAcc && currentAcc.type === FinancialAccountType.CATEGORY) {
            inferredMode = ModalMode.ACCOUNT
            initialMoneyAcc = defAccId || allAccounts.find(a => a.type === FinancialAccountType.MONEY)?.id || ""
            initialPartnerAcc = currentAcc.id
          } else {
            inferredMode = ModalMode.CASHBOOK
            const moneyAccs = allAccounts.filter(a => a.type === FinancialAccountType.MONEY || (a.type === FinancialAccountType.CATEGORY && a.categoryType === CategoryType.ADJUSTMENT))

            // USE DEFAULT MONEY ACCOUNT
            initialMoneyAcc = defAccId || moneyAccs[0]?.id || ""

            // USE DEFAULT CATEGORY ACCOUNTS
            const isInitMoneyAdj = allAccounts.find(a => a.id === initialMoneyAcc)?.categoryType === CategoryType.ADJUSTMENT
            const defaultCatAccId = isOut ? defExpenseAccId : defIncomeAccId;
            const targetCat = isOut ? CategoryType.EXPENSE : CategoryType.INCOME
            initialPartnerAcc = (!isInitMoneyAdj && defaultCatAccId) || allAccounts.find(a => a.type === FinancialAccountType.CATEGORY && a.categoryType === targetCat)?.id || ""
          }

          setMode(inferredMode)
          setMoneyAccountId(initialMoneyAcc)
          setPartnerAccountId(initialPartnerAcc)
          setData((pre: any) => ({
            ...pre,
            partyId: allAccounts.find(a => a.id === initialPartnerAcc)?.partyId || null,
            documents: [],
          }))
        }
        lastInitializedRef.current = initializationKey
      }
    } else if (!open && lastInitializedRef.current !== "") {
      lastInitializedRef.current = ""
      // Cleanup for next open
      if (!transactionData) {
        setData({
          id: undefined,
          businessId: "",
          amount: "",
          description: "",
          date: format(new Date(), "yyyy-MM-dd"),
          time: format(new Date(), "HH:mm"),
          partyId: partyId || null,
          fromAccountId: "",
          toAccountId: "",
          userId: "",
          documents: [],
        })
        setMoneyAccountId("")
        setPartnerAccountId("")
        setPreviewDoc(null)
        setPreviewOpen(false)
      }
    }
  }, [open, loadingAccounts, allAccounts, partyId, accountId, transactionData?.id, currentDirection, isOut, defAccId, defIncomeAccId, defExpenseAccId])

  // Update data state whenever selections change
  useEffect(() => {
    const partnerAcc = allAccounts.find(a => a.id === partnerAccountId)

    // Direction logic
    // PARTY: OUT -> Money to Party, IN -> Party to Money
    // ACCOUNT: OUT -> Current to Other, IN -> Other to Current
    // CASHBOOK: OUT -> Money to Expense, IN -> Income to Money

    let from = ""
    let to = ""

    if (mode === ModalMode.PARTY) {
      from = isOut ? moneyAccountId : partnerAccountId
      to = isOut ? partnerAccountId : moneyAccountId
    } else if (mode === ModalMode.ACCOUNT) {
      from = isOut ? moneyAccountId : partnerAccountId
      to = isOut ? partnerAccountId : moneyAccountId
    } else {
      // CASHBOOK
      from = isOut ? moneyAccountId : partnerAccountId
      to = isOut ? partnerAccountId : moneyAccountId
    }

    setData((pre: any) => ({
      ...pre,
      fromAccountId: from,
      toAccountId: to,
      partyId: partnerAcc?.partyId || null
    }))
  }, [moneyAccountId, partnerAccountId, currentDirection, mode, allAccounts])

  const queryClient = useQueryClient()

  const transactionMutation = useMutation({
    mutationFn: async (vars: { data: any, path?: string }) => {
      return await addTransaction({
        ...vars.data,
        amount: Number(vars.data.amount),
        date: new Date(`${vars.data.date}T${vars.data.time}:00`),
        description: vars.data.description || null
      }, vars.path)
    },
    onMutate: async (vars) => {
      const { data: txData } = vars;
      // 1. Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["financial-accounts"] })
      await queryClient.cancelQueries({ queryKey: ["cashbook-transactions"] })
      if (txData.partyId) {
        await queryClient.cancelQueries({ queryKey: ["party-detail", txData.partyId] })
        await queryClient.cancelQueries({ queryKey: ["party-transactions", txData.partyId] })
      }
      if (txData.fromAccountId) await queryClient.cancelQueries({ queryKey: ["financial-account", txData.fromAccountId] })
      if (txData.toAccountId) await queryClient.cancelQueries({ queryKey: ["financial-account", txData.toAccountId] })
      if (txData.id) await queryClient.cancelQueries({ queryKey: ["transaction-detail", txData.id] })

      // 2. Snapshot the previous values
      const previousParties = queryClient.getQueriesData({ queryKey: ["party-transactions"] })
      const previousCashbook = queryClient.getQueriesData({ queryKey: ["cashbook-transactions"] })
      const previousFromBalance = txData.fromAccountId ? queryClient.getQueryData(["financial-account", txData.fromAccountId]) : null
      const previousToBalance = txData.toAccountId ? queryClient.getQueryData(["financial-account", txData.toAccountId]) : null

      const newTx = {
        ...txData,
        id: "temp-id-" + Date.now(),
        amount: Number(txData.amount),
        date: new Date(`${txData.date}T${txData.time}:00`),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // 3. Optimistically update
      // Update lists
      if (txData.partyId) {
        queryClient.setQueriesData(
          { queryKey: ["party-transactions", txData.partyId] },
          (old: any) => [newTx, ...(old || [])]
        )
      }
      queryClient.setQueriesData(
        { queryKey: ["cashbook-transactions"] },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            transactions: [newTx, ...(old.transactions || [])],
            totalIn: old.totalIn + (txData.toAccountId && txData.fromAccountId ? 0 : (!isOut ? Number(txData.amount) : 0)), // Simplified logic
            totalOut: old.totalOut + (txData.toAccountId && txData.fromAccountId ? 0 : (isOut ? Number(txData.amount) : 0))
          }
        }
      )

      // Update balances
      if (txData.fromAccountId) {
        queryClient.setQueryData(["financial-account", txData.fromAccountId], (old: number) => (old || 0) - Number(txData.amount))
      }
      if (txData.toAccountId) {
        queryClient.setQueryData(["financial-account", txData.toAccountId], (old: number) => (old || 0) + Number(txData.amount))
      }

      return { previousParties, previousCashbook, previousFromBalance, previousToBalance }
    },
    onError: (err, vars, context: any) => {
      // Rollback
      if (context?.previousParties) {
        context.previousParties.forEach(([key, value]: any) => queryClient.setQueryData(key, value))
      }
      if (context?.previousCashbook) {
        context.previousCashbook.forEach(([key, value]: any) => queryClient.setQueryData(key, value))
      }
      if (vars.data.fromAccountId && context?.previousFromBalance !== undefined) {
        queryClient.setQueryData(["financial-account", vars.data.fromAccountId], context.previousFromBalance)
      }
      if (vars.data.toAccountId && context?.previousToBalance !== undefined) {
        queryClient.setQueryData(["financial-account", vars.data.toAccountId], context.previousToBalance)
      }
      toast.error("Failed to save transaction")
    },
    onSettled: (data, err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["financial-accounts"] })
      queryClient.invalidateQueries({ queryKey: ["cashbook-transactions"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
      queryClient.invalidateQueries({ queryKey: ["budget-insights"] })
      queryClient.invalidateQueries({ queryKey: ["accounts-distribution"] })
      if (vars.data.fromAccountId) queryClient.invalidateQueries({ queryKey: ["financial-account", vars.data.fromAccountId] })
      if (vars.data.toAccountId) queryClient.invalidateQueries({ queryKey: ["financial-account", vars.data.toAccountId] })
      if (vars.data.partyId) {
        queryClient.invalidateQueries({ queryKey: ["party-detail", vars.data.partyId] })
        queryClient.invalidateQueries({ queryKey: ["party-transactions", vars.data.partyId] })
        queryClient.invalidateQueries({ queryKey: ["party-list"] })
      }
      const txId = vars.data.id || data?.id
      if (txId) {
        queryClient.invalidateQueries({ queryKey: ["transaction-detail", txId] })
      }
    }
  })

  const handleAddTransaction = async () => {
    if (!data.amount || isNaN(Number(data.amount))) {
      return toast.error("Please enter a valid amount")
    }

    if (!data.fromAccountId || !data.toAccountId) {
      return toast.error("Please select both accounts")
    }

    if (data.fromAccountId === data.toAccountId) {
      return toast.error("Source and destination accounts cannot be the same")
    }

    const fromAcc = allAccounts.find(a => a.id === data.fromAccountId)
    const toAcc = allAccounts.find(a => a.id === data.toAccountId)
    if (
      fromAcc?.type === FinancialAccountType.CATEGORY &&
      fromAcc?.categoryType === CategoryType.ADJUSTMENT &&
      toAcc?.type === FinancialAccountType.CATEGORY &&
      toAcc?.categoryType === CategoryType.ADJUSTMENT
    ) {
      return toast.error("Cannot transfer between two adjustment accounts")
    }

    const combinedDateTime = new Date(`${data.date}T${data.time}:00`)
    if (isNaN(combinedDateTime.getTime())) {
      return toast.error("Please enter a valid date and time")
    }

    transactionMutation.mutate({ data, path })

    toast.success("Transaction recorded successfully", {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    })
    setOpen(false)

    // Reset
    setData({
      id: undefined,
      businessId: "",
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      description: "",
      partyId: partyId || null,
      fromAccountId: "",
      toAccountId: "",
      userId: "",
      documents: [],
    })
    setMoneyAccountId("")
    setPartnerAccountId("")
    setPreviewDoc(null)
    setPreviewOpen(false)
    router.refresh()
  }

  const isAdjustmentAccount = (acc?: any) => {
    return acc?.type === FinancialAccountType.CATEGORY && acc?.categoryType === CategoryType.ADJUSTMENT
  }

  const selectedPartnerAcc = allAccounts.find(a => a.id === partnerAccountId)
  const isPartnerAdjustment = isAdjustmentAccount(selectedPartnerAcc)

  const selectedMoneyAcc = allAccounts.find(a => a.id === moneyAccountId)
  const isMoneyAdjustment = isAdjustmentAccount(selectedMoneyAcc)

  // Filtering Logic
  const moneyAccounts = allAccounts.filter(a => {
    if (a.id === partnerAccountId) return false

    if (a.type === FinancialAccountType.MONEY) return true

    if (isAdjustmentAccount(a)) {
      return !isPartnerAdjustment
    }

    return false
  })

  const partnerOptions = allAccounts.filter(acc => {
    if (mode === ModalMode.PARTY)
      return false // Partner is fixed

    if (acc.id === moneyAccountId) return false

    if (mode === ModalMode.ACCOUNT) {
      // Show list of accounts where partyId is null, except current
      if (acc.partyId !== null) return false
      if (isMoneyAdjustment && isAdjustmentAccount(acc)) return false
      return true
    }

    if (mode === ModalMode.CASHBOOK) {
      const targetCat = isOut ? CategoryType.EXPENSE : CategoryType.INCOME
      if (acc.type !== FinancialAccountType.CATEGORY) return false

      if (acc.categoryType === targetCat) return true

      if (isAdjustmentAccount(acc)) {
        return !isMoneyAdjustment
      }

      return false
    }

    return true
  })

  const handleMoneyAccountChange = (val: string) => {
    setMoneyAccountId(val)
    const newMoneyAcc = allAccounts.find(a => a.id === val)
    if (isAdjustmentAccount(newMoneyAcc) && isPartnerAdjustment) {
      const targetCat = isOut ? CategoryType.EXPENSE : CategoryType.INCOME
      const fallbackPartner = allAccounts.find(a => a.type === FinancialAccountType.CATEGORY && a.categoryType === targetCat && a.id !== val)
      setPartnerAccountId(fallbackPartner?.id || "")
    }
  }

  const handlePartnerAccountChange = (val: string) => {
    setPartnerAccountId(val)
    const newPartnerAcc = allAccounts.find(a => a.id === val)
    if (isAdjustmentAccount(newPartnerAcc) && isMoneyAdjustment) {
      const fallbackMoney = defAccId || allAccounts.find(a => a.type === FinancialAccountType.MONEY && a.id !== val)?.id || ""
      setMoneyAccountId(fallbackMoney)
    }
  }

  // Labels
  const moneyLabel = isOut ? tran("cashbook.pay_from_account") : tran("cashbook.receive_in_account")
  const partnerLabel = mode === ModalMode.ACCOUNT
    ? (isOut ? tran("cashbook.transfer_to") : tran("cashbook.transfer_from"))
    : (isOut ? tran("cashbook.payment_for_category") : tran("cashbook.source_category"))

  return (
    <>
      <div onClick={() => setOpen(true)} className="inline-block cursor-pointer active:scale-95 transition-transform">
        {children}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full! h-full! sm:max-w-[70vw]! lg:max-w-[35vw]! border-l-0 sm:border-l p-0 flex flex-col overflow-hidden bg-background"
        >
          <SheetHeader className="px-4 py-4 border-b bg-muted/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-400",
                  isOut ? "bg-rose-500 text-white shadow-rose-200" : "bg-emerald-500 text-white shadow-emerald-200"
                )}>
                  {isOut ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                  <SheetTitle className="text-xl font-black tracking-tight">{title || tran("cashbook.new_entry")}</SheetTitle>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {tran(`common.${ModalMode[mode].toLowerCase()}`)} {tran("common.entry")}
                  </p>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Money In/Out Toggle */}
            <div className="bg-muted/50 p-1 mx-6 rounded-4xl flex items-center shadow-inner border border-muted-foreground/5">
              <button
                onClick={() => setCurrentDirection(TransactionDirection.IN)}
                className={cn(
                  "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-400 ease-out",
                  !isOut
                    ? "bg-background text-emerald-600 shadow-xl scale-[1.02] border border-emerald-100/50"
                    : "text-muted-foreground/40 hover:text-muted-foreground/60"
                )}
              >
                {tran("cashbook.money_in")}
              </button>
              <button
                onClick={() => setCurrentDirection(TransactionDirection.OUT)}
                className={cn(
                  "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-400 ease-out",
                  isOut
                    ? "bg-background text-rose-600 shadow-xl scale-[1.02] border border-rose-100/50"
                    : "text-muted-foreground/40 hover:text-muted-foreground/60"
                )}
              >
                {tran("cashbook.money_out")}
              </button>
            </div>

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.04
                  }
                }
              }}
              initial="hidden"
              animate="visible"
              className="px-6 py-8 space-y-8"
            >
              {/* Amount Input */}
              <motion.div variants={itemVariants} className="text-center space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{tran("common.amount")}</Label>
                <div className={cn(
                  "relative flex items-center justify-center transition-all duration-300",
                  isOut ? "text-rose-600" : "text-emerald-600"
                )}>
                  <span className="text-4xl font-black mr-2 opacity-50">{getCurrencySymbol(userConfig.currency)}</span>
                  <input
                    value={(() => {
                      if (!data.amount) return "";
                      const parts = data.amount.toString().split('.');
                      const integerPart = parts[0];
                      const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
                      const formattedInteger = integerPart ? parseInt(integerPart, 10).toLocaleString('en-IN') : integerPart === '0' ? '0' : '';
                      return (integerPart === "" && data.amount.startsWith('.') ? "" : formattedInteger) + decimalPart;
                    })()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/,/g, '');
                      // Allow only numbers and up to two decimal points
                      if (/^\d*\.?\d{0,2}$/.test(val)) {
                        setData({ ...data, amount: val });
                      }
                    }}
                    inputMode="decimal"
                    placeholder="0.00"
                    autoFocus
                    className={cn(
                      "w-full bg-transparent text-6xl font-black text-center outline-none selection:bg-primary/10 transition-all",
                      isOut ? "placeholder:text-rose-100" : "placeholder:text-emerald-100"
                    )}
                  />
                </div>
                <div className="h-1 w-24 mx-auto bg-linear-to-r from-transparent via-muted to-transparent rounded-full" />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                    <CalendarIcon size={12} /> {tran("common.date")}
                  </Label>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className="h-14 w-full justify-between rounded-2xl border-2 px-4 text-base font-bold shadow-sm hover:border-primary/50 transition-all"
                        >
                          {format(new Date(data.date), "dd MMM yyyy")}
                          <ChevronDownIcon size={16} className="text-muted-foreground" />
                        </Button>
                      }
                    />
                    <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(data.date)}
                        onSelect={(d) => {
                          if (d) {
                            setData({ ...data, date: format(d, "yyyy-MM-dd") })
                            setDateOpen(false)
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </motion.div>

                {/* Time Selection */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                    <Clock size={12} /> {tran("common.time")}
                  </Label>
                  <input
                    type="time"
                    value={data.time}
                    onChange={(e) => setData({ ...data, time: e.target.value })}
                    className="h-14 w-full rounded-2xl border-2 bg-transparent px-4 text-base font-bold shadow-sm outline-none focus:border-primary transition-all"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="col-span-full space-y-6 overflow-hidden"
                >
                  {/* Money Account Selection */}
                  {mode !== ModalMode.ACCOUNT && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                        <Wallet size={12} /> {moneyLabel}
                      </Label>
                      <Select
                        value={moneyAccountId}
                        onValueChange={(val) => val && handleMoneyAccountChange(val)}
                      >
                        <SelectTrigger className="h-14 w-full rounded-2xl border-2 px-4 text-base font-bold shadow-sm hover:border-primary transition-all text-foreground bg-background">
                          <SelectValue placeholder={tran("common.choose_account")}>
                            {allAccounts.find(a => a.id === moneyAccountId)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-xl max-h-75">
                          {moneyAccounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id} className="py-2 px-4 focus:bg-primary/90 rounded-xl cursor-pointer">
                              <div className="flex flex-col">
                                <span className="font-bold text-sm">{acc.name}</span>
                                <span className="text-[10px] text-muted-foreground/90 italic">
                                  {acc.moneyType || acc.categoryType || acc.type}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Partner Account Selection (Category/Transfer) */}
                  {mode !== ModalMode.PARTY && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                        <Wallet size={12} /> {partnerLabel}
                      </Label>
                      <Select
                        value={partnerAccountId}
                        onValueChange={(val) => val && handlePartnerAccountChange(val)}
                      >
                        <SelectTrigger className="h-14 w-full rounded-2xl border-2 px-4 text-base font-bold shadow-sm hover:border-primary/50 transition-all text-foreground bg-background">
                          <SelectValue placeholder={tran("common.select_category_or_account")}>
                            {allAccounts.find(a => a.id === partnerAccountId)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-xl max-h-75">
                          {partnerOptions.map(acc => (
                            <SelectItem key={acc.id} value={acc.id} className="py-2 px-4 focus:bg-primary/90 rounded-xl cursor-pointer">
                              <div className="flex flex-col">
                                <span className="font-bold text-sm">{acc.name}</span>
                                <span className="text-[10px] text-muted-foreground/90 italic">
                                  {acc.partyType || acc.categoryType || acc.type}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Note */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                  <Paperclip size={12} /> {tran("common.description")}
                </Label>
                <Textarea
                  placeholder={tran("common.what_is_this_for")}
                  value={data.description}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                  className="min-h-25 rounded-2xl border-2 p-4 text-base font-medium transition-all focus:border-primary focus:ring-0"
                />
              </motion.div>

              {/* Invoice & Documents Upload */}
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                    <Receipt size={12} /> Invoice & Documents
                  </Label>
                  {data.documents?.length > 0 && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/50 bg-muted px-2 py-0.5 rounded-full">
                      {data.documents.length} {data.documents.length === 1 ? "File" : "Files"}
                    </span>
                  )}
                </div>

                {/* Upload Control */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.length) {
                      uploadFiles(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative group flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200",
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-muted-foreground/20 hover:border-primary/50 bg-muted/20 hover:bg-muted/40"
                  )}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {isUploading ? (
                    <div className="flex items-center gap-3 py-2 text-primary">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="text-xs font-bold uppercase tracking-wider">Uploading invoice documents...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-1 text-center sm:text-left">
                      <div className="h-9 w-9 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UploadCloud size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Click or drag & drop to upload invoices & receipts
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 font-medium">
                          Supports JPG, PNG, JPEG, PDF (up to 15MB each)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Document List */}
                {data.documents?.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {data.documents.map((doc: any, idx: number) => {
                      const isPdf = doc.fileName?.toLowerCase().endsWith(".pdf") || doc.fileType === "application/pdf";
                      return (
                        <div
                          key={doc.id || doc.documentRelativePath || idx}
                          className="group flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/50 hover:border-primary/30 transition-all"
                        >
                          <div
                            onClick={() => handlePreviewDocument(doc)}
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                          >
                            <div className={cn(
                              "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-[10px] uppercase shadow-xs transition-transform group-hover:scale-105",
                              isPdf ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" : "bg-primary/10 text-primary border border-primary/20"
                            )}>
                              {isPdf ? (
                                <span className="font-black">PDF</span>
                              ) : (
                                <FileImage size={18} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                {doc.fileName}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-semibold">
                                {doc.fileSize ? formatFileSize(doc.fileSize) : isPdf ? "PDF Document" : "Image File"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background"
                              onClick={() => handlePreviewDocument(doc)}
                              title="Preview document"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveDocument(idx);
                              }}
                              title="Remove document"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Footer Actions */}
          <div className="p-2 border-t bg-background/50 backdrop-blur-md pb-[env(safe-area-inset-bottom,24px)]">
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-12 flex-1 rounded-2xl text-base font-bold border-2"
              >
                {tran("common.discard")}
              </Button>
              <Button
                onClick={handleAddTransaction}
                disabled={loadingAccounts || transactionMutation.isPending || isUploading}
                className={cn(
                  "h-12 flex-2 rounded-2xl text-white text-base font-black uppercase tracking-widest gap-2 shadow-xl active:scale-[0.97] transition-all",
                  isOut
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                )}
              >
                {transactionMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {tran("cashbook.recording")}
                  </>
                ) : (
                  <>
                    {isOut ? tran("cashbook.confirm_pay") : tran("cashbook.confirm_receive")}
                    {isOut ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Document Preview Lightbox */}
      {previewDoc && (
        <DocumentPreview
          isOpen={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setPreviewDoc(null);
          }}
          url={previewDoc.url}
          fileName={previewDoc.fileName}
        />
      )}
    </>
  )
}
