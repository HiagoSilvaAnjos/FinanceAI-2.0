import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { installmentGroupTable, transactionTable } from "@/db/schema";

export type Transaction = InferSelectModel<typeof transactionTable>;
export type NewTransaction = InferInsertModel<typeof transactionTable>;

export type InstallmentGroup = InferSelectModel<typeof installmentGroupTable>;
export type NewInstallmentGroup = InferInsertModel<
  typeof installmentGroupTable
>;

// Tipo estendido para transação com informações de parcelas
export type TransactionWithInstallments = Transaction & {
  installmentGroup?: InstallmentGroup | null;
};

// Tipo para exibição de parcelas agrupadas
export type InstallmentGroupWithTransactions = InstallmentGroup & {
  transactions: Transaction[];
};
