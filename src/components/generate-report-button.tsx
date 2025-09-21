/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { format } from "date-fns";
import {
  AlertTriangle,
  Clock,
  Copy,
  Download,
  FileText,
  Loader2,
  Share2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { generateReport } from "@/actions/generate-report";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { generateAndDownloadPDF } from "./generateAndDownloadPDF";

interface GenerateReportButtonProps {
  month: string;
  year: string;
  hasTransactions: boolean;
  hasQuota: boolean;
}

const GenerateReportButton = ({
  month,
  year,
  hasTransactions,
  hasQuota,
}: GenerateReportButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuotaDialog, setShowQuotaDialog] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [quotaInfo, setQuotaInfo] = useState<any>(null);

  const handleGenerateReport = async () => {
    if (!hasTransactions) {
      toast.error("Nenhuma transação encontrada", {
        description:
          "Adicione pelo menos uma transação para gerar um relatório.",
      });
      return;
    }

    setIsGenerating(true);

    try {
      toast.info("Gerando relatório com IA...", {
        description: "Isso pode levar alguns segundos",
      });

      const result = await generateReport(month, year);

      if (result.quotaExceeded) {
        setQuotaInfo(result.quotaInfo);
        setShowQuotaDialog(true);
        toast.error("Limite mensal de relatórios atingido", {
          description: `Você pode gerar novamente em ${result.quotaInfo?.timeUntilReset}`,
        });
      } else if (result.success) {
        setReportData(result);
        setShowReportModal(true);
        toast.success("Relatório gerado com sucesso!");
      } else {
        toast.error("Erro ao gerar relatório", {
          description: result.error || "Tente novamente em alguns momentos",
        });
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.error("Erro ao gerar relatório", {
        description: "Tente novamente em alguns momentos",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyReport = async () => {
    if (reportData?.content) {
      try {
        await navigator.clipboard.writeText(reportData.content);
        toast.success("Relatório copiado para área de transferência!");
      } catch (error) {
        toast.error("Erro ao copiar relatório");
      }
    }
  };

  // Updated PDF download handler using react-pdf
  const handleDownloadPDF = async () => {
    if (!reportData) return;

    try {
      toast.info("Gerando PDF...", { description: "Preparando documento..." });

      await generateAndDownloadPDF(reportData);

      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF", {
        description: "Tente novamente em alguns momentos",
      });
    }
  };

  const buttonClass = hasQuota
    ? "bg-gradient-to-r from-green-500 to-green-700 text-white transition duration-300 ease-linear hover:from-green-600 hover:to-green-800 hover:text-white"
    : "bg-gradient-to-r from-red-500 to-red-700 text-white transition duration-300 ease-linear hover:from-red-600 hover:to-red-800 hover:text-white";

  return (
    <>
      <Button
        onClick={handleGenerateReport}
        className={`flex items-center gap-2 ${buttonClass}`}
        variant="outline"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        {isGenerating ? "Gerando..." : "Relatório com IA"}
        <Sparkles className="h-6 w-6" />
      </Button>

      {/* Modal de Quota Excedida */}
      <Dialog open={showQuotaDialog} onOpenChange={setShowQuotaDialog}>
        <DialogContent className="max-h-[90vh] w-[90%] max-w-md p-0 sm:max-h-[85vh]">
          <div className="flex-shrink-0 p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Limite Mensal Atingido
              </DialogTitle>
              <DialogDescription className="text-black dark:text-white">
                Você já utilizou todos os relatórios com IA deste mês.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="w-full rounded-lg bg-muted p-4">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>
                      Resetará em: <strong>{quotaInfo?.timeUntilReset}</strong>
                    </span>
                  </div>
                  <div className="mt-1 text-center text-sm text-black dark:text-white">
                    Uso atual: {quotaInfo?.currentUsage}/{quotaInfo?.limit}{" "}
                    relatórios
                  </div>
                </div>

                <div className="text-sm dark:text-white">
                  Os limites são renovados todo primeiro dia do mês
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 border-t bg-background p-6 pt-4">
            <div className="flex justify-end">
              <DialogClose asChild>
                <Button variant="outline">Entendi</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal do Relatório */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-h-[90vh] w-[90%] max-w-4xl p-0 sm:max-h-[85vh]">
          <div className="flex-shrink-0 p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatório Financeiro - {reportData?.userData?.period}
              </DialogTitle>
              <DialogDescription className="text-black dark:text-white">
                Análise inteligente das suas finanças gerada por IA
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {reportData?.content && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="mb-4 mt-6 text-2xl font-bold text-primary">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-3 mt-5 text-xl font-semibold">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-2 mt-4 text-lg font-medium">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-3 leading-relaxed">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-4 list-inside list-disc space-y-1">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => <li className="ml-2">{children}</li>,
                    strong: ({ children }) => (
                      <strong className="font-semibold text-primary">
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {reportData.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 border-t bg-background p-6 pt-4">
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex gap-2">
                <Button
                  onClick={handleCopyReport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar
                </Button>

                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              </div>
              <DialogClose asChild>
                <Button variant="outline">Fechar</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GenerateReportButton;
