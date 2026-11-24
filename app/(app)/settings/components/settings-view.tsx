"use client";

import { FooterButtons } from "@/components/footer-buttons";
import { useUserConfig } from "@/components/providers/user-config-provider";
import { Button } from "@/components/ui/button";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useSession } from "@/lib/auth/auth-client";
import { APP } from "@/lib/config/repo";
import { tran } from "@/lib/languages/i18n";
import { useAppVersion, useUpsertUserSettings } from "@/tanstacks/settings";
import { motion } from "framer-motion";
import { LogOut, Trash } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SettingsAppearanceSection } from "./settings-appearance-section";
import { SettingsGeneralSection } from "./settings-general-section";
import { SettingsSecuritySection } from "./settings-security-section";
import { SettingsSkeleton } from "./settings-skeleton";
import { SettingsUserCard } from "./settings-user-card";
import { SettingsRow, SettingsSection } from "./settings-section-row";

export function SettingsView() {
  const router = useRouter();
  const { theme, setTheme, updateConfig, ...userConfig } = useUserConfig();
  const { data: session, isPending } = useSession();
  const { data: versionData } = useAppVersion();

  const [currency, setCurrency] = useState(userConfig.currency);
  const [locale, setLocale] = useState(userConfig.locale);
  const [dateFormat, setDateFormat] = useState(userConfig.dateFormat);
  const [timeFormat, setTimeFormat] = useState(userConfig.timeFormat);
  const [language, setLanguage] = useState(userConfig.language);
  const [isDevMode, setIsDevMode] = useState(userConfig.debug ?? false);
  const upsertSettingsMutation = useUpsertUserSettings();

  const searchParams = useSearchParams();
  const isDebug = searchParams.get("debug") === "true" || userConfig.debug || isDevMode;
  const version = versionData || "Pending ...";

  if (isPending) return <SettingsSkeleton />;

  const handleSignOut = () => {
    router.push("/signout");
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-3xl space-y-8"
      >
        {/* USER PROFILE CARD */}
        <motion.div variants={itemVariants}>
          <SettingsUserCard sessionUser={session?.user} />
        </motion.div>

        {/* GENERAL SETTINGS */}
        <motion.div variants={itemVariants}>
          <SettingsGeneralSection
            language={language}
            setLanguage={setLanguage}
            currency={currency}
            setCurrency={setCurrency}
            dateFormat={dateFormat}
            setDateFormat={setDateFormat}
            timeFormat={timeFormat}
            setTimeFormat={setTimeFormat}
            locale={locale}
            setLocale={setLocale}
            isDebug={Boolean(isDebug)}
            isDevMode={isDevMode}
            setIsDevMode={setIsDevMode}
            updateConfig={updateConfig}
            upsertSettingsMutation={upsertSettingsMutation}
          />
        </motion.div>

        {/* APPEARANCE SETTINGS */}
        <motion.div variants={itemVariants}>
          <SettingsAppearanceSection
            theme={theme}
            setTheme={setTheme}
            updateConfig={updateConfig}
            upsertSettingsMutation={upsertSettingsMutation}
          />
        </motion.div>

        {/* Data Management */}
        <SettingsSection title={tran("settings.data_management")}>
          <SettingsRow
            icon={Trash}
            label={tran("settings.recycle_bin")}
            href="/settings/recycle-bin"
          />
        </SettingsSection>

        {/* SECURITY & PRIVACY */}
        <motion.div variants={itemVariants}>
          <SettingsSecuritySection />
        </motion.div>

        {/* App Version */}
        <motion.div
          variants={itemVariants}
          className="text-center space-y-2 opacity-50 pt-4 pb-24"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Build Version {version}</p>
          <p className="text-[9px] font-medium italic">
            © {new Date().getFullYear()} {APP.NAME}. All rights reserved.
          </p>
        </motion.div>
      </motion.div>

      {/* SIGNOUT BUTTON */}
      <FooterButtons bottomSpace={true}>
        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="h-14 w-14 md:w-auto md:px-12 rounded-full md:gap-3 font-semibold uppercase bg-rose-500 hover:bg-rose-500/70 text-white shadow-lg shadow-rose-500/50 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 p-0 md:py-2"
        >
          <LogOut className="size-5 md:size-6" />
          <span className="hidden md:block text-center font-black tracking-[0.2em] text-sm">
            {tran("settings.signout")}
          </span>
        </Button>
      </FooterButtons>
    </div>
  );
}

