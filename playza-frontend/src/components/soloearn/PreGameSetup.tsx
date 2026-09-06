import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, TrendingUp } from "lucide-react";
import { ZASymbol } from "@/components/currency/ZASymbol";
import type { GameProps } from "./types";

const STAKE_PRESETS = [100, 200, 500, 1000];

export const PreGameSetup = ({ game, onBack, onStart }: GameProps) => {
  const [stake, setStake] = useState("100");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const stakeNum = parseInt(stake, 10) || 0;

  return (
    <div className="w-full max-w-xl mx-auto animate-in fade-in pb-24 md:pb-10">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 text-xs font-black uppercase tracking-widest"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Hub
      </button>

      {/* Cinematic hero — banner with the game title overlaid, instead of a
          side-by-side thumbnail box that reads like a plain settings form */}
      <div className="relative h-44 md:h-56 rounded-3xl overflow-hidden border border-border shadow-xl">
        <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <span className="inline-block text-[9px] font-black uppercase tracking-[0.25em] text-primary bg-primary/15 border border-primary/30 rounded-full px-2.5 py-1 mb-2 backdrop-blur-sm">
            {game.label || "Skill Challenge"}
          </span>
          <h1 className="font-heading font-black text-2xl md:text-4xl text-white uppercase tracking-tight leading-none drop-shadow-lg">
            {game.title}
          </h1>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mt-4 mb-6 px-1">
        {game.description}
      </p>

      {/* Stake selector — one unified card instead of a bare input plus a
          row of quick-pick buttons underneath it */}
      <div className="glass-card border border-border rounded-2xl p-5 md:p-6 space-y-5">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-primary" /> Entry Stake
          </label>

          <div className="grid grid-cols-4 gap-2">
            {STAKE_PRESETS.map((val) => (
              <button
                key={val}
                onClick={() => setStake(val.toString())}
                className={`py-3 md:py-4 rounded-xl font-heading font-black text-sm md:text-base border-2 transition-all ${
                  stake === val.toString()
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-background/40 border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <ZASymbol className="text-sm" />
            </span>
            <input
              type="number"
              min="1"
              placeholder="Custom amount"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="w-full h-12 bg-background/50 border border-border rounded-xl pl-9 pr-4 text-foreground font-black font-heading text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground placeholder:font-normal placeholder:text-xs"
            />
          </div>
        </div>

        {/* Payout preview — turns the abstract "multiplier" concept into a
            concrete number before the player commits their stake */}
        <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/15 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">
                Best Case Payout
              </p>
              <p className="text-lg font-black text-primary flex items-center gap-1 leading-none">
                <ZASymbol className="text-sm" />
                {(stakeNum * 2).toLocaleString()}
                <span className="text-[10px] text-muted-foreground font-bold ml-1">at 2.0×</span>
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setShowConfirmModal(true)}
          disabled={stakeNum <= 0}
          className="w-full h-13 rounded-xl text-sm font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/25"
        >
          Enter Arena
        </Button>
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
              You are about to stake{" "}
              <strong className="text-foreground inline-flex items-center gap-0.5">
                <ZASymbol className="text-xs" />
                {stakeNum}
              </strong>{" "}
              on this run. Are you sure you want to proceed?
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
                className="flex-1 rounded-xl h-12 text-primary-foreground shadow-lg shadow-primary/20 font-bold tracking-widest uppercase text-xs"
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