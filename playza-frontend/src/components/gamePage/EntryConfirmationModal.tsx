import type { Session } from "@/types/types";
import { X, Wallet, AlertCircle } from "lucide-react";
import { ZASymbol } from "../currency/ZASymbol";

interface EntryConfirmationModalProps {
  session: Session | null;
  onClose: () => void;
  onConfirm: () => void;
  userBalance: number;
}

export const EntryConfirmationModal = ({ session, onClose, onConfirm, userBalance }: EntryConfirmationModalProps) => {
  if (!session) return null;

  const remainingBalance = userBalance - session.entryFee;
  const canAfford = remainingBalance >= 0;

  return (
    <>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-2 md:p-4">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 dark:bg-playza-dark/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <div
          className="relative w-full max-w-md bg-white dark:bg-playza-dark border border-slate-200 dark:border-white/10 rounded-xl p-2 md:p-8 backdrop-blur-3xl overflow-hidden"
        >
          {/* Decorative Background Element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-playza-blue/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 bg-slate-100 dark:bg-white/5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-8 relative">
            <div className="inline-flex p-2 md:p-5 bg-primary/20 rounded-xl">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Confirm Entry</h2>
              <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 font-bold">
                Join <span className="text-primary dark:text-white font-black italic">{session.title}</span> and compete for the prize.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-2 md:p-8 border border-slate-100 dark:border-white/5 space-y-5">
              <div className="flex justify-between items-center px-2">
                <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Entry Fee</span>
                <div className="flex items-center gap-1.5">
                  <ZASymbol className="text-sm scale-90" />
                  <span className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic">{session.entryFee}</span>
                </div>
              </div>
              <div className="h-px bg-slate-200 dark:bg-white/5 mx-2" />
              <div className="flex justify-between items-center px-2">
                <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Your Balance</span>
                <div className="flex items-center gap-1.5">
                  <ZASymbol className="text-sm scale-90" />
                  <span className="text-lg md:text-2xl font-black text-playza-green italic">{userBalance.toLocaleString()}</span>
                </div>
              </div>
              <div className="pt-2 px-2 flex justify-between items-center border-t border-slate-200 dark:border-white/10">
                <span className="text-primary font-black uppercase tracking-widest text-[10px]">Remaining</span>
                <div className="flex items-center gap-1.5 ">
                  <ZASymbol className={`text-sm scale-90 ${canAfford ? '' : 'opacity-50'}`} />
                  <span className={`text-2xl font-black ${canAfford ? 'text-slate-900 dark:text-white' : 'text-red-500'} italic`}>
                    {remainingBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 md:gap-3 text-left p-2 md:p-5 bg-amber-500/5 border border-amber-500/10 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs md:text-base text-[11px] text-amber-500/80 font-bold leading-relaxed">
                Entry fees are non-refundable once the session starts. Please ensure you have a stable connection.
              </p>
            </div>

            <div className="flex flex-col gap-2 md:gap-3">
              <button 
                onClick={onConfirm}
                disabled={!canAfford}
                className={`w-full py-5 rounded-xl font-black text-white uppercase tracking-widest ${
                  canAfford 
                    ? 'bg-primary' 
                    : 'bg-red-500/50 cursor-not-allowed text-white/50'
                }`}
              >
                {canAfford ? 'Confirm & Join' : 'Insufficient Balance'}
              </button>
              <button 
                onClick={onClose}
                className="w-full py-2 md:py-5 bg-transparent text-slate-500 font-black rounded-xl uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
