"use client";

import { TrashIcon } from "lucide-react";

import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import AlertDialogDelete from "./delete-transaction-dialog";

interface DeleteTransactionButtonProps {
  transactionId: string;
}

const DeleteTransactionButton = ({
  transactionId,
}: DeleteTransactionButtonProps) => {
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="icon"
            className="space-x-1 bg-zinc-600 text-white transition duration-300 ease-in-out hover:bg-red-500"
          >
            <TrashIcon />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogDelete transactionId={transactionId} />
      </AlertDialog>
    </>
  );
};

export default DeleteTransactionButton;
