import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TRANSACTION_CATEGORY_LABELS } from "@/constants/transactions";
import { TotalExpensePerCategory } from "@/data/get-dashboard/types";

interface ExpensesPerCategoryProps {
  expensesPerCategory: TotalExpensePerCategory[];
}

const ExpensesPerCategory = ({
  expensesPerCategory,
}: ExpensesPerCategoryProps) => {
  return (
    <ScrollArea className="col-span-2 h-full rounded-md border pb-6">
      <CardHeader className="mb-2 mt-4">
        <CardTitle className="font-semibold">
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
                <p className="text-sm font-bold">
                  {category.percentageOfTotal}%
                </p>
              </div>
              <Progress value={category.percentageOfTotal} />
            </div>
          ))
        ) : (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma despesa encontrada para este período
            </p>
          </div>
        )}
      </CardContent>
    </ScrollArea>
  );
};

export default ExpensesPerCategory;
