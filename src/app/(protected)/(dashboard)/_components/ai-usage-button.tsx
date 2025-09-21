import { BrainCircuit } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { getAIUsageStats } from "@/services/ai-quota-service";

import { AIUsageDialog } from "./ai-usage-dialog";

const AIUsageButton = async () => {
  const usage = await getAIUsageStats();

  return (
    <AIUsageDialog usage={usage}>
      <Button
        variant="outline"
        className={`flex items-center gap-2 rounded-full font-medium transition-all duration-300`}
      >
        <BrainCircuit className="h-4 w-4" />
        Uso de IA
      </Button>
    </AIUsageDialog>
  );
};

export default AIUsageButton;
