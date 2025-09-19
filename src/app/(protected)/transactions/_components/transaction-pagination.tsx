"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalCount: number;
  perPage: number;
}

export const PaginationControls = ({
  hasNextPage,
  hasPrevPage,
  totalCount,
  perPage,
}: PaginationControlsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ?? "1";
  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="flex items-center justify-between gap-2 p-2">
      <div className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevPage}
          onClick={() => {
            router.push(`${pathname}?page=${Number(page) - 1}`);
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => {
            router.push(`${pathname}?page=${Number(page) + 1}`);
          }}
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
