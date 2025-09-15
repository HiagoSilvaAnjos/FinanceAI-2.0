import { z } from "zod";

export const upsertTransactionSchema = z.object({
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

  type: z.enum(["DEPOSIT", "EXPENSE", "INVESTIMENT"], {
    message: "Tipo de transação inválido",
  }),

  category: z.enum(
    [
      "HOUSING",
      "TRANSPORTATION",
      "FOOD",
      "ENTERTAINMENT",
      "HEALTH",
      "UTILITY",
      "SALARY",
      "EDUCATION",
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
});
