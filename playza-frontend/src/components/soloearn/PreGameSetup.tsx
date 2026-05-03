import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import { ZASymbol } from "@/components/currency/ZASymbol";
import type { GameProps } from "./types";

export const PreGameSetup = ({ game, onBack, onStart }: GameProps) => {
  const [stake, setStake] = useState("10");

  return (
    <div className="w-full max-w-2xl mx-auto animation-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </button>

      <div className="glass-card border border-primary/20 rounded-xl p-6 md:p-8 bg-surface-elevated/40">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden aspect-square md:aspect-auto md:h-64 relative border border-white/10 shrink-0">
             <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <div>
              <h1 className="font-heading font-black text-2xl md:text-3xl text-white uppercase tracking-tight mb-2">{game.title}</h1>
              <p className="text-sm text-slate-400">{game.description}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">Entry Stake (<ZASymbol className="text-[10px]" />)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black"><ZASymbol className="text-sm" /></span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter Entry Fee..."
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    className="w-full h-12 bg-surface/50 border border-white/10 rounded-xl pl-8 pr-4 text-white font-black font-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                   {[5, 10, 25, 50].map(val => (
                     <button
                       key={val}
                       onClick={() => setStake(val.toString())}
                       className={`flex-1 h-8 rounded-lg font-black text-xs border transition-all ${stake === val.toString() ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-white/10 text-slate-300 hover:bg-surface-elevated'}`}
                     >
                       <ZASymbol className="text-[10px] mr-0.5" />{val}
                     </button>
                   ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-3 items-start">
                <Trophy className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-200/80 leading-relaxed font-medium">
                  Your final reward is based purely on your performance multiplier. High score = High multiplier.
                </p>
              </div>

              <Button onClick={() => onStart?.(stake)} className="w-full h-12 rounded-xl text-sm font-black uppercase tracking-widest text-black shadow-lg shadow-primary/20">
                Start Run
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
