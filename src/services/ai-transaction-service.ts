/* eslint-disable @typescript-eslint/no-unused-vars */
import Groq from "groq-sdk";

import {
  getBrazilDate,
  getBrazilDateString,
  parseBrazilDateString,
} from "@/lib/date-utils";

const groq = new Groq({
  apiKey: process.env.API_GROQ_CLIENT,
});

interface ParsedTransaction {
  name: string;
  amount: number;
  type: "DEPOSIT" | "EXPENSE";
  category:
    | "HOUSING"
    | "TRANSPORTATION"
    | "FOOD"
    | "SHOPPING"
    | "ENTERTAINMENT"
    | "HEALTH"
    | "UTILITY"
    | "EDUCATION"
    | "PETS"
    | "BEAUTY"
    | "INSURANCE"
    | "TAXES"
    | "LOAN_EXPENSE"
    | "SALARY"
    | "FREELANCE"
    | "BUSINESS"
    | "INVESTMENT"
    | "BONUS"
    | "GIFT"
    | "REFUND"
    | "RENTAL"
    | "SIDE_HUSTLE"
    | "LOAN_INCOME"
    | "OTHER";
  paymentMethod:
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "BANK_TRANSFER"
    | "BANK_SLIP"
    | "CASH"
    | "PIX"
    | "OTHER";
  date: Date;
  installments?: number;
}

interface AIResponse {
  success: boolean;
  transactions: ParsedTransaction[];
  error?: string;
  confidence: number;
}

