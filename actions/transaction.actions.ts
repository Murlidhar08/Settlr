"use server";

// Lib
import { getServerSession, getUserSession } from "@/lib/auth/auth";
import { Prisma } from "@/lib/generated/prisma/client";
import { CategoryType, FinancialAccountType } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/prisma";
import { uploadFile, deleteFile, validateMagicBytes } from "@/lib/file-operations";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { MAX_TRANSACTION_FILE_SIZE_BYTES, MAX_TRANSACTION_FILE_SIZE_MB } from "@/lib/config/constants";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import path from "path";
import crypto from "crypto";

export async function addTransaction(transactionData: any, pathToRevalidate?: string) {
  const session = await getUserSession();

  if (!session?.user.activeBusinessId) {
    throw new Error("No active business found in session");
  }

  const businessId = session.user.activeBusinessId;
  const userId = session.user.id;

  // Validation
  if (!transactionData.amount) throw new Error("Amount is required");
  if (!transactionData.fromAccountId) throw new Error("Source account is required");
  if (!transactionData.toAccountId) throw new Error("Destination account is required");

  // Fetch accounts to validate business and types
  const [fromAccount, toAccount] = await Promise.all([
    prisma.financialAccount.findUnique({ where: { id: transactionData.fromAccountId, isDelete: false } }),
    prisma.financialAccount.findUnique({ where: { id: transactionData.toAccountId, isDelete: false } })
  ]);

  if (!fromAccount || !toAccount) throw new Error("One or both accounts not found");

  // 1. BUSINESS ISOLATION
  if (fromAccount.businessId !== businessId || toAccount.businessId !== businessId) {
    throw new Error("Cross-business transactions are strictly prohibited.");
  }

  // 2. ACTIVE CHECK
  if (!fromAccount.isActive || !toAccount.isActive) {
    throw new Error("Cannot perform transactions with inactive accounts.");
  }

  // 3. CATEGORY TO CATEGORY RESTRICTION
  if (fromAccount.type === FinancialAccountType.CATEGORY && toAccount.type === FinancialAccountType.CATEGORY) {
    if (fromAccount.categoryType === CategoryType.ADJUSTMENT && toAccount.categoryType === CategoryType.ADJUSTMENT) {
      throw new Error("Direct transfers between two adjustment accounts are not allowed.");
    }
    if (fromAccount.categoryType !== CategoryType.ADJUSTMENT && toAccount.categoryType !== CategoryType.ADJUSTMENT) {
      throw new Error("Direct Category to Category transfers are only allowed for Adjustments.");
    }
  }

  if (transactionData.partyId) {
    const party = await prisma.party.findUnique({ where: { id: transactionData.partyId, isDelete: false } });
    if (!party?.isActive) throw new Error("Cannot perform transactions with an inactive party.");
    if (party.businessId !== businessId) throw new Error("Party does not belong to this business.");
  }

  let result;

  // Handle Invalid Date
  const finalDate = (transactionData.date && !isNaN(new Date(transactionData.date).getTime()))
    ? new Date(transactionData.date)
    : new Date();

  // If id exists and not zero -> update
  if (!!transactionData.id) {
    const updateData: any = {
      amount: new Prisma.Decimal(transactionData.amount),
      date: finalDate,
      description: transactionData.description || null,
      business: { connect: { id: businessId } },
      user: { connect: { id: userId } },
      fromAccount: { connect: { id: transactionData.fromAccountId } },
      toAccount: { connect: { id: transactionData.toAccountId } },
      party: transactionData.partyId
        ? { connect: { id: transactionData.partyId } }
        : { disconnect: true }
    };

    if (Array.isArray(transactionData.documents)) {
      const existingDocIds = transactionData.documents
        .filter((d: any) => d.id)
        .map((d: any) => d.id);

      updateData.documents = {
        deleteMany: {
          id: { notIn: existingDocIds },
        },
        create: transactionData.documents
          .filter((d: any) => !d.id)
          .map((doc: any) => ({
            fileName: doc.fileName,
            fileSize: doc.fileSize ? Number(doc.fileSize) : null,
            fileType: doc.fileType || null,
            documentRelativePath: doc.documentRelativePath,
          })),
      };
    }

    result = await prisma.transaction.update({
      where: {
        id: transactionData.id,
      },
      data: updateData,
      include: {
        documents: true,
      },
    });
  }

  // Else -> create
  else {
    const createData: any = {
      amount: new Prisma.Decimal(transactionData.amount),
      date: finalDate,
      description: transactionData.description || null,
      business: { connect: { id: businessId } },
      user: { connect: { id: userId } },
      fromAccount: { connect: { id: transactionData.fromAccountId } },
      toAccount: { connect: { id: transactionData.toAccountId } },
    };

    if (transactionData.partyId) {
      createData.party = { connect: { id: transactionData.partyId } };
    }

    if (Array.isArray(transactionData.documents) && transactionData.documents.length > 0) {
      createData.documents = {
        create: transactionData.documents.map((doc: any) => ({
          fileName: doc.fileName,
          fileSize: doc.fileSize ? Number(doc.fileSize) : null,
          fileType: doc.fileType || null,
          documentRelativePath: doc.documentRelativePath,
        })),
      };
    }

    result = await prisma.transaction.create({
      data: createData,
      include: {
        documents: true,
      },
    });
  }

  if (pathToRevalidate)
    revalidatePath(pathToRevalidate)

  return {
    ...result,
    amount: Number(result.amount)
  };
}

