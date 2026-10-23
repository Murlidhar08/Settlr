"use client"

import { authClient } from "@/lib/auth/auth-client"
import { ShieldAlert, UserX } from "lucide-react"
import { BetterAuthActionButton } from "./better-auth-action-button"

export function ImpersonationIndicator() {
    const { data: session } = authClient.useSession()

    if (session?.session.impersonatedBy == null) return null

    return (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-100 animate-in slide-in-from-bottom-8 duration-500 w-[90%] sm:w-auto max-w-lg">
            <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-3 rounded-2xl sm:rounded-[2.5rem] bg-amber-500/10 backdrop-blur-3xl border border-amber-500/20 shadow-2xl shadow-amber-500/10">
                <div className="p-2 sm:p-3 bg-amber-500/20 rounded-xl sm:rounded-2xl shrink-0">
                    <ShieldAlert className="text-amber-600 size-4 sm:size-5" />
                </div>
                <div className="flex flex-col min-w-0 flex-1 sm:flex-initial">
                    <span className="font-extrabold text-amber-900 text-[11px] sm:text-sm tracking-tight leading-none mb-0.5 sm:mb-1 truncate">
                        Impersonation Mode
                    </span>
                    <span className="text-[8px] sm:text-[10px] font-bold text-amber-800/60 uppercase tracking-widest leading-none truncate">
                        Viewing as {session?.user.name}
                    </span>
                </div>
                <div className="pl-2 sm:pl-4 border-l border-amber-500/10 ml-1 sm:ml-2">
                    <BetterAuthActionButton
                        action={async () =>
                            await authClient.admin.stopImpersonating(undefined, {
                                onSuccess: () => {
                                    window.location.replace("/admin");
                                },
                            })
                        }
                        variant="destructive"
                        className="rounded-xl sm:rounded-2xl h-9 sm:h-11 px-3 sm:px-6 font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-rose-500/10 active:scale-95 transition-all"
                        successMessage="Stopped impersonation"
                    >
                        <UserX className="size-3.5 sm:size-4 sm:mr-2" />
                        <span className="hidden md:inline">Stop</span>
                    </BetterAuthActionButton>
                </div>
            </div>
        </div>
    )
}
