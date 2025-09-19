import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TransactionsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 7 }).map((_, i) => (
                <TableHead key={i} className="py-6">
                  <Skeleton className="h-5 w-24 bg-white/10" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full bg-white/10" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-2 p-2">
        <Skeleton className="h-8 w-24 bg-white/10" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-md bg-white/10" />
          <Skeleton className="h-9 w-24 rounded-md bg-white/10" />
        </div>
      </div>
    </div>
  );
}
