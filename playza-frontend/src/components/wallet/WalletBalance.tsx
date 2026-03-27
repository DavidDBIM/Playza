import { Info, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { MdPayments } from "react-icons/md";
import { ZASymbol } from "../currency/ZASymbol";
import { CurrencyConverter } from "./CurrencyConverter";

interface WalletBalanceProps {
  balance: number | string;
  onWithdrawClick?: () => void;
}

const WalletBalance = ({ balance, onWithdrawClick }: WalletBalanceProps) => {
  const navigate = useNavigate();
  const numericBalance = typeof balance === "string" ? parseFloat(balance.replace(/,/g, "")) : balance;

  const handleWithdraw = () => {
    if (onWithdrawClick) {
      onWithdrawClick();
    } else {
      navigate("?modal=withdraw");
    }
  };

  return (
    <div className="lg:col-span-2 glass-card rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 size-64 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all"></div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-slate-600 dark:text-slate-400 font-medium tracking-wide uppercase text-xs">
            Available Balance
          </p>
          <button className="text-primary/50 hover:text-primary transition-colors cursor-help">
            <Info size={16} />
          </button>
        </div>
        
        <div className="flex flex-col">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-2">
            <ZASymbol className="scale-90 md:scale-100" />
            <span>{numericBalance?.toLocaleString()}</span>
            <span className="text-lg font-bold text-slate-400 opacity-50">.00</span>
          </h2>
          
          <CurrencyConverter amount={numericBalance || 0} />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          onClick={() => navigate("?modal=deposit")}
          className="flex-1 bg-primary hover:bg-primary/90 text-background dark:text-background-dark font-black py-3 md:py-4 rounded-xl transition-all neon-glow flex items-center justify-center gap-2 text-xs md:text-base group/btn uppercase tracking-widest"
        >
          <PlusCircle className="transition-transform group-hover/btn:rotate-90" />
          Deposit Funds
        </button>
        <button
          onClick={handleWithdraw}
          className="flex-1 bg-transparent border border-slate-200 dark:border-white/10 hover:border-primary/50 text-slate-900 dark:text-white font-black py-3 md:py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs md:text-base group/btn uppercase tracking-widest shadow-sm hover:shadow-lg"
        >
          <MdPayments className="transition-transform group-hover/btn:scale-110" />
          Withdraw Earnings
        </button>
      </div>
    </div>
  );
};

export default WalletBalance;
