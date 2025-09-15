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

  const userId = session.user.id;

  // Dados comuns para insert e update
  const transactionData = {
    name: params.name,
    amount: params.amount.toString(),
    type: params.type as "DEPOSIT" | "EXPENSE" | "INVESTIMENT",
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
  };

  if (params.id) {
    // UPDATE
    await db
      .update(transactionTable)
      .set({
        ...transactionData,
        updatedAt: new Date(),
      })
      .where(eq(transactionTable.id, params.id));
  } else {
    // INSERT
    await db.insert(transactionTable).values(transactionData);
  }

  revalidatePath("/transactions");
};
