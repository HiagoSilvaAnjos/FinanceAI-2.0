import { BrainCircuit } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { getAIUsageStats } from "@/services/ai-quota-service";

import { AIUsageDialog } from "./ai-usage-dialog";

const AIUsageButton = async () => {
  const usage = await getAIUsageStats();

  const transactionUsage = usage.transactions;
  const reportUsage = usage.reports;

  const hasTransactionsQuota = transactionUsage.hasQuota;
  const hasReportsQuota = reportUsage.hasQuota;

  const noQuotaLeft = !hasTransactionsQuota && !hasReportsQuota;

  return (
    <AIUsageDialog usage={usage}>
      <Button
        variant="outline"
        className={`flex items-center gap-2 rounded-full font-medium transition-all duration-300 ${noQuotaLeft ? "bg-gradient-to-r from-red-500/50 to-red-700/50 text-white hover:from-red-600/50 hover:to-red-800/50" : "hover:bg-accent"}`}
      >
        <BrainCircuit className="h-4 w-4" />
        Uso de IA
      </Button>
    </AIUsageDialog>
  );
};

export default AIUsageButton;
