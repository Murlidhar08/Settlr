"use client"

import { togglePartyActive } from "@/actions/parties.actions"
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
import { useDeleteParty } from "@/tanstacks/parties"
import { useQueryClient } from "@tanstack/react-query"
import { Pencil, ShieldAlert, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { AddPartiesModal } from "../../components/add-parties-modal"

export default function BackHeaderClient({ party }: { party: any }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const deletePartyMutation = useDeleteParty()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleDelete = async () => {
    deletePartyMutation.mutate(party.id, {
      onSuccess: (success) => {
        if (success) {
          toast.success("Party and all transactions deleted")
          router.back()
        } else {
          toast.error("Failed to delete party")
        }
      },
      onError: () => {
        toast.error("Failed to delete party")
      }
    })
  }

  return (
    <>
      <BackHeader
        title={party?.name}
        backUrl='/parties'
        showProfile={false}
        menuItems={[
          {
            icon: <Pencil size={18} />,
            label: "Edit",
            onClick: () => setIsEditing(true),
            destructive: false
          },
          {
            icon: <ShieldAlert size={18} />,
            label: party.isActive ? "Deactivate" : "Activate",
            onClick: async () => {
              const success = await togglePartyActive(party.id, !party.isActive)
              if (success) {
                queryClient.invalidateQueries({ queryKey: ["party-list", party?.type] })
                queryClient.invalidateQueries({ queryKey: ["party-detail", party.id] })
                toast.success(`Party ${party.isActive ? "deactivated" : "activated"} successfully`)
                router.refresh()
              } else {
                toast.error("Failed to toggle party status")
              }
            },
            destructive: party.isActive
          },
          {
            icon: <Trash2 size={18} />,
            label: "Delete",
            onClick: () => setIsDeleting(true),
            destructive: true
          }
        ]}
      />

      {/* Edit Sheet */}
      <AddPartiesModal
        type={party.type}
        partyData={party}
        openInternal={isEditing}
        setOpenInternal={setIsEditing}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent className="rounded-3xl border-rose-200">
          <AlertDialogHeader>
            <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-2">
              <ShieldAlert size={32} />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-black">Dangerous Territory!</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              This will delete <span className="font-bold text-foreground">"{party?.name}"</span> and <span className="font-bold text-rose-600 underline">EVERY single transaction</span> associated with them. This is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-2">
            <AlertDialogCancel className="h-12 rounded-2xl font-bold border-none bg-muted">No, Keep Them</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="h-12 rounded-2xl font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200"
            >
              Yes, Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
