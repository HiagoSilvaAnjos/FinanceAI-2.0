"use server";

import { headers } from "next/headers";

import { TRANSACTION_CATEGORY_LABELS } from "@/constants/transactions";
import { getDashboard } from "@/data/get-dashboard";
import { getHistoricalData } from "@/data/get-historical-data";
import { auth } from "@/lib/auth";
import { generateFinancialReport } from "@/services/groq-service";

export async function generateReport(month: string, year: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Buscar dados do dashboard
    const dashboardData = await getDashboard(month, year);

    // Buscar dados históricos
    const historicalData = await getHistoricalData(year);

    // Preparar dados para a IA
    const aiData = {
      currentMonth: month,
      currentYear: year,
      balance: dashboardData.balance,
      depositsTotal: dashboardData.depositsTotal,
      expensesTotal: dashboardData.expensesTotal,
      totalExpensePerCategory: dashboardData.totalExpensePerCategory.map(
        (cat) => ({
          category: TRANSACTION_CATEGORY_LABELS[cat.category],
          totalAmount: cat.totalAmount,
          percentageOfTotal: cat.percentageOfTotal,
        }),
      ),
      lastTransactions: dashboardData.lastTransactions.map((t) => ({
        name: t.name,
        amount: t.amount,
        type: t.type,
        category: TRANSACTION_CATEGORY_LABELS[t.category],
        paymentMethod: t.paymentMethod,
        date: t.date.toISOString(),
      })),
      historicalData,
    };

    // Gerar relatório com IA
    const reportContent = await generateFinancialReport(aiData);

    // Retornar dados para o PDF
    return {
      content: reportContent,
      userData: {
        name: session.user.name || "Usuário",
        email: session.user.email,
        generatedAt: new Date(),
        period: `${month}/${year}`,
      },
      financialSummary: {
        balance: dashboardData.balance,
        deposits: dashboardData.depositsTotal,
        expenses: dashboardData.expensesTotal,
      },
    };
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    throw new Error("Falha ao gerar relatório");
  }
}
