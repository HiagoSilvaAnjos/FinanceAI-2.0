import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import AddTransactionButton from "@/components/add-transaction-button";
import AITransactionButton from "@/components/ai-transaction-button";
import GenerateReportButton from "@/components/generate-report-button";
import { getUsageAndTransactionCount } from "@/data/get-ai-usage/get-ai-usage";
import { getTransactions } from "@/data/get-transactions-data/get-transactions-data";
import { auth } from "@/lib/auth";

import TransactionsList from "./_components/transactions-list";
import { TransactionsListSkeleton } from "./_components/transactions-list-skeleton";

// Componente para buscar os dados das transações
async function TransactionsData({ page }: { page: number }) {
  const { transactions, totalCount } = await getTransactions({
    page,
    limit: 200,
  });

  return (
    <TransactionsList transactions={transactions} totalCount={totalCount} />
  );
}

// Componente principal da página
interface TransactionsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

const TransactionsPage = async ({ searchParams }: TransactionsPageProps) => {
  const { page: pageParam } = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const { hasTransactions, usage } = await getUsageAndTransactionCount();

  const page = Number(pageParam ?? "1");

  // Para o botão de Gerar Relatório, usamos o mês e ano atuais
  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const currentYear = String(currentDate.getFullYear());

  return (
    <>
      <div className="space-y-6 p-6">
        <div className="flex w-full flex-col items-start justify-between gap-4 text-2xl md:flex-row md:items-center">
          <h1 className="text-2xl font-bold">Transações</h1>
          <div className="flex flex-wrap items-center gap-4">
            <AITransactionButton hasQuota={usage.transactions.hasQuota} />
            <GenerateReportButton
              month={currentMonth}
              year={currentYear}
              hasTransactions={hasTransactions}
              hasQuota={usage.reports.hasQuota}
            />
            <AddTransactionButton />
          </div>
        </div>
        <div className="mt-4">
          <Suspense fallback={<TransactionsListSkeleton />}>
            <TransactionsData page={page} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default TransactionsPage;
