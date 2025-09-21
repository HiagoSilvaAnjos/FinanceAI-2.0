"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TRANSACTION_CATEGORY_LABELS } from "@/constants/transactions";
import { TotalExpensePerCategory } from "@/data/get-dashboard/types";
import { formatCurrency } from "@/lib/currency";

interface ExpensesPerCategoryProps {
  expensesPerCategory: TotalExpensePerCategory[];
}

const ExpensesPerCategory = ({
  expensesPerCategory,
}: ExpensesPerCategoryProps) => {
  return (
    <ScrollArea className="col-span-2 h-full max-h-[500px] rounded-md border pb-6">
      <CardHeader className="mb-4 mt-4">
        <CardTitle className="text-base font-semibold md:text-xl">
          Seus gastos por categoria
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {expensesPerCategory.length > 0 ? (
          expensesPerCategory.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex w-full justify-between">
                <p className="text-sm font-bold">
                  {TRANSACTION_CATEGORY_LABELS[category.category]}
                </p>
                <div className="flex gap-2 text-sm font-bold">
                  <p>{category.percentageOfTotal}%</p>
                </div>
              </div>
              <Progress value={category.percentageOfTotal} />
              <p className="text-black dark:text-white">
                Total: {formatCurrency(category.totalAmount)}
              </p>
            </div>
          ))
        ) : (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-black dark:text-white">
              Nenhuma despesa encontrada para este período
            </p>
          </div>
        )}
      </CardContent>
    </ScrollArea>
  );
};

export default ExpensesPerCategory;
