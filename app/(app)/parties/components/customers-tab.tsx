import { Plus } from "lucide-react";
import { Suspense } from "react";

import { FooterButtons } from "@/components/footer-buttons";
import { Button } from "@/components/ui/button";
import { PartyType } from "@/lib/generated/prisma/enums";
import { Language, t } from "@/lib/languages/i18n";
import { getUserConfig } from "@/lib/user-config";
import { AddPartiesModal } from "./add-parties-modal";
import BalanceCard from "./balance-card";
import { PartyList } from "./party-list";

interface PartyListProp {
  partyType: PartyType;
  search?: string;
  includeInactive?: boolean;
  period?: 'month' | 'year' | 'all';
}

export default async function CustomersTab({ partyType, search, includeInactive = false, period = 'all' }: PartyListProp) {
  const userConfig = await getUserConfig();
  const lang = (userConfig?.language || "en") as Language;

  return (
    <main className="flex-1 w-full space-y-4">
      <Suspense fallback={<div className="h-28 w-full animate-pulse rounded-2xl bg-muted/20 border border-muted/30" />}>
        <BalanceCard
          partyType={partyType}
          search={search}
          includeInactive={includeInactive}
          period={period}
        />
      </Suspense>

      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {t("parties.recently_active", lang)}
      </p>

      <Suspense fallback={
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-muted/20 border border-muted/30" />
          ))}
        </div>
      }>
        <PartyList
          partyType={partyType}
          search={search}
          includeInactive={includeInactive}
          period={period}
        />
      </Suspense>

      <FooterButtons>
        <AddPartiesModal type={partyType}>
          <Button className="h-14 w-14 md:w-auto md:px-12 rounded-full md:gap-3 font-semibold uppercase bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 p-0 md:py-2">
            <Plus className="size-6 sm:size-5" />
            <span className="hidden md:block">
              {partyType === PartyType.CUSTOMER ? t("parties.add_new_customer", lang) :
                partyType === PartyType.SUPPLIER ? t("parties.add_new_supplier", lang) :
                  partyType === PartyType.EMPLOYEE ? t("parties.add_new_employee", lang) :
                    t("parties.add_new_party", lang)}
            </span>
          </Button>
        </AddPartiesModal>
      </FooterButtons>
    </main>
  );
}

