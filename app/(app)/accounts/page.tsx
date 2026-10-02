import { AccountsSkeleton } from "@/components/account/accounts-skeleton";
import MobileNav from "@/components/tab/mobile-tab";
import { getUserConfig } from "@/lib/user-config";
import { Suspense } from "react";
import { AccountsContent } from "./components/accounts-content";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AccountsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const { currency } = await getUserConfig();
    const includeInactive = params.inactive === 'true';
    const period = (params.period as 'month' | 'year' | 'all') || 'month';

    return (
        <div className="flex-1 w-full bg-background pb-34">
            <Suspense fallback={<AccountsSkeleton />}>
                <AccountsContent
                    currency={currency}
                    initialShowInactive={includeInactive}
                    initialPeriod={period}
                />
            </Suspense>

            <MobileNav />
        </div>
    );
}