import MobileNav from "@/components/tab/mobile-tab";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserSession } from "@/lib/auth/auth";
import { tran } from "@/lib/languages/i18n";
import { Suspense } from "react";
import { AccountsDistribution } from "./components/accounts-distribution";
import { AddTransactionButton } from "./components/add-transaction-button";
import { BudgetAlerts, BudgetAlertsSkeleton } from "./components/budget-alerts";
import SwitchBusiness from "./components/business-switch";
import { CashflowChart } from "./components/cashflow-chart";
import RecentTransaction from "./components/recent-transaction";
import SummaryCard, { SummaryCardSkeleton } from "./components/summary-card";
import { TransactionListSkeletons } from "./components/transaction-item-skeleton";
import WelcomeNote from "./components/welcome-note";


export default async function Page() {
  const session = await getUserSession();
  const firstName = session?.user.name?.split(" ")[0] || "User";

  return (
    <>
      <div className="flex-1 px-4 space-y-6 sm:space-y-8 pb-34">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4">
          <WelcomeNote firstName={firstName} />
          <div className="shrink-0">
            <SwitchBusiness />
          </div>
        </section>

        {/* Global Stats Grid */}
        <Suspense fallback={<SummaryCardSkeleton />}>
          <SummaryCard />
        </Suspense>

        {/* Visual Analytics Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Suspense fallback={<Skeleton className="h-112.5 w-full rounded-[2.5rem] bg-muted/40 animate-pulse border-2 border-dashed border-muted" />}>
            <div className="space-y-4">
              <CashflowChart />
            </div>
          </Suspense>

          <Suspense fallback={<Skeleton className="h-112.5 w-full rounded-[2.5rem] bg-muted/40 animate-pulse border-2 border-dashed border-muted" />}>
            <div className="space-y-4">
              <AccountsDistribution />
            </div>
          </Suspense>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32">
          <section className="lg:col-span-2 space-y-6">
            <div className="px-2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">{tran("dashboard.recent_transactions")}</h2>
            </div>

            <Suspense fallback={<TransactionListSkeletons />}>
              <div className="relative">
                <div className="absolute -top-10 left-10 h-40 w-40 bg-primary/5 blur-[100px] pointer-events-none rounded-full" />
                <RecentTransaction />
              </div>
            </Suspense>
          </section>

          {/* Quick Stats / Mini Cards Column */}
          <aside className="space-y-6">
            <div className="px-2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">{tran("dashboard.insights")}</h2>
            </div>
            <Suspense fallback={<BudgetAlertsSkeleton />}>
              <BudgetAlerts />
            </Suspense>
          </aside>
        </div>
      </div>

      <AddTransactionButton />
      <MobileNav />
    </>
  );
}