export async function deleteTransaction(transactionId: string, redirectPath?: string) {
  const session = await getUserSession()

  if (!session?.user.activeBusinessId) {
    throw new Error("Unauthorized")
  }

  await prisma.transaction.update({
    where: {
      id: transactionId,
      businessId: session.user.activeBusinessId,
    },
    data: {
      isDelete: true
    }
  })

  // Redirect after delete if path is provided
  if (redirectPath) {
    redirect(redirectPath as any)
  }

  return { success: true }
}

export const getRecentTransactions = async function getRecentTransactions() {
  const session = await getUserSession();
  let businessId = session?.user.activeBusinessId;

  if (!businessId && session?.user.id) {
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true }
    });
    businessId = business?.id;
  }

  if (!businessId) return [];

  const transactions = await prisma.transaction.findMany({
    where: {
      businessId: businessId,
      isDelete: false,
      fromAccount: { isActive: true },
      toAccount: { isActive: true }
    },
    orderBy: {
      date: "desc",
    },
    take: 8,
    include: {
      party: {
        select: { name: true },
      },
      fromAccount: {
        select: { name: true, type: true }
      },
      toAccount: {
        select: { name: true, type: true }
      }
    },
  });

  return transactions.map(tx => ({
    ...tx,
    amount: Number(tx.amount)
  }));
};

export const getCashbookTransactions = async function getCashbookTransactions(filters: {
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const session = await getUserSession();
  let businessId = session?.user.activeBusinessId;

  if (!businessId && session?.user.id) {
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true }
    });
    businessId = business?.id;
  }

  if (!businessId) return { transactions: [], totalIn: 0, totalOut: 0 };

  const where: any = {
    businessId,
    isDelete: false,
  };

  // Account type filter (Cash/Online) removed as mode is gone

  // Date range filter
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      where.date.gte = start;
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate || filters.startDate!);
      end.setHours(23, 59, 59, 999);
      where.date.lte = end;
    }
  }

  // Search filter (description or amount)
  if (filters.search) {
    const searchNum = parseFloat(filters.search);
    where.OR = [
      { description: { contains: filters.search, mode: "insensitive" } },
      !isNaN(searchNum) ? { amount: { equals: searchNum } } : undefined,
    ].filter(Boolean);
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: [
      { date: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      fromAccount: { select: { name: true, type: true } },
      toAccount: { select: { name: true, type: true } },
      party: { select: { name: true } }
    }
  });

  let totalIn = 0;
  let totalOut = 0;

  transactions.forEach(tx => {
    const amount = Number(tx.amount);
    if (tx.toAccount.type === FinancialAccountType.MONEY) totalIn += amount;
    if (tx.fromAccount.type === FinancialAccountType.MONEY) totalOut += amount;
  });

  return {
    transactions: transactions.map(transaction => ({
      ...transaction,
      amount: Number(transaction.amount)
    })),
    totalIn,
    totalOut,
  };
};

