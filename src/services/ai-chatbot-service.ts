import Groq from "groq-sdk";
import { headers } from "next/headers";

import { TRANSACTION_CATEGORY_LABELS } from "@/constants/transactions";
import { getDashboard } from "@/data/get-dashboard";
import { auth } from "@/lib/auth";

import { checkAIQuota, incrementAIUsage } from "./ai-quota-service";

const groq = new Groq({
  apiKey: process.env.API_GROQ_CLIENT,
});

export async function getChatbotResponse(question: string): Promise<string> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return "Usuário não autenticado.";

    const quotaCheck = await checkAIQuota("AI_CHAT");

    if (!quotaCheck.hasQuota) {
      return `Você atingiu seu limite de ${quotaCheck.limit} mensagens hoje. O limite será reiniciado em ${quotaCheck.timeUntilReset}.`;
    }

    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
    const currentYear = String(currentDate.getFullYear());

    const dashboardData = await getDashboard(currentMonth, currentYear);

    // Traduz as categorias para português antes de enviar para a IA
    const translatedCategories = dashboardData.totalExpensePerCategory
      .slice(0, 3)
      .map((c) => TRANSACTION_CATEGORY_LABELS[c.category] || c.category)
      .join(", ");

    const systemPrompt = `
     Você é "FinanceAI", um assistente financeiro pessoal.
      - **Sempre** se dirija ao usuário pelo nome dele, Hiago. Use um tom amigável e conversacional (use "você", "suas finanças", etc.).
      - Suas respostas devem ser em português do Brasil e formatadas com markdown (use **negrito** e listas).
      - Baseie suas respostas financeiras estritamente no contexto fornecido.
      - Para perguntas não financeiras, responda com uma mensagem dizendo ao usuário que voce não responde essse tipo de pergunta apenas sobre finanças .
    `;

    const userPrompt = `
      **Contexto Financeiro Atual:**
      - Nome do Usuário: ${session.user.name}
      - Saldo do Mês: ${dashboardData.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      - Total de Receitas: ${dashboardData.depositsTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      - Total de Despesas: ${dashboardData.expensesTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      - Principais Categorias de Gasto: ${translatedCategories}

      **Pergunta do Usuário:**
      "${question}"
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 600,
    });

    await incrementAIUsage("AI_CHAT");

    return (
      completion.choices[0]?.message?.content?.trim() ||
      "Não consegui processar sua pergunta."
    );
  } catch (error) {
    console.error("Erro no serviço de chatbot:", error);
    return "Ocorreu um erro ao buscar sua resposta. Tente novamente.";
  }
}
