/* eslint-disable jsx-a11y/alt-text */
"use client";

import {
  Document,
  Image,
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
    fontSize: 11,
    paddingTop: 40,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#181920",
    padding: 15,
    marginBottom: 20,
    marginLeft: -40,
    marginRight: -40,
    marginTop: -40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {},
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
  },
  headerSubtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  logo: {
    width: 90,
    height: 20,
  },
  reportTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#55B02E",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    fontSize: 10,
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
    fontSize: 9,
    marginBottom: 3,
    fontFamily: "Helvetica",
  },
  cardValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
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
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#55B02E",
    marginBottom: 10,
  },
  contentContainer: {
    lineHeight: 1.6,
  },
  h1: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#55B02E",
    marginTop: 15,
    marginBottom: 8,
  },
  h2: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#55B02E", // Cor verde aplicada
    marginTop: 12,
    marginBottom: 6,
  },
  h3: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#55B02E", // Cor verde aplicada
    marginTop: 10,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 8,
    color: "#333333",
    textAlign: "justify",
  },
  bulletPoint: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 4,
    marginLeft: 10,
    color: "#333333",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
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
  const cleanedContent = content
    .replace(/R\$\s*\/?\s*/g, "R$ ")
    .replace(/(\d+)\s*\/?\s*%/g, "$1%");

  const lines = cleanedContent
    .split("\n")
    .filter((line) => line.trim() !== "" && line.trim() !== "---");

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
          trimmedLine.startsWith("• ") ||
          trimmedLine.startsWith("* ")
        ) {
          const lineContent = trimmedLine.substring(2);
          const parts = lineContent.split(/(\*\*.*?\*\*)/g).filter(Boolean);

          return (
            <Text key={index} style={styles.bulletPoint}>
              <Text>• </Text>
              {parts.map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <Text key={i} style={{ fontFamily: "Helvetica-Bold" }}>
                      {part.slice(2, -2)}
                    </Text>
                  );
                }
                return <Text key={i}>{part}</Text>;
              })}
            </Text>
          );
        } else if (trimmedLine.length > 0) {
          const parts = trimmedLine.split(/(\*\*.*?\*\*)/g).filter(Boolean);
          return (
            <Text key={index} style={styles.paragraph}>
              {parts.map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <Text key={i} style={{ fontFamily: "Helvetica-Bold" }}>
                      {part.slice(2, -2)}
                    </Text>
                  );
                }
                return <Text key={i}>{part}</Text>;
              })}
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
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>FinanceAI</Text>
            <Text style={styles.headerSubtitle}>
              Relatório Financeiro Inteligente
            </Text>
          </View>
          <Image style={styles.logo} src="/logo.png" />
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
    link.download = `relatorio-financeAI-${reportData.userData.period.replace(
      "/",
      "-",
    )}.pdf`;

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
