import { TrendingDownIcon, TrendingUpIcon, WalletIcon } from "lucide-react";

import SummaryCard from "./summary-card";

interface SummaryCardsProps {
  balance: number;
  depositsTotal: number;
  expensesTotal: number;
}

const SummaryCards = async ({
  balance,
  depositsTotal,
  expensesTotal,
}: SummaryCardsProps) => {
  return (
    <div className="space-y-6">
      <SummaryCard
        icon={<WalletIcon size={16} />}
        title={"Saldo"}
        amount={balance}
        size="large"
        explanation="Seu saldo é a diferença entre todas as suas Receitas e Despesas."
        tooltipText="O saldo representa o valor que você tem disponível após todas as despesas."
      />

      <div className="grid grid-cols-2 gap-6">
        <SummaryCard
          icon={<TrendingUpIcon size={16} className="text-primary" />}
          title="Receita"
          amount={depositsTotal}
          explanation="O total de todos os seus depósitos e ganhos neste período."
          tooltipText="Receita é o valor total que entrou na sua conta."
        />

        <SummaryCard
          icon={<TrendingDownIcon size={16} className="text-red-500" />}
          title="Despesas"
          amount={expensesTotal}
          explanation="O total de todos os seus gastos neste período."
          tooltipText="Despesas é o valor total que saiu da sua conta."
        />
      </div>
    </div>
  );
};

export default SummaryCards;
