"use client";

import { PencilIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import UpsertTransactionDialog from "@/components/upsert-transaction-dialog";
import { Transaction } from "@/types/transaction";

interface EditTransactionButtonProps {
  transaction: Transaction;
}

const EditTransactionButton = ({ transaction }: EditTransactionButtonProps) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        className="space-x-1 bg-zinc-600 text-white transition duration-300 ease-in-out hover:bg-green-500"
        onClick={() => setDialogIsOpen(true)}
      >
        <PencilIcon />
      </Button>
      <UpsertTransactionDialog
        defaultValues={{
          ...transaction,
          amount: Number(transaction.amount),
        }}
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
        transactionId={transaction.id}
      />
    </>
  );
};

export default EditTransactionButton;
