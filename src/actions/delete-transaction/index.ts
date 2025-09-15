"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { transactionTable } from "@/db/schema";
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

  await db.delete(transactionTable).where(eq(transactionTable.id, params.id));

  revalidatePath("/transactions");
  revalidatePath("/");
};

export type DeleteTransactionParams = z.infer<typeof delteTransactionSchema>;
