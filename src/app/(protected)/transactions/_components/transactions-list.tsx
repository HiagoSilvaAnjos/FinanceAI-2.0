/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  DollarSign,
  Filter,
  MoreVertical,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import React, { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DEPOSIT_CATEGORY_OPTIONS,
  EXPENSE_CATEGORY_OPTIONS,
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_PAYMENT_METHOD_ICONS,
  TRANSACTION_PAYMENT_METHOD_LABELS,
  TRANSACTION_PAYMENT_METHOD_OPTIONS,
} from "@/constants/transactions";
import { Transaction } from "@/types/transaction";

import DeleteTransactionButton from "./delete-transaction-button";
import EditTransactionButton from "./edit-transaction-button";

interface TransactionCardProps {
  transaction: Transaction;
}

function TransactionCard({ transaction }: TransactionCardProps) {
  const isPositive = transaction.type === "DEPOSIT";
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(transaction.amount));

  return (
    <Card className="p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg dark:bg-gray-800">
            <Image
              src={`/${TRANSACTION_PAYMENT_METHOD_ICONS[transaction.paymentMethod]}`}
              height={20}
              width={20}
              alt={transaction.paymentMethod}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium">{transaction.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {TRANSACTION_CATEGORY_LABELS[transaction.category]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {TRANSACTION_PAYMENT_METHOD_LABELS[transaction.paymentMethod]}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p
              className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}
            >
              {isPositive ? "+" : ""}
              {formattedAmount}
            </p>
          </div>

          <EditTransactionButton transaction={transaction} />

          <DeleteTransactionButton transactionId={transaction.id} />
        </div>
      </div>
    </Card>
  );
}

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    search: string;
    type: string;
    category: string;
    paymentMethod: string;
    month: string;
  };
  setFilters: (filters: any) => void;
}

function FilterSheet({
  open,
  onOpenChange,
  filters,
  setFilters,
}: FilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">Tipo</label>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="DEPOSIT">Receitas</SelectItem>
                <SelectItem value="EXPENSE">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Categoria</label>
            <Select
              value={filters.category}
              onValueChange={(value) =>
                setFilters({ ...filters, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="--- DESPESAS ---" disabled>
                  --- DESPESAS ---
                </SelectItem>
                {EXPENSE_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem
                    key={`expense-${option.value}`}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
                <SelectItem value="--- RECEITAS ---" disabled>
                  --- RECEITAS ---
                </SelectItem>
                {DEPOSIT_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem
                    key={`deposit-${option.value}`}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Método de Pagamento
            </label>
            <Select
              value={filters.paymentMethod}
              onValueChange={(value) =>
                setFilters({ ...filters, paymentMethod: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os métodos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {TRANSACTION_PAYMENT_METHOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Mês</label>
            <Select
              value={filters.month}
              onValueChange={(value) =>
                setFilters({ ...filters, month: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os meses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="01">Janeiro</SelectItem>
                <SelectItem value="02">Fevereiro</SelectItem>
                <SelectItem value="03">Março</SelectItem>
                <SelectItem value="04">Abril</SelectItem>
                <SelectItem value="05">Maio</SelectItem>
                <SelectItem value="06">Junho</SelectItem>
                <SelectItem value="07">Julho</SelectItem>
                <SelectItem value="08">Agosto</SelectItem>
                <SelectItem value="09">Setembro</SelectItem>
                <SelectItem value="10">Outubro</SelectItem>
                <SelectItem value="11">Novembro</SelectItem>
                <SelectItem value="12">Dezembro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() =>
              setFilters({
                search: "",
                type: "all",
                category: "all",
                paymentMethod: "all",
                month: "all",
              })
            }
            variant="outline"
            className="w-full"
          >
            Limpar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface TransactionsListProps {
  transactions: Transaction[];
  totalCount: number;
}

export default function TransactionsList({
  transactions,
  totalCount,
}: TransactionsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    category: "all",
    paymentMethod: "all",
    month: "all",
  });

  // Agrupar transações por data
  const groupedTransactions = useMemo(() => {
    let filteredTransactions = transactions;

    // Aplicar filtros
    if (searchQuery) {
      filteredTransactions = filteredTransactions.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filters.type !== "all") {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.type === filters.type,
      );
    }

    if (filters.category !== "all") {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.category === filters.category,
      );
    }

    if (filters.paymentMethod !== "all") {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.paymentMethod === filters.paymentMethod,
      );
    }

    if (filters.month !== "all") {
      filteredTransactions = filteredTransactions.filter((t) => {
        const transactionDate = new Date(t.date);
        const month = String(transactionDate.getMonth() + 1).padStart(2, "0");
        return month === filters.month;
      });
    }

    // Agrupar por data
    const grouped = filteredTransactions.reduce(
      (acc, transaction) => {
        const transactionDate = new Date(transaction.date);
        const dateKey = transactionDate.toDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(transaction);
        return acc;
      },
      {} as Record<string, Transaction[]>,
    );

    // Ordenar por data (mais recente primeiro)
    return Object.entries(grouped)
      .sort(
        ([dateA], [dateB]) =>
          new Date(dateB).getTime() - new Date(dateA).getTime(),
      )
      .map(([date, transactionList]) => ({
        date: new Date(date),
        transactions: transactionList.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      }));
  }, [transactions, searchQuery, filters]);

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    } else {
      return date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      });
    }
  };

  const hasActiveFilters = Object.values(filters).some(
    (filter) => filter !== "all" && filter !== "",
  );

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col bg-background">
      {/* Barra de busca e filtros */}
      <div className="sticky top-0 z-10 space-y-4 border-b bg-background p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="icon"
            onClick={() => setShowFilters(true)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {hasActiveFilters && (
              <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </div>
      </div>

      {/* Lista de transações com scroll */}
      <div className="flex-1 overflow-y-auto">
        {groupedTransactions.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-4 text-center">
            <DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">
              Nenhuma transação encontrada
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || hasActiveFilters
                ? "Tente ajustar os filtros ou termo de busca."
                : "Crie sua primeira transação para começar."}
            </p>
          </div>
        ) : (
          <div className="space-y-6 p-4">
            {groupedTransactions.map(
              ({ date, transactions: transactionList }) => (
                <div key={date.toDateString()}>
                  <h2 className="sticky top-0 mb-3 bg-background py-2 text-sm font-medium text-muted-foreground">
                    {formatDateHeader(date)}
                  </h2>
                  <div className="space-y-2">
                    {transactionList.map((transaction) => (
                      <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Sheet de filtros */}
      <FilterSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
}
