import { TrendingUp, Target, Zap, Clock, Trophy, Loader2 } from "lucide-react";
import { MdReplay } from "react-icons/md";
import { ZASymbol } from "../currency/ZASymbol";
import { useMySessionStats } from "@/hooks/gamesession/useGameSession";

interface SessionPerformanceProps {
  sessionId: string;
}

const SessionPerformance = ({ sessionId }: SessionPerformanceProps) => {
  const { data, isLoading } = useMySessionStats(sessionId);
  const stats = data?.stats;
  const rank = data?.rank;

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Calculating your standing...
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-4">
        <div className="p-6 rounded-full bg-slate-100 dark:bg-white/5">
          <Trophy size={40} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-black uppercase italic text-slate-900 dark:text-white">
          No Data Yet
        </h3>
        <p className="text-xs text-slate-500 max-w-xs font-medium">
          Join the session and submit your first score to see your performance
          metrics here!
        </p>
      </div>
    );
  }

  // Derived metrics (using some dummy math for visuals, real data where possible)
  const estimatedPrize =
    rank <= 5
      ? Number(stats.session?.pool_amount || 0) *
        (rank === 1 ? 0.4 : rank === 2 ? 0.25 : 0.15)
      : 0;

  return (
    <main className="flex h-full flex-col bg-transparent rounded-xl p-2 md:p-8 overflow-hidden relative">
      <div className="md:px-4 flex flex-1 justify-center py-2 md:py-4 relative z-10 w-full">
        <div className="flex flex-col flex-1 w-full">
          {/* <!-- Header Section --> */}
          <div className="flex flex-wrap items-end justify-between gap-2 md:gap-6 mb-3 md:mb-8">
            <div className="flex flex-col gap-2 md:gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2 md:px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase text-primary tracking-widest">
                  Live Analytics
                </span>
                <span className="px-2 md:px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase text-blue-500 dark:text-blue-400 tracking-widest">
                  Rank #{rank || "---"}
                </span>
              </div>
              <h1 className=" tracking-tighter text-xl md:text-3xl lg:text-5xl font-black leading-tight text-slate-900 dark:text-white uppercase italic transition-colors">
                My{" "}
                <span className="text-primary font-black italic">
                  Performance
                </span>
              </h1>
              <div className="flex items-center gap-2 text-playza-green">
                <TrendingUp className="size-4" />
                <p className="text-xs font-black uppercase tracking-tight">
                  {rank <= 5
                    ? "You are currently in the Winning Zone!"
                    : `Climb ${rank - 5} positions to enter the Prize Zone`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden lg:flex flex-col items-end">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
                  Estimated Prize
                </p>
                <div className="flex items-center gap-1.5 ">
                  <ZASymbol className="text-sm scale-90" />
                  <p className=" text-lg md:text-2xl font-black text-slate-900 dark:text-white">
                    {estimatedPrize.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* <!-- Stats Grid --> */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 pb-3 md:pb-8">
            <div className="p-2 md:p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2 md:mb-4">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Trophy className="text-primary size-5" />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">
                  Best Score
                </p>
                <p className="text-xs md:text-basefont-black text-slate-900 dark:text-white transition-colors">
                  {stats.best_score?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-2 md:p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between group hover:border-blue-500/50 transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-2 md:mb-4">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Target className="text-blue-500 size-5" />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">
                  Attempts
                </p>
                <p className="text-xs md:text-base font-black text-slate-900 dark:text-white transition-colors">
                  {stats.attempts}
                </p>
              </div>
            </div>

            <div className="p-2 md:p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between group hover:border-purple-500/50 transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-2 md:mb-4">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <Zap className="text-purple-500 size-5" />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">
                  Top Streak
                </p>
                <p className="text-xs md:text-base font-black text-slate-900 dark:text-white transition-colors">
                  ---
                </p>
              </div>
            </div>

            <div className="p-2 md:p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col justify-between group hover:border-orange-500/50 transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-2 md:mb-4">
                <div className="p-2 bg-orange-500/10 rounded-xl">
                  <Clock className="text-orange-500 size-5" />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">
                  Last Played
                </p>
                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">
                  {new Date(stats.updated_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* <!-- Secondary Stats Grid --> */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-white/60">
                  Skills Breakdown
                </h2>
                <button className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Full Analysis
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                <div className="p-2 md:p-5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-4">
                  <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                    <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Consistency
                    </span>
                    <span className="text-primary font-black">High</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[75%]"></div>
                  </div>
                </div>
                <div className="p-2 md:p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-4 shadow-sm">
                  <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                    <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Efficiency
                    </span>
                    <span className="text-blue-500 dark:text-blue-400 font-black">
                      Stable
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[60%]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className=" dark:bg-slate-900/40 border border-slate-200 dark:border-primary/20 rounded-xl p-2 md:p-6 flex flex-col justify-center items-center text-center group">
              <div className="p-2 md:p-4 bg-primary text-slate-900 rounded-xl mb-4">
                <Trophy size={32} />
              </div>
              <h3 className="text-sm md:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2 italic">
                Climb Higher
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-50 mb-6 font-medium">
                Submit another score to secure your position in the prize pool!
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2 md:py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-white"
              >
                <MdReplay className="inline mr-2" /> Re-launch Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SessionPerformance;
