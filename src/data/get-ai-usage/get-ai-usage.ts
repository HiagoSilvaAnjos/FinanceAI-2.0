"use server";

import { count, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { transactionTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getAIUsageStats } from "@/services/ai-quota-service";

export const getUsageAndTransactionCount = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Buscar quotas de IA
  const usage = await getAIUsageStats();

  // Contar o total de transações do utilizador
  const totalTransactionsResult = await db
    .select({ total: count() })
    .from(transactionTable)
    .where(eq(transactionTable.userId, session.user.id));

  const hasTransactions = (totalTransactionsResult[0]?.total ?? 0) > 0;

  return {
    usage,
    hasTransactions,
  };
};
