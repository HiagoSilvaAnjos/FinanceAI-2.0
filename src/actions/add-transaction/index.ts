"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { transactionTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { upsertTransactionSchema } from "./schema";

type UpsertTransactionParams = z.infer<typeof upsertTransactionSchema> & {
  id?: string;
};

export const upsertTransaction = async (params: UpsertTransactionParams) => {
  upsertTransactionSchema.parse(params);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  console.log("Session user:", session.user);

  const userId = session?.user.id;

  // Se for uma atualização (tem ID), fazemos o update normal
  if (params.id) {
    const transactionData = {
      name: params.name,
      amount: params.amount.toString(),
      type: params.type as "DEPOSIT" | "EXPENSE",
      category: params.category as
        | "HOUSING"
        | "TRANSPORTATION"
        | "FOOD"
        | "ENTERTAINMENT"
        | "HEALTH"
        | "UTILITY"
        | "SALARY"
        | "EDUCATION"
        | "OTHER",
      paymentMethod: params.paymentMethod as
        | "CREDIT_CARD"
        | "DEBIT_CARD"
        | "BANK_TRANSFER"
        | "BANK_SLIP"
        | "CASH"
        | "PIX"
        | "OTHER",
      date: params.date,
      userId,
      updatedAt: new Date(),
    };

    await db
      .update(transactionTable)
      .set(transactionData)
      .where(eq(transactionTable.id, params.id));
  } else {
    // INSERT - Nova transação

    // Se for cartão de crédito e tiver parcelas, criar múltiplas transações
    if (
      params.paymentMethod === "CREDIT_CARD" &&
      params.installments &&
      params.installments > 1
    ) {
      const installments = params.installments;
      const installmentAmount = params.amount / installments;

      // Criar array de transações para inserir
      const transactionsToCreate = [];

      for (let i = 0; i < installments; i++) {
        // Calcular a data de cada parcela (mesmo dia, meses seguintes)
        const installmentDate = new Date(params.date);
        installmentDate.setMonth(installmentDate.getMonth() + i);

        // Nome da transação incluindo informação da parcela
        const installmentName = `${params.name} (${i + 1}/${installments})`;

        transactionsToCreate.push({
          name: installmentName,
          amount: installmentAmount.toString(),
          type: params.type as "DEPOSIT" | "EXPENSE",
          category: params.category as
            | "HOUSING"
            | "TRANSPORTATION"
            | "FOOD"
            | "ENTERTAINMENT"
            | "HEALTH"
            | "UTILITY"
            | "SALARY"
            | "EDUCATION"
            | "OTHER",
          paymentMethod: params.paymentMethod as
            | "CREDIT_CARD"
            | "DEBIT_CARD"
            | "BANK_TRANSFER"
            | "BANK_SLIP"
            | "CASH"
            | "PIX"
            | "OTHER",
          date: installmentDate,
          userId,
        });
      }

      // Inserir todas as transações parceladas de uma vez
      await db.insert(transactionTable).values(transactionsToCreate);
    } else {
      // Transação única (não é cartão de crédito ou é só 1 parcela)
      await db.insert(transactionTable).values({
        name: params.name,
        amount: params.amount.toString(),
        type: params.type as "DEPOSIT" | "EXPENSE",
        category: params.category as
          | "HOUSING"
          | "TRANSPORTATION"
          | "FOOD"
          | "ENTERTAINMENT"
          | "HEALTH"
          | "UTILITY"
          | "SALARY"
          | "EDUCATION"
          | "OTHER",
        paymentMethod: params.paymentMethod as
          | "CREDIT_CARD"
          | "DEBIT_CARD"
          | "BANK_TRANSFER"
          | "BANK_SLIP"
          | "CASH"
          | "PIX"
          | "OTHER",
        date: params.date,
        userId,
      });
    }
  }

  revalidatePath("/transactions");
};
