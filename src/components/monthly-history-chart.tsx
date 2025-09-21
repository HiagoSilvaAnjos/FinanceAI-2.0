/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";

interface MonthlyData {
  month: number;
  monthName: string;
  deposits: number;
  expenses: number;
  balance: number;
}

interface MonthlyHistoryChartProps {
  data: MonthlyData[];
  selectedYear: string;
}

const MonthlyHistoryChart = ({
  data,
  selectedYear,
}: MonthlyHistoryChartProps) => {
  // Formatar dados para o gráfico
  const chartData = data.map((item) => ({
    month: item.monthName.substring(0, 3), // Abreviar nomes dos meses
    Receitas: item.deposits,
    Despesas: item.expenses,
    Saldo: item.balance,
  }));

  // Tooltip customizado com cor de fundo personalizada
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-300 bg-background p-3 shadow-lg dark:border-gray-600">
          <p className="mb-2 font-medium text-gray-900 dark:text-white">{`${label} de ${selectedYear}`}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="mt-1 text-sm text-gray-700 dark:text-gray-300"
              style={{ color: entry.color }}
            >
              {`${entry.dataKey}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Histórico de Receitas e Despesas - {selectedYear}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visualização mensal dos seus dados financeiros
        </p>
      </CardHeader>
      <CardContent className="w-full overflow-x-auto">
        <ResponsiveContainer width="100%" minWidth={800} height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
            />
            <Legend />
            <Bar
              dataKey="Receitas"
              fill="#55B02E"
              name="Receitas"
              radius={[2, 2, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="Despesas"
              fill="#E93030"
              name="Despesas"
              radius={[2, 2, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="Saldo"
              fill="#3B82F6"
              name="Saldo"
              radius={[2, 2, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyHistoryChart;
