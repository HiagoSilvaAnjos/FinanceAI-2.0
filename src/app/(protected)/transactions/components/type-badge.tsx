import { Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types/transaction";
const TRANSACTION_TYPES = {
  DEPOSIT: "DEPOSIT",
  EXPENSE: "EXPENSE",
  INVESTIMENT: "INVESTIMENT", // note que no seu schema está "INVESTIMENT" (sem o S)
} as const;

interface TransactioTypeBadgeProps {
  transaction: Transaction;
}

const TransactioTypeBadge = ({ transaction }: TransactioTypeBadgeProps) => {
  if (transaction.type === TRANSACTION_TYPES.DEPOSIT) {
    return (
      <Badge className="bg-muted font-bold text-primary hover:bg-muted">
        <Circle className="mr-2 fill-primary" size={10} />
        Deposito
      </Badge>
    );
  }

  if (transaction.type === TRANSACTION_TYPES.EXPENSE) {
    return (
      <Badge className="bg-muted font-bold text-red-500 hover:bg-muted">
        <Circle className="mr-2 border-none fill-red-500" size={10} />
        Despesa
      </Badge>
    );
  }

  if (transaction.type === TRANSACTION_TYPES.INVESTIMENT) {
    return (
      <Badge className="bg-muted font-bold text-primary text-white hover:bg-muted">
        <Circle className="mr-2 fill-white" size={10} />
        Investimento
      </Badge>
    );
  }

  return null;
};

export default TransactioTypeBadge;
