"use client"

import { KeyRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth/auth-client"
import { AUTH_PAGES_COPY } from "@/lib/config/auth-error-copy"
import { toast } from "sonner"

type TotpFormValues = {
  code: string
}

export function TotpForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TotpFormValues>()

  async function onSubmit(values: TotpFormValues) {
    await authClient.twoFactor.verifyTotp(
      { code: values.code },
      {
        onSuccess: () => {
          toast.success(AUTH_PAGES_COPY.twoFactor.totp.successToast)
          router.push("/")
        },
        onError: (error) => {
          toast.error(error?.error?.message ?? "Invalid code")
        },
      }
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="space-y-3">
        <label className="text-sm font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
          <KeyRound className="w-4 h-4" /> {AUTH_PAGES_COPY.twoFactor.totp.codeLabel}
        </label>
        <div className="relative group">
          <Input
            {...register("code", {
              required: "Code is required",
              minLength: { value: 6, message: "Enter 6-digit code" },
              maxLength: { value: 6, message: "Enter 6-digit code" },
            })}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={AUTH_PAGES_COPY.twoFactor.totp.codePlaceholder}
            className="h-14 rounded-2xl text-center text-2xl tracking-[0.5em] font-mono pl-4 pr-4 transition-all duration-300 bg-background border-muted-foreground/10 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        {errors.code && (
          <p className="text-xs font-medium text-destructive animate-bounce">
            {errors.code.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="relative rounded-2xl h-14 w-full text-lg font-bold shadow-xl shadow-primary/10 hover:shadow-primary/25 transition-all duration-300 active:scale-[0.98]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            {AUTH_PAGES_COPY.twoFactor.totp.verifyingButton}
          </div>
        ) : AUTH_PAGES_COPY.twoFactor.totp.verifyButton}
      </Button>
    </form>
  )
}


