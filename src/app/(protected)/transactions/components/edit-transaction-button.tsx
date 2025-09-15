"use client";

import { PencilIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Transaction } from "@/types/transaction";

// import UpsertTransactionDialog from "@/app/_components/upsert-transaction-dialog";

interface EditTransactionButtonProps {
  transaction: Transaction;
}

const EditTransactionButton = ({ transaction }: EditTransactionButtonProps) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        variant={"ghost"}
        className="space-x-1 text-muted-foreground"
        onClick={() => setDialogIsOpen(true)}
      >
        <PencilIcon />
      </Button>
      {/* <UpsertTransactionDialog
        defaultValues={{
          ...transaction,
          amount: Number(transaction.amount),
        }}
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
        transactionId={transaction.id}
      /> */}
    </>
  );
};

export default EditTransactionButton;
