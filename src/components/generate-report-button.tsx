/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { format } from "date-fns";
import jsPDF from "jspdf";
import {
  AlertTriangle,
  Clock,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
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

      const reportData = await generateReport(month, year);

      if (reportData.quotaExceeded) {
        setQuotaInfo(reportData.quotaInfo);
        setShowQuotaDialog(true);
        toast.error("Limite mensal de relatórios atingido", {
          description: `Você pode gerar novamente em ${reportData.quotaInfo?.timeUntilReset}`,
        });
      } else if (reportData.success) {
        await generatePDF(reportData);
        toast.success("Relatório gerado com sucesso!", {
          description: "O download foi iniciado automaticamente",
        });
      } else {
        toast.error("Erro ao gerar relatório", {
          description: reportData.error || "Tente novamente em alguns momentos",
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

  const generatePDF = async (data: any) => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Configurações de cores
    const primaryColor = [85, 176, 46];
    const secondaryColor = [24, 25, 29];
    const darkText = [0, 0, 0];
    const lightText = [255, 255, 255];

    // Header do PDF
    pdf.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.rect(0, 0, pageWidth, 40, "F");

    const logoImg = "/logo.png";
    const img = new Image();
    img.src = logoImg;

    const logoWidth = 40;
    const aspectRatio = 39 / 173;
    const logoHeight = logoWidth * aspectRatio;

    pdf.addImage(img, "PNG", margin, 12, logoWidth, logoHeight);

    pdf.setTextColor(lightText[0], lightText[1], lightText[2]);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Relatório Financeiro Inteligente", margin + 50, 22);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Análise detalhada por Inteligência Artificial", margin + 50, 28);

    let yPosition = 60;
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Relatório Financeiro", margin, yPosition);

    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(darkText[0], darkText[1], darkText[2]);
    pdf.text(`Usuário: ${data.userData.name}`, margin, yPosition);
    pdf.text(`E-mail: ${data.userData.email}`, margin + 80, yPosition);
    pdf.text(`Período: ${data.userData.period}`, margin + 140, yPosition);

    yPosition += 15;
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Resumo Financeiro", margin, yPosition);

    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(darkText[0], darkText[1], darkText[2]);

    const summaryData = [
      {
        label: "Receitas",
        value: data.financialSummary.deposits,
        color: [85, 176, 46],
      },
      {
        label: "Despesas",
        value: data.financialSummary.expenses,
        color: [233, 48, 48],
      },
      {
        label: "Saldo",
        value: data.financialSummary.balance,
        color:
          data.financialSummary.balance >= 0 ? [59, 130, 246] : [233, 48, 48],
      },
    ];

    let currentY = yPosition;
    summaryData.forEach((item) => {
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(darkText[0], darkText[1], darkText[2]);
      pdf.text(`${item.label}:`, margin, currentY);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(item.color[0], item.color[1], item.color[2]);
      pdf.text(
        `R$ ${item.value.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}`,
        margin + 25,
        currentY,
      );
      currentY += 6;
    });

    yPosition = currentY + 10;
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Análise Inteligente", margin, yPosition);

    yPosition += 10;

    const content = data.content;
    const lines = content.split("\n");

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(darkText[0], darkText[1], darkText[2]);

    for (const line of lines) {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;

        pdf.setFillColor(
          secondaryColor[0],
          secondaryColor[1],
          secondaryColor[2],
        );
        pdf.rect(0, 0, pageWidth, 20, "F");
        pdf.setTextColor(lightText[0], lightText[1], lightText[2]);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("FinanceAI - Relatório Financeiro", margin, 13);
        yPosition += 15;
      }

      if (line.trim() === "") {
        yPosition += 4;
        continue;
      }

      if (line.startsWith("# ")) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        const text = line.substring(2);
        pdf.text(text, margin, yPosition);
        yPosition += 8;
      } else if (line.startsWith("## ")) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(darkText[0], darkText[1], darkText[2]);
        const text = line.substring(3);
        pdf.text(text, margin, yPosition);
        yPosition += 6;
      } else if (line.startsWith("### ")) {
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(darkText[0], darkText[1], darkText[2]);
        const text = line.substring(4);
        pdf.text(text, margin, yPosition);
        yPosition += 5;
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(darkText[0], darkText[1], darkText[2]);
        const text = line.substring(2);
        const wrappedText = pdf.splitTextToSize(`• ${text}`, contentWidth - 10);
        pdf.text(wrappedText, margin + 5, yPosition);
        yPosition += wrappedText.length * 4;
      } else if (line.trim() !== "") {
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(darkText[0], darkText[1], darkText[2]);
        const wrappedText = pdf.splitTextToSize(line, contentWidth);
        pdf.text(wrappedText, margin, yPosition);
        yPosition += wrappedText.length * 4;
      }

      yPosition += 2;
    }

    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(darkText[0], darkText[1], darkText[2]);
      pdf.text(
        `Página ${i} de ${totalPages} - Gerado por FinanceAI em ${format(
          new Date(),
          "dd/MM/yyyy",
        )}`,
        margin,
        pageHeight - 10,
      );
      pdf.text(
        `${data.userData.name} | ${data.userData.email}`,
        pageWidth - margin - 80,
        pageHeight - 10,
      );
    }

    const fileName = `relatorio-financeAI-${data.userData.period.replace(
      "/",
      "-",
    )}.pdf`;
    pdf.save(fileName);
  };

  const buttonClass = hasQuota
    ? "bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800"
    : "bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800";

  return (
    <>
      <Button
        onClick={handleGenerateReport}
        className={`flex items-center gap-2 ${buttonClass}`}
        variant="outline"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        {isGenerating ? "Gerando..." : "Gerar Relatório com IA"}
        <Sparkles className="h-4 w-4" />
      </Button>

      <Dialog open={showQuotaDialog} onOpenChange={setShowQuotaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Limite Mensal Atingido
            </DialogTitle>
            <DialogDescription>
              Você já utilizou todos os relatórios com IA deste mês.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="w-full rounded-lg bg-muted p-4">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>
                    Resetará em: <strong>{quotaInfo?.timeUntilReset}</strong>
                  </span>
                </div>
                <div className="mt-1 text-center text-xs text-muted-foreground">
                  Uso atual: {quotaInfo?.currentUsage}/{quotaInfo?.limit}{" "}
                  relatórios
                </div>
              </div>

              <div className="text-sm dark:text-white">
                Os limites são renovados todo primeiro dia do mês
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Entendi</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GenerateReportButton;
