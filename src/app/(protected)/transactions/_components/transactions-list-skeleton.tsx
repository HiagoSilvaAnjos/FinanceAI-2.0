import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TransactionsListSkeleton() {
  return (
    <div className="flex h-[calc(100vh-200px)] flex-col bg-background">
      {/* Barra de busca skeleton */}
      <div className="sticky top-0 z-10 space-y-4 border-b bg-background p-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 bg-white/10" />
          <Skeleton className="h-10 w-10 bg-white/10" />
        </div>
      </div>

      {/* Lista de transações skeleton */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Grupo 1 */}
        <div>
          <Skeleton className="mb-3 h-4 w-16 bg-white/10" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-1 items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 bg-white/10" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-20 rounded bg-white/10" />
                        <Skeleton className="h-3 w-16 bg-white/10" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20 bg-white/10" />
                    <Skeleton className="h-8 w-8 bg-white/10" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Grupo 2 */}
        <div>
          <Skeleton className="mb-3 h-4 w-20 bg-white/10" />
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-1 items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40 bg-white/10" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-24 rounded bg-white/10" />
                        <Skeleton className="h-3 w-12 bg-white/10" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-24 bg-white/10" />
                    <Skeleton className="h-8 w-8 bg-white/10" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Grupo 3 */}
        <div>
          <Skeleton className="mb-3 h-4 w-24 bg-white/10" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-1 items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-36 bg-white/10" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-20 rounded bg-white/10" />
                        <Skeleton className="h-3 w-14 bg-white/10" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20 bg-white/10" />
                    <Skeleton className="h-8 w-8 bg-white/10" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
