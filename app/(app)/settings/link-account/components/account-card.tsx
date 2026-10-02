'use client'

import { BetterAuthActionButton } from '@/components/auth/better-auth-action-button'
import { itemVariants } from '@/lib/animations'
import { auth } from '@/lib/auth/auth'
import { authClient } from '@/lib/auth/auth-client'
import {
    SUPPORTED_OAUTH_PROVIDER_DETAILS,
    SupportedOAuthProvider
} from '@/lib/auth/o-auth-providers'
import { tran } from '@/lib/languages/i18n'
import { cn } from '@/lib/utils'
import { formatUserDate, formatUserTime } from '@/utility/date-time-fn'
import { motion } from 'framer-motion'
import { Plus, Shield, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Account = Awaited<ReturnType<typeof auth.api.listUserAccounts>>[number]

export default function AccountCard({
    provider,
    account,
}: {
    provider: string
    account?: Account
}) {
    const router = useRouter()

    const providerDetails =
        SUPPORTED_OAUTH_PROVIDER_DETAILS[
        provider as SupportedOAuthProvider
        ] ?? {
            name: provider,
            Icon: Shield,
        }

    function linkAccount() {
        return authClient.linkSocial({
            provider,
            callbackURL: '/settings/link-account',
        })
    }

    function unlinkAccount() {
        if (!account) {
            return Promise.resolve({
                error: { message: 'Account not found' },
            })
        }

        return authClient.unlinkAccount(
            {
                accountId: account.accountId,
            },
            {
                onSuccess: () => router.refresh(),
            }
        )
    }

    return (
        <motion.div
            variants={itemVariants}
            className="group relative overflow-hidden p-5 rounded-3xl bg-card border shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/20"
        >
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-6 shadow-sm",
                        account ? "bg-primary/5 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                        <providerDetails.Icon className="size-6" />
                    </div>
                    <div>
                        <p className="font-bold text-base leading-tight">{providerDetails.name}</p>
                        {account ? (
                            <div className="flex flex-col gap-0.5 mt-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                                    {tran("linked_accounts.verified")}
                                </p>
                                {account.createdAt && (
                                    <p className="text-[11px] font-bold text-muted-foreground/60">
                                        {tran("linked_accounts.linked_on", {
                                            date: formatUserDate(account.createdAt),
                                            time: formatUserTime(account.createdAt)
                                        })}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 mt-1">
                                {tran("linked_accounts.not_connected")}
                            </p>
                        )}
                    </div>
                </div>

                {account ? (
                    <BetterAuthActionButton
                        variant="outline"
                        size="sm"
                        className="rounded-xl h-10 px-4 font-bold border-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 active:scale-95"
                        action={unlinkAccount}
                    >
                        <Trash2 className="size-4 mr-2" />
                        {tran("linked_accounts.unlink")}
                    </BetterAuthActionButton>
                ) : (
                    <BetterAuthActionButton
                        variant="secondary"
                        size="sm"
                        className="rounded-xl h-10 px-4 font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 shadow-sm"
                        action={linkAccount}
                    >
                        <Plus className="size-4 mr-2" />
                        {tran("linked_accounts.connect")}
                    </BetterAuthActionButton>
                )}
            </div>
            {account && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
            )}
        </motion.div>
    )
}
