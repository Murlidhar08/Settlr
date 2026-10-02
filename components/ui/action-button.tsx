"use client"

import { type ComponentProps, type ReactNode, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { LoadingSwap } from "@/components/ui/loading-swap"
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ActionButton({
  action,
  requireAreYouSure = false,
  areYouSureTitle = "Are you sure?",
  areYouSureDescription = "This action cannot be undone.",
  areYouSureConfirmText = "Yes",
  areYouSureCancelText = "Cancel",
  ...props
}: ComponentProps<typeof Button> & {
  action: () => Promise<{ error: boolean; message?: string }>
  requireAreYouSure?: boolean
  areYouSureTitle?: ReactNode
  areYouSureDescription?: ReactNode
  areYouSureConfirmText?: ReactNode
  areYouSureCancelText?: ReactNode
}) {
  const [isLoading, startTransition] = useTransition()

  function performAction() {
    startTransition(async () => {
      const data = await action()
      if (data.error) {
        toast.error(data.message ?? "Error")
      } else if (data.message) {
        toast.success(data.message)
      }
    })
  }

  if (requireAreYouSure) {
    return (
      <AlertDialog open={isLoading ? true : undefined}>
        <AlertDialogTrigger render={<Button {...props} />}></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{areYouSureTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {areYouSureDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{areYouSureCancelText}</AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onClick={performAction}>
              <LoadingSwap isLoading={isLoading}>{areYouSureConfirmText}</LoadingSwap>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Button
      {...props}
      disabled={props.disabled ?? isLoading}
      onClick={e => {
        performAction()
        props.onClick?.(e)
      }}
    >
      <LoadingSwap
        isLoading={isLoading}
        className="inline-flex items-center gap-2"
      >
        {props.children}
      </LoadingSwap>
    </Button>
  )
}
