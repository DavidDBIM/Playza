import { Button } from "@/components/ui/button";
import type { GameProps } from "./types";

export const SoloGameCard = ({ game, onSelect }: GameProps) => (
  <div className="glass-card hover:bg-surface-elevated/30 transition-all border border-primary/10 rounded-2xl p-4 flex flex-col group h-full">
    <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-slate-900 border border-white/5">
      <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-500" />
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-[10px] uppercase font-black tracking-widest text-primary border border-primary/20">
        {game.difficulty}
      </div>
    </div>
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <h3 className="font-heading font-black text-lg text-white mb-1 uppercase tracking-tight">{game.title} <span className="text-[10px] ml-1 text-slate-500 font-bold tracking-widest">{game.label}</span></h3>
        <p className="text-sm text-slate-400 mb-4">{game.description}</p>
      </div>
      <Button onClick={() => onSelect?.(game)} className="w-full font-black uppercase text-xs tracking-widest h-10 bg-primary/20 hover:bg-primary text-primary hover:text-black">
        Play Challenge
      </Button>
    </div>
  </div>
);
