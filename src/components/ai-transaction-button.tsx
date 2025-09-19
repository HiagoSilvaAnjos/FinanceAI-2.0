"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import AITransactionDialog from "./ai-transaction-dialog";

const AITransactionButton = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setDialogIsOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white transition duration-300 ease-linear hover:from-green-600 hover:to-green-800"
      >
        Adicione sua transação com a IA
        <Sparkles className="h-4 w-4" />
      </Button>

      <AITransactionDialog isOpen={dialogIsOpen} setIsOpen={setDialogIsOpen} />
    </>
  );
};

export default AITransactionButton;
