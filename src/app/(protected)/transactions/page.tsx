import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import AddTransactionButton from "@/components/add-transaction-button";
import NavBar from "@/components/navbar";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/db";
import { transactionTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { transactionColumns } from "./columns";

const TransactionsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const transactions = await db.query.transactionTable.findMany({
    where: eq(transactionTable.userId, session.user.id),
    with: {
      installmentGroup: true,
    },
  });

  console.log(transactions);

  return (
    <>
      <NavBar />
      <div className="space-y-6 p-6">
        <div className="flex w-full items-center justify-between text-2xl">
          <h1 className="text-2xl font-bold">Transações</h1>
          <AddTransactionButton />
        </div>
        <div className="mt-4">
          <DataTable columns={transactionColumns} data={transactions} />
        </div>
      </div>
    </>
  );
};

export default TransactionsPage;
