/* eslint-disable @typescript-eslint/no-unused-vars */
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.API_GROQ_CLIENT,
});

interface ParsedTransaction {
  name: string;
  amount: number;
  type: "DEPOSIT" | "EXPENSE";
  category: // Categorias para DESPESAS (EXPENSE)
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
    // Categorias para DEPÓSITOS (DEPOSIT)
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
    // Fallback
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

// Lista de palavras/frases que podem indicar prompt injection
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

// Função para detectar possível prompt injection
function detectPromptInjection(input: string): boolean {
  const lowercaseInput = input.toLowerCase();

  // Verificar padrões suspeitos
  const hasSuspiciousPatterns = SUSPICIOUS_PATTERNS.some((pattern) =>
    lowercaseInput.includes(pattern.toLowerCase()),
  );

  // Verificar comandos ou estruturas suspeitas
  const hasSuspiciousStructure =
    lowercaseInput.includes("</") || // Tags HTML/XML
    lowercaseInput.includes("<?") || // PHP/XML
    lowercaseInput.includes("{{") || // Templates
    lowercaseInput.includes("${") || // Template literals
    lowercaseInput.match(/\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b/i) || // SQL
    lowercaseInput.includes("javascript:") ||
    lowercaseInput.includes("data:") ||
    lowercaseInput.match(/\b(eval|exec|system)\s*\(/i); // Funções perigosas

  // Verificar tentativas de manipulação do sistema
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

// Função para sanitizar entrada
function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[{}$`]/g, "") // Remove caracteres especiais
    .trim()
    .substring(0, 500); // Limita tamanho
}

export async function parseTransactionWithAI(
  userInput: string,
): Promise<AIResponse> {
  try {
    // Verificar prompt injection
    if (detectPromptInjection(userInput)) {
      return {
        success: false,
        transactions: [],
        error: "Entrada Inválida!.",
        confidence: 0,
      };
    }

    // Sanitizar entrada
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
- HOUSING: Casa, aluguel, financiamento, condomínio
- TRANSPORTATION: Combustível, transporte, Uber, ônibus, manutenção carro
- FOOD: Comida, restaurante, supermercado, lanche, delivery
- SHOPPING: Roupas, eletrônicos, presentes, compras em geral
- ENTERTAINMENT: Cinema, jogos, streaming, viagens, lazer, bar
- HEALTH: Médico, farmácia, plano de saúde, academia, dentista
- UTILITY: Luz, água, internet, telefone, gás, contas básicas
- EDUCATION: Curso, livro, escola, faculdade, material escolar
- PETS: Veterinário, ração, petshop, medicamentos pet
- BEAUTY: Salão, cosméticos, cuidados pessoais, barbeiro
- INSURANCE: Seguro carro, casa, vida, saúde
- TAXES: Impostos, IPTU, taxas bancárias, multas, contas
- LOAN_EXPENSE: Dinheiro emprestado para alguém
- OTHER: Outros gastos que não se encaixam

CATEGORIAS PARA RECEITAS/DEPÓSITOS (DEPOSIT):
- SALARY: Salário CLT, pró-labore, pagamento trabalho
- FREELANCE: Trabalhos extras, consultoria, freela
- BUSINESS: Vendas, lucros, receitas de negócio próprio
- INVESTMENT: Dividendos, juros, rendimentos, lucros investimento
- BONUS: 13º salário, PLR, comissões, prêmios, bônus
- GIFT: Dinheiro de presente, doações recebidas
- REFUND: Devoluções, estornos, reembolsos
- RENTAL: Aluguel recebido, renda de imóveis
- SIDE_HUSTLE: Vendas online, apps, renda extra
- LOAN_INCOME: Dinheiro recebido emprestado
- OTHER: Outras receitas que não se encaixam

MÉTODOS DE PAGAMENTO:
- CREDIT_CARD: Cartão de crédito, parcelado
- DEBIT_CARD: Cartão de débito
- CASH: Dinheiro, à vista
- PIX: PIX, transferência instantânea
- BANK_TRANSFER: Transferência bancária, TED, DOC
- BANK_SLIP: Boleto bancário
- OTHER: Outros métodos

EXEMPLOS:
Input: "Comprei um celular por R$ 2400 no cartão em 12x"
Output: {"success": true, "transactions": [{"name": "Celular", "amount": 2400, "type": "EXPENSE", "category": "SHOPPING", "paymentMethod": "CREDIT_CARD", "date": "2025-01-19", "installments": 12}], "confidence": 95}

Input: "Recebi meu salário de 5000 reais"
Output: {"success": true, "transactions": [{"name": "Salário", "amount": 5000, "type": "DEPOSIT", "category": "SALARY", "paymentMethod": "BANK_TRANSFER", "date": "2025-01-19", "installments": 1}], "confidence": 90}

Input: "Paguei R$ 80 de combustível no posto"
Output: {"success": true, "transactions": [{"name": "Combustível", "amount": 80, "type": "EXPENSE", "category": "TRANSPORTATION", "paymentMethod": "CASH", "date": "2025-01-19", "installments": 1}], "confidence": 85}

Input: "Emprestei 500 reais para meu irmão"
Output: {"success": true, "transactions": [{"name": "Empréstimo para irmão", "amount": 500, "type": "EXPENSE", "category": "LOAN_EXPENSE", "paymentMethod": "CASH", "date": "2025-01-19", "installments": 1}], "confidence": 90}

Input: "Recebi 1000 reais emprestado do banco"
Output: {"success": true, "transactions": [{"name": "Empréstimo bancário", "amount": 1000, "type": "DEPOSIT", "category": "LOAN_INCOME", "paymentMethod": "BANK_TRANSFER", "date": "2025-01-19", "installments": 1}], "confidence": 85}

ENTRADA DO USUÁRIO:
"${sanitizedInput}"

Analise esta entrada e extraia as informações da transação. Use a data de hoje (${new Date().toISOString().split("T")[0]}) se não especificada. Responda APENAS com o JSON válido:`;

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
      temperature: 0.1,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim();

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

      // Validar e normalizar dados
      const validatedTransaction: ParsedTransaction = {
        name: String(transaction.name).substring(0, 100),
        amount: Math.abs(Number(transaction.amount)),
        type: transaction.type,
        category: [
          "HOUSING",
          "TRANSPORTATION",
          "FOOD",
          "ENTERTAINMENT",
          "HEALTH",
          "UTILITY",
          "SALARY",
          "EDUCATION",
          "OTHER",
        ].includes(transaction.category)
          ? transaction.category
          : "OTHER",
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
        date: transaction.date ? new Date(transaction.date) : new Date(),
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
