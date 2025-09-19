/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  installmentGroupTable,
  transactionTable,
  userTable,
} from "@/db/schema";
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
    redirect("/authentication");
  }

  const userId = session.user.id;

  // Verificar se o usuário existe na tabela
  const userExists = await db.query.userTable.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });

  // Se o usuário não existir, criar ele
  if (!userExists) {
    await db.insert(userTable).values({
      id: session.user.id,
      name: session.user.name || session.user.email?.split("@")[0] || "User",
      email: session.user.email || "",
      emailVerified: session.user.emailVerified || false,
      image: session.user.image || null,
    });
  }

  // Se for uma atualização (tem ID), fazemos o update
  if (params.id) {
    await handleTransactionUpdate(params, userId);
  } else {
    // INSERT - Nova transação
    await handleTransactionCreate(params, userId);
  }

  revalidatePath("/transactions");
};

// Função para lidar com criação de transações
async function handleTransactionCreate(
  params: UpsertTransactionParams,
  userId: string,
) {
  // Se for cartão de crédito e tiver parcelas, criar sistema de parcelas
  if (
    params.paymentMethod === "CREDIT_CARD" &&
    params.installments &&
    params.installments > 1
  ) {
    // Criar o grupo de parcelas
    const [installmentGroup] = await db
      .insert(installmentGroupTable)
      .values({
        originalName: params.name,
        originalAmount: params.amount.toString(),
        totalInstallments: params.installments,
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
        userId,
      })
      .returning();

    const installmentAmount = params.amount / params.installments;
    const transactionsToCreate = [];

    for (let i = 0; i < params.installments; i++) {
      // Calcular a data de cada parcela
      const installmentDate = new Date(params.date);
      installmentDate.setMonth(installmentDate.getMonth() + i);

      // Nome da transação incluindo informação da parcela
      const installmentName = `${params.name} (${i + 1}/${params.installments})`;

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
        installmentGroupId: installmentGroup.id,
        installmentNumber: i + 1,
      });
    }

    // Inserir todas as transações parceladas
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
      installmentGroupId: null,
      installmentNumber: null,
    });
  }
}

// Função para lidar com atualizações de transações
async function handleTransactionUpdate(
  params: UpsertTransactionParams,
  userId: string,
) {
  // Buscar a transação atual
  const currentTransaction = await db.query.transactionTable.findFirst({
    where: (transactions, { eq }) => eq(transactions.id, params.id!),
    with: {
      installmentGroup: true,
    },
  });

  if (!currentTransaction) {
    throw new Error("Transaction not found");
  }

  // Se a transação atual faz parte de um grupo de parcelas
  if (currentTransaction.installmentGroupId) {
    await handleInstallmentUpdate(currentTransaction, params, userId);
  } else {
    // Se mudou para cartão de crédito com parcelas
    if (
      params.paymentMethod === "CREDIT_CARD" &&
      params.installments &&
      params.installments > 1
    ) {
      // Deletar a transação atual e criar um grupo de parcelas
      await db
        .delete(transactionTable)
        .where(eq(transactionTable.id, params.id!));
      await handleTransactionCreate(params, userId);
    } else {
      // Atualização normal de transação única
      await db
        .update(transactionTable)
        .set({
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
          updatedAt: new Date(),
        })
        .where(eq(transactionTable.id, params.id!));
    }
  }
}

// Função para lidar com atualizações de parcelas
async function handleInstallmentUpdate(
  currentTransaction: any,
  params: UpsertTransactionParams,
  userId: string,
) {
  const installmentGroup = currentTransaction.installmentGroup;

  // Se mudou de cartão de crédito para outro método, deletar todas as parcelas
  if (params.paymentMethod !== "CREDIT_CARD") {
    // Deletar todas as transações do grupo
    await db
      .delete(transactionTable)
      .where(eq(transactionTable.installmentGroupId, installmentGroup.id));

    // Deletar o grupo de parcelas
    await db
      .delete(installmentGroupTable)
      .where(eq(installmentGroupTable.id, installmentGroup.id));

    // Criar nova transação única
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
      installmentGroupId: null,
      installmentNumber: null,
    });
    return;
  }

  // Se manteve cartão de crédito, atualizar o grupo e todas as parcelas
  // CORREÇÃO: Usar o valor original do grupo, não o valor da parcela individual
  const totalAmount = params.amount; // Este é o valor total que o usuário quer
  const newInstallmentAmount = totalAmount / installmentGroup.totalInstallments;

  // Atualizar o grupo de parcelas
  await db
    .update(installmentGroupTable)
    .set({
      originalName: params.name,
      originalAmount: totalAmount.toString(), // Salvar o valor total
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
      updatedAt: new Date(),
    })
    .where(eq(installmentGroupTable.id, installmentGroup.id));

  // Buscar todas as transações do grupo
  const allInstallments = await db.query.transactionTable.findMany({
    where: (transactions, { eq }) =>
      eq(transactions.installmentGroupId, installmentGroup.id),
    orderBy: (transactions, { asc }) => [asc(transactions.installmentNumber)],
  });

  // Atualizar todas as parcelas com os novos valores
  for (const installment of allInstallments) {
    const installmentDate = new Date(params.date);
    installmentDate.setMonth(
      installmentDate.getMonth() + (installment.installmentNumber! - 1),
    );

    await db
      .update(transactionTable)
      .set({
        // CORREÇÃO: Usar o nome original, não adicionar sufixo sobre sufixo
        name: `${params.name} (${installment.installmentNumber}/${installmentGroup.totalInstallments})`,
        amount: newInstallmentAmount.toString(),
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
        date: installmentDate,
        updatedAt: new Date(),
      })
      .where(eq(transactionTable.id, installment.id));
  }
}
