// Packages
import { PartyType } from "@/lib/generated/prisma/enums";
import { Suspense } from "react";

// Components
import MobileNav from "@/components/tab/mobile-tab";
import * as motion from "framer-motion/client";
import CustomersTab from "./components/customers-tab";
import { PartiesClientProvider, PartiesTabContent } from "./components/parties-client-wrapper";
import { PartyFilters } from "./components/party-filters";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Parties({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentTab = typeof params.tab === 'string' ? params.tab : "customers";
  const searchQuery = typeof params.search === 'string' ? params.search : "";
  const includeInactive = params.inactive === 'true';

  const partyType =
    currentTab === "suppliers" ? PartyType.SUPPLIER :
      currentTab === "employees" ? PartyType.EMPLOYEE :
        currentTab === "other" ? PartyType.OTHER :
          PartyType.CUSTOMER;

  const currentPeriod = (params.period as 'month' | 'year' | 'all') || (partyType === PartyType.EMPLOYEE ? 'month' : 'all');

  const loaderProps = (
    <div className="space-y-4">
      <div className="h-28 w-full animate-pulse rounded-2xl bg-muted/50" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-muted/30" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto pb-34">
      <div className="w-full mx-auto max-w-4xl mt-6 space-y-8 px-6">
        <PartiesClientProvider currentTab={currentTab}>
          <PartyFilters />

          <motion.div
            key={`${currentTab}-${searchQuery}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PartiesTabContent currentTab={currentTab} fallback={loaderProps}>
              <Suspense fallback={loaderProps}>
                <CustomersTab
                  partyType={partyType}
                  search={searchQuery}
                  includeInactive={includeInactive}
                  period={currentPeriod}
                />
              </Suspense>
            </PartiesTabContent>
          </motion.div>
        </PartiesClientProvider>
      </div>

      <MobileNav />
    </div>
  );
}

