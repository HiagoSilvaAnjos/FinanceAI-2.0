import { z } from "zod";

export const upsertTransactionSchema = z
  .object({
    name: z.string().trim().min(1, {
      message: "O nome é obrigatório.",
    }),

    amount: z
      .number({
        error: "O valor é obrigatório",
      })
      .positive({
        message: "O valor deve ser maior que zero",
      }),

    type: z.enum(["DEPOSIT", "EXPENSE"], {
      message: "Tipo de transação inválido",
    }),

    category: z.enum(
      [
        // Categorias para DESPESAS (EXPENSE)
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
        // Categorias para DEPÓSITOS (DEPOSIT)
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
        // Fallback
        "OTHER",
      ],
      {
        message: "Categoria inválida",
      },
    ),

    paymentMethod: z.enum(
      [
        "CREDIT_CARD",
        "DEBIT_CARD",
        "BANK_TRANSFER",
        "BANK_SLIP",
        "CASH",
        "PIX",
        "OTHER",
      ],
      {
        message: "Método de pagamento inválido",
      },
    ),

    date: z.date(),

    // Campo opcional para parcelas
    installments: z.number().min(1).max(24).optional(),

    // Validação customizada para garantir que categoria combine com tipo
  })
  .refine(
    (data) => {
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

      if (data.type === "EXPENSE") {
        return expenseCategories.includes(data.category);
      } else {
        return depositCategories.includes(data.category);
      }
    },
    {
      message: "Categoria não compatível com o tipo de transação selecionado",
      path: ["category"],
    },
  );
