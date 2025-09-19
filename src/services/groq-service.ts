import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.API_GROQ_CLIENT,
});

interface FinancialData {
  currentMonth: string;
  currentYear: string;
  balance: number;
  depositsTotal: number;
  expensesTotal: number;
  totalExpensePerCategory: Array<{
    category: string;
    totalAmount: number;
    percentageOfTotal: number;
  }>;
  lastTransactions: Array<{
    name: string;
    amount: number;
    type: string;
    category: string;
    paymentMethod: string;
    date: string;
  }>;
  historicalData?: Array<{
    month: number;
    monthName: string;
    deposits: number;
    expenses: number;
    balance: number;
  }>;
}

export async function generateFinancialReport(
  data: FinancialData,
): Promise<string> {
  const prompt = `
  Como um especialista em análise financeira pessoal, crie um relatório detalhado e profissional baseado nos seguintes dados financeiros de ${data.currentMonth}/${data.currentYear}:

  DADOS FINANCEIROS:
  - Saldo atual: R$ ${data.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
  - Total de receitas: R$ ${data.depositsTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
  - Total de despesas: R$ ${data.expensesTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}

  DESPESAS POR CATEGORIA:
  ${data.totalExpensePerCategory
    .map(
      (cat) =>
        `- ${cat.category}: R$ ${cat.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${cat.percentageOfTotal}%)`,
    )
    .join("\n")}

  ÚLTIMAS TRANSAÇÕES:
  ${data.lastTransactions
    .slice(0, 10)
    .map(
      (t) =>
        `- ${t.name}: R$ ${Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${t.type === "EXPENSE" ? "Despesa" : "Receita"}) - ${new Date(t.date).toLocaleDateString("pt-BR")}`,
    )
    .join("\n")}

  ${
    data.historicalData
      ? `
  DADOS HISTÓRICOS (${data.currentYear}):
  ${data.historicalData
    .map(
      (h) =>
        `- ${h.monthName}: Receitas R$ ${h.deposits.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}, Despesas R$ ${h.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}, Saldo R$ ${h.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    )
    .join("\n")}
  `
      : ""
  }

  Por favor, atue como um consultor financeiro e crie um relatório profissional em português brasileiro. Use uma linguagem simples e clara, evitando jargão técnico, e foque em soluções práticas. O relatório deve conter as seguintes seções:

  1. Resumo Executivo: Visão geral da situação financeira atual.
  2. Análise de Ganhos e Gastos: Análise detalhada de receitas e despesas.
  3. Despesas por Categoria: Insights sobre onde o dinheiro está sendo gasto.
  4. Pontos de Melhoria: Alertas sobre gastos ou categorias que merecem atenção.
  5. Plano de Ação: Sugestões práticas para melhorar a saúde financeira.
  6. Próximos Passos: Sugestões de metas financeiras realistas para o próximo período.

  IMPORTANTE - FORMATAÇÃO:
  - Use apenas #, ##, ou ### para títulos e subtítulos. Não adicione asteriscos ou outros caracteres de negrito aos títulos.
  - O conteúdo deve ser em texto simples e limpo.
  - Máximo de 1000 palavras.

  Base todas as análises nos números reais apresentados.
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 4000,
    });

    return completion.choices[0]?.message?.content || "Erro ao gerar relatório";
  } catch (error) {
    console.error("Erro ao chamar Groq API:", error);
    throw new Error("Falha ao gerar relatório com IA");
  }
}
