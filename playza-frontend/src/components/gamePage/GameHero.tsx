import type { Game } from "@/types/types";
import { Users, Trophy, SwatchBook, MousePointer2 } from "lucide-react";
import { formatNaira } from "@/lib/formatNaira";
import { Link } from "react-router";

interface GameHeroProps {
  game: Game;
  pricePool: number;
}

export const GameHero = ({ game, pricePool }: GameHeroProps) => {
  return (
    <section className="relative w-full min-h-95 md:min-h-120 lg:min-h-137.5 flex items-center overflow-hidden rounded-2xl md:rounded-3xl mb-6 md:mb-8 group border border-slate-200 dark:border-white/5 shadow-xl transition-colors duration-300">
      {/* Background Image with theme-aware overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover transform scale-105 opacity-40 dark:opacity-60 group-hover:scale-110 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-linear-to-b from-white/20 via-white/40 to-white/90 dark:from-playza-dark/20 dark:via-playza-dark/60 dark:to-playza-dark/95" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-slate-50 via-slate-50/60 to-transparent dark:from-background dark:via-background/60 dark:to-transparent" />
      </div>

      <div className="relative z-10 w-full px-4 md:px-8 lg:px-12 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 md:gap-10 lg:gap-16">
          {/* Portrait Card */}
          <div className="relative group/portrait shrink-0">
            <div className="absolute -inset-6 md:-inset-10 bg-playza-cyan/40 hover:bg-playza-cyan/60 blur-[60px] md:blur-[100px] rounded-full opacity-0 group-hover/portrait:opacity-100 transition-all duration-700" />
            <div className="relative w-32 h-44 md:w-56 md:h-72 lg:w-64 lg:h-80 rounded-xl overflow-hidden border-2 md:border-4 border-white/50 dark:border-white/10 shadow-2xl glass-panel p-2 md:p-3 transition-transform duration-500 hover:rotate-2 animate-fade-in-up bg-white/40 dark:bg-white/5 backdrop-blur-sm">
              <div className="w-full h-full rounded-lg md:rounded-2xl overflow-hidden relative">
                <img
                  src={game.thumbnail}
                  alt="Game Portrait"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/portrait:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 dark:from-playza-dark/40 to-transparent" />
              </div>
            </div>
          </div>

          {/* Game Info Content */}
          <div className="flex-1 space-y-4 md:space-y-6 lg:pb-4 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4">
              <span className="flex items-center gap-2 px-3 md:px-4 py-1 bg-red-500 rounded-full text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest animate-pulse">
                <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white rounded-full" />
                Live
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em]">
                {game.category} / {game.mode}
              </span>
            </div>

            <div className="space-y-2 md:space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase text-slate-900 dark:text-white leading-none tracking-tighter drop-shadow-sm dark:drop-shadow-2xl italic transition-colors duration-300">
                {game.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-xs md:text-base lg:text-lg font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0 transition-colors duration-300">
                Endless runner competitive challenge where every turn counts.
                Push your limits in{" "}
                <span className="text-slate-900 dark:text-white font-bold">
                  {game.title}
                </span>{" "}
                and compete for the top of the leaderboard.
              </p>
            </div>

            {/* Stats Flex-Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 md:gap-4 pt-2 md:pt-4">
              <div className="glass-card px-3 md:px-5 py-2 md:py-3 rounded-xl border border-slate-200 dark:border-white/5 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shadow-sm">
                <div className="p-1.5 bg-playza-blue/10 rounded-lg">
                  <Users className="w-3 md:w-4 h-3 md:h-4 text-playza-blue opacity-70" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[7px] md:text-[9px] text-slate-500 font-black uppercase tracking-tight">
                    Active
                  </span>
                  <span className="text-xs md:text-base font-black text-slate-900 dark:text-white leading-none uppercase">
                    {game.activePlayers.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="glass-card px-3 md:px-5 py-2 md:py-3 rounded-xl border border-slate-200 dark:border-white/5 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shadow-sm">
                <div className="p-1.5 bg-playza-yellow/10 rounded-lg">
                  <SwatchBook className="w-3 md:w-4 h-3 md:h-4 text-playza-yellow opacity-70" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[7px] md:text-[9px] text-slate-500 font-black uppercase tracking-tight">
                    Sessions
                  </span>
                  <span className="text-xs md:text-base font-black text-slate-900 dark:text-white leading-none uppercase">
                    3
                  </span>
                </div>
              </div>

              <div className="glass-card px-3 md:px-5 py-2 md:py-3 rounded-xl border-l-2 md:border-l-4 border-l-playza-green bg-playza-green/5 flex items-center gap-3 hover:bg-playza-green/10 transition-colors shadow-sm border-y border-r border-slate-200 dark:border-white/5">
                <div className="p-1.5 bg-playza-green/10 rounded-lg">
                  <Trophy className="w-3 md:w-4 h-3 md:h-4 text-playza-green opacity-70" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[7px] md:text-[9px] text-playza-green/70 font-black uppercase tracking-tight">
                    Pot
                  </span>
                  <span className="text-xs md:text-base font-black text-playza-green font-mono tracking-tighter leading-none">
                    {formatNaira(pricePool)}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button Underneath */}
            <div className="pt-4 md:pt-6">
              <Link
                to={`/games/${game.slug}/session`}
                className="inline-block w-full md:w-auto"
              >
                <button className="group relative w-full md:w-auto bg-primary text-slate-900 font-black px-8 md:px-12 py-3 md:py-4 rounded-xl md:rounded-2xl hover:scale-[1.03] transition-all uppercase tracking-[0.2em] text-[10px] md:text-sm shadow-xl dark:shadow-[0_0_30px_rgba(244,192,37,0.3)] active:scale-95 flex items-center justify-center gap-3 overflow-hidden border border-primary/20">
                  <span>Enter Live Match Arena</span>
                  <div className="relative flex items-center justify-center ml-2">
                    <MousePointer2 className="w-4 h-4 text-slate-900 relative z-10" />
                    <div className="absolute inset-x-0 inset-y-0 -m-2 border-2 border-slate-900/40 rounded-full animate-click-pulse" />
                    <div className="absolute inset-x-0 inset-y-0 -m-4 border border-slate-900/20 rounded-full animate-click-pulse delay-700" />
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes click-pulse {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-click-pulse {
          animation: click-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </section>
  );
};
