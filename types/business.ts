import type { CategoryType } from "@/lib/generated/prisma/enums";

export type PeriodFilter = "month" | "year" | "all";

export interface BusinessCategoryStats {
  income: number;
  expense: number;
  net: number;
  asset: number;
  equity: number;
  adjustment: number;
  breakdown: Record<CategoryType, number>;
}

export interface BusinessListItem {
  id: string;
  name: string;
  categoryStats: BusinessCategoryStats;
}
