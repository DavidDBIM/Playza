import type { GameProps } from "./types";
import { Play } from "lucide-react";

export const SoloGameCard = ({ game, onSelect }: GameProps) => (
  <div
    onClick={() => onSelect?.(game)}
    className="group relative glass-card bg-background/40 hover:bg-muted/60 transition-all duration-500 border border-border hover:border-primary/40 rounded-2xl md:rounded-3xl p-2 md:p-4 flex flex-col cursor-pointer overflow-hidden shadow-xl hover:shadow-primary/10 hover:-translate-y-1 h-full"
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
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
          <Play
            fill="currentColor"
            className="w-5 h-5 md:w-7 md:h-7 translate-x-0.5"
          />
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 flex flex-col items-center justify-center mt-2">
      <h3 className="font-heading font-black text-sm md:text-xl text-foreground uppercase tracking-tight group-hover:text-primary transition-colors truncate w-full text-center">
        {game.title}
      </h3>
    </div>

    {/* Subtle Glow Background */}
    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
  </div>
);
