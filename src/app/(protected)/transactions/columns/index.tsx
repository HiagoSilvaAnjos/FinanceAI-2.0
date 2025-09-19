/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEPOSIT_CATEGORY_OPTIONS,
  EXPENSE_CATEGORY_OPTIONS,
  TRANSACTION_CATEGORY_LABELS,
  TRANSACTION_PAYMENT_METHOD_LABELS,
  TRANSACTION_PAYMENT_METHOD_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
} from "@/constants/transactions";
import { Transaction } from "@/types/transaction";

import DeleteTransactionButton from "../_components/delete-transaction-button";
import EditTransactionButton from "../_components/edit-transaction-button";
import TransactioTypeBadge from "../_components/type-badge";

const MONTH_OPTIONS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 2024; year--) {
    years.push({ value: String(year), label: String(year) });
  }
  return years;
};

export const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <>
        <div className="mb-2 mt-1 flex flex-col items-start gap-1 text-[16px] font-medium dark:!text-white">
          Nome
        </div>
        <Input
          placeholder="Filtrar por nome..."
          value={(column.getFilterValue() as string) ?? ""}
          onChange={(event) => column.setFilterValue(event.target.value)}
          className="max-w-[300px]"
        />
      </>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <>
        <div className="mb-2 mt-1 flex flex-col items-start gap-1 text-[16px] font-medium dark:text-white">
          Tipo
        </div>
        <Select
          onValueChange={(value) => column.setFilterValue(value)}
          value={(column.getFilterValue() as string) ?? ""}
        >
          <SelectTrigger className="h-8 w-[100px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {TRANSACTION_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </>
    ),
    cell: ({ row: { original: transaction } }) => {
      return <TransactioTypeBadge transaction={transaction} />;
    },
    filterFn: (row, columnId, filterValue) => {
      if (filterValue === "all" || !filterValue) return true;
      return row.getValue(columnId) === filterValue;
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <>
        <div className="mb-2 mt-1 flex flex-col items-start gap-1 text-[16px] font-medium dark:text-white">
          Categoria
        </div>
        <Select
          onValueChange={(value) => column.setFilterValue(value)}
          value={(column.getFilterValue() as string) ?? ""}
        >
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {/* Mostrar todas as categorias (tanto de despesa quanto receita) */}
            <SelectItem value="--- DESPESAS ---" disabled>
              --- DESPESAS ---
            </SelectItem>
            {EXPENSE_CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={`expense-${option.value}`} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            <SelectItem value="--- RECEITAS ---" disabled>
              --- RECEITAS ---
            </SelectItem>
            {DEPOSIT_CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={`deposit-${option.value}`} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </>
    ),
    cell: ({ row: { original: transaction } }) => {
      return TRANSACTION_CATEGORY_LABELS[transaction.category];
    },
    filterFn: (row, columnId, filterValue) => {
      if (
        filterValue === "all" ||
        !filterValue ||
        filterValue.startsWith("---")
      )
        return true;
      return row.getValue(columnId) === filterValue;
    },
  },
  {
    accessorKey: "paymentMethod",
    header: ({ column }) => (
      <>
        <div className="mb-2 mt-1 flex flex-col items-start gap-1 text-[16px] font-medium dark:text-white">
          Método de Pagamento
        </div>
        <Select
          onValueChange={(value) => column.setFilterValue(value)}
          value={(column.getFilterValue() as string) ?? ""}
        >
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue placeholder="Todos" />
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
      </>
    ),
    cell: ({ row: { original: transaction } }) => {
      return TRANSACTION_PAYMENT_METHOD_LABELS[transaction.paymentMethod];
    },
    filterFn: (row, columnId, filterValue) => {
      if (filterValue === "all" || !filterValue) return true;
      return row.getValue(columnId) === filterValue;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      const yearOptions = generateYearOptions();
      const filterValue = (column.getFilterValue() as {
        month?: string;
        year?: string;
      }) || { month: "", year: "" };

      const handleMonthChange = (value: string) => {
        const newMonth = value === "all" ? "" : value;
        column.setFilterValue((old: any) => ({ ...old, month: newMonth }));
      };

      const handleYearChange = (value: string) => {
        const newYear = value === "all" ? "" : value;
        column.setFilterValue((old: any) => ({ ...old, year: newYear }));
      };

      return (
        <div className="flex flex-col gap-2">
          <div className="text-[16px] font-medium dark:text-white">Data</div>
          <div className="flex gap-2">
            <Select
              onValueChange={handleMonthChange}
              value={filterValue.month || ""}
            >
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {MONTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={handleYearChange}
              value={filterValue.year || ""}
            >
              <SelectTrigger className="h-8 w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {yearOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    },
    cell: ({ row: { original: transaction } }) =>
      new Date(transaction.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    filterFn: (row, columnId, filterValue) => {
      const { month, year } = filterValue as { month?: string; year?: string };
      if (!month && !year) {
        return true;
      }
      const date = new Date(row.getValue(columnId));
      const rowMonth = String(date.getMonth() + 1).padStart(2, "0");
      const rowYear = String(date.getFullYear());

      const monthMatch = month ? rowMonth === month : true;
      const yearMatch = year ? rowYear === year : true;

      return monthMatch && yearMatch;
    },
  },
  {
    accessorKey: "amount",
    header: () => (
      <div className="mb-10 mt-1 flex flex-col items-start gap-1 text-[16px] font-medium dark:text-white">
        Valor
      </div>
    ),
    cell: ({ row: { original: transaction } }) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(transaction.amount)),
  },
  {
    accessorKey: "actions",
    header: () => (
      <div className="mb-10 mt-1 flex flex-col items-start gap-1 text-[16px] font-medium dark:text-white">
        Ações
      </div>
    ),
    cell: (row) => {
      const transaction = row.row.original;

      return (
        <div className="flex items-center gap-2">
          <EditTransactionButton transaction={transaction} />
          <DeleteTransactionButton transactionId={transaction.id} />
        </div>
      );
    },
  },
];
