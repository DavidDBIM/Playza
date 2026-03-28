import { Landmark, AlertCircle, XCircle } from "lucide-react";
import { ZASymbol } from "../currency/ZASymbol";

type WithdrawStatus = "idle" | "verify" | "failed";

interface ReqWithdrawProps {
  onClick: (value: WithdrawStatus) => void;
  status: WithdrawStatus;
  amount: number;
  bank: string;
}

const ReqWithdraw = ({ onClick, status, amount, bank }: ReqWithdrawProps) => {
  
  return (
    <div className="glass-card rounded-xl py-2 md:py-8 px-2 md:p-12 relative overflow-hidden border border-yellow-500/20 shadow-2xl">
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-yellow-500/10 blur-[100px] rounded-full"></div>
      
      <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 relative z-10 tracking-tight text-center md:text-left">
        Wallet <span className="bg-clip-text text-transparent bg-linear-to-r from-yellow-400 via-amber-200 to-yellow-600">Withdrawal</span>
      </h1>
      <p className="text-slate-500 font-medium mb-12 relative z-10 text-center md:text-left text-sm md:text-xs md:text-base">Confirm destination and process your payout.</p>

      <div className="space-y-8 relative z-10">
        <div className="bg-slate-50 dark:bg-white/5 rounded-2xl px-2 py-2 md:py-6 md:p-6 border border-slate-200 dark:border-white/5">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 px-1">Payout Details</h3>
          
          <div className="flex items-center justify-between mb-4 text-sm md:text-base px-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-widest">Status</span>
            <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded font-bold uppercase tracking-wide text-[10px]">Pending Approval</span>
          </div>

          <div className="flex items-center justify-between mb-4 px-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-widest">Destination</span>
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Landmark size={18} className="text-yellow-500" />
              <span className="uppercase text-sm">{bank} - **** 456</span>
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-white/10 my-6"></div>

          <div className="flex items-center justify-between px-1">
            <span className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Payout Requested</span>
            <div className="flex items-center gap-1.5">
              <ZASymbol className="text-xl md:text-2xl" />
              <span className="text-lg md:text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-yellow-400 via-amber-200 to-yellow-600 leading-none">
                {amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-2 py-2 md:py-4 md:p-4 flex gap-2 md:gap-3 text-yellow-500/80">
          <AlertCircle className="shrink-0 size-5" />
          <p className="text-[10px] md:text-xs font-bold leading-relaxed">
            Notice: Payouts are usually processed within 5-15 minutes. Heavy network volumes might extend processing up to 24 hours.
          </p>
        </div>

        {status === "failed" && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-2 py-2 md:py-4 md:p-4 flex gap-2 md:gap-3 text-red-500 animate-in shake">
            <XCircle className="shrink-0" />
            <div>
              <p className="font-bold text-xs md:text-sm">Execution Failed</p>
              <p className="text-xs opacity-80 mt-1 font-medium">Our gateway rejected the request. Please verify your limit and try again.</p>
            </div>
          </div>
        )}

        <button
          onClick={() => onClick("verify")}
          className="w-full bg-linear-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white dark:text-background-dark py-2 md:py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-2 group hover:-translate-y-0.5 active:scale-[0.98] text-sm"
        >
          {status === "failed" ? (
            <span>Retry Request</span>
          ) : (
            <span>Request Transfer</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReqWithdraw;
