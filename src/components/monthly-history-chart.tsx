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

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="font-medium">{`${label} ${selectedYear}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
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
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
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
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="Receitas"
              fill="#55B02E"
              name="Receitas"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="Despesas"
              fill="#E93030"
              name="Despesas"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="Saldo"
              fill="#3B82F6"
              name="Saldo"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyHistoryChart;
