"use client";

import { ArrowDownUp } from "lucide-react";
import { useState } from "react";

import { Button } from "./ui/button";
// import UpsertTransactionDialog from "./upsert-transaction-dialog";

const AddTransactionButton = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setDialogIsOpen(true)}
        className="rounded-full font-medium"
      >
        Adicionar Transação <ArrowDownUp />
      </Button>
      {/* <UpsertTransactionDialog
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
      /> */}
    </>
  );
};

export default AddTransactionButton;
