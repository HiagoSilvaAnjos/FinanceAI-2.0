/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { installmentGroupTable, transactionTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { DelteTransactionSchema, delteTransactionSchema } from "./schema";

export const deleteTransaction = async (params: DelteTransactionSchema) => {
  delteTransactionSchema.parse(params);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Buscar a transação a ser deletada
  const transactionToDelete = await db.query.transactionTable.findFirst({
    where: (transactions, { eq }) => eq(transactions.id, params.id),
    with: {
      installmentGroup: true,
    },
  });

  if (!transactionToDelete) {
    throw new Error("Transaction not found");
  }

  // Se a transação não faz parte de um grupo de parcelas, deletar normalmente
  if (!transactionToDelete.installmentGroupId) {
    await db.delete(transactionTable).where(eq(transactionTable.id, params.id));
  } else {
    // Se faz parte de um grupo de parcelas, aplicar regras de exclusão
    await handleInstallmentDeletion(transactionToDelete);
  }

  revalidatePath("/transactions");
  revalidatePath("/");
};

// Função para lidar com exclusão de parcelas
async function handleInstallmentDeletion(transaction: any) {
  const installmentGroup = transaction.installmentGroup;
  const installmentNumber = transaction.installmentNumber;

  // Buscar todas as transações do grupo
  const allInstallments = await db.query.transactionTable.findMany({
    where: (transactions, { eq }) =>
      eq(transactions.installmentGroupId, installmentGroup.id),
    orderBy: (transactions, { asc }) => [asc(transactions.installmentNumber)],
  });

  if (installmentNumber === 1) {
    // Se deletar a parcela 1, deletar todas as parcelas
    await db
      .delete(transactionTable)
      .where(eq(transactionTable.installmentGroupId, installmentGroup.id));

    // Deletar o grupo de parcelas
    await db
      .delete(installmentGroupTable)
      .where(eq(installmentGroupTable.id, installmentGroup.id));
  } else {
    // Se deletar qualquer parcela a partir da 2, deletar desta parcela em diante
    // Buscar parcelas >= à parcela atual
    const installmentsToDelete = allInstallments.filter(
      (inst) => inst.installmentNumber! >= installmentNumber,
    );

    // Deletar as parcelas
    for (const installmentToDelete of installmentsToDelete) {
      await db
        .delete(transactionTable)
        .where(eq(transactionTable.id, installmentToDelete.id));
    }

    // Verificar se sobrou alguma parcela
    const remainingInstallments = await db.query.transactionTable.findMany({
      where: (transactions, { eq }) =>
        eq(transactions.installmentGroupId, installmentGroup.id),
    });

    if (remainingInstallments.length === 0) {
      // Se não sobrou nenhuma parcela, deletar o grupo
      await db
        .delete(installmentGroupTable)
        .where(eq(installmentGroupTable.id, installmentGroup.id));
    } else {
      // Atualizar o total de parcelas no grupo
      const newTotalInstallments = remainingInstallments.length;
      await db
        .update(installmentGroupTable)
        .set({
          totalInstallments: newTotalInstallments,
          updatedAt: new Date(),
        })
        .where(eq(installmentGroupTable.id, installmentGroup.id));

      // Atualizar os nomes das parcelas restantes
      const sortedRemaining = remainingInstallments.sort(
        (a, b) => a.installmentNumber! - b.installmentNumber!,
      );

      for (let i = 0; i < sortedRemaining.length; i++) {
        const installment = sortedRemaining[i];
        const newInstallmentNumber = i + 1;

        await db
          .update(transactionTable)
          .set({
            installmentNumber: newInstallmentNumber,
            name: `${installmentGroup.originalName} (${newInstallmentNumber}/${newTotalInstallments})`,
            updatedAt: new Date(),
          })
          .where(eq(transactionTable.id, installment.id));
      }
    }
  }
}

export type DeleteTransactionParams = z.infer<typeof delteTransactionSchema>;
