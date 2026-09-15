import type { GameProps } from "./types";
import { Play, TrendingUp } from "lucide-react";

export const SoloGameCard = ({ game, onSelect }: GameProps) => (
  <div
    onClick={() => onSelect?.(game)}
    className="group flex flex-col gap-3 cursor-pointer"
  >
    {/* Image Container (No borders or padding around it) */}
    <div className="w-full aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden relative shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      <img
        src={game.thumbnail}
        alt={game.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      {/* Payout cap badge — "up to" since actual payout depends on how well
          you play, not a fixed per-game number */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full shadow-lg">
        <TrendingUp className="w-2.5 h-2.5" />
        Up to 2.0x
      </div>

      {/* Play Button Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
          <Play fill="currentColor" className="w-6 h-6 md:w-8 md:h-8 ml-1" />
        </div>
      </div>
    </div>

    {/* Title centered below the image */}
    <h3 className="font-heading font-black text-base md:text-xl text-slate-900 dark:text-white uppercase tracking-wide text-center group-hover:text-emerald-500 transition-colors">
      {game.title}
    </h3>
  </div>
);