import { and, eq, gte, lt, sum } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { transactionTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export interface MonthlyData {
  month: number;
  monthName: string;
  deposits: number;
  expenses: number;
  balance: number;
}

export interface ComparisonData {
  currentMonth: {
    month: string;
    deposits: number;
    expenses: number;
    balance: number;
  };
  previousMonth: {
    month: string;
    deposits: number;
    expenses: number;
    balance: number;
  };
  percentageChange: {
    deposits: number;
    expenses: number;
    balance: number;
  };
}

export const getHistoricalData = async (year: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Array com nomes dos meses
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  // Buscar dados de todos os meses do ano
  const monthlyData: MonthlyData[] = [];

  for (let month = 1; month <= 12; month++) {
    const startDate = new Date(parseInt(year), month - 1, 1);
    const endDate = new Date(parseInt(year), month, 0, 23, 59, 59);

    const baseWhere = and(
      eq(transactionTable.userId, userId),
      gte(transactionTable.date, startDate),
      lt(transactionTable.date, endDate),
    );

    // Depósitos do mês
    const depositsResult = await db
      .select({ total: sum(transactionTable.amount) })
      .from(transactionTable)
      .where(and(baseWhere, eq(transactionTable.type, "DEPOSIT")));
    const deposits = Number(depositsResult[0]?.total || 0);

    // Despesas do mês
    const expensesResult = await db
      .select({ total: sum(transactionTable.amount) })
      .from(transactionTable)
      .where(and(baseWhere, eq(transactionTable.type, "EXPENSE")));
    const expenses = Number(expensesResult[0]?.total || 0);

    // Saldo do mês
    const balance = deposits - expenses;

    monthlyData.push({
      month,
      monthName: monthNames[month - 1],
      deposits,
      expenses,
      balance,
    });
  }

  return monthlyData;
};

export const getComparisonData = async (
  currentMonth: string,
  currentYear: string,
): Promise<ComparisonData> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Calcular mês anterior
  const currentMonthNum = parseInt(currentMonth);
  const currentYearNum = parseInt(currentYear);

  let previousMonth: number;
  let previousYear: number;

  if (currentMonthNum === 1) {
    previousMonth = 12;
    previousYear = currentYearNum - 1;
  } else {
    previousMonth = currentMonthNum - 1;
    previousYear = currentYearNum;
  }

  // Função para buscar dados de um mês específico
  const getMonthData = async (month: number, year: number) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const baseWhere = and(
      eq(transactionTable.userId, userId),
      gte(transactionTable.date, startDate),
      lt(transactionTable.date, endDate),
    );

    const depositsResult = await db
      .select({ total: sum(transactionTable.amount) })
      .from(transactionTable)
      .where(and(baseWhere, eq(transactionTable.type, "DEPOSIT")));
    const deposits = Number(depositsResult[0]?.total || 0);

    const expensesResult = await db
      .select({ total: sum(transactionTable.amount) })
      .from(transactionTable)
      .where(and(baseWhere, eq(transactionTable.type, "EXPENSE")));
    const expenses = Number(expensesResult[0]?.total || 0);

    return {
      deposits,
      expenses,
      balance: deposits - expenses,
    };
  };

  // Buscar dados dos dois meses
  const currentData = await getMonthData(currentMonthNum, currentYearNum);
  const previousData = await getMonthData(previousMonth, previousYear);

  // Calcular percentual de mudança
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  return {
    currentMonth: {
      month: `${monthNames[currentMonthNum - 1]} ${currentYear}`,
      ...currentData,
    },
    previousMonth: {
      month: `${monthNames[previousMonth - 1]} ${previousYear}`,
      ...previousData,
    },
    percentageChange: {
      deposits: calculatePercentageChange(
        currentData.deposits,
        previousData.deposits,
      ),
      expenses: calculatePercentageChange(
        currentData.expenses,
        previousData.expenses,
      ),
      balance: calculatePercentageChange(
        currentData.balance,
        previousData.balance,
      ),
    },
  };
};
