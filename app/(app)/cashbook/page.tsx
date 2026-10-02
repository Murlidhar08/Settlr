import { FooterButtons } from "@/components/footer-buttons";
import MobileNav from "@/components/tab/mobile-tab";
import { AddTransactionModal } from "@/components/transaction/add-transaction-modal";
import { Button } from "@/components/ui/button";
import { Language, t } from "@/lib/languages/i18n";
import { getUserConfig } from "@/lib/user-config";
import { TransactionDirection } from "@/types/transaction/TransactionDirection";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import CashFilters from "./components/cash-filters";
import { CashbookContent } from "./components/cashbook-content";
import { CashbookSkeleton } from "./components/cashbook-skeleton";

interface CashbookPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function CashbookPage({ searchParams }: CashbookPageProps) {
  const params = await searchParams;
  const today = format(new Date(), "yyyy-MM-dd");
  const userConfig = await getUserConfig();
  const lang = (userConfig?.language || "en") as Language;

  const isSearchActive = !!params.search;
  const effectiveStartDate = params.startDate || (!isSearchActive ? today : undefined);
  const effectiveEndDate = params.endDate || (!isSearchActive ? today : undefined);

  return (
    <div className="w-full flex-1 bg-background pb-34">
      <div className="mx-auto w-full max-w-4xl px-6">
        <CashFilters effectiveStartDate={effectiveStartDate} effectiveEndDate={effectiveEndDate} />

        <Suspense
          key={`${params.search}-${params.category}-${effectiveStartDate}-${effectiveEndDate}`}
          fallback={<CashbookSkeleton />}
        >
          <CashbookContent
            search={params.search}
            category={params.category}
            startDate={effectiveStartDate}
            endDate={effectiveEndDate}
          />
        </Suspense>
      </div>

      <FooterButtons bottomSpace={true}>
        <AddTransactionModal
          title={t("cashbook.new_entry", lang)}
          direction={TransactionDirection.OUT}
          path="/cashbook"
        >
          <Button className="h-14 w-14 md:w-auto md:px-12 rounded-full md:gap-3 font-semibold uppercase bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 p-0 md:py-2">
            <Plus className="size-6 sm:size-5" />
            <span className="hidden md:block text-center font-black tracking-[0.2em] text-sm">
              {t("cashbook.add_entry", lang)}
            </span>
          </Button>
        </AddTransactionModal>
      </FooterButtons>

      <MobileNav />
    </div>
  );
}



