/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BrainCircuit, CheckCircle, Clock, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface AIUsageDialogProps {
  children: React.ReactNode;
  usage: any;
}

export const AIUsageDialog = ({ children, usage }: AIUsageDialogProps) => {
  const transactionUsage = usage.transactions;
  const reportUsage = usage.reports;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            Seu Uso de Inteligência Artificial
          </DialogTitle>
          <DialogDescription>
            Acompanhe seus limites de uso para as funcionalidades com IA. Os
            limites são reiniciados periodicamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Uso de Transações com IA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Criação de Transações com IA</h3>
              {transactionUsage.hasQuota ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <Progress
              value={
                (transactionUsage.currentUsage / transactionUsage.limit) * 100
              }
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Uso: {transactionUsage.currentUsage} / {transactionUsage.limit}
              </span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Reinicia em: {transactionUsage.timeUntilReset}</span>
              </div>
            </div>
          </div>

          {/* Uso de Relatórios com IA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Geração de Relatórios com IA</h3>
              {reportUsage.hasQuota ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <Progress
              value={(reportUsage.currentUsage / reportUsage.limit) * 100}
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Uso: {reportUsage.currentUsage} / {reportUsage.limit}
              </span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Reinicia em: {reportUsage.timeUntilReset}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
