import { z } from "zod";

export const delteTransactionSchema = z.object({
  id: z.string({
    message: "O id do produto é obrigatório.",
  }),
});

export type DelteTransactionSchema = z.infer<typeof delteTransactionSchema>;
