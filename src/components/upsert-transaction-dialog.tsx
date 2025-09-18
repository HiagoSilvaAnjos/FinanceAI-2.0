"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertTransaction } from "@/actions/add-transaction";
import { upsertTransactionSchema } from "@/actions/add-transaction/schema";
import {
  TRANSACTION_CATEGORY_OPTIONS,
  TRANSACTION_PAYMENT_METHOD_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
} from "@/constants/transactions";

import { MoneyInput } from "./money-input";
import { Button } from "./ui/button";
import { DatePicker } from "./ui/date-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type FormSchema = z.infer<typeof upsertTransactionSchema>;

// No início do arquivo, após as importações, adicione:
interface ExtendedFormSchema extends FormSchema {
  installmentGroupId?: string | null;
  installmentGroup?: {
    id: string;
    originalName: string;
    originalAmount: string;
    totalInstallments: number;
  };
  installmentNumber?: number | null;
}

// Depois altere a interface do componente:
interface UpsertTransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  defaultValues?: ExtendedFormSchema;
  transactionId?: string;
}

const UpsertTransactionDialog = ({
  isOpen,
  setIsOpen,
  transactionId,
  defaultValues,
}: UpsertTransactionDialogProps) => {
  // Verificar se é uma transação parcelada
  const isInstallmentTransaction =
    defaultValues?.installmentGroupId !== null &&
    defaultValues?.installmentGroupId !== undefined;

  const form = useForm<FormSchema>({
    resolver: zodResolver(upsertTransactionSchema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          date: new Date(defaultValues.date),
          // Se for parcela, usar o valor total original dividido pelas parcelas para mostrar o valor total
          amount:
            isInstallmentTransaction && defaultValues.installmentGroup
              ? Number(defaultValues.installmentGroup.originalAmount)
              : defaultValues.amount,
          // Se for parcela, usar o nome original sem o sufixo
          name:
            isInstallmentTransaction && defaultValues.installmentGroup
              ? defaultValues.installmentGroup.originalName
              : defaultValues.name,
        }
      : {
          amount: 0,
          category: "OTHER",
          date: new Date(),
          name: "",
          paymentMethod: "CASH",
          type: "EXPENSE",
        },
  });

  // Observar mudanças no método de pagamento
  const paymentMethod = form.watch("paymentMethod");
  const isCreditCard = paymentMethod === "CREDIT_CARD";

  useEffect(() => {
    if (isOpen && defaultValues) {
      form.reset({
        ...defaultValues,
        date: new Date(defaultValues.date),
        // Se for parcela, usar o valor total original
        amount:
          isInstallmentTransaction && defaultValues.installmentGroup
            ? Number(defaultValues.installmentGroup.originalAmount)
            : defaultValues.amount,
        // Se for parcela, usar o nome original sem o sufixo
        name:
          isInstallmentTransaction && defaultValues.installmentGroup
            ? defaultValues.installmentGroup.originalName
            : defaultValues.name,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultValues, isInstallmentTransaction]);

  const onSubmit = async (data: FormSchema) => {
    const isUpdate = Boolean(transactionId);
    try {
      await upsertTransaction({ ...data, id: transactionId });
      setIsOpen(false);
      form.reset();

      // Mensagem personalizada para transações parceladas
      if (
        !isUpdate &&
        data.paymentMethod === "CREDIT_CARD" &&
        data.installments &&
        data.installments > 1
      ) {
        toast.success(
          `${data.installments} transações criadas com sucesso (parcelado).`,
        );
      } else {
        toast.success(
          `Transação ${isUpdate ? "editada" : "adicionada"} com sucesso.`,
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(
        "Ocorreu um erro ao tentar salvar a transação. Tente novamente.",
      );
    }
  };

  const isUpdate = Boolean(transactionId);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          form.reset();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Editar" : "Adicionar"} Transação
          </DialogTitle>
          <DialogDescription>Insira as informações abaixo</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da sua transação</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Compra de supermercado"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isCreditCard
                      ? "Valor total somando suas parcelas"
                      : "Valor da transação"}
                    {isCreditCard &&
                      form.watch("installments") &&
                      form.watch("installments")! > 1 && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          (Valor total - será dividido em{" "}
                          {form.watch("installments")} parcelas)
                        </span>
                      )}
                  </FormLabel>

                  <FormControl>
                    <MoneyInput
                      placeholder="Digite o valor..."
                      value={field.value || 0}
                      onValueChange={({ floatValue }) => {
                        field.onChange(floatValue || undefined);
                      }}
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo da transação</FormLabel>

                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria da transação</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Forma de pagamento
                    {isInstallmentTransaction && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        (Transação parcelada - não editável)
                      </span>
                    )}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isInstallmentTransaction}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um método de pagamento..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_PAYMENT_METHOD_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de parcelas - só aparece para cartão de crédito E não for transação parcelada existente */}
            {isCreditCard && !isInstallmentTransaction && (
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de parcelas</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o número de parcelas..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}x
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {field.value &&
                      field.value > 1 &&
                      form.watch("amount") > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Cada parcela:{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(form.watch("amount") / field.value)}
                        </p>
                      )}
                  </FormItem>
                )}
              />
            )}

            {/* Mostrar informações da parcela se for transação parcelada */}
            {isInstallmentTransaction && defaultValues?.installmentGroup && (
              <div className="rounded-lg border bg-muted p-4">
                <h4 className="mb-2 font-semibold">Informações da Parcela</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Parcela:</span>{" "}
                    {defaultValues.installmentNumber} de{" "}
                    {defaultValues.installmentGroup.totalInstallments}
                  </p>
                  <p>
                    <span className="font-medium">Valor por parcela:</span>{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(
                      Number(defaultValues.installmentGroup.originalAmount) /
                        defaultValues.installmentGroup.totalInstallments,
                    )}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Alterações afetarão todas as parcelas desta compra
                  </p>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Data
                    {isCreditCard &&
                      form.watch("installments") &&
                      form.watch("installments")! > 1 && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          (Data da primeira parcela)
                        </span>
                      )}
                  </FormLabel>
                  <DatePicker value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant={"outline"}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <LoaderCircleIcon className="animate-spin" />
                    &nbsp;Salvando...
                  </>
                ) : isUpdate ? (
                  "Editar"
                ) : (
                  "Adicionar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertTransactionDialog;
