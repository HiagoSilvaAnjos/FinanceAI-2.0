import { headers } from "next/headers";
import { redirect } from "next/navigation";

// import ComparisonChart from "@/components/comparison-chart";
import MonthlyHistoryChart from "@/components/monthly-history-chart";
import NavBar from "@/components/navbar";
import { getDashboard } from "@/data/get-dashboard";
import {
  // getComparisonData,
  getHistoricalData,
} from "@/data/get-historical-data";
import { auth } from "@/lib/auth";

import ExpensesPerCategory from "./_components/expenses-per-category";
import LastTransactions from "./_components/last-transactions";
import SummaryCards from "./_components/summary-cards";
import TimeSelect from "./_components/time-select";
import TransactionsPieChart from "./_components/transactions-pie-chart";

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

  // Define o mês e ano: parâmetro da URL > mês/ano atual > Janeiro/ano atual
  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const currentYear = String(currentDate.getFullYear());
  const selectedMonth = month ?? currentMonth;
  const selectedYear = year ?? currentYear;

  // Buscar dados do dashboard atual
  const dashboard = await getDashboard(selectedMonth, selectedYear);

  // Buscar dados históricos do ano
  const historicalData = await getHistoricalData(selectedYear);

  // Buscar dados de comparação
  // const comparisonData = await getComparisonData(selectedMonth, selectedYear);

  return (
    <div>
      <NavBar />
      <div className="space-y-6 p-6">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <TimeSelect
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>

        {/* Seção principal com resumo e transações */}
        <div className="grid grid-cols-[2fr,1fr] gap-6">
          <div className="flex flex-col gap-6">
            <SummaryCards {...dashboard} />
            <div className="grid grid-cols-3 grid-rows-1 gap-6">
              <TransactionsPieChart {...dashboard} />
              <ExpensesPerCategory
                expensesPerCategory={dashboard.totalExpensePerCategory}
              />
            </div>
          </div>
          <LastTransactions lastTransactions={dashboard.lastTransactions} />
        </div>

        {/* Seção de gráficos históricos */}
        <div className="space-y-6">
          {/* Gráfico de histórico mensal */}
          <MonthlyHistoryChart
            data={historicalData}
            selectedYear={selectedYear}
          />

          {/* Gráficos de comparação */}
          {/* <ComparisonChart data={comparisonData} /> */}
        </div>
      </div>
    </div>
  );
}
