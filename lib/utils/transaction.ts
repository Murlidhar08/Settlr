import { Currency } from "@/lib/generated/prisma/enums";
import { format } from "date-fns";
import { getActivePreferences } from "./formatters";

export const formatAmount = (
  amount: number,
  showSign: boolean = false,
  direction?: "IN" | "OUT",
): string => {
  const symbol = getCurrencySymbol();
  const formattedAmount = Math.abs(amount).toLocaleString("en-IN");

  let sign = "";
  if (showSign) {
    if (direction === "IN") sign = "+";
    else if (direction === "OUT") sign = "-";
    else sign = amount >= 0 ? "+" : "-";
  }

  return `${sign}${symbol}${formattedAmount}`;
};

export const getCurrencySymbol = (currency?: Currency): string => {
  const userCurrency = getActivePreferences().currency;
  switch (currency ?? userCurrency) {
    case Currency.USD:
      return "$";
    case Currency.EUR:
      return "€";
    case Currency.INR:
    default:
      return "₹";
  }
};

export const formatDate = (
  date: Date | string | number,
  dateFormat: string = "dd/MM/yyyy"
): string => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return format(d, dateFormat);
  } catch {
    return String(date);
  }
};

export const formatTime = (
  date: Date | string | number,
  timeFormat: string = "hh:mm a"
): string => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return format(d, timeFormat);
  } catch {
    return String(date);
  }
};
