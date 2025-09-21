/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuotaExceeded(false);
      setResult(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      toast.error("Por favor, descreva uma transação", {
        position: "top-left",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setQuotaExceeded(false);

    try {
      const response = await createTransactionWithAI(userInput.trim());
      setResult(response);

      if (response.quotaExceeded) {
        setQuotaExceeded(true);
        toast.error("Limite diário atingido", {
          description: `Você pode usar novamente em ${response.quotaInfo?.timeUntilReset}`,
          position: "top-left",
        });
      } else if (response.success) {
        toast.success(
          `${response.createdTransactions} transação(ões) criada(s) com sucesso!`,
          {
            description: `Total: R$ ${response.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            position: "top-left",
          },
        );
      } else {
        toast.error("Erro ao processar transação", {
          description: response.error,
          position: "top-left",
        });
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro interno", {
        description: "Tente novamente em alguns momentos",
        position: "top-left",
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
      setQuotaExceeded(false);
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
      <DialogContent className="max-h-[90vh] w-[90%] max-w-2xl p-0 sm:max-h-[85vh]">
        {/* Header fixo */}
        <div className="flex-shrink-0 p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Criar Transação com IA
            </DialogTitle>
            <DialogDescription className="text-base text-black dark:text-white">
              {quotaExceeded
                ? "Limite diário de uso atingido. Tente novamente amanhã."
                : "Descreva sua transação em linguagem natural e nossa IA criará automaticamente para você."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Container com scroll para o conteúdo */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {quotaExceeded ? (
            // Tela de limite atingido
            <div className="space-y-4 py-8">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-orange-100 p-4 dark:bg-orange-900/20">
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    Limite Diário Atingido
                  </h3>
                  <p className="text-black dark:text-white">
                    Você já utilizou todas as {result?.quotaInfo?.limit}{" "}
                    transações com IA hoje.
                  </p>
                </div>

                {result?.quotaInfo && (
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>
                        Resetará em:{" "}
                        <strong>{result.quotaInfo.timeUntilReset}</strong>
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-black dark:text-white">
                      Uso atual: {result.quotaInfo.currentUsage}/
                      {result.quotaInfo.limit}
                    </div>
                  </div>
                )}

                <div className="text-sm text-black dark:text-white">
                  Você ainda pode adicionar transações manualmente pelo botão{" "}
                  <span className="font-semibold text-green-500">
                    Adicionar Transação
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Tela normal de uso
            <div className="space-y-6">
              {/* Input de texto */}
              <div className="space-y-2">
                <label className="text-sm text-black dark:text-white">
                  Descreva sua transação:
                </label>
                <Textarea
                  placeholder="Ex: Comprei um notebook por R$ 3.500 no cartão parcelado em 10x"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="min-h-[80px]"
                  disabled={isProcessing}
                  maxLength={500}
                />
                <div className="flex justify-between text-sm text-black dark:text-white">
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
                      className="cursor-pointer p-2 text-sm font-normal hover:bg-muted"
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
                      {result.success
                        ? "Sucesso!"
                        : "Falha ao inserir transação"}
                    </h4>
                  </div>

                  {result.success ? (
                    <div className="space-y-2">
                      <p className="text-sm">
                        {result.createdTransactions} transação(ões) criada(s)
                        com sucesso!
                      </p>
                      <p className="text-sm font-medium">
                        Total: R${" "}
                        {result.totalAmount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>

                      {result.transactions && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium">
                            Transações criadas:
                          </p>
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
                                <p className="text-sm text-black dark:text-white">
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
                      {result.error ||
                        "Não foi possível extrair transação válida. Tente Novamente!"}
                    </p>
                  )}
                </div>
              )}

              {/* Espaço extra no final */}
              <div className="h-4" />
            </div>
          )}
        </div>

        {/* Footer fixo */}
        <div className="flex-shrink-0 border-t bg-background p-6 pt-4">
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={handleClose}>
                {result?.success || quotaExceeded ? "Fechar" : "Cancelar"}
              </Button>
            </DialogClose>

            {!result?.success && !quotaExceeded && (
              <Button
                onClick={handleSubmit}
                disabled={!userInput.trim() || isProcessing}
                className="mb-2 flex items-center gap-2 md:mb-0"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AITransactionDialog;
