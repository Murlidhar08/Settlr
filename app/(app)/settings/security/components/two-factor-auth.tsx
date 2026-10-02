"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { authClient } from "@/lib/auth/auth-client"
import { envClient } from "@/lib/env.client"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from 'framer-motion'
import { Copy, RefreshCw, ShieldCheck } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

const QRCode = dynamic(() => import('react-qr-code'), {
  ssr: false,
  loading: () => <div className="h-45 w-45 animate-pulse bg-muted rounded-xl" />
})

/* ========================================================= */
/* SCHEMA */
/* ========================================================= */

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
})

const tokenSchema = z.object({
  token: z.string().length(6, "Enter a 6-digit code"),
})

type PasswordForm = z.infer<typeof passwordSchema>
type TokenForm = z.infer<typeof tokenSchema>

type TwoFactorData = {
  totpURI: string
  backupCodes: string[]
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

/* ========================================================= */
/* MAIN COMPONENT */
/* ========================================================= */

export function TwoFactorAuth({ isEnabled }: { isEnabled: boolean }) {
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  async function enable2FA(values: PasswordForm) {
    const result = await authClient.twoFactor.enable({
      password: values.password,
      issuer: envClient.NEXT_PUBLIC_APP_NAME,
    })

    if (result.error) {
      toast.error(result.error.message ?? "Failed to enable 2FA")
      return
    }

    if (result.data && "totpURI" in result.data) {
      setTwoFactorData({
        totpURI: result.data.totpURI,
        backupCodes: result.data.backupCodes,
      })
      reset()
    } else {
      toast.error("Failed to generate TOTP authentication data")
    }
  }

  async function disable2FA(values: PasswordForm) {
    await authClient.twoFactor.disable(
      { password: values.password },
      {
        onSuccess: () => {
          toast.success("Two-factor authentication disabled")
          reset()
          router.refresh()
        },
        onError: (error) => {
          toast.error(error?.error?.message ?? "Failed to disable 2FA")
        },
      }
    )
  }

  if (twoFactorData) {
    return (
      <QRCodeVerify
        {...twoFactorData}
        onDone={() => setTwoFactorData(null)}
      />
    )
  }

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      variants={itemVariants}
      onSubmit={handleSubmit(isEnabled ? disable2FA : enable2FA)}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">
          Confirm Your Password
        </label>
        <Input
          {...register("password")}
          type="password"
          className="h-14 rounded-2xl bg-muted/10 border-muted-foreground/10 focus:bg-background transition-all"
        />
        {errors.password && (
          <p className="ml-1 text-xs font-bold text-rose-500 italic">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] ${isEnabled
          ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
          : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
          }`}
        disabled={isSubmitting}
      >
        <LoadingSwap isLoading={isSubmitting}>
          {isEnabled ? "Disable Protection" : "Initialize 2FA"}
        </LoadingSwap>
      </Button>
    </motion.form>
  )
}

/* ========================================================= */
/* QR VERIFY STEP */
/* ========================================================= */

function QRCodeVerify({
  totpURI,
  backupCodes,
  onDone,
}: TwoFactorData & { onDone: () => void }) {
  const [completed, setCompleted] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<TokenForm>({
    resolver: zodResolver(tokenSchema),
  })

  async function verifyCode(values: TokenForm) {
    await authClient.twoFactor.verifyTotp(
      { code: values.token },
      {
        onSuccess: () => {
          toast.success("Security verification successful")
          setCompleted(true)
          router.refresh()
        },
        onError: (error) => {
          toast.error(error?.error?.message ?? "Invalid verification code")
        },
      }
    )
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-2">
            <ShieldCheck size={28} />
          </div>
          <p className="font-bold text-lg">Safe Connection Established</p>
          <p className="text-sm text-muted-foreground leading-relaxed px-4">
            Store these recovery codes securely. They are the only way to access your account if you lose your device.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 rounded-3xl bg-muted/40 border border-muted-foreground/5 font-mono text-xs tracking-widest shadow-inner">
          {backupCodes.map(code => (
            <div
              key={code}
              className="flex items-center justify-center p-3 rounded-xl bg-background border border-muted shadow-xs font-bold"
            >
              {code}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-2xl gap-2 font-bold" onClick={() => {
            navigator.clipboard.writeText(backupCodes.join("\n"))
            toast.success("Codes copied to clipboard")
          }}>
            <Copy size={16} /> Copy
          </Button>
          <Button onClick={onDone} className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]">
            Complete Setup
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      onSubmit={handleSubmit(verifyCode)}
      className="space-y-8"
    >
      <div className="space-y-4 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary mb-2">
          <RefreshCw size={24} className="animate-spin-slow" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Scan the QR code with your authenticator app (like Authy or Google Authenticator) and enter the 6-digit sync code below.
        </p>
      </div>

      <div className="flex justify-center p-6 rounded-[2.5rem] bg-background border shadow-xl relative group">
        <QRCode size={180} value={totpURI} />
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
      </div>

      <div className="space-y-2">
        <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">
          Verification Sync Code
        </label>
        <Input
          {...register("token")}
          inputMode="numeric"
          autoComplete="one-time-code"
          className="h-14 rounded-2xl bg-muted/10 border-muted-foreground/10 focus:bg-background transition-all text-center text-xl font-black tracking-[0.5em] pr-[0.5em]"
          placeholder="000000"
        />
        {errors.token && (
          <p className="text-center text-xs font-bold text-rose-500 italic mt-2">
            {errors.token.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-2xl transition-all active:scale-[0.98]" disabled={isSubmitting}>
        <LoadingSwap isLoading={isSubmitting}>
          Establish Security Link
        </LoadingSwap>
      </Button>
    </motion.form>
  )
}

