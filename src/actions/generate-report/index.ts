"use server";

import { headers } from "next/headers";

import { TRANSACTION_CATEGORY_LABELS } from "@/constants/transactions";
import { getDashboard } from "@/data/get-dashboard";
import { getHistoricalData } from "@/data/get-historical-data";
import { auth } from "@/lib/auth";
import { checkAIQuota, incrementAIUsage } from "@/services/ai-quota-service";
import { generateFinancialReport } from "@/services/groq-service";

interface ReportResult {
  success: boolean;
  content?: string;
  userData?: {
    name: string;
    email: string;
    generatedAt: Date;
    period: string;
  };
  financialSummary?: {
    balance: number;
    deposits: number;
    expenses: number;
  };
  error?: string;
  quotaExceeded?: boolean;
  quotaInfo?: {
    currentUsage: number;
    limit: number;
    timeUntilReset: string;
  };
}

export async function generateReport(
  month: string,
  year: string,
): Promise<ReportResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Usuário não autenticado.",
      };
    }

    // Verificar quota ANTES de processar
    const quotaCheck = await checkAIQuota("AI_REPORT");

    if (!quotaCheck.hasQuota) {
      return {
        success: false,
        error: "Limite mensal de relatórios com IA atingido.",
        quotaExceeded: true,
        quotaInfo: {
          currentUsage: quotaCheck.currentUsage,
          limit: quotaCheck.limit,
          timeUntilReset: quotaCheck.timeUntilReset,
        },
      };
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

    // Incrementar quota ANTES de gerar
    await incrementAIUsage("AI_REPORT", 1);

    // Gerar relatório com IA
    const reportContent = await generateFinancialReport(aiData);

    if (!reportContent || reportContent.includes("Erro ao gerar relatório")) {
      return {
        success: false,
        error: "Falha ao gerar relatório com IA. Tente novamente.",
      };
    }

    // Retornar dados para o modal e PDF
    return {
      success: true,
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
    return {
      success: false,
      error: "Erro interno do servidor. Tente novamente.",
    };
  }
}