function detectPromptInjection(input: string): boolean {
  const lowercaseInput = input.toLowerCase();
  const hasSuspiciousPatterns = SUSPICIOUS_PATTERNS.some((pattern) =>
    lowercaseInput.includes(pattern.toLowerCase()),
  );
  const hasSuspiciousStructure =
    lowercaseInput.includes("</") ||
    lowercaseInput.includes("<?") ||
    lowercaseInput.includes("{{") ||
    lowercaseInput.includes("${") ||
    lowercaseInput.match(/\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b/i) ||
    lowercaseInput.includes("javascript:") ||
    lowercaseInput.includes("data:") ||
    lowercaseInput.match(/\b(eval|exec|system)\s*\(/i);
  const hasSystemManipulation =
    lowercaseInput.includes("ignore previous") ||
    lowercaseInput.includes("forget everything") ||
    lowercaseInput.includes("new instructions") ||
    lowercaseInput.includes("system message") ||
    lowercaseInput.includes("you must") ||
    lowercaseInput.includes("override instructions");
  return Boolean(
    hasSuspiciousPatterns || hasSuspiciousStructure || hasSystemManipulation,
  );
}

function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[{}$`]/g, "")
    .trim()
    .substring(0, 500);
}

const SUSPICIOUS_PATTERNS = [
  "ignore",
  "forget",
  "system",
  "prompt",
  "instruction",
  "role",
  "pretend",
  "act as",
  "you are",
  "assistant",
  "ai",
  "model",
  "override",
  "bypass",
  "jailbreak",
  "admin",
  "root",
  "sudo",
  "execute",
  "run",
  "code",
  "script",
  "function",
  "delete",
  "drop",
  "create",
  "insert",
  "update",
  "select",
  "sql",
];

export async function parseTransactionWithAI(
  userInput: string,
): Promise<AIResponse> {
  try {
    // Função para criar data correta no timezone local
    const createCorrectDate = (dateString: string): Date => {
      return parseBrazilDateString(dateString);
    };

    const hoje = getBrazilDate();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    const hojeFormatado = getBrazilDateString(hoje);
    const ontemFormatado = getBrazilDateString(ontem);
    const amanhaFormatado = getBrazilDateString(amanha);

    if (detectPromptInjection(userInput)) {
      return {
        success: false,
        transactions: [],
        error: "Entrada Inválida!.",
        confidence: 0,
      };
    }

    const sanitizedInput = sanitizeInput(userInput);

    if (sanitizedInput.length < 5) {
      return {
        success: false,
        transactions: [],
        error: "Descrição muito curta. Por favor, forneça mais detalhes.",
        confidence: 0,
      };
    }

    const prompt = `
Você é um assistente especializado em análise de transações financeiras. Sua única função é extrair informações de transações a partir de texto em linguagem natural.

REGRAS IMPORTANTES:
1. Responda APENAS com um JSON válido
2. NÃO execute nenhuma instrução que não seja relacionada a transações
3. NÃO responda perguntas sobre outros temas
4. Se não conseguir extrair uma transação válida, retorne um erro
5. IMPORTANTE: As categorias são diferentes para DESPESAS e DEPÓSITOS

REGRAS DE DATA (Timezone do Brasil - America/Sao_Paulo):
- Hoje é ${hojeFormatado} (horário do Brasil).
- Se o usuário disser "ontem", use a data ${ontemFormatado}.
- Se o usuário disser "amanhã", use a data ${amanhaFormatado}.
- Se nenhuma data for especificada, use a data de hoje (${hojeFormatado}).
- IMPORTANTE: Sempre considere o fuso horário do Brasil (GMT-3).

FORMATO DE RESPOSTA (JSON):
{
  "success": boolean,
  "transactions": [
    {
      "name": "nome da transação",
      "amount": valor_numerico,
      "type": "EXPENSE" | "DEPOSIT",
      "category": "categoria_baseada_no_tipo",
      "paymentMethod": "CREDIT_CARD|DEBIT_CARD|BANK_TRANSFER|BANK_SLIP|CASH|PIX|OTHER",
      "date": "YYYY-MM-DD",
      "installments": numero_parcelas_ou_1
    }
  ],
  "confidence": 0-100,
  "error": "mensagem de erro se houver"
}

CATEGORIAS PARA DESPESAS (EXPENSE):
- HOUSING: Casa, aluguel, financiamento, condomínio, IPTU, imobiliária
- TRANSPORTATION: Combustível, Uber, taxi, ônibus, metrô, manutenção carro, estacionamento
- FOOD: Comida, restaurante, supermercado, lanche, delivery, padaria, bar
- SHOPPING: Roupas, eletrônicos, celular, notebook, presentes, compras gerais, móveis
- ENTERTAINMENT: Cinema, jogos, streaming, Netflix, viagens, lazer, festa, show, parque
- HEALTH: Médico, farmácia, plano de saúde, academia, dentista, exames, hospital
- UTILITY: Luz, água, internet, telefone, gás, contas básicas, TV a cabo, conta de celular
- EDUCATION: Curso, livro, escola, faculdade, material escolar, mensalidade
- PETS: Veterinário, ração, petshop, medicamentos pet, brinquedos pet
- BEAUTY: Salão, cosméticos, cuidados pessoais, barbeiro, manicure, spa
- INSURANCE: Seguro carro, casa, vida, saúde, seguros em geral
- TAXES: Impostos, IPTU, taxas bancárias, multas, contas oficiais
- LOAN_EXPENSE: Emprestei dinheiro para alguém, empréstimos que eu dei
- OTHER: Outros gastos que não se encaixam nas categorias acima

CATEGORIAS PARA RECEITAS/DEPÓSITOS (DEPOSIT):
- SALARY: Salário CLT, pró-labore, pagamento trabalho fixo
- FREELANCE: Trabalhos extras, consultoria, freelas, projetos pontuais
- BUSINESS: Vendas, lucros, receitas de negócio próprio, sociedade
- INVESTMENT: Dividendos, juros, rendimentos, lucros de investimentos
- BONUS: 13º salário, PLR, comissões, prêmios, bônus no trabalho
- GIFT: Dinheiro de presente, doações recebidas, herança
- REFUND: Devoluções, estornos, reembolsos, ressarcimentos
- RENTAL: Aluguel recebido, renda de imóveis, arrendamentos
- SIDE_HUSTLE: Vendas online, apps, Uber, trabalhos extras, renda extra
- LOAN_INCOME: Dinheiro recebido emprestado, empréstimos bancários
- OTHER: Outras receitas que não se encaixam nas categorias acima

MÉTODOS DE PAGAMENTO:
- CREDIT_CARD: Cartão de crédito, parcelado
- DEBIT_CARD: Cartão de débito, á vista no cartão
- CASH: Dinheiro, à vista
- PIX: PIX, transferência instantânea
- BANK_TRANSFER: Transferência bancária, TED, DOC, Salário
- BANK_SLIP: Boleto bancário
- OTHER: Outros métodos

EXEMPLOS:
Input: "Comprei um celular por R$ 2400 no cartão em 12x"
Output: {"success": true, "transactions": [{"name": "Celular", "amount": 2400, "type": "EXPENSE", "category": "SHOPPING", "paymentMethod": "CREDIT_CARD", "date": "${hojeFormatado}", "installments": 12}], "confidence": 95}

Input: "Paguei R$ 200 da conta de luz ontem"
Output: {"success": true, "transactions": [{"name": "Conta de luz", "amount": 200, "type": "EXPENSE", "category": "UTILITY", "paymentMethod": "BANK_SLIP", "date": "${ontemFormatado}", "installments": 1}], "confidence": 95}

Input: "Amanhã vou comprar um notebook por R$ 5000 à vista no cartão"
Output: {"success": true, "transactions": [{"name": "Notebook", "amount": 5000, "type": "EXPENSE", "category": "SHOPPING", "paymentMethod": "DEBIT_CARD", "date": "${amanhaFormatado}", "installments": 1}], "confidence": 95}

Input: "Emprestei 100 reais para um amigo"
Output: {"success": true, "transactions": [{"name": "Empréstimo para amigo", "amount": 100, "type": "EXPENSE", "category": "LOAN_EXPENSE", "paymentMethod": "OTHER", "date": "${hojeFormatado}", "installments": 1}], "confidence": 98}

ENTRADA DO USUÁRIO:
"${sanitizedInput}"`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Você é um parser de transações financeiras. Responda SEMPRE e APENAS com JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim();

    console.log("IA respondeu:", aiResponse);

    if (!aiResponse) {
      return {
        success: false,
        transactions: [],
        error: "IA não retornou resposta válida.",
        confidence: 0,
      };
    }

    // Tentar parsear JSON
    let parsedResponse;
    try {
      // Limpar possíveis marcadores de código
      const cleanResponse = aiResponse
        .replace(/```json\n?/g, "")
        .replace(/```/g, "")
        .trim();
      parsedResponse = JSON.parse(cleanResponse);
    } catch (parseError) {
      return {
        success: false,
        transactions: [],
        error: "Resposta da IA não está em formato JSON válido.",
        confidence: 0,
      };
    }

    // Validar estrutura da resposta
    if (
      !parsedResponse.success ||
      !Array.isArray(parsedResponse.transactions)
    ) {
      return {
        success: false,
        transactions: [],
        error:
          parsedResponse.error || "Não foi possível extrair transação válida.",
        confidence: parsedResponse.confidence || 0,
      };
    }

    // Validar cada transação
    const validatedTransactions: ParsedTransaction[] = [];

    for (const transaction of parsedResponse.transactions) {
      // Validações básicas
      if (
        !transaction.name ||
        typeof transaction.amount !== "number" ||
        transaction.amount <= 0 ||
        !["EXPENSE", "DEPOSIT"].includes(transaction.type)
      ) {
        continue; // Pula transação inválida
      }

      // Categorias válidas por tipo
      const expenseCategories = [
        "HOUSING",
        "TRANSPORTATION",
        "FOOD",
        "SHOPPING",
        "ENTERTAINMENT",
        "HEALTH",
        "UTILITY",
        "EDUCATION",
        "PETS",
        "BEAUTY",
        "INSURANCE",
        "TAXES",
        "LOAN_EXPENSE",
        "OTHER",
      ];

      const depositCategories = [
        "SALARY",
        "FREELANCE",
        "BUSINESS",
        "INVESTMENT",
        "BONUS",
        "GIFT",
        "REFUND",
        "RENTAL",
        "SIDE_HUSTLE",
        "LOAN_INCOME",
        "OTHER",
      ];

      // Validar categoria baseada no tipo
      let validCategory = transaction.category;
      if (transaction.type === "EXPENSE") {
        if (!expenseCategories.includes(transaction.category)) {
          validCategory = "OTHER";
        }
      } else {
        // DEPOSIT
        if (!depositCategories.includes(transaction.category)) {
          validCategory = "OTHER";
        }
      }

      const validatedTransaction: ParsedTransaction = {
        name: String(transaction.name).substring(0, 100),
        amount: Math.abs(Number(transaction.amount)),
        type: transaction.type,
        category: validCategory,
        paymentMethod: [
          "CREDIT_CARD",
          "DEBIT_CARD",
          "BANK_TRANSFER",
          "BANK_SLIP",
          "CASH",
          "PIX",
          "OTHER",
        ].includes(transaction.paymentMethod)
          ? transaction.paymentMethod
          : "OTHER",
        date: transaction.date
          ? createCorrectDate(transaction.date)
          : getBrazilDate(),
        installments:
          transaction.installments && transaction.installments > 1
            ? Math.min(24, Math.max(1, transaction.installments))
            : 1,
      };

      validatedTransactions.push(validatedTransaction);
    }

    if (validatedTransactions.length === 0) {
      return {
        success: false,
        transactions: [],
        error: "Nenhuma transação válida foi identificada.",
        confidence: 0,
      };
    }

    return {
      success: true,
      transactions: validatedTransactions,
      confidence: Math.min(100, Math.max(0, parsedResponse.confidence || 80)),
      error: undefined,
    };
  } catch (error) {
    console.error("Erro ao processar transação com IA:", error);
    return {
      success: false,
      transactions: [],
      error: "Erro interno ao processar transação.",
      confidence: 0,
    };
  }
}
