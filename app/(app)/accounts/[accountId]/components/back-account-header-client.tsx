"use client"

import { deleteFinancialAccount, setAccountAsDefault, toggleFinancialAccountActive } from "@/actions/financial-account.actions"
import { AddAccountModal } from "@/components/account/add-account-modal"
import { BackHeader } from "@/components/header/back-header"
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
import { FinancialAccount } from "@/lib/generated/prisma/client"
import { tran } from "@/lib/languages/i18n"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowDownToLine, ArrowUpFromLine, Pencil, ShieldAlert, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function BackAccountHeaderClient({ account }: { account: FinancialAccount }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const queryClient = useQueryClient()

    const handleDelete = async () => {
        try {
            await deleteFinancialAccount(account.id)
            queryClient.invalidateQueries({ queryKey: ["financial-accounts"] })
            queryClient.removeQueries({ queryKey: ["financial-account", account.id] })
            toast.success("Account deleted successfully")
            router.push("/accounts" as any)
        } catch (error: any) {
            toast.error(error.message || "Failed to delete account")
        }
    }

    return (
        <>
            <BackHeader
                title={account?.name}
                backUrl={'/accounts' as any}
                showProfile={false}
                menuItems={[
                    ...(account.type === 'MONEY' ? [
                        {
                            icon: <ShieldAlert size={18} />,
                            label: "accounts.set_primary_account",
                            onClick: async () => {
                                try {
                                    await setAccountAsDefault(account.id, 'GENERAL')
                                    queryClient.invalidateQueries({ queryKey: ["financial-accounts"] })
                                    toast.success("Primary money account updated")
                                    router.refresh()
                                } catch (err) {
                                    toast.error("Failed to update settings")
                                }
                            },
                            destructive: false
                        }
                    ] : []),
                    ...(account.type === 'CATEGORY' && account.categoryType === 'INCOME' ? [
                        {
                            icon: <ArrowDownToLine size={18} />,
                            label: "accounts.set_default_income",
                            onClick: async () => {
                                try {
                                    await setAccountAsDefault(account.id, 'INCOME')
                                    queryClient.invalidateQueries({ queryKey: ["financial-accounts"] })
                                    toast.success("Default income category set")
                                    router.refresh()
                                } catch (err) {
                                    toast.error("Failed to update settings")
                                }
                            },
                            destructive: false
                        }
                    ] : []),
                    ...(account.type === 'CATEGORY' && account.categoryType === 'EXPENSE' ? [
                        {
                            icon: <ArrowUpFromLine size={18} />,
                            label: "accounts.set_default_expense",
                            onClick: async () => {
                                try {
                                    await setAccountAsDefault(account.id, 'EXPENSE')
                                    queryClient.invalidateQueries({ queryKey: ["financial-accounts"] })
                                    toast.success("Default expense category set")
                                    router.refresh()
                                } catch (err) {
                                    toast.error("Failed to update settings")
                                }
                            },
                            destructive: false
                        }
                    ] : []),
                    ...(account.isSystem ? [
                        {
                            icon: <Pencil size={18} />,
                            label: "common.rename",
                            onClick: () => setIsEditing(true),
                            destructive: false
                        }
                    ] : [
                        {
                            icon: <Pencil size={18} />,
                            label: "common.edit",
                            onClick: () => setIsEditing(true),
                            destructive: false
                        },
                        {
                            icon: <ShieldAlert size={18} />,
                            label: account.isActive ? "common.deactivate" : "common.activate",
                            onClick: async () => {
                                try {
                                    await toggleFinancialAccountActive(account.id, !account.isActive)
                                    queryClient.invalidateQueries({ queryKey: ["financial-accounts"] })
                                    queryClient.invalidateQueries({ queryKey: ["financial-account", account.id] })
                                    toast.success(`Account ${account.isActive ? "deactivated" : "activated"} successfully`)
                                    router.refresh()
                                } catch (error: any) {
                                    toast.error(error.message || "Failed to toggle account status")
                                }
                            },
                            destructive: account.isActive
                        },
                        {
                            icon: <Trash2 size={18} />,
                            label: "common.delete",
                            onClick: () => setIsDeleting(true),
                            destructive: true
                        }
                    ])
                ]}
            />

            {/* Edit Modal (Reusing existing AddAccountModal for editing) */}
            {isEditing && (
                <AddAccountModal
                    accountData={account}
                    openInternal={isEditing}
                    setOpenInternal={setIsEditing}
                >
                    <div className="hidden" />
                </AddAccountModal>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                <AlertDialogContent className="rounded-3xl border-rose-200">
                    <AlertDialogHeader>
                        <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-2">
                            <ShieldAlert size={32} />
                        </div>
                        <AlertDialogTitle className="text-center text-2xl font-black">{tran("common.dangerous_territory")}</AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-base">
                            {tran("accounts.delete_account_confirm_desc", { name: account?.name || "" })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0 mt-2">
                        <AlertDialogCancel className="h-12 rounded-2xl font-bold border-none bg-muted">{tran("common.no_keep_it")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="h-12 rounded-2xl font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200"
                        >
                            {tran("accounts.yes_delete_account")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
