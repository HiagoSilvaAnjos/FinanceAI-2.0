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
Gere um relatório com insights sobre as minhas finanças, com dicas e orientações de como melhorar minha vida financeira, seja criativa e escreva bastante para ajudar o usuário. O relatório deve ser escrito de uma perspectiva do período:

De um olá e informe que este é um relatório financeiro gerado por IA.

PERIODO: ${data.currentMonth}/${data.currentYear}

Use textos com parágrafos, evite criar no formato de tabelas ou lista com | ou ---
não crie formatos como: "| Categoria | Valor | % do total de despesas | |-----------|-------|------------------------| | Alimentação | R$ 85,00 | 6% | | Pets | R$ 1.000,00 | 70% | | Utilidades | R$ 120,00 | 8% | | Compras | R$ 216,67 | 15% |"

apenas parágrafos com textos.

INFORMAÇÕES IMPORTANTES:
- Saldo: R$ ${data.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
- Receitas: R$ ${data.depositsTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
- Despesas: R$ ${data.expensesTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}

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
      `- ${t.name}: R$ ${Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${t.type === "EXPENSE" ? "Despesa" : "Receita"})`,
  )
  .join("\n")}
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Você é um consultor financeiro experiente. Crie relatórios objetivos, práticos e bem formatados em markdown limpo.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      // model: "llama-3.3-70b-versatile",
      model: "openai/gpt-oss-20b",
      temperature: 0.3,
      max_tokens: 4000,
    });

    console.log(completion.choices[0]?.message?.content);

    return completion.choices[0]?.message?.content || "Erro ao gerar relatório";
  } catch (error) {
    console.error("Erro ao chamar Groq API:", error);
    throw new Error("Falha ao gerar relatório com IA");
  }
}
