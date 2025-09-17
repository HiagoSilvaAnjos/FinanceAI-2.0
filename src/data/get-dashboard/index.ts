import { and, desc, eq, gte, lt, sum } from "drizzle-orm";
import { headers } from "next/headers";

import { TRANSACTION_TYPES } from "@/constants/transactions";
import { db } from "@/db";
import { transactionTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { TotalExpensePerCategory, TransactionPercentagePerType } from "./types";

export const getDashboard = async (month: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Filtros de data
  const startDate = new Date(`2025-${month}-01`);
  const endDate = new Date(`2025-${month}-31`);

  const baseWhere = and(
    eq(transactionTable.userId, userId),
    gte(transactionTable.date, startDate),
    lt(transactionTable.date, endDate),
  );

  // Depósitos totais
  const depositsResult = await db
    .select({ total: sum(transactionTable.amount) })
    .from(transactionTable)
    .where(and(baseWhere, eq(transactionTable.type, "DEPOSIT")));
  const depositsTotal = Number(depositsResult[0]?.total || 0);

  // Investimentos totais
  const investmentsResult = await db
    .select({ total: sum(transactionTable.amount) })
    .from(transactionTable)
    .where(and(baseWhere, eq(transactionTable.type, "INVESTIMENT")));
  const investmentsTotal = Number(investmentsResult[0]?.total || 0);

  // Despesas totais
  const expensesResult = await db
    .select({ total: sum(transactionTable.amount) })
    .from(transactionTable)
    .where(and(baseWhere, eq(transactionTable.type, "EXPENSE")));
  const expensesTotal = Number(expensesResult[0]?.total || 0);

  // Total geral
  const transactionsTotalResult = await db
    .select({ total: sum(transactionTable.amount) })
    .from(transactionTable)
    .where(baseWhere);
  const transactionsTotal = Number(transactionsTotalResult[0]?.total || 0);

  const balance = depositsTotal - investmentsTotal - expensesTotal;

  // Percentuais por tipo - Adicionando a verificação para evitar NaN
  const typesPercentage: TransactionPercentagePerType = {
    [TRANSACTION_TYPES.DEPOSIT]:
      transactionsTotal > 0
        ? Math.round((depositsTotal / transactionsTotal) * 100)
        : 0,
    [TRANSACTION_TYPES.EXPENSE]:
      transactionsTotal > 0
        ? Math.round((expensesTotal / transactionsTotal) * 100)
        : 0,
    [TRANSACTION_TYPES.INVESTIMENT]:
      transactionsTotal > 0
        ? Math.round((investmentsTotal / transactionsTotal) * 100)
        : 0,
  };

  // Total de despesas por categoria
  const expensesByCategory = await db
    .select({
      category: transactionTable.category,
      totalAmount: sum(transactionTable.amount),
    })
    .from(transactionTable)
    .where(and(baseWhere, eq(transactionTable.type, "EXPENSE")))
    .groupBy(transactionTable.category);

  const totalExpensePerCategory: TotalExpensePerCategory[] =
    expensesByCategory.map((category) => ({
      category: category.category,
      totalAmount: Number(category.totalAmount),
      percentageOfTotal:
        expensesTotal > 0
          ? Math.round((Number(category.totalAmount) / expensesTotal) * 100)
          : 0,
    }));

  // Últimas transações
  const lastTransactionsResult = await db
    .select()
    .from(transactionTable)
    .where(baseWhere)
    .orderBy(desc(transactionTable.date))
    .limit(15);

  const lastTransactions = lastTransactionsResult.map((transaction) => ({
    ...transaction,
    amount: Number(transaction.amount),
  }));

  return {
    balance,
    depositsTotal,
    investmentsTotal,
    expensesTotal,
    typesPercentage,
    totalExpensePerCategory,
    lastTransactions,
  };
};
