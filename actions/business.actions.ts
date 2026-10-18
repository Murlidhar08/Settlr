"use server";

// Package
import { getUserSession } from "@/lib/auth/auth";
import { CategoryType, FinancialAccountType, MoneyType } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/prisma";
import { revalidatePath } from "next/cache";

export async function addBusiness(name: string) {
  if (!name) {
    throw new Error("Business name is required");
  }

  const session = await getUserSession();
  if (!session) {
    console.error("User is not logged in.")
    return null;
  }

  const newBusiness = await prisma.business.create({
    data: {
      name: name,
      ownerId: session.user.id
    }
  });

  // Automatically create default financial accounts (Cash, Owner Withdrawal, Owner Investment, Expense, Sales)
  await createDefaultAccountsForBusiness(newBusiness.id);

  revalidatePath("/dashboard");
  revalidatePath("/business");
  return newBusiness;
}

export async function switchBusiness(businessId: string, redirectTo?: string | null) {
  // 1. Get the session using the Better-Auth API for server context
  const session = await getUserSession();

  if (!session) {
    throw new Error("User is not logged in.");
  }

  // 2. Optimization: Skip if already active
  if (!businessId || session.user.activeBusinessId === businessId) {
    return { success: true };
  }

  try {
    // 3. Update the User record in the database
    // Better-Auth will pick this up on the next request/validation
    await prisma.user.update({
      where: { id: session.user.id },
      data: { activeBusinessId: businessId },
    });

    // 4. Revalidate paths to clear Next.js Data Cache
    revalidatePath("/dashboard");
    if (redirectTo) {
      revalidatePath(redirectTo);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to switch business:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function updateBusiness(
  id: string,
  name?: string,
  defaults?: {
    defAccId?: string | null;
    defIncomeAccId?: string | null;
    defExpenseAccId?: string | null;
  }
) {
  const session = await getUserSession();
  if (!session) return null;

  const data: any = {};
  if (name) data.name = name;
  if (defaults) {
    if (defaults.defAccId !== undefined) data.defAccId = defaults.defAccId;
    if (defaults.defIncomeAccId !== undefined) data.defIncomeAccId = defaults.defIncomeAccId;
    if (defaults.defExpenseAccId !== undefined) data.defExpenseAccId = defaults.defExpenseAccId;
  }

  const updated = await prisma.business.update({
    where: {
      id: id,
      ownerId: session.user.id // Security check
    },
    data
  });

  revalidatePath("/dashboard");
  revalidatePath("/business");
  return updated;
}

export async function deleteBusiness(id: string) {
  const session = await getUserSession();
  if (!session) return null;

  // Check if it's the only business - optional but recommended
  const count = await prisma.business.count({
    where: { ownerId: session.user.id, isDelete: false }
  });

  if (count <= 1) {
    throw new Error("You must have at least one business.");
  }

  await prisma.business.update({
    where: {
      id: id,
      ownerId: session.user.id // Security check
    },
    data: {
      isDelete: true
    }
  });

  // If the deleted business was active, switch to another one
  if (session.user.activeBusinessId === id) {
    const other = await prisma.business.findFirst({
      where: { ownerId: session.user.id, isDelete: false }
    });
    if (other) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { activeBusinessId: other.id }
      });
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/business");
  return { success: true };
}

import type { BusinessListItem, PeriodFilter } from "@/types";

export async function getBusinessList(
  period: PeriodFilter = "month"
): Promise<BusinessListItem[]> {
  const session = await getUserSession();

  if (!session) {
    console.error("User is not logged in.");
    return [];
  }

  // 1. Fetch user businesses and their category accounts
  const businesses = await prisma.business.findMany({
    where: { ownerId: session.user.id, isDelete: false },
    select: {
      id: true,
      name: true,
      financialAccounts: {
        where: {
          type: FinancialAccountType.CATEGORY,
          isDelete: false,
        },
        select: {
          id: true,
          categoryType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (businesses.length === 0) {
    return [];
  }

  // 2. Date filtering based on period
  const now = new Date();
  let dateFilter: any = {};
  if (period === "month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    dateFilter = { date: { gte: startOfMonth } };
  } else if (period === "year") {
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    dateFilter = { date: { gte: startOfYear } };
  }

  // 3. Fetch all active transactions for these businesses in the specified period
  const businessIds = businesses.map((b) => b.id);
  const transactions = await prisma.transaction.findMany({
    where: {
      businessId: { in: businessIds },
      isDelete: false,
      ...dateFilter,
    },
    select: {
      businessId: true,
      amount: true,
      fromAccountId: true,
      toAccountId: true,
    },
  });

  // 4. Group transactions by businessId
  const txsByBusiness = new Map<string, typeof transactions>();
  for (const tx of transactions) {
    const list = txsByBusiness.get(tx.businessId);
    if (list) {
      list.push(tx);
    } else {
      txsByBusiness.set(tx.businessId, [tx]);
    }
  }

  // 5. Aggregate category amounts per business
  return businesses.map((business) => {
    const categoryMap = new Map<string, CategoryType>();
    for (const acc of business.financialAccounts) {
      if (acc.categoryType) {
        categoryMap.set(acc.id, acc.categoryType);
      }
    }

    let income = 0;
    let expense = 0;
    let asset = 0;
    let equity = 0;
    let adjustment = 0;

    const bTxs = txsByBusiness.get(business.id) || [];
    for (const tx of bTxs) {
      const amount = Number(tx.amount) || 0;
      const fromCat = categoryMap.get(tx.fromAccountId);
      const toCat = categoryMap.get(tx.toAccountId);

      // Income: funds flowing FROM Income account (subtracted if reversed into Income account)
      if (fromCat === CategoryType.INCOME) income += amount;
      if (toCat === CategoryType.INCOME) income -= amount;

      // Expense: funds flowing INTO Expense account (subtracted if refunded out of Expense account)
      if (toCat === CategoryType.EXPENSE) expense += amount;
      if (fromCat === CategoryType.EXPENSE) expense -= amount;

      // Asset: funds flowing INTO Asset account
      if (toCat === CategoryType.ASSET) asset += amount;
      if (fromCat === CategoryType.ASSET) asset -= amount;

      // Equity: funds contributed from Equity into business
      if (fromCat === CategoryType.EQUITY) equity += amount;
      if (toCat === CategoryType.EQUITY) equity -= amount;

      // Adjustment
      if (toCat === CategoryType.ADJUSTMENT || fromCat === CategoryType.ADJUSTMENT) {
        adjustment += amount;
      }
    }

    const safeIncome = Math.max(0, income);
    const safeExpense = Math.max(0, expense);

    return {
      id: business.id,
      name: business.name,
      categoryStats: {
        income: safeIncome,
        expense: safeExpense,
        net: safeIncome - safeExpense,
        asset: Math.max(0, asset),
        equity: Math.max(0, equity),
        adjustment: Math.max(0, adjustment),
        breakdown: {
          [CategoryType.INCOME]: safeIncome,
          [CategoryType.EXPENSE]: safeExpense,
          [CategoryType.ASSET]: Math.max(0, asset),
          [CategoryType.EQUITY]: Math.max(0, equity),
          [CategoryType.ADJUSTMENT]: Math.max(0, adjustment),
        },
      },
    };
  });
}

export async function getBusinessDetailsWithStats(businessId: string) {
  const session = await getUserSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // 1. Get business and verify ownership
  const business = await prisma.business.findFirst({
    where: {
      id: businessId,
      ownerId: session.user.id,
      isDelete: false
    }
  });

  if (!business) {
    throw new Error("Business not found");
  }

  // 2. Count parties by type
  const customerCount = await prisma.party.count({
    where: {
      businessId,
      isDelete: false,
      financialAccounts: {
        some: {
          partyType: "CUSTOMER",
          isDelete: false
        }
      }
    }
  });

  const supplierCount = await prisma.party.count({
    where: {
      businessId,
      isDelete: false,
      financialAccounts: {
        some: {
          partyType: "SUPPLIER",
          isDelete: false
        }
      }
    }
  });

  const employeeCount = await prisma.party.count({
    where: {
      businessId,
      isDelete: false,
      financialAccounts: {
        some: {
          partyType: "EMPLOYEE",
          isDelete: false
        }
      }
    }
  });

  const otherCount = await prisma.party.count({
    where: {
      businessId,
      isDelete: false,
      financialAccounts: {
        some: {
          partyType: "OTHER",
          isDelete: false
        }
      }
    }
  });

  // 3. Count total active transactions
  const transactionCount = await prisma.transaction.count({
    where: {
      businessId,
      isDelete: false
    }
  });

  // 4. Fetch financial accounts
  const financialAccounts = await prisma.financialAccount.findMany({
    where: {
      businessId,
      isDelete: false,
    },
    select: {
      id: true,
      name: true,
      type: true,
      moneyType: true,
      partyType: true,
      categoryType: true,
      isActive: true,
    }
  });

  // 5. Fetch all transactions to calculate balances
  const transactions = await prisma.transaction.findMany({
    where: {
      businessId,
      isDelete: false
    },
    select: {
      amount: true,
      fromAccountId: true,
      toAccountId: true,
      partyId: true
    }
  });

  // Calculate balances for each financial account
  const accountBalances = financialAccounts.map(account => {
    let totalIn = 0;
    let totalOut = 0;

    for (const tx of transactions) {
      if (tx.toAccountId === account.id) {
        totalIn += Number(tx.amount);
      }
      if (tx.fromAccountId === account.id) {
        totalOut += Number(tx.amount);
      }
    }

    return {
      ...account,
      balance: totalIn - totalOut
    };
  });

  // Calculate overall stats
  let liquidCash = 0;
  let receivable = 0;
  let payable = 0;

  accountBalances.forEach(acc => {
    if (acc.type === "MONEY" && acc.isActive) {
      liquidCash += acc.balance;
    } else if (acc.type === "PARTY" && acc.isActive) {
      if (acc.balance > 0) {
        receivable += acc.balance;
      } else if (acc.balance < 0) {
        payable += Math.abs(acc.balance);
      }
    }
  });

  const netWorth = liquidCash + receivable - payable;

  return {
    business,
    counts: {
      customer: customerCount,
      supplier: supplierCount,
      employee: employeeCount,
      other: otherCount,
      party: customerCount + supplierCount + employeeCount + otherCount,
      transaction: transactionCount,
      accounts: financialAccounts.length
    },
    accounts: accountBalances,
    stats: {
      liquidCash,
      receivable,
      payable,
      netWorth
    }
  };
}

// Helper function
export async function createDefaultAccountsForBusiness(businessId: string) {
  const cashAcc = await prisma.financialAccount.create({
    data: {
      name: "Cash",
      type: FinancialAccountType.MONEY,
      moneyType: MoneyType.CASH,
      isSystem: true,
      businessId,
    }
  });

  const incomeAcc = await prisma.financialAccount.create({
    data: {
      name: "Income",
      type: FinancialAccountType.CATEGORY,
      categoryType: CategoryType.INCOME,
      isSystem: true,
      businessId,
    }
  });

  const expenseAcc = await prisma.financialAccount.create({
    data: {
      name: "Expense",
      type: FinancialAccountType.CATEGORY,
      categoryType: CategoryType.EXPENSE,
      isSystem: true,
      businessId,
    }
  });

  await prisma.financialAccount.create({
    data: {
      name: "Adjustment",
      type: FinancialAccountType.CATEGORY,
      categoryType: CategoryType.ADJUSTMENT,
      isSystem: true,
      businessId,
    }
  });

  // Update business with default account IDs
  await prisma.business.update({
    where: { id: businessId },
    data: {
      defAccId: cashAcc.id,
      defIncomeAccId: incomeAcc.id,
      defExpenseAccId: expenseAcc.id,
    }
  });

  return { cashAcc, expenseAcc, incomeAcc };
}