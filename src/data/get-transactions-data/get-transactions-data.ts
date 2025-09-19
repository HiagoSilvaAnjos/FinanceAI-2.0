import { count, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { transactionTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const getTransactions = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const offset = (page - 1) * limit;

  const where = eq(transactionTable.userId, userId);

  // Fetch transactions
  const transactions = await db.query.transactionTable.findMany({
    where,
    with: {
      installmentGroup: true,
    },
    orderBy: [desc(transactionTable.date)],
    limit,
    offset,
  });

  // Fetch the total
  const totalResult = await db
    .select({ total: count() })
    .from(transactionTable)
    .where(where);

  const totalCount = totalResult[0]?.total ?? 0;

  return { transactions, totalCount };
};
