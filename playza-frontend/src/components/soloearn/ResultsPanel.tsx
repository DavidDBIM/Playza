import { Button } from "@/components/ui/button";
import { ZASymbol } from "@/components/currency/ZASymbol";
import type { GameProps } from "./types";

export const ResultsPanel = ({ stake, multiplier = 0, onBack, onPlayAgain }: GameProps) => {
  const simulatedMultiplier = multiplier;
  const simulatedEarnings = (parseFloat(stake || "0") * simulatedMultiplier).toFixed(2);

  return (
    <div className="w-full max-w-md mx-auto animation-fade-in pt-8">
      <div className="glass-card border border-primary/20 rounded-xl p-8 text-center bg-surface-elevated/40 relative overflow-hidden">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/20 blur-[60px]" />

        <div className="relative z-10">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary to-orange-400 mx-auto mb-6 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.4)]">
            <span className="font-heading font-black text-3xl text-black">A</span>
          </div>

          <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Rank Achieved</p>
          <h2 className="font-heading font-black text-3xl text-white uppercase tracking-tight mb-8">Excellent Run!</h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass-card bg-surface border border-white/5 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Payout Multiplier</span>
              <span className="font-heading text-2xl font-black text-white">{simulatedMultiplier.toFixed(1)}x</span>
            </div>
            <div className="glass-card bg-primary/10 border border-primary/20 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] uppercase font-black text-primary/70 tracking-widest mb-1">Total Payout</span>
              <span className="font-heading text-2xl font-black text-primary flex items-center gap-1.5"><ZASymbol className="text-3xl" />{simulatedEarnings}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
             <Button onClick={() => onPlayAgain?.()} className="h-12 w-full rounded-full font-black uppercase tracking-widest text-black">
               <span className="flex items-center gap-1">Play Again (<ZASymbol className="text-sm" />{stake})</span>
             </Button>
             <button onClick={onBack} className="h-12 w-full rounded-full font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs">
               Back to Solo Hub
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
