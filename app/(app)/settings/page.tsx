"use client";

import { FooterButtons } from "@/components/footer-buttons";
import { useUserConfig } from "@/components/providers/user-config-provider";
import MobileNav from "@/components/tab/mobile-tab";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useSession } from "@/lib/auth/auth-client";
import { envClient } from "@/lib/env.client";
import { Currency, ThemeMode } from "@/lib/generated/prisma/enums";
import { tran } from "@/lib/languages/i18n";
import { cn } from "@/lib/utils";
import { useAppVersion } from "@/tanstacks/settings";
import { getInitials } from "@/utility/common-function";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  Clock,
  Globe,
  IndianRupee,
  KeyRoundIcon,
  Languages,
  Laptop,
  Link2Icon,
  LockKeyhole,
  LogOut,
  Moon,
  PaintbrushIcon,
  Skull,
  Sun,
  Terminal,
  Trash2Icon
} from "lucide-react";
import { useEffect, useState } from "react";


import { getFileUrl } from "@/lib/utils";
import { useUpsertUserSettings } from "@/tanstacks/settings";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, updateConfig, ...userConfig } = useUserConfig();
  const { data: session, isPending } = useSession();
  const { data: versionData } = useAppVersion();

  const [currency, setCurrency] = useState(userConfig.currency);
  const [locale, setLocale] = useState(userConfig.locale);
  const [dateFormat, setDateFormat] = useState(userConfig.dateFormat);
  const [timeFormat, setTimeFormat] = useState(userConfig.timeFormat);
  const [language, setLanguage] = useState(userConfig.language);
  const [isDevMode, setIsDevMode] = useState(false);
  const upsertSettingsMutation = useUpsertUserSettings();

  const searchParams = useSearchParams();
  const isDebug = searchParams.get("debug") === "true";

  const version = versionData || "Pending ...";

  useEffect(() => {
    // Load dev mode from localStorage
    const savedDevMode = localStorage.getItem("dev_mode") === "true";
    setIsDevMode(savedDevMode);
  }, []);

  if (isPending)
    return <SettingsSkeleton />;

  const handleLogout = () => {
    router.push("/logout");
  };



  return (
    <div className="min-h-screen bg-background pb-34">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl mt-6 space-y-8 px-6"
      >
        {/* USER */}
        <motion.div
          variants={itemVariants}
          onClick={() => { router.push("/settings/profile") }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-4 p-5 rounded-3xl bg-card border shadow-sm cursor-pointer transition-shadow hover:shadow-md"
        >
          <div className="relative group">
            <Avatar className="h-16 w-16 ring-4 ring-background transition-transform duration-500 group-hover:scale-110">
              <AvatarImage
                src={getFileUrl(session?.user?.image)}
                alt={session?.user?.name ?? "User avatar"}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                {getInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-xl tracking-tight">{session?.user?.name ?? "Unknown"}</p>
              {session?.user?.username && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  @{session.user.username}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-muted-foreground opacity-70">{session?.user?.email ?? "Unknown"}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
            <ChevronRight className="text-muted-foreground" size={20} />
          </div>
        </motion.div>

        {/* GENERAL */}
        <motion.div variants={itemVariants}>
          <Section title={tran("settings.general")}>
            {/* Currency */}
            <Row icon={IndianRupee} label={tran("settings.currency")}>
              <Select
                items={currencyItems}
                value={currency}
                onValueChange={(value) => {
                  if (!value) return
                  const v = value as Currency
                  setCurrency(v)
                  updateConfig({ currency: v })
                  void upsertSettingsMutation.mutateAsync({ currency: v })
                  toast.success(tran("settings.msg.currency_updated"))
                }}
              >
                <SelectTrigger className="w-45 h-10 rounded-xl border-2 font-bold focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl">
                  {Object.values(Currency).map((currency) => (
                    <SelectItem key={currency} value={currency} className="rounded-lg font-medium">
                      {currencyItems[currency]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>

            {/* Locale */}
            <Row icon={Globe} label={tran("settings.locale")}>
              <Select
                items={localeItems}
                value={locale}
                onValueChange={(value) => {
                  if (!value) return
                  const v = value as string
                  setLocale(v)
                  updateConfig({ locale: v })
                  void upsertSettingsMutation.mutateAsync({ locale: v })
                  toast.success(tran("settings.msg.locale_updated"))
                }}
              >
                <SelectTrigger className="w-45 h-10 rounded-xl border-2 font-bold focus:ring-primary/20">
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
            </Row>

            <Row icon={Calendar} label={tran("settings.date_format")}>
              <Select
                items={dateFormatItems}
                value={dateFormat}
                onValueChange={(value) => {
                  if (!value) return
                  setDateFormat(value)
                  updateConfig({ dateFormat: value })
                  void upsertSettingsMutation.mutateAsync({ dateFormat: value })
                  toast.success(tran("settings.msg.date_format_updated"))
                }}
              >
                <SelectTrigger className="w-45 h-10 rounded-xl border-2 font-bold focus:ring-primary/20">
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
            </Row>

            <Row icon={Clock} label={tran("settings.time_format")}>
              <Select
                items={timeFormatItems}
                value={timeFormat}
                onValueChange={(value) => {
                  if (!value) return
                  setTimeFormat(value)
                  updateConfig({ timeFormat: value })
                  void upsertSettingsMutation.mutateAsync({ timeFormat: value })
                  toast.success(tran("settings.msg.time_format_updated"))
                }}
              >
                <SelectTrigger className="w-45 h-10 rounded-xl border-2 font-bold focus:ring-primary/20">
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
            </Row>

            <Row icon={Languages} label={tran("settings.language")}>
              <Select
                items={languageItems}
                value={language}
                onValueChange={(value) => {
                  if (!value) return
                  setLanguage(value)
                  updateConfig({ language: value })
                  void upsertSettingsMutation.mutateAsync({ language: value })
                  toast.success(tran("settings.msg.language_updated"))
                }}
              >
                <SelectTrigger className="w-45 h-10 rounded-xl border-2 font-bold focus:ring-primary/20">
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
            </Row>

            {isDebug && (
              <Row icon={Terminal} label={tran("settings.developer_mode")}>
                <Button
                  variant={isDevMode ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-xl font-bold px-6",
                    isDevMode && "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  )}
                  onClick={() => {
                    const newValue = !isDevMode;
                    setIsDevMode(newValue);
                    localStorage.setItem("dev_mode", String(newValue));
                    toast.success(tran(newValue ? "settings.msg.dev_mode_enabled" : "settings.msg.dev_mode_disabled"));
                  }}
                >
                  {isDevMode ? "ON" : "OFF"}
                </Button>
              </Row>
            )}
          </Section >
        </motion.div >

        {/* APPEARANCE */}
        < motion.div variants={itemVariants} >
          <Section title={tran("settings.appearance")}>
            <Row icon={PaintbrushIcon} label={tran("settings.theme_mode")}>
              <div className="flex gap-1 bg-muted/50 rounded-2xl p-1.5 border-2 focus-within:border-primary/10">
                {[
                  { id: ThemeMode.AUTO, icon: Laptop, label: tran("settings.auto") },
                  { id: ThemeMode.LIGHT, icon: Sun, label: tran("settings.light") },
                  { id: ThemeMode.DARK, icon: Moon, label: tran("settings.dark") },
                ].map((mode) => (
                  <Button
                    key={mode.id}
                    variant={theme === mode.id ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all px-4 h-9",
                      theme === mode.id && "bg-background shadow-lg scale-100 text-primary",
                      theme !== mode.id && "opacity-60 hover:opacity-100"
                    )}
                    onClick={async () => {
                      setTheme(mode.id);
                      updateConfig({ theme: mode.id });
                      await upsertSettingsMutation.mutateAsync({ theme: mode.id });
                    }}
                  >
                    <mode.icon size={15} />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </Button>
                ))}
              </div>
            </Row>
          </Section>
        </motion.div >

        {/* DATA MANAGEMENT */}
        < motion.div variants={itemVariants} >
          <Section title={tran("settings.data_management")}>
            <Row
              icon={Trash2Icon}
              label={tran("settings.recycle_bin")}
              href="/settings/recycle-bin"
            />
          </Section>
        </motion.div >

        {/* SECURITY */}
        < motion.div variants={itemVariants} >
          <Section title={tran("settings.security_privacy")}>
            <Row
              icon={Link2Icon}
              label={tran("settings.linked_accounts")}
              href="/settings/link-account"
            />
            <Row
              icon={LockKeyhole}
              label={tran("settings.safety_security")}
              href="/settings/security"
            />
            <Row
              icon={KeyRoundIcon}
              label={tran("settings.active_sessions")}
              href="/settings/session-management"
            />
            <Row
              icon={Skull}
              label={tran("settings.danger_zone")}
              labelClassName="text-rose-600"
              iconContainerClassName="bg-rose-100 text-rose-600"
              href="/settings/danger"
            />
          </Section>
        </motion.div >

        {/* App Version */}
        <motion.div
          variants={itemVariants}
          className="text-center space-y-2 opacity-50 pt-4"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Build Version {version}</p>
          <p className="text-[9px] font-medium italic">© {new Date().getFullYear()} {envClient.NEXT_PUBLIC_APP_NAME}. All rights reserved.</p>
        </motion.div>
      </motion.div >

      <FooterButtons bottomSpace={true}>
        <Button onClick={handleLogout} variant="destructive" className="h-14 w-14 md:w-auto md:px-12 rounded-full md:gap-3 font-semibold uppercase bg-rose-500 hover:bg-rose-500/70 text-white shadow-lg shadow-rose-500/50 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 p-0 md:py-2">
          <LogOut className="size-5 md:size-6" />
          <span className="hidden md:block text-center font-black tracking-[0.2em] text-sm">
            {tran("settings.logout")}
          </span>
        </Button>
      </FooterButtons>

      <MobileNav />
    </div >
  );
}

import { currencyItems, dateFormatItems, languageItems, localeItems, timeFormatItems } from "@/lib/constants/common";

function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl pb-32 mt-6 space-y-8 px-6 animate-pulse">
        {/* Profile Card Skeleton */}
        <div className="h-28 w-full rounded-[2rem] bg-muted/10 border border-border/50 p-6 flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="h-10 w-10 rounded-full bg-muted/20" />
        </div>

        {/* Sections Skeletons */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-4 w-28 ml-2 bg-muted/20 rounded-md" />
            <div className="rounded-2xl border bg-muted/5 divide-y divide-border/20">
              {[...Array(i === 2 ? 4 : 3)].map((_, j) => (
                <div key={j} className="h-16 flex items-center px-4 gap-4">
                  <div className="h-8 w-8 rounded-full bg-muted/20" />
                  <div className="h-4 flex-1 bg-muted/20 rounded-md" />
                  <div className="h-10 w-28 rounded-xl bg-muted/20" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- components ---------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 pl-2">
        {title}
      </h3>
      <div className="rounded-2xl bg-background border shadow-sm divide-y">
        {children}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, labelClassName, iconContainerClassName, href, children }: {
  icon: React.ElementType; label: string; labelClassName?: string; iconContainerClassName?: string; href?: string; children?: React.ReactNode
}) {
  const router = useRouter();
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-4 px-4 h-16 group cursor-pointer rounded-xl hover:bg-primary/5"
      onClick={() => { if (href) router.push(href as any) }}
    >
      <div className={cn("h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all", iconContainerClassName)}>
        <Icon size={16} />
      </div>
      <p className={cn("flex-1 font-semibold text-lg", labelClassName)}>{label}</p>
      {
        href ? <ChevronRight className="text-muted-foreground" /> : children ? children : null
      }
    </motion.div>
  );
}
