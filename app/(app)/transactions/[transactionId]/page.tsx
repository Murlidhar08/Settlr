"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { FinancialAccountType } from "@/lib/generated/prisma/enums"
import { getTransactionPerspective } from "@/lib/transaction-logic"
import { useTransactionDetail } from "@/tanstacks/cashbook"
import { TransactionDirection } from "@/types/transaction/TransactionDirection"
import { notFound } from "next/navigation"
import { use } from "react"
import { TransactionDetailView } from "./components/transaction-detail-view"

export default function TransactionDetailPage({ params: paramsPromise }: { params: Promise<{ transactionId: string }> }) {
  const params = use(paramsPromise);
  const transactionId = params.transactionId;

  const { data: transaction, isLoading, isError } = useTransactionDetail(transactionId)

  if (isLoading) {
    return <TransactionDetailSkeleton />
  }

  if (isError || !transaction) {
    notFound()
  }

  // Determine perspective: If party exists, use its account, else use toAccount if it's MONEY
  const contextId = transaction.toAccount.type === FinancialAccountType.MONEY
    ? transaction.toAccountId
    : transaction.fromAccountId;

  const perspective = getTransactionPerspective(
    transaction.toAccountId,
    transaction.fromAccountId,
    contextId
  );

  const isIn = perspective === TransactionDirection.IN;

  return (
    <TransactionDetailView
      transaction={transaction}
      isIn={isIn}
    />
  )
}

function TransactionDetailSkeleton() {
  return (
    <div className="min-h-full bg-background relative">
      <main className="mx-auto max-w-6xl px-4 pb-32 pt-4 md:px-8 space-y-12">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-5 space-y-8">
            <div className="flex flex-col items-center lg:items-start gap-4">
              <Skeleton className="h-20 w-20 rounded-3xl" />
              <div className="space-y-2 w-full max-w-50">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-48 w-full rounded-[2.5rem]" />
          </div>
          <div className="lg:col-span-7 space-y-8">
            <Skeleton className="h-40 w-full rounded-[2.5rem]" />
            <Skeleton className="h-64 w-full rounded-[2.5rem]" />
          </div>
        </div>
      </main>
    </div>
  )
}
