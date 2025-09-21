import Groq from "groq-sdk";
import { revalidatePath } from "next/cache";
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

    const dashboardData = await getDashboard(currentMonth, currentYear, 50);

    const translatedCategories = dashboardData.totalExpensePerCategory
      .slice(0, 3)
      .map((c) => TRANSACTION_CATEGORY_LABELS[c.category] || c.category)
      .join(", ");

    const formattedTransactions = dashboardData.lastTransactions
      .map(
        (t) =>
          `- ${t.name}: ${
            t.type === "EXPENSE" ? "-" : "+"
          }${t.amount.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })} em ${new Date(t.date).toLocaleDateString("pt-BR")}`,
      )
      .join("\n");

    const today = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const projectContext = `
      O FinanceAI é uma plataforma de gestão financeira que utiliza Inteligência Artificial para monitorar as movimentações financeiras do usuário e oferecer insights personalizados, facilitando o controle do orçamento.

      - **Tecnologias**: O projeto foi construído com Next.js.
    `;

    const systemPrompt = `
      Você é "FinanceAI", um assistente financeiro e de projeto. Siga estas regras de forma estrita e lógica:

      **1. Identidade e Tom:**
      - **Sempre** se dirija ao usuário como ${
        session.user.name
      }. Use um tom amigável e prestativo.
      - Responda em português do Brasil, usando markdown.

      **2. Fonte da Verdade:**
      - Suas respostas **DEVEM** ser baseadas **EXCLUSIVAMENTE** no contexto fornecido.
      - **Não presuma nem invente informações.** Se a informação não estiver no contexto, diga que não a encontrou.

      **3. Processamento de Tarefas Financeiras:**
      - **REGRA CRÍTICA DE SALDO**: Se o usuário perguntar sobre o "saldo", sua única e exclusiva resposta deve ser o valor que está no campo "Saldo do Mês". **NUNCA** recalcule o saldo. Apenas informe o valor fornecido.
      - **Definição de Termos**: "Receita", "ganho", "depósito", "entrada" e transações com valor positivo (+) significam a mesma coisa. "Despesa", "gasto", "saída" e transações com valor negativo (-) significam a mesma coisa.
      - **Data de Referência**: A data de "hoje" é **${today}**. Use esta data para calcular períodos relativos.
      - **Última Transação**: Para responder sobre a "última transação", sua resposta **DEVE SER**, sem exceção, a **primeira transação da lista**.
      - **Perguntas sobre Atividades**: Interprete perguntas sobre atividades (ex: "fui a um show?") como questões financeiras sobre gastos.

      **4. Processamento de Tarefas do Projeto:**
      - Para perguntas sobre o projeto FinanceAI, use apenas o contexto "Sobre o Projeto FinanceAI".

      **5. Regra de Escape:**
      - Para qualquer outra pergunta fora do escopo, responda: "Como um assistente do FinanceAI, meu foco é ajudar com suas finanças e informações sobre o projeto. Não consigo responder a perguntas sobre outros assuntos."
    `;

    const userPrompt = `
      **Meu Contexto Financeiro Atual:**
      - Data de Hoje: ${today}
      - Nome do Usuário: ${session.user.name}
      - Saldo do Mês (saldo do usuário): ${dashboardData.balance.toLocaleString(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL",
        },
      )}
      - Total de Receitas: ${dashboardData.depositsTotal.toLocaleString(
        "pt-BR",
        { style: "currency", currency: "BRL" },
      )}
      - Total de Despesas: ${dashboardData.expensesTotal.toLocaleString(
        "pt-BR",
        { style: "currency", currency: "BRL" },
      )}
      - Principais Categorias de Gasto: ${translatedCategories}

      **Últimas Transações (ordenadas da mais recente para a mais antiga):**
      ${formattedTransactions || "Nenhuma transação este mês."}

      **Sobre o Projeto FinanceAI:**
      ${projectContext}

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

    revalidatePath("/");
    revalidatePath("/transactions");

    return (
      completion.choices[0]?.message?.content?.trim() ||
      "Não consegui processar sua pergunta."
    );
  } catch (error) {
    console.error("Erro no serviço de chatbot:", error);
    return "Ocorreu um erro ao buscar sua resposta. Tente novamente.";
  }
}
