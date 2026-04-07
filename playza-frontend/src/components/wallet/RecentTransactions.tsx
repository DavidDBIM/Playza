import { ArrowBigRight, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import TransactionDetailModal from "@/components/transactions/TransactionDetailModal";
import TransactionItem from "@/components/transactions/TransactionItem";
import type { TransactionUI } from "@/types/types";
import { useTransactions } from "@/hooks/wallet/useWallet";
import { format } from "date-fns";

const RecentTransactions = () => {
  const [selectedTxn, setSelectedTxn] = useState<TransactionUI | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading: loading } = useTransactions(1, 4);
  const transactions = data?.transactions || [];

  const uiTransactions: TransactionUI[] = transactions.map((t) => {
    const isPositive = ["deposit", "win", "refund"].includes(t.type);

    // Map backend types/status to frontend labels for icon/style matching
    const typeLabelMap: Record<string, string> = {
      deposit: "Deposit",
      withdrawal: "Withdrawal",
      bet: "Game Entry",
      win: "Prize Win",
      refund: "Refund",
    };

    const statusLabelMap: Record<string, string> = {
      successful: "Completed",
      pending: "Pending",
      failed: "Failed",
      cancelled: "Cancelled",
    };

    return {
      id: `#${t.id.slice(-5).toUpperCase()}`,
      type:
        typeLabelMap[t.type] ||
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
      amount: `${isPositive ? "+" : "-"}ZA${t.amount.toLocaleString()}`,
      status:
        statusLabelMap[t.status] ||
        t.status.charAt(0).toUpperCase() + t.status.slice(1),
      reference: t.reference,
      date: format(new Date(t.created_at), "MMM dd, yyyy · HH:mm"),
    };
  });

  const handleOpen = (txn: TransactionUI) => {
    setSelectedTxn(txn);
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="glass-card rounded-xl overflow-hidden">
        <div className="px-2 md:px-8 py-2 md:py-6 border-b border-slate-900/10 dark:border-white/10 flex items-center justify-between">
          <h3 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white">
            Recent Activity
          </h3>
          <Link
            to={"/wallet/transactions"}
            className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group"
          >
            View Full History
            <ArrowBigRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest animate-pulse">
                Fetching Activity...
              </p>
            </div>
          ) : uiTransactions.length > 0 ? (
            uiTransactions.map((txn) => (
              <TransactionItem
                key={txn.id}
                {...txn}
                onClick={() => handleOpen(txn)}
              />
            ))
          ) : (
            <div className="p-12 text-center text-slate-500 font-medium italic">
              No recent transactions found.
            </div>
          )}
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
