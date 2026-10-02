"use client";

import AppTabs from "@/components/tab/app-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { containerVariants } from "@/lib/animations";
import { useSession } from "@/lib/auth/auth-client";
import { tran } from "@/lib/languages/i18n";
import { useListUserAccounts } from "@/tanstacks/settings";
import { motion } from "framer-motion";
import { Key, Lock, ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";
import { SecureTab } from "./components/secure-tab";

const TwoFactorTab = dynamic(
    () => import("./components/two-factor-tab").then((m) => m.TwoFactorTab),
    {
        loading: () => <Skeleton className="h-64 w-full rounded-3xl" />,
    }
);

const PasskeyTab = dynamic(
    () => import("./components/passkey-tab").then((m) => m.PasskeyTab),
    {
        loading: () => <Skeleton className="h-64 w-full rounded-3xl" />,
    }
);

export default function SecurityPage() {
    const { data: session, isPending: isSessionPending } = useSession();
    const { data: accounts = [], isLoading: isAccountsLoading } = useListUserAccounts();

    const hasPasswordAccount = accounts.some((a: any) => a.providerId === "credential");

    if (isSessionPending || isAccountsLoading) {
        return <SecuritySkeleton />;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-4xl p-6 mt-4"
            >
                <AppTabs
                    defaultTab="password"
                    tabs={[
                        {
                            id: "password",
                            label: tran("security.access.title"),
                            icon: <Lock size={14} />,
                            content: (
                                <SecureTab
                                    email={session?.user.email ?? ""}
                                    hasPasswordAccount={hasPasswordAccount}
                                />
                            )
                        },
                        {
                            id: "2fa",
                            label: tran("security.two_factor.title"),
                            icon: <ShieldCheck size={14} />,
                            content: (
                                <TwoFactorTab
                                    isTwoFactorEnabled={session?.user?.twoFactorEnabled ?? false}
                                    hasPasswordAccount={hasPasswordAccount}
                                />
                            )
                        },
                        {
                            id: "passkeys",
                            label: tran("security.passkeys.title"),
                            icon: <Key size={14} />,
                            content: (
                                <PasskeyTab />
                            )
                        }
                    ]}
                />
            </motion.div>
        </div>
    );
}

// @ts-ignore
function SecuritySkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-lg p-6 mt-6 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-48 w-full rounded-3xl" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-32 w-full rounded-3xl" />
                </div>
            </div>
        </div>
    );
}
