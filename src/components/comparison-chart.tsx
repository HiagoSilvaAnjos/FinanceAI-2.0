/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";

interface ComparisonData {
  currentMonth: {
    month: string;
    deposits: number;
    expenses: number;
    balance: number;
  };
  previousMonth: {
    month: string;
    deposits: number;
    expenses: number;
    balance: number;
  };
  percentageChange: {
    deposits: number;
    expenses: number;
    balance: number;
  };
}

interface ComparisonChartProps {
  data: ComparisonData;
}

const ComparisonChart = ({ data }: ComparisonChartProps) => {
  // Preparar dados para o gráfico
  const chartData = [
    {
      category: "Receitas",
      "Mês Anterior": data.previousMonth.deposits,
      "Mês Atual": data.currentMonth.deposits,
    },
    {
      category: "Despesas",
      "Mês Anterior": data.previousMonth.expenses,
      "Mês Atual": data.currentMonth.expenses,
    },
    {
      category: "Saldo",
      "Mês Anterior": data.previousMonth.balance,
      "Mês Atual": data.currentMonth.balance,
    },
  ];

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="font-medium">{label}</p>
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
    <div className="grid grid-cols-1 gap-6">
      {/* Gráfico de Comparação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Comparação Mensal
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {data.previousMonth.month} vs {data.currentMonth.month}
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="category"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="Mês Anterior"
                fill="#55B02E"
                name="Mês Anterior"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="Mês Atual"
                fill="#3B82F6"
                name="Mês Atual"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparisonChart;
