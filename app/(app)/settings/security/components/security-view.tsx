"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Key, Lock, ShieldCheck } from "lucide-react";
import AppTabs from "@/components/tab/app-tabs";
import type { TabItem } from "@/components/navbar/tab-item";
import { Skeleton } from "@/components/ui/skeleton";
import { containerVariants } from "@/lib/animations";
import { useSession } from "@/lib/auth/auth-client";
import { tran } from "@/lib/languages/i18n";
import { useListUserAccounts } from "@/tanstacks/settings";
import { SecureTab } from "./secure-tab";
import { SecuritySkeleton } from "./security-skeleton";

const TwoFactorTab = dynamic(
  () => import("./two-factor-tab").then((m) => m.TwoFactorTab),
  {
    loading: () => <Skeleton className="h-64 w-full rounded-3xl" />,
  }
);

const PasskeyTab = dynamic(
  () => import("./passkey-tab").then((m) => m.PasskeyTab),
  {
    loading: () => <Skeleton className="h-64 w-full rounded-3xl" />,
  }
);

export function SecurityView() {
  const { data: session, isPending: isSessionPending } = useSession();
  const { data: accounts = [], isLoading: isAccountsLoading } = useListUserAccounts();

  const hasPasswordAccount = accounts.some((a: any) => a.providerId === "credential");

  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: "password",
        label: tran("security.access.title"),
        icon: <Lock size={14} />,
        content: (
          <SecureTab
            email={session?.user.email ?? ""}
            hasPasswordAccount={hasPasswordAccount}
          />
        ),
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
        ),
      },
      {
        id: "passkeys",
        label: tran("security.passkeys.title"),
        icon: <Key size={14} />,
        content: <PasskeyTab />,
      },
    ],
    [session?.user.email, session?.user?.twoFactorEnabled, hasPasswordAccount]
  );

  if (isSessionPending || isAccountsLoading) {
    return <SecuritySkeleton />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl p-4 sm:p-6 mt-4"
      >
        <AppTabs defaultTab="password" tabs={tabs} />
      </motion.div>
    </div>
  );
}

