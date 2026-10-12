"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PartyType } from "@/lib/generated/prisma/enums";
import { tran } from "@/lib/languages/i18n";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { Briefcase, CircleDot, Truck, Users } from "lucide-react";

interface BalanceCardProps {
  totalReceived: number;
  totalPaid: number;
  currency?: string;
  isInactive?: boolean;
  partyType?: PartyType | null;
}

const formatAmount = (amount: number) =>
  amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getPartyTypeConfig = (type: PartyType) => {
  switch (type) {
    case PartyType.CUSTOMER:
      return {
        label: tran("parties.customers"),
        icon: Users,
        className: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300 dark:border-sky-400/20",
      };
    case PartyType.SUPPLIER:
      return {
        label: tran("parties.suppliers"),
        icon: Truck,
        className: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300 dark:border-amber-400/20",
      };
    case PartyType.EMPLOYEE:
      return {
        label: tran("parties.employees"),
        icon: Briefcase,
        className: "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-300 dark:border-purple-400/20",
      };
    case PartyType.OTHER:
      return {
        label: tran("parties.other"),
        icon: CircleDot,
        className: "border-muted-foreground/20 bg-muted text-muted-foreground",
      };
    default:
      return {
        label: String(type),
        icon: CircleDot,
        className: "border-border bg-muted/50 text-muted-foreground",
      };
  }
};

export function BalanceCard({
  totalReceived,
  totalPaid,
  currency,
  isInactive,
  partyType
}: BalanceCardProps) {
  const netBalance = totalReceived - totalPaid;

  const isToReceive = netBalance < 0;
  const isToPay = netBalance > 0;
  const isSettled = netBalance === 0;

  const label = isSettled
    ? tran("parties.settled")
    : isToReceive
      ? tran("parties.to_receive")
      : tran("parties.to_pay");

  const partyConfig = partyType ? getPartyTypeConfig(partyType) : null;
  const PartyIcon = partyConfig?.icon;

  return (
    <Card className={cn(
      "relative m-1 overflow-hidden rounded-[2.5rem] border bg-card shadow-xs transition-all duration-300",
      !isInactive && "hover:-translate-y-1 hover:shadow-lg",
      isInactive && "grayscale-75"
    )}>
      {/* Accent bar */}
      <div
        className={clsx(
          "absolute inset-y-0 left-0 w-2",
          isToReceive
            ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            : isToPay
              ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              : "bg-muted"
        )}
      />

      {/* Top right corner party type */}
      {partyConfig && PartyIcon && (
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20">
          <Badge
            variant="outline"
            className={cn(
              "h-7 gap-1.5 px-3 rounded-full text-[11px] font-bold tracking-wide backdrop-blur-xs shadow-2xs transition-colors",
              partyConfig.className
            )}
          >
            <PartyIcon className="size-3.5" />
            <span>{partyConfig.label}</span>
          </Badge>
        </div>
      )}

      <div className="grid gap-6 px-8 py-10 lg:grid-cols-3 lg:gap-8 relative z-10">
        {/* Left content */}
        <div className="space-y-6 lg:col-span-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-70">
            {label}
          </p>

          <h1
            className={clsx(
              "text-5xl font-black lg:text-6xl tracking-tighter",
              isToReceive
                ? "text-emerald-600 dark:text-emerald-400"
                : isToPay
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground/60"
            )}
          >
            {currency}
            {formatAmount(Math.abs(netBalance))}
          </h1>

          <Separator className="lg:hidden opacity-30" />

          {/* Totals */}
          <div className="flex gap-12 pt-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                {tran("parties.you_pay")}
              </span>
              <span className="text-xl font-black text-rose-500 dark:text-rose-400 tracking-tight">
                {currency}
                {formatAmount(totalPaid)}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                {tran("parties.you_receive")}
              </span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {currency}
                {formatAmount(totalReceived)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
