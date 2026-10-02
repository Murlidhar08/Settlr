"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { containerVariants, itemVariants } from "@/lib/animations";
import { SUPPORTED_OAUTH_PROVIDERS } from '@/lib/auth/o-auth-providers';
import { tran } from "@/lib/languages/i18n";
import { useEnabledOAuthProviders, useListUserAccounts } from "@/tanstacks/settings";
import { motion } from "framer-motion";
import AccountCard from "./components/account-card";

export default function LinkAccountPage() {
    const { data: accountsList = [], isLoading: isAccountsLoading } = useListUserAccounts();
    const { data: enabledProviders = { google: false, discord: false, facebook: false }, isLoading: isProvidersLoading } = useEnabledOAuthProviders();

    const currAccount = accountsList.filter((a: any) => a.providerId !== "credential");
    const loading = isAccountsLoading || isProvidersLoading;

    if (loading) {
        return <LinkAccountSkeleton />;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto max-w-4xl mt-6 space-y-8 px-6"
            >
                <div className="space-y-10">
                    <section className="space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">
                            {tran("linked_accounts.active_connections")}
                        </h3>

                        {currAccount?.length === 0 ? (
                            <motion.div
                                variants={itemVariants}
                                className="p-8 text-center bg-card/50 rounded-3xl border border-dashed border-muted-foreground/20 text-muted-foreground"
                            >
                                <p className="text-sm font-medium">
                                    {tran("linked_accounts.no_accounts_linked")}
                                </p>
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                {currAccount?.map(account => (
                                    <AccountCard
                                        key={account.id}
                                        provider={account.providerId}
                                        account={account}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {SUPPORTED_OAUTH_PROVIDERS.filter(provider =>
                        enabledProviders[provider] && !currAccount?.find(acc => acc.providerId === provider)
                    ).length > 0 && (
                            <section className="space-y-4">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">
                                    {tran("linked_accounts.available_providers")}
                                </h3>

                                <div className="grid gap-3">
                                    {SUPPORTED_OAUTH_PROVIDERS.filter(provider =>
                                        enabledProviders[provider] && !currAccount?.find(acc => acc.providerId === provider)
                                    ).map(provider => (
                                        <AccountCard key={provider} provider={provider} />
                                    ))}
                                </div>
                            </section>
                        )}
                </div>
            </motion.div>
        </div>
    );
}

function LinkAccountSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-lg p-6 mt-6 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-24 w-full rounded-3xl" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-24 w-full rounded-3xl" />
                    <Skeleton className="h-24 w-full rounded-3xl" />
                </div>
            </div>
        </div>
    );
}
