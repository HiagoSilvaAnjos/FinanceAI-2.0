"use client";

import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import React from "react";

// Define interfaces
interface FinancialSummary {
  deposits: number;
  expenses: number;
  balance: number;
}

interface UserData {
  name: string;
  email: string;
  period: string;
}

interface ReportData {
  content: string;
  financialSummary: FinancialSummary;
  userData: UserData;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#181920",
    padding: 15,
    marginBottom: 20,
    marginLeft: -20,
    marginRight: -20,
    marginTop: -40,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  headerSubtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#55B02E",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    fontSize: 9,
    color: "#333333",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    minHeight: 40,
  },
  revenueCard: {
    backgroundColor: "#DCFCE7",
    borderLeft: "3px solid #16A34A",
  },
  expenseCard: {
    backgroundColor: "#FEE2E2",
    borderLeft: "3px solid #DC2626",
  },
  balanceCardPositive: {
    backgroundColor: "#DBEAFE",
    borderLeft: "3px solid #2563EB",
  },
  balanceCardNegative: {
    backgroundColor: "#FEE2E2",
    borderLeft: "3px solid #DC2626",
  },
  cardLabel: {
    fontSize: 8,
    marginBottom: 3,
    fontWeight: "normal",
  },
  cardValue: {
    fontSize: 11,
    fontWeight: "bold",
  },
  revenueText: {
    color: "#166534",
  },
  expenseText: {
    color: "#991B1B",
  },
  balanceTextPositive: {
    color: "#1E40AF",
  },
  balanceTextNegative: {
    color: "#991B1B",
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#55B02E",
    marginBottom: 10,
  },
  contentContainer: {
    lineHeight: 1.5,
  },
  h1: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#55B02E",
    marginTop: 15,
    marginBottom: 8,
  },
  h2: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 12,
    marginBottom: 6,
  },
  h3: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 10,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 8,
    color: "#333333",
    textAlign: "justify",
  },
  bulletPoint: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 4,
    marginLeft: 10,
    color: "#333333",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#666666",
    borderTop: "1px solid #E5E5E5",
    paddingTop: 10,
  },
});

// Component to format currency
const formatCurrency = (value: number): string => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};

// Component to parse and render markdown content
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split("\n").filter((line) => line.trim() !== "");

  return (
    <View style={styles.contentContainer}>
      {lines.map((line, index) => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith("# ")) {
          return (
            <Text key={index} style={styles.h1}>
              {trimmedLine.substring(2)}
            </Text>
          );
        } else if (trimmedLine.startsWith("## ")) {
          return (
            <Text key={index} style={styles.h2}>
              {trimmedLine.substring(3)}
            </Text>
          );
        } else if (trimmedLine.startsWith("### ")) {
          return (
            <Text key={index} style={styles.h3}>
              {trimmedLine.substring(4)}
            </Text>
          );
        } else if (
          trimmedLine.startsWith("- ") ||
          trimmedLine.startsWith("* ")
        ) {
          return (
            <Text key={index} style={styles.bulletPoint}>
              • {trimmedLine.substring(2)}
            </Text>
          );
        } else if (trimmedLine.length > 0) {
          // Remove markdown formatting from paragraphs
          const cleanText = trimmedLine
            .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown
            .replace(/\*(.*?)\*/g, "$1") // Remove italic markdown
            .replace(/`(.*?)`/g, "$1"); // Remove code markdown

          return (
            <Text key={index} style={styles.paragraph}>
              {cleanText}
            </Text>
          );
        }

        return null;
      })}
    </View>
  );
};

// Main PDF Document Component
const FinancialReportPDF: React.FC<{ reportData: ReportData }> = ({
  reportData,
}) => {
  const isPositiveBalance = reportData.financialSummary.balance >= 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FinanceAI</Text>
          <Text style={styles.headerSubtitle}>
            Relatório Financeiro Inteligente
          </Text>
        </View>

        {/* Report Title */}
        <Text style={styles.reportTitle}>Relatório Financeiro</Text>

        {/* User Information */}
        <View style={styles.userInfo}>
          <Text>Usuário: {reportData.userData.name}</Text>
          <Text>E-mail: {reportData.userData.email}</Text>
          <Text>Período: {reportData.userData.period}</Text>
        </View>

        {/* Financial Summary Cards */}
        <View style={styles.summaryContainer}>
          {/* Revenue Card */}
          <View style={[styles.summaryCard, styles.revenueCard]}>
            <Text style={[styles.cardLabel, styles.revenueText]}>Receitas</Text>
            <Text style={[styles.cardValue, styles.revenueText]}>
              {formatCurrency(reportData.financialSummary.deposits)}
            </Text>
          </View>

          {/* Expense Card */}
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={[styles.cardLabel, styles.expenseText]}>Despesas</Text>
            <Text style={[styles.cardValue, styles.expenseText]}>
              {formatCurrency(reportData.financialSummary.expenses)}
            </Text>
          </View>

          {/* Balance Card */}
          <View
            style={[
              styles.summaryCard,
              isPositiveBalance
                ? styles.balanceCardPositive
                : styles.balanceCardNegative,
            ]}
          >
            <Text
              style={[
                styles.cardLabel,
                isPositiveBalance
                  ? styles.balanceTextPositive
                  : styles.balanceTextNegative,
              ]}
            >
              Saldo
            </Text>
            <Text
              style={[
                styles.cardValue,
                isPositiveBalance
                  ? styles.balanceTextPositive
                  : styles.balanceTextNegative,
              ]}
            >
              {formatCurrency(reportData.financialSummary.balance)}
            </Text>
          </View>
        </View>

        {/* Analysis Title */}
        <Text style={styles.analysisTitle}>Análise Inteligente</Text>

        {/* AI Content */}
        <MarkdownRenderer content={reportData.content} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Gerado por FinanceAI em {format(new Date(), "dd/MM/yyyy")}
          </Text>
          <Text>
            {reportData.userData.name} | {reportData.userData.email}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Function to generate and download PDF
export const generateAndDownloadPDF = async (
  reportData: ReportData,
): Promise<void> => {
  try {
    const blob = await pdf(
      <FinancialReportPDF reportData={reportData} />,
    ).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-financeAI-${reportData.userData.period.replace("/", "-")}.pdf`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw new Error("Erro ao gerar PDF");
  }
};

export default FinancialReportPDF;
