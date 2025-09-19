"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { upsertTransaction } from "@/actions/add-transaction";
import { auth } from "@/lib/auth";
import { checkAIQuota, incrementAIUsage } from "@/services/ai-quota-service";
import { parseTransactionWithAI } from "@/services/ai-transaction-service";

interface AITransactionResult {
  success: boolean;
  createdTransactions: number;
  totalAmount: number;
  error?: string;
  confidence?: number;
  transactions?: Array<{
    name: string;
    amount: number;
    type: string;
    installments?: number;
  }>;
  quotaExceeded?: boolean;
  quotaInfo?: {
    currentUsage: number;
    limit: number;
    timeUntilReset: string;
  };
}

export async function createTransactionWithAI(
  userInput: string,
): Promise<AITransactionResult> {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        createdTransactions: 0,
        totalAmount: 0,
        error: "Usuário não autenticado.",
      };
    }

    // Verificar quota ANTES de processar
    const quotaCheck = await checkAIQuota("AI_TRANSACTION");

    if (!quotaCheck.hasQuota) {
      return {
        success: false,
        createdTransactions: 0,
        totalAmount: 0,
        error: "Limite diário de transações com IA atingido.",
        quotaExceeded: true,
        quotaInfo: {
          currentUsage: quotaCheck.currentUsage,
          limit: quotaCheck.limit,
          timeUntilReset: quotaCheck.timeUntilReset,
        },
      };
    }

    // Validação básica do input
    if (!userInput || userInput.trim().length < 3) {
      return {
        success: false,
        createdTransactions: 0,
        totalAmount: 0,
        error: "Por favor, descreva uma transação válida.",
      };
    }

    // Processar com IA
    const aiResult = await parseTransactionWithAI(userInput);

    if (!aiResult.success || aiResult.transactions.length === 0) {
      // Mesmo com falha, incrementar quota para evitar spam
      await incrementAIUsage("AI_TRANSACTION", 1);

      return {
        success: false,
        createdTransactions: 0,
        totalAmount: 0,
        error: aiResult.error || "Não foi possível processar a transação.",
        confidence: aiResult.confidence,
      };
    }

    // Incrementar quota APÓS sucesso da IA
    await incrementAIUsage("AI_TRANSACTION", 1);

    // Criar transações no banco
    let createdCount = 0;
    let totalAmount = 0;
    const createdTransactions = [];

    for (const transaction of aiResult.transactions) {
      try {
        await upsertTransaction({
          name: transaction.name,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          paymentMethod: transaction.paymentMethod,
          date: transaction.date,
          installments: transaction.installments || 1,
        });

        createdCount++;
        totalAmount += transaction.amount;
        createdTransactions.push({
          name: transaction.name,
          amount: transaction.amount,
          type: transaction.type === "EXPENSE" ? "Despesa" : "Receita",
          installments: transaction.installments,
        });
      } catch (error) {
        console.error(`Erro ao criar transação ${transaction.name}:`, error);
        // Continua tentando criar as outras transações
      }
    }

    if (createdCount === 0) {
      return {
        success: false,
        createdTransactions: 0,
        totalAmount: 0,
        error: "Falha ao salvar as transações no banco de dados.",
      };
    }

    // Revalidar páginas
    revalidatePath("/");
    revalidatePath("/transactions");

    return {
      success: true,
      createdTransactions: createdCount,
      totalAmount,
      confidence: aiResult.confidence,
      transactions: createdTransactions,
    };
  } catch (error) {
    console.error("Erro ao processar transação com IA:", error);
    return {
      success: false,
      createdTransactions: 0,
      totalAmount: 0,
      error: "Erro interno do servidor. Tente novamente.",
    };
  }
}
