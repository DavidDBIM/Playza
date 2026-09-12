import { useMemo } from "react";
import { useRecentWinners } from "@/hooks/gamesession/useGameSession";
import { Trophy, Clock } from "lucide-react";
import { ZASymbol } from "../currency/ZASymbol";
import { formatDistanceToNowStrict } from "date-fns";

const RecentWinners = () => {
  // Real wins across every game type — H2H, Solo Earn, and Tournament/Arena
  // all write to the same game_history table on a win, so this one feed
  // covers all of them. Always the most recent 30 (server-capped); as new
  // wins arrive via polling, older ones naturally age out of that window
  // without any client-side deletion needed.
  const { data: winners = [], isLoading } = useRecentWinners(30);

  const displayWinners = useMemo(
    () => (winners.length > 0 ? [...winners, ...winners] : []),
    [winners],
  );

  // Nothing to show yet (no wins recorded) — don't render an empty/fake ticker.
  if (!isLoading && winners.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-1.5 md:gap-2 py-1 relative z-10">
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

      {isLoading ? (
        <div className="flex gap-2 md:gap-4 px-2 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 w-56 rounded-2xl bg-slate-800/50 animate-pulse shrink-0" />
          ))}
        </div>
      ) : (
        /* Scrolling Container with Edge Fades */
        <div className="relative w-full overflow-hidden flex items-center rounded-2xl mask-horizontal-fade">
          <div className="flex w-max items-center gap-2 md:gap-4 py-2 recent-winner">
            {displayWinners.map(({ id, username, game, amountWon, playedAt }, i) => (
              <div
                key={`${id}-${i}`}
                className="relative flex items-center gap-2 md:gap-4 px-2 md:px-4 py-2 rounded-2xl border border-primary/20 bg-slate-900/95 shadow-lg shrink-0"
              >
                {/* Content — these chips are a deliberately dark "live
                    ticker" strip, same idea as the HeroBanner carousel:
                    a self-contained dark card that sits on top of the page
                    rather than blending into it. bg-slate-900/95 makes that
                    intent hold regardless of whether the page itself is
                    light or dark, so the light text below stays correct
                    either way instead of relying on the page's ambient
                    color to make the chip "dark enough." */}
                <div className="flex justify-center gap-1">
                  <div className="flex items-center gap-2 text-[10px] md:text-xs leading-none pt-1">
                    <span className="font-bold truncate max-w-30 text-white">{username}</span>
                    <span className="italic opacity-80 text-slate-300">won</span>
                    <div className="flex items-center gap-1">
                      <ZASymbol className="text-sm scale-75" />
                      <span className="font-extrabold text-sm md:text-base lg:text-lg text-emerald-400 font-mono tracking-tight leading-none">
                        {amountWon.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1 md:gap-4 mt-0.5">
                    <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest truncate max-w-37.5 text-slate-300">
                      in {game}
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-medium whitespace-nowrap bg-black/20 px-2 py-0.5 rounded-full text-slate-300">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatDistanceToNowStrict(new Date(playedAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentWinners;