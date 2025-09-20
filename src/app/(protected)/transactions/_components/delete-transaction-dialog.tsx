import { deleteTransaction } from "@/actions/delete-transaction";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteTransactionDialogCProps {
  transactionId: string;
}

const AlertDialogDelete = ({
  transactionId,
}: DeleteTransactionDialogCProps) => {
  const onDelete = async () => await deleteTransaction({ id: transactionId });

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          Você realmente deseja excluir esta transação?
        </AlertDialogTitle>
        <AlertDialogDescription>
          Você esta prestes a excluir esta transação. Esta ação não pode ser
          desfeita. Deseja continuar ?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          className="bg-red-500 hover:bg-red-600"
          onClick={onDelete}
        >
          Continuar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default AlertDialogDelete;
