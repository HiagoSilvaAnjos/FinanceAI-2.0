import { headers } from "next/headers";
import { redirect } from "next/navigation";

import NavBar from "@/components/navbar";
import { getDashboard } from "@/data/get-dashboard";
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

  // Define o mês: parâmetro da URL > mês atual > Janeiro
  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const currentYear = String(currentDate.getFullYear());
  const selectedMonth = month ?? currentMonth;
  const selectedYear = year ?? currentYear;

  const dashboard = await getDashboard(selectedMonth, selectedYear);

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
      </div>
    </div>
  );
}
