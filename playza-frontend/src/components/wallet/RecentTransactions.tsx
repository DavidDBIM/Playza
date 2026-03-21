import { ArrowBigRight } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import TransactionDetailModal from "@/components/transactions/TransactionDetailModal";
import TransactionItem from "@/components/transactions/TransactionItem";
import type { TransactionUI } from "@/types/types";

const transactions: TransactionUI[] = [
  {
    id: "#TRX-90821",
    type: "Prize Win",
    amount: "+₦50,000.00",
    status: "Completed",
    reference: "VAL-TOURN-X-FINALS",
    date: "Oct 24, 2023 · 14:32",
  },
  {
    id: "#TRX-90744",
    type: "Deposit",
    amount: "+₦10,000.00",
    status: "Completed",
    reference: "PAYSTACK-REF-889",
    date: "Oct 23, 2023 · 09:15",
  },
  {
    id: "#TRX-90612",
    type: "Game Entry",
    amount: "-₦2,500.00",
    status: "Completed",
    reference: "ENTRY-FEE-VAL-44",
    date: "Oct 22, 2023 · 18:00",
  },
  {
    id: "#TRX-90501",
    type: "Withdrawal",
    amount: "-₦15,000.00",
    status: "Pending",
    reference: "BANK-X-442291",
    date: "Oct 21, 2023 · 11:45",
  },
];

const RecentTransactions = () => {
  const [selectedTxn, setSelectedTxn] = useState<TransactionUI | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = (txn: TransactionUI) => {
    setSelectedTxn(txn);
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="glass-card rounded-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-900/10 dark:border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
          <Link
            to={"/wallet/transactions"}
            className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group"
          >
            View Full History 
            <ArrowBigRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="flex flex-col">
          {transactions.map((txn) => (
            <TransactionItem key={txn.id} {...txn} onClick={() => handleOpen(txn)} />
          ))}
        </div>
      </section>

      <TransactionDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        transaction={selectedTxn} 
      />
    </>
  );
};

export default RecentTransactions;