export const getPartyStatement = async function getPartyStatement(partyId: string, filters: {
  mode?: string;
  direction?: string;
  startDate?: string;
  endDate?: string;
}) {
  const session = await getUserSession();
  const businessId = session?.user.activeBusinessId || "";

  const where: any = {
    businessId,
    partyId,
    isDelete: false,
  };

  // direction filter (translated to perspective in the component, but here we can handle it at DB if we know party account)
  if (filters.direction) {
    const partyAccount = await prisma.financialAccount.findFirst({
      where: { partyId, businessId },
      select: { id: true }
    });

    if (partyAccount) {
      if (filters.direction === "IN") {
        // Perspective IN means money flows FROM Party TO Us
        where.fromAccountId = partyAccount.id;
      } else if (filters.direction === "OUT") {
        // Perspective OUT means money flows FROM Us TO Party
        where.toAccountId = partyAccount.id;
      }
    }
  }

  // Date range filter
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      where.date.gte = start;
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      where.date.lte = end;
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      fromAccount: { select: { name: true, type: true } },
      toAccount: { select: { name: true, type: true } }
    }
  });

  const party = await prisma.party.findUnique({
    where: { id: partyId },
    include: {
      financialAccounts: {
        select: { partyType: true },
        take: 1
      }
    }
  });

  const partyWithTyped = party ? {
    ...party,
    type: party.financialAccounts[0]?.partyType
  } : null;

  return {
    party: partyWithTyped,
    transactions: transactions.map(tx => ({ ...tx, amount: Number(tx.amount) })),
  };
};

