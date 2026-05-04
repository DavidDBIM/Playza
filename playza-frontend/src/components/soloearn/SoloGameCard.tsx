import type { GameProps } from "./types";
import { Play } from "lucide-react";

export const SoloGameCard = ({ game, onSelect }: GameProps) => (
  <div
    onClick={() => onSelect?.(game)}
    className="group relative glass-card bg-slate-900/40 hover:bg-slate-900/60 transition-all duration-500 border border-white/5 hover:border-primary/40 rounded-2xl md:rounded-3xl p-2 md:p-4 flex flex-col cursor-pointer overflow-hidden shadow-xl hover:shadow-primary/10 hover:-translate-y-1 h-full"
  >
    {/* Image Container */}
    <div className="relative w-full aspect-16/10 md:aspect-video rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-5 bg-slate-950 ring-1 ring-white/5">
      <img
        src={game.thumbnail}
        alt={game.title}
        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
      />

      {/* Play Overlay */}
      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary text-black flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
          <Play
            fill="currentColor"
            className="w-5 h-5 md:w-7 md:h-7 translate-x-0.5"
          />
        </div>
      </div>

      {/* Difficulty Badge */}
      <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[8px] md:text-[10px] uppercase font-black tracking-widest text-primary border border-primary/30">
        {game.difficulty}
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 flex flex-col">
      <h3 className="font-heading font-black text-xs md:text-xl text-white mb-0.5 md:mb-1.5 uppercase tracking-tight group-hover:text-primary transition-colors truncate">
        {game.title}
      </h3>
      <div className="flex items-center gap-2 mb-1 md:mb-4">
        <span className="text-[7px] md:text-[10px] text-primary/80 font-black uppercase tracking-[0.2em]">
          {game.label}
        </span>
      </div>
      <p className="text-[10px] md:text-sm text-slate-400 line-clamp-2 md:line-clamp-none font-medium leading-relaxed">
        {game.description}
      </p>
    </div>

    {/* Subtle Glow Background */}
    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
  </div>
);
