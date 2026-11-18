"use client";

import { Calendar, Clock, Globe, IndianRupee, Languages, Terminal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Currency } from "@/lib/generated/prisma/enums";
import { tran } from "@/lib/languages/i18n";
import { cn } from "@/lib/utils";
import {
  currencyItems,
  dateFormatItems,
  languageItems,
  localeItems,
  timeFormatItems,
} from "@/lib/constants/common";
import { SettingsRow, SettingsSection } from "./settings-section-row";

interface SettingsGeneralSectionProps {
  language: string;
  setLanguage: (val: string) => void;
  currency: Currency;
  setCurrency: (val: Currency) => void;
  dateFormat: string;
  setDateFormat: (val: string) => void;
  timeFormat: string;
  setTimeFormat: (val: string) => void;
  locale: string;
  setLocale: (val: string) => void;
  isDebug: boolean;
  isDevMode: boolean;
  setIsDevMode: (val: boolean) => void;
  updateConfig: (patch: Record<string, any>) => void;
  upsertSettingsMutation: {
    mutateAsync: (data: any) => Promise<any>;
  };
}

export function SettingsGeneralSection({
  language,
  setLanguage,
  currency,
  setCurrency,
  dateFormat,
  setDateFormat,
  timeFormat,
  setTimeFormat,
  locale,
  setLocale,
  isDebug,
  isDevMode,
  setIsDevMode,
  updateConfig,
  upsertSettingsMutation,
}: SettingsGeneralSectionProps) {
  return (
    <SettingsSection title={tran("settings.general")}>
      {/* Language */}
      <SettingsRow icon={Languages} label={tran("settings.language")}>
        <Select
          items={languageItems}
          value={language}
          onValueChange={(value) => {
            if (!value) return;
            setLanguage(value);
            updateConfig({ language: value });
            void upsertSettingsMutation.mutateAsync({ language: value });
            toast.success(tran("settings.msg.language_updated"));
          }}
        >
          <SelectTrigger className="w-36 sm:w-44 h-10 rounded-xl border-2 font-bold focus:ring-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl shadow-2xl">
            {languageItems.map((item) => (
              <SelectItem key={item.value} value={item.value} className="rounded-lg font-medium">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>

      {/* Currency */}
      <SettingsRow icon={IndianRupee} label={tran("settings.currency")}>
        <Select
          items={currencyItems}
          value={currency}
          onValueChange={(value) => {
            if (!value) return;
            const v = value as Currency;
            setCurrency(v);
            updateConfig({ currency: v });
            void upsertSettingsMutation.mutateAsync({ currency: v });
            toast.success(tran("settings.msg.currency_updated"));
          }}
        >
          <SelectTrigger className="w-36 sm:w-44 h-10 rounded-xl border-2 font-bold focus:ring-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl shadow-2xl">
            {Object.values(Currency).map((curr) => (
              <SelectItem key={curr} value={curr} className="rounded-lg font-medium">
                {currencyItems[curr]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>

      {/* Date Format */}
      <SettingsRow icon={Calendar} label={tran("settings.date_format")}>
        <Select
          items={dateFormatItems}
          value={dateFormat}
          onValueChange={(value) => {
            if (!value) return;
            setDateFormat(value);
            updateConfig({ dateFormat: value });
            void upsertSettingsMutation.mutateAsync({ dateFormat: value });
            toast.success(tran("settings.msg.date_format_updated"));
          }}
        >
          <SelectTrigger className="w-36 sm:w-44 h-10 rounded-xl border-2 font-bold focus:ring-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl shadow-2xl">
            {dateFormatItems.map((item) => (
              <SelectItem key={item.value} value={item.value} className="rounded-lg font-medium">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>

      {/* Time Format */}
      <SettingsRow icon={Clock} label={tran("settings.time_format")}>
        <Select
          items={timeFormatItems}
          value={timeFormat}
          onValueChange={(value) => {
            if (!value) return;
            setTimeFormat(value);
            updateConfig({ timeFormat: value });
            void upsertSettingsMutation.mutateAsync({ timeFormat: value });
            toast.success(tran("settings.msg.time_format_updated"));
          }}
        >
          <SelectTrigger className="w-36 sm:w-44 h-10 rounded-xl border-2 font-bold focus:ring-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl shadow-2xl">
            {timeFormatItems.map((item) => (
              <SelectItem key={item.value} value={item.value} className="rounded-lg font-medium">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>

      {/* Locale */}
      <SettingsRow icon={Globe} label={tran("settings.locale")}>
        <Select
          items={localeItems}
          value={locale}
          onValueChange={(value) => {
            if (!value) return;
            const v = value as string;
            setLocale(v);
            updateConfig({ locale: v });
            void upsertSettingsMutation.mutateAsync({ locale: v });
            toast.success(tran("settings.msg.locale_updated"));
          }}
        >
          <SelectTrigger className="w-36 sm:w-44 h-10 rounded-xl border-2 font-bold focus:ring-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl shadow-2xl">
            {Object.entries(localeItems).map(([key, value]) => (
              <SelectItem key={key} value={key} className="rounded-lg font-medium">
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>

      {isDebug && (
        <SettingsRow icon={Terminal} label={tran("settings.developer_mode")}>
          <Button
            variant={isDevMode ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-xl font-bold px-5 sm:px-6",
              isDevMode && "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            )}
            onClick={async () => {
              const newValue = !isDevMode;
              setIsDevMode(newValue);
              updateConfig({ debug: newValue });
              await upsertSettingsMutation.mutateAsync({ debug: newValue });
              toast.success(tran(newValue ? "settings.msg.dev_mode_enabled" : "settings.msg.dev_mode_disabled"));
            }}
          >
            {isDevMode ? "ON" : "OFF"}
          </Button>
        </SettingsRow>
      )}
    </SettingsSection>
  );
}

