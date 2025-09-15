import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import AddTransactionButton from "@/components/add-transaction-button";
import { DataTable } from "@/components/ui/data-table";
import { db } from "@/db"; // ajuste o path para sua instância do drizzle
import { transactionTable } from "@/db/schema"; // ajuste o path para seu schema
import { auth } from "@/lib/auth";

import { transactionColumns } from "./columns";

const TransactionsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const transactions = await db
    .select()
    .from(transactionTable)
    .where(eq(transactionTable.userId, session.user.id));

  console.log(transactions);

  return (
    <>
      {/* <NavBar /> */}
      <div className="space-y-6 p-6">
        <div className="flex w-full items-center justify-between text-2xl">
          <h1 className="text-2xl font-bold">Transações</h1>
          <AddTransactionButton />
        </div>
        <DataTable columns={transactionColumns} data={transactions} />
      </div>
    </>
  );
};

export default TransactionsPage;
