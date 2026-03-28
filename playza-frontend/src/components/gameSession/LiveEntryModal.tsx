import { useEffect } from "react";
import {
  Zap,
  X,
  Gamepad,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { ZASymbol } from "../currency/ZASymbol";
import type { Game } from "@/types/types";
import { formatZA } from "@/lib/formatCurrency";

interface LiveEntryModalProps {
  game: Game;
  onClick: (value: boolean) => void;
  onConfirm: () => void;
  userBalance?: number;
}

const LiveEntryModal = ({ game, onClick, onConfirm, userBalance = 1250 }: LiveEntryModalProps) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    };
  }, []);

  const newBalance = userBalance - game.entryFee;
  const isInsufficient = newBalance < 0;

  return (
    <main className="fixed inset-0 z-100 overflow-y-auto backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
      <div className="min-h-full flex items-center justify-center p-2 md:p-4">
        <div className="relative w-full max-w-md glass-card rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          
          <button
            onClick={() => onClick(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-20"
          >
            <X size={18} />
          </button>

          <div className="p-2 md:p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg md:text-2xl font-black text-white tracking-widest uppercase italic">
                BATTLE <span className="text-primary">ENTRY</span>
              </h2>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-tighter">
                Secure your spot in the arena
              </p>
            </div>

            <div className="relative rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden mb-6">
              <div className="h-20 w-full relative">
                <img 
                  src={game.thumbnail} 
                  alt={game.title} 
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900 to-transparent"></div>
                <div className="absolute bottom-2 left-4">
                  <h3 className="text-sm md:text-lg font-black text-white italic uppercase tracking-tight">{game.title}</h3>
                </div>
              </div>
              <div className="p-2 md:p-4 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1 text-primary">
                    <ZASymbol className="text-sm scale-90" />
                    <span className="text-base md:text-xl font-black">{formatZA(game.entryFee)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Gamepad size={12} className="text-primary" />
                  Live Match
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                <span>Wallet Balance</span>
                <div className="flex items-center gap-1 text-white">
                  <ZASymbol className="text-[10px] scale-75" />
                  <span>{formatZA(userBalance)}</span>
                </div>
              </div>
              
              <div className="bg-black/40 rounded-xl p-2 md:p-4 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Entry Deduction</span>
                  <span className="text-xs font-black text-rose-500">-{formatZA(game.entryFee)}</span>
                </div>
                <div className="h-px bg-white/5 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Final Balance</span>
                  <span className={`text-sm font-black ${isInsufficient ? 'text-rose-500' : 'text-primary'}`}>
                    {formatZA(newBalance)}
                  </span>
                </div>
              </div>
            </div>

            {isInsufficient ? (
              <div className="flex gap-2 md:gap-3 p-2 md:p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 mb-6 items-center">
                <AlertCircle size={16} className="text-rose-500 shrink-0" />
                <p className="text-[10px] font-bold text-rose-500/80">
                  Insufficient funds. Please top up your wallet.
                </p>
              </div>
            ) : (
              <div className="flex gap-2 md:gap-3 p-2 md:p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 mb-6 items-center">
                <ShieldCheck size={16} className="text-amber-500 shrink-0" />
                <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-tighter italic">
                  Instant payouts guaranteed on win
                </p>
              </div>
            )}

            <button 
              disabled={isInsufficient}
              onClick={onConfirm}
              className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group
                ${isInsufficient 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-linear-to-r from-primary to-blue-600 hover:scale-[1.02] active:scale-98 text-slate-950 shadow-lg shadow-primary/20 cursor-pointer'}
              `}
            >
              Confirm & Enter Arena
              {!isInsufficient && <Zap size={14} className="fill-slate-950" />}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LiveEntryModal;
