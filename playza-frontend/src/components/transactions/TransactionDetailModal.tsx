import { useState, useEffect } from "react";
import { Trophy, ArrowDownCircle, Gamepad2, ArrowUpCircle, X, Check, Copy, Share2 } from "lucide-react";
import type { TransactionUI } from "@/types/types";
import { ZASymbol } from "@/components/currency/ZASymbol";

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionUI | null;
}

const getIcon = (type: string) => {
  switch (type) {
    case "Prize Win": return { icon: Trophy, color: "text-primary", bg: "bg-primary/10" };
    case "Deposit": return { icon: ArrowDownCircle, color: "text-blue-400", bg: "bg-blue-400/10" };
    case "Game Entry": return { icon: Gamepad2, color: "text-slate-400", bg: "bg-slate-400/10" };
    case "Withdrawal": return { icon: ArrowUpCircle, color: "text-amber-400", bg: "bg-amber-400/10" };
    default: return { icon: ArrowDownCircle, color: "text-slate-400", bg: "bg-slate-400/10" };
  }
};

const TransactionDetailModal = ({ isOpen, onClose, transaction }: TransactionDetailModalProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

  const { icon: Icon, color, bg } = getIcon(transaction.type);
  const isPositive = transaction.amount.startsWith("+") || transaction.type === "Deposit" || transaction.type === "Reward Payout" || transaction.type === "Prize Win";
  const displayAmount = transaction.amount.replace("+ZA", "").replace("-ZA", "").replace("ZA", "");

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-100 p-2 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity overflow-y-auto" onClick={onClose}>
      <div 
        className="relative w-full max-w-md glass-card rounded-xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Decor */}
        <div className={`h-2 w-full ${isPositive ? 'bg-primary' : 'bg-amber-500'}`}></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-2 md:p-8">
          {/* Icon & Status */}
          <div className="flex flex-col items-center mb-8">
            <div className={`size-20 rounded-2xl ${bg} flex items-center justify-center mb-4 shadow-inner border border-white/5`}>
              <Icon className={`${color} text-4xl`} />
            </div>
            <h3 className="text-base md:text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1 uppercase italic tracking-tight">{transaction.type}</h3>
            <span className={`px-4 py-1 rounded-full ${transaction.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'} text-[10px] font-black uppercase tracking-[0.2em] border border-white/5`}>
              {transaction.status}
            </span>
          </div>

          {/* Amount */}
          <div className="bg-slate-900/5 dark:bg-white/5 rounded-2xl p-2 md:p-6 text-center mb-8 border border-slate-200 dark:border-white/5 shadow-inner">
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Transaction Amount</p>
             <div className={`text-4xl sm:text-5xl font-black flex items-center justify-center gap-2 italic ${isPositive ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
               {isPositive ? '+' : '-'}
               <ZASymbol className="scale-110" />
               <span>{displayAmount}</span>
             </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Transaction ID</span>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 font-mono text-primary hover:text-primary/80 transition-colors"
              >
                {transaction.id}
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Date & Time</span>
              <span className="text-white font-bold">{transaction.date}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Reference</span>
              <span className="text-white font-bold truncate max-w-45">{transaction.reference}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Payment Method</span>
              <span className="text-white font-bold">Wallet Transfer</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 md:gap-4">
             <button className="flex items-center justify-center gap-2 py-2 md:py-3 bg-white/5 border border-white/5 rounded-xl text-white font-bold hover:bg-white/10 transition-all">
               <Share2 size={18} />
               Share
             </button>
             <button 
               onClick={onClose}
               className="flex items-center justify-center gap-2 py-2 md:py-3 bg-primary text-background-dark rounded-xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
             >
               Dismiss
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
