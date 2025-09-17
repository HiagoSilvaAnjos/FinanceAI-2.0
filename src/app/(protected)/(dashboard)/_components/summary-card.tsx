"use client";

import { HelpCircle, XIcon } from "lucide-react";
import React, { useState } from "react";

import AddTransactionButton from "@/components/add-transaction-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  amount: number;
  size?: "small" | "large";
  explanation?: string;
  tooltipText?: string;
}

const SummaryCard = ({
  icon,
  title,
  amount,
  size = "small",
  explanation,
  tooltipText,
}: SummaryCardProps) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const handleToggleExplanation = () => {
    setShowExplanation((prev) => !prev);
  };

  const formattedAmount = Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);

  return (
    <Card className={`${size === "large" ? "bg-white bg-opacity-5" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <p
            className={`font-medium ${size === "small" ? "text-sm text-white" : "text-white opacity-70"}`}
          >
            {title}
          </p>
        </div>
        {explanation && (
          <Button
            variant="ghost"
            title={tooltipText}
            onClick={handleToggleExplanation}
          >
            {showExplanation ? (
              <XIcon className="size-6 text-red-500" />
            ) : (
              <HelpCircle className="size-6" />
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex justify-between">
        {showExplanation ? (
          <p className={`font-medium text-white`}>{explanation}</p>
        ) : (
          <p
            className={`font-bold ${size === "small" ? "text-2xl" : `text-4xl ${amount < 0 ? "text-red-600" : "text-primary"}`}`}
          >
            {formattedAmount}
          </p>
        )}
        {size === "large" && <AddTransactionButton />}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
