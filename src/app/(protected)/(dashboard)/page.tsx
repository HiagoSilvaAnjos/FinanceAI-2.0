// src/app/(protected)/(dashboard)/page.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import AITransactionButton from "@/components/ai-transaction-button";
import GenerateReportButton from "@/components/generate-report-button";
import MonthlyHistoryChart from "@/components/monthly-history-chart";
import NavBar from "@/components/navbar";
import { getDashboard } from "@/data/get-dashboard";
import { getHistoricalData } from "@/data/get-historical-data";
import { auth } from "@/lib/auth";

import {
  ExpensesPerCategorySkeleton,
  LastTransactionsSkeleton,
  MonthlyHistoryChartSkeleton,
  SummaryCardsSkeleton,
  TimeSelectSkeleton,
  TransactionsPieChartSkeleton,
} from "./_components/dashboard-skeleton";
import ExpensesPerCategory from "./_components/expenses-per-category";
import LastTransactions from "./_components/last-transactions";
import SummaryCards from "./_components/summary-cards";
import TimeSelect from "./_components/time-select";
import TransactionsPieChart from "./_components/transactions-pie-chart";

// --- Componentes Assíncronos Individuais ---

async function SummaryCardsData({
  month,
  year,
}: {
  month: string;
  year: string;
}) {
  const dashboard = await getDashboard(month, year);
  return <SummaryCards {...dashboard} />;
}

async function PieChartData({ month, year }: { month: string; year: string }) {
  const dashboard = await getDashboard(month, year);
  return <TransactionsPieChart {...dashboard} />;
}

async function ExpensesData({ month, year }: { month: string; year: string }) {
  const dashboard = await getDashboard(month, year);
  return (
    <ExpensesPerCategory
      expensesPerCategory={dashboard.totalExpensePerCategory}
    />
  );
}

async function LastTransactionsData({
  month,
  year,
}: {
  month: string;
  year: string;
}) {
  const dashboard = await getDashboard(month, year);
  return <LastTransactions lastTransactions={dashboard.lastTransactions} />;
}

async function HistoryChartData({ year }: { year: string }) {
  const historicalData = await getHistoricalData(year);
  return <MonthlyHistoryChart data={historicalData} selectedYear={year} />;
}

// --- Página Principal ---

interface HomeProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { month, year } = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const currentYear = String(currentDate.getFullYear());
  const selectedMonth = month ?? currentMonth;
  const selectedYear = year ?? currentYear;

  return (
    <div>
      <NavBar />
      <div className="space-y-6 p-6">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <AITransactionButton />
            <GenerateReportButton month={selectedMonth} year={selectedYear} />
            <Suspense fallback={<TimeSelectSkeleton />}>
              <TimeSelect
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            </Suspense>
          </div>
        </div>

        <div className="grid grid-cols-[2fr,1fr] gap-6">
          <div className="flex flex-col gap-6">
            <Suspense fallback={<SummaryCardsSkeleton />}>
              <SummaryCardsData month={selectedMonth} year={selectedYear} />
            </Suspense>
            <div className="grid grid-cols-3 grid-rows-1 gap-6">
              <Suspense fallback={<TransactionsPieChartSkeleton />}>
                <PieChartData month={selectedMonth} year={selectedYear} />
              </Suspense>
              <Suspense fallback={<ExpensesPerCategorySkeleton />}>
                <ExpensesData month={selectedMonth} year={selectedYear} />
              </Suspense>
            </div>
          </div>
          <Suspense fallback={<LastTransactionsSkeleton />}>
            <LastTransactionsData month={selectedMonth} year={selectedYear} />
          </Suspense>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<MonthlyHistoryChartSkeleton />}>
            <HistoryChartData year={selectedYear} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