export const getAccountStats = async function getAccountStats(accountId: string, period: 'month' | 'year' | 'all' = 'all') {
  const session = await getUserSession();
  const businessId = session?.user.activeBusinessId || "";

  const account = await prisma.financialAccount.findUnique({
    where: { id: accountId, businessId },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  const now = new Date();
  let dateFilter = {};
  if (period === 'month') {
    dateFilter = { date: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } };
  } else if (period === 'year') {
    dateFilter = { date: { gte: new Date(now.getFullYear(), 0, 1) } };
  }

  const [inResult, outResult, allInResult, allOutResult] = await Promise.all([
    // Stats for the specific period
    prisma.transaction.aggregate({
      where: {
        businessId,
        toAccountId: accountId,
        isDelete: false,
        ...dateFilter
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        businessId,
        fromAccountId: accountId,
        isDelete: false,
        ...dateFilter
      },
      _sum: {
        amount: true,
      },
    }),
    // Always calculate total balance from all-time
    prisma.transaction.aggregate({
      where: {
        businessId,
        toAccountId: accountId,
        isDelete: false,
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        businessId,
        fromAccountId: accountId,
        isDelete: false,
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const totalIn = Number(inResult._sum.amount || 0);
  const totalOut = Number(outResult._sum.amount || 0);

  const allTimeIn = Number(allInResult._sum.amount || 0);
  const allTimeOut = Number(allOutResult._sum.amount || 0);

  if (account.type === FinancialAccountType.PARTY) {
    return {
      totalIn: totalOut, // Period In
      totalOut: totalIn, // Period Out
      balance: allTimeOut - allTimeIn, // All-time balance
    };
  }

  return {
    totalIn,
    totalOut,
    balance: allTimeIn - allTimeOut,
  };
};

export const getAccountTransactions = async function getAccountTransactions(
  accountId: string,
  pagination?: { limit?: number; page?: number },
  period: 'month' | 'year' | 'all' = 'all',
  search?: string,
  sortBy: 'date' | 'title' | 'price' = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  const session = await getUserSession();
  const businessId = session?.user.activeBusinessId || "";

  const account = await prisma.financialAccount.findUnique({
    where: { id: accountId, businessId },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  const limit = pagination?.limit || 20;
  const page = pagination?.page || 1;
  const skip = (page - 1) * limit;

  const where: Prisma.TransactionWhereInput = {
    businessId,
    OR: [
      { fromAccountId: accountId },
      { toAccountId: accountId },
    ],
    isDelete: false,
    ...(period !== 'all' ? {
      date: {
        gte: period === 'month'
          ? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          : new Date(new Date().getFullYear(), 0, 1)
      }
    } : {})
  };

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    const searchConditions: Prisma.TransactionWhereInput[] = [
      { description: { contains: trimmedSearch, mode: 'insensitive' } },
      { party: { name: { contains: trimmedSearch, mode: 'insensitive' } } },
      { fromAccount: { name: { contains: trimmedSearch, mode: 'insensitive' } } },
      { toAccount: { name: { contains: trimmedSearch, mode: 'insensitive' } } },
    ];

    if (!isNaN(Number(trimmedSearch))) {
      searchConditions.push({
        amount: { equals: new Prisma.Decimal(trimmedSearch) }
      });
    }

    where.AND = [
      {
        OR: searchConditions
      }
    ];
  }

  let orderBy: Prisma.TransactionOrderByWithRelationInput | Prisma.TransactionOrderByWithRelationInput[];
  if (sortBy === 'price') {
    orderBy = [
      { amount: sortOrder },
      { date: 'desc' }
    ];
  } else if (sortBy === 'title') {
    orderBy = [
      { description: sortOrder },
      { date: 'desc' }
    ];
  } else {
    orderBy = { date: sortOrder };
  }

  const [transactions, totalTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy,
      take: limit,
      skip: skip,
      include: {
        fromAccount: { select: { name: true, type: true } },
        toAccount: { select: { name: true, type: true } },
        party: { select: { name: true } }
      }
    }),
    prisma.transaction.count({
      where
    })
  ]);

  return {
    account,
    totalTransactions,
    transactions: transactions.map(tx => ({ ...tx, amount: Number(tx.amount) })),
  };
};

export const getBudgetInsights = async function getBudgetInsights() {
  const session = await getUserSession();
  const businessId = session?.user.activeBusinessId;

  if (!businessId) return null;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Fetch transactions for the current month
  const transactions = await prisma.transaction.findMany({
    where: {
      businessId,
      date: { gte: startOfMonth },
      isDelete: false,
      fromAccount: { isActive: true },
      toAccount: { isActive: true }
    },
    include: {
      fromAccount: { select: { name: true, type: true } },
      toAccount: { select: { name: true, type: true } }
    }
  });

  const categories: Record<string, number> = {};
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(tx => {
    const amount = Number(tx.amount);
    // Expense categorization
    if (tx.fromAccount.type === FinancialAccountType.MONEY && tx.toAccount.type === FinancialAccountType.CATEGORY) {
      categories[tx.toAccount.name] = (categories[tx.toAccount.name] || 0) + amount;
      totalExpense += amount;
    }
    // Income categorization
    if (tx.fromAccount.type === FinancialAccountType.CATEGORY && tx.toAccount.type === FinancialAccountType.MONEY) {
      totalIncome += amount;
    }
  });

  const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  const topExpense = sortedCategories[0];

  return {
    totalIncome,
    totalExpense,
    topExpense,
    hasTransactions: transactions.length > 0
  };
};

export async function getTransactionDetail(transactionId: string) {
  const session = await getUserSession();
  if (!session?.user.activeBusinessId) {
    throw new Error("Unauthorized");
  }

  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      businessId: session.user.activeBusinessId,
    },
    include: {
      party: { select: { id: true, name: true, contactNo: true } },
      toAccount: { select: { id: true, name: true, type: true, moneyType: true, categoryType: true, party: { select: { id: true, name: true } } } },
      fromAccount: { select: { id: true, name: true, type: true, moneyType: true, categoryType: true, party: { select: { id: true, name: true } } } },
      user: { select: { name: true } },
      documents: true,
    },
  });

  if (!transaction) return null;

  return {
    ...transaction,
    amount: Number(transaction.amount)
  };
}

const ALLOWED_TRANSACTION_DOC_EXTENSIONS = new Set(["jpg", "jpeg", "png", "pdf"]);

export async function uploadTransactionFile(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new UnauthorizedError("Unauthorized");
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    throw new ValidationError("No file provided");
  }

  // 1. File size limit validation
  if (file.size === 0) {
    throw new ValidationError("File is empty (0 bytes)");
  }
  if (file.size > MAX_TRANSACTION_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new ValidationError(
      `File size (${sizeInMb}MB) exceeds the maximum allowed limit of ${MAX_TRANSACTION_FILE_SIZE_MB}MB`
    );
  }

  // 2. Extension validation
  const rawExt = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_TRANSACTION_DOC_EXTENSIONS.has(rawExt)) {
    throw new ValidationError("Invalid file type. Allowed formats: JPG, JPEG, PNG, PDF");
  }

  // 3. Magic bytes validation
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  if (!validateMagicBytes(fileBuffer, rawExt)) {
    throw new ValidationError("Invalid file content: file signature does not match declared extension");
  }

  // 4. Upload file to /uploads/transaction
  const destinationDir = "transaction";
  const ext = `.${rawExt}`;
  const safeBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
  const uniqueName = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}_${safeBaseName}${ext}`;

  const relativePath = await uploadFile(file, destinationDir, uniqueName);

  return {
    fileName: path.basename(file.name),
    fileSize: file.size,
    fileType: file.type || (rawExt === "pdf" ? "application/pdf" : `image/${rawExt}`),
    documentRelativePath: relativePath,
  };
}

export async function deleteTransactionFile(relativePath: string) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new UnauthorizedError("Unauthorized");
  }

  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized.startsWith("invoice/transaction/file/")) {
    throw new ValidationError("Invalid file path");
  }

  await deleteFile(normalized);
  return { success: true };
}
