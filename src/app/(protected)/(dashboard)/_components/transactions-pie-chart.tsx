"use client";

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Pie, PieChart } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TRANSACTION_TYPES } from "@/constants/transactions";
import { TransactionPercentagePerType } from "@/data/get-dashboard/types";

import PercentageItem from "./percentage-item";

const chartConfig = {
  [TRANSACTION_TYPES.DEPOSIT]: {
    label: "Receita",
    color: "#55B02E",
  },
  [TRANSACTION_TYPES.EXPENSE]: {
    label: "Despesas",
    color: "#E93030",
  },
} satisfies ChartConfig;

interface TransactionsPieChartProps {
  typesPercentage: TransactionPercentagePerType;
  depositsTotal: number;
  expensesTotal: number;
}

const TransactionsPieChart = ({
  typesPercentage,
  depositsTotal,
  expensesTotal,
}: TransactionsPieChartProps) => {
  const chartData = [
    {
      type: TRANSACTION_TYPES.DEPOSIT,
      amount: depositsTotal,
      fill: "#55B02E",
    },
    {
      type: TRANSACTION_TYPES.EXPENSE,
      amount: expensesTotal,
      fill: "#E93030",
    },
  ];

  const hasTransactions = depositsTotal > 0 || expensesTotal > 0;

  return (
    <Card className="flex flex-col p-6">
      <CardContent className="flex-1 pb-0">
        {hasTransactions ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full md:max-w-sm"
          >
            <PieChart>
              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="type"
                innerRadius={60}
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma transação encontrada para este período.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <PercentageItem
            icon={<TrendingUpIcon size={16} className="text-primary" />}
            title="Receita"
            value={typesPercentage[TRANSACTION_TYPES.DEPOSIT]}
          />
          <PercentageItem
            icon={<TrendingDownIcon size={16} className="text-red-500" />}
            title="Despesas"
            value={typesPercentage[TRANSACTION_TYPES.EXPENSE]}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsPieChart;
