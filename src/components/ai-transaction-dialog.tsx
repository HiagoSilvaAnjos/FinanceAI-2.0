/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Brain, CheckCircle, Loader2, Send, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { createTransactionWithAI } from "@/actions/ai-transaction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Textarea } from "./ui/textarea";

interface AITransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AITransactionDialog = ({
  isOpen,
  setIsOpen,
}: AITransactionDialogProps) => {
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      toast.error("Por favor, descreva uma transação");
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await createTransactionWithAI(userInput.trim());
      setResult(response);

      if (response.success) {
        toast.success(
          `${response.createdTransactions} transação(ões) criada(s) com sucesso!`,
          {
            description: `Total: R$ ${response.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          },
        );
      } else {
        toast.error("Erro ao processar transação", {
          description: response.error,
        });
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro interno", {
        description: "Tente novamente em alguns momentos",
      });
      setResult({
        success: false,
        error: "Erro interno do sistema",
        createdTransactions: 0,
        totalAmount: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setUserInput("");
      setResult(null);
    }, 300);
  };

  const examples = [
    "Comprei um celular por R$ 2.600 parcelado em 12x no cartão",
    "Paguei R$ 150 de combustível no PIX",
    "Recebi meu salário de R$ 4.500",
    "Gastei R$ 85 no supermercado em dinheiro",
    "Paguei R$ 120 da conta de luz via transferência",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Criar Transação com IA
          </DialogTitle>
          <DialogDescription className="text-base">
            Descreva sua transação em linguagem natural e nossa IA criará
            automaticamente para você.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Input de texto */}
          <div className="space-y-2">
            <label className="text-sm">Descreva sua transação:</label>
            <Textarea
              placeholder="Ex: Comprei um notebook por R$ 3.500 no cartão parcelado em 10x"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="min-h-[80px]"
              disabled={isProcessing}
              maxLength={500}
            />
            <div className="flex justify-between text-xs dark:text-white">
              <span>Use linguagem natural - a IA entenderá!</span>
              <span>{userInput.length}/500</span>
            </div>
          </div>

          {/* Exemplos */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Exemplos (clique para usar):
            </label>
            <div className="flex flex-wrap gap-2">
              {examples.map((example, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer p-2 text-base font-normal hover:bg-muted"
                  onClick={() => setUserInput(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>

          {/* Resultado */}
          {result && (
            <div
              className={`rounded-lg border p-4 ${
                result.success
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                  : "border-red-200 bg-red-50 bg-white/5 dark:border-red-800"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <h4 className="font-medium">
                  {result.success ? "Sucesso!" : "Falha ao inserir transação"}
                </h4>
              </div>

              {result.success ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    {result.createdTransactions} transação(ões) criada(s) com
                    sucesso!
                  </p>
                  <p className="text-sm font-medium">
                    Total: R${" "}
                    {result.totalAmount.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>

                  {result.transactions && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium">Transações criadas:</p>
                      {result.transactions.map((t: any, i: number) => (
                        <div
                          key={i}
                          className="rounded border border-white/40 bg-white/5 p-2 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{t.name}</span>
                            <span
                              className={`font-semibold ${
                                t.type === "Despesa"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {t.type === "Despesa" ? "-" : "+"}R${" "}
                              {t.amount.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          {t.installments && t.installments > 1 && (
                            <p className="text-xs text-muted-foreground">
                              Parcelado em {t.installments}x
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-700 dark:text-red-300">
                  {
                    "Não foi possível extrair transação válida. Tente Novamente!"
                  }
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={handleClose}>
              {result?.success ? "Fechar" : "Cancelar"}
            </Button>
          </DialogClose>

          {!result?.success && (
            <Button
              onClick={handleSubmit}
              disabled={!userInput.trim() || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Criar Transação
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AITransactionDialog;
