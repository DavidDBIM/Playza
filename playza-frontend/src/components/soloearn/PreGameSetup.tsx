import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import { ZASymbol } from "@/components/currency/ZASymbol";
import type { GameProps } from "./types";

export const PreGameSetup = ({ game, onBack, onStart }: GameProps) => {
  const [stake, setStake] = useState("100");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto animation-fade-in pb-24 md:pb-8">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm font-bold uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </button>

      <div className="glass-card border border-border rounded-xl p-6 md:p-8 bg-background/40">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden h-40 md:h-64 relative border border-border shrink-0">
             <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <div>
              <h1 className="font-heading font-black text-2xl md:text-3xl text-foreground uppercase tracking-tight mb-2">{game.title}</h1>
              <p className="text-sm text-muted-foreground">{game.description}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">Entry Stake (<ZASymbol className="text-[10px]" />)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black"><ZASymbol className="text-sm" /></span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter Entry Fee..."
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    className="w-full h-12 bg-background/50 border border-border rounded-xl pl-8 pr-4 text-foreground font-black font-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                   {[100, 200, 500, 1000].map(val => (
                     <button
                       key={val}
                       onClick={() => setStake(val.toString())}
                       className={`flex-1 h-8 rounded-lg font-black text-xs border transition-all ${stake === val.toString() ? 'bg-primary/20 border-primary text-primary' : 'bg-background/40 border-border text-muted-foreground hover:bg-muted'}`}
                     >
                       <ZASymbol className="text-[10px] mr-0.5" />{val}
                     </button>
                   ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-3 items-start">
                <Trophy className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800 dark:text-orange-200/80 leading-relaxed font-medium">
                  Your final reward is based purely on your performance multiplier. High score = High multiplier.
                </p>
              </div>

              <Button onClick={() => setShowConfirmModal(true)} className="w-full h-12 rounded-xl text-sm font-black uppercase tracking-widest text-black shadow-lg shadow-primary/20">
                Start Run
              </Button>
            </div>
          </div>
        </div>
      </div>
    {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card border border-border rounded-2xl p-6 md:p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl bg-background">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <ZASymbol className="text-3xl text-primary" />
            </div>
            <h3 className="font-heading font-black text-xl text-foreground uppercase tracking-wider mb-2">
              Confirm Entry
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              You are about to stake <strong className="text-foreground inline-flex items-center gap-0.5"><ZASymbol className="text-xs" />{stake}</strong> on this run. Are you sure you want to proceed?
            </p>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-12 border-border text-foreground hover:bg-muted font-bold tracking-widest uppercase text-xs"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl h-12 text-black shadow-lg shadow-primary/20 font-bold tracking-widest uppercase text-xs"
                disabled={isStarting}
                onClick={async () => {
                  setIsStarting(true);
                  try {
                    await onStart?.(stake);
                  } finally {
                    setIsStarting(false);
                    setShowConfirmModal(false);
                  }
                }}
              >
                {isStarting ? "Starting..." : "Start Game"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
