import { winners } from "@/constants/constants";
import { Trophy, Clock } from "lucide-react";
import { ZASymbol } from "../currency/ZASymbol";

// Generate random times once per module load to ensure the component remains pure
// and avoids both hydration mismatches and cascading render effects.
const randomTimes = Array.from({ length: winners.length * 3 }, () => 
  Math.max(1, Math.floor(Math.random() * 59))
);

const RecentWinners = () => {

  return (
    <div className="w-full flex flex-col gap-2 md:gap-4 py-2 relative z-10">
      {/* Title Section */}
      <div className="flex items-center gap-2 md:gap-3 px-2">
        <div className="relative flex items-center justify-center">
          <Trophy className="w-5 h-5 text-yellow-500 relative z-10" />
        </div>
        <h3 className="text-sm md:text-base font-bold uppercase tracking-widest bg-clip-text text-transparent bg-linear-to-r from-yellow-400 via-amber-200 to-yellow-600 font-display">
          Live Winners Arena
        </h3>
        <div className="ml-auto flex items-center gap-2 px-2 md:px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
          <span className="w-2 h-2 rounded-full bg-red-500 live-indicator"></span>
          <span className="text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-widest">Live Updates</span>
        </div>
      </div>

      {/* Scrolling Container with Edge Fades */}
      <div 
        className="relative w-full overflow-hidden flex items-center rounded-2xl mask-horizontal-fade"
      >
        <div className="flex w-max items-center gap-2 md:gap-4 py-2 recent-winner">
          {[...winners, ...winners].map(
            ({ id, username, game, amountWon }, i) => (
              <div
                key={`${id}-${i}`}
                className="relative flex items-center gap-2 md:gap-4 px-2 md:px-4 py-2 rounded-2xl glass-card border border-primary/20 bg-slate-900/40 dark:bg-slate-900/60 shrink-0"
              >
                {/* Content */}
                <div className="flex justify-center gap-1">
                  <div className="flex items-center gap-2 text-[10px] md:text-xs leading-none pt-1">
                    <span className="font-bold truncate max-w-30">{username}</span>
                    <span className="italic opacity-80">won</span>
                    <div className="flex items-center gap-1">
                      <ZASymbol className="text-sm scale-75" />
                      <span className="font-extrabold text-sm md:text-base lg:text-lg text-emerald-400 font-mono tracking-tight leading-none">
                        {amountWon.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-1 md:gap-4 mt-0.5">
                    <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest truncate max-w-37.5">
                      in {game}
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-medium whitespace-nowrap bg-black/20 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3 " />
                      <span>{randomTimes[i] || 1}m ago</span>
                    </div>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentWinners;
