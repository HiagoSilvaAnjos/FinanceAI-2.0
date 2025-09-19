import { Skeleton } from "@/components/ui/skeleton";

export function SummaryCardsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[125px] w-full rounded-xl bg-white/10" />
      <div className="grid grid-cols-2 gap-6">
        <Skeleton className="h-[101px] w-full rounded-xl bg-white/10" />
        <Skeleton className="h-[101px] w-full rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

export function TransactionsPieChartSkeleton() {
  return (
    <Skeleton className="flex h-[370px] w-full flex-col rounded-md border bg-white/10 p-6" />
  );
}

export function ExpensesPerCategorySkeleton() {
  return (
    <Skeleton className="col-span-2 h-full min-h-[370px] rounded-md border bg-white/10 pb-6" />
  );
}

export function LastTransactionsSkeleton() {
  return (
    <Skeleton className="h-full min-h-[500px] w-full rounded-md bg-white/10" />
  );
}

export function MonthlyHistoryChartSkeleton() {
  return <Skeleton className="h-[422px] w-full rounded-xl bg-white/10" />;
}

export function TimeSelectSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-9 w-[150px] rounded-full bg-white/10" />
      <Skeleton className="h-9 w-[100px] rounded-full bg-white/10" />
    </div>
  );
}
