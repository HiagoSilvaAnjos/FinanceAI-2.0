import { InferSelectModel } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TRANSACTION_PAYMENT_METHOD_ICONS,
  TRANSACTION_TYPES,
} from "@/constants/transactions";
import { transactionTable } from "@/db/schema";
import { formatCurrency } from "@/lib/currency";

type Transaction = InferSelectModel<typeof transactionTable>;

interface SerializedTransaction extends Omit<Transaction, "amount"> {
  amount: number;
}

interface LastTransactionsProps {
  lastTransactions: SerializedTransaction[];
}

const LastTransactions = ({ lastTransactions }: LastTransactionsProps) => {
  const getAmountColor = (transaction: SerializedTransaction) => {
    if (transaction.type === TRANSACTION_TYPES.EXPENSE) {
      return "text-red-500";
    }
    if (transaction.type === TRANSACTION_TYPES.DEPOSIT) {
      return "text-primary";
    }
    return "text-white";
  };

  const getAmountPrefix = (transaction: SerializedTransaction) => {
    if (transaction.type === TRANSACTION_TYPES.DEPOSIT) {
      return "+";
    }
    return "-";
  };

  return (
    <ScrollArea className="max-h-[900px] rounded-md border">
      <CardHeader className="mb-2 mt-4 flex items-center justify-between">
        <CardTitle className="font-bold">Suas últimas transações</CardTitle>
        <Button className="rounded-full font-medium text-white" asChild>
          <Link href="/transactions">Ver mais</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {lastTransactions.length > 0 ? (
          lastTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white bg-opacity-[3%] p-3 text-white">
                  <Image
                    src={`/${TRANSACTION_PAYMENT_METHOD_ICONS[transaction.paymentMethod]}`}
                    height={20}
                    width={20}
                    alt={transaction.paymentMethod}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold">{transaction.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <p className={`text-sm font-bold ${getAmountColor(transaction)}`}>
                {getAmountPrefix(transaction)}
                {formatCurrency(Number(transaction.amount))}
              </p>
            </div>
          ))
        ) : (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma transação encontrada para este período
            </p>
          </div>
        )}
      </CardContent>
    </ScrollArea>
  );
};

export default LastTransactions;
