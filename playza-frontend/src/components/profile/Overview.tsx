import {
  MdAnalytics, MdCancel, MdCheckCircle, MdEmojiEvents, MdGrade, MdHistory, MdMilitaryTech, MdTrendingUp
} from "react-icons/md";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { useProfile, useGameHistory } from "@/hooks/profile/useProfile";
import type { GameHistoryItem } from "@/api/profile.api";

const Overview = () => {
  const { data: profile } = useProfile();
  const { data: historyData } = useGameHistory(1, 3);

  const recentMatches = historyData?.history ?? [];
  const totalGames = historyData?.total ?? 0;
  const wins = recentMatches.filter((m: GameHistoryItem) => m.status === "completed" && m.winnings > 0).length;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const highestScore = recentMatches.reduce((max: number, m: GameHistoryItem) => Math.max(max, m.score || 0), 0);
  const pzaPoints = profile?.pza_points ?? 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      <h2 className="md:hidden text-lg font-black text-slate-900 dark:text-white tracking-tight col-span-full">Overview</h2>

      <div className="xl:col-span-2 space-y-8">
        <div className="grid grid-cols-2 2xl:grid-cols-4 gap-2 md:gap-4 overflow-hidden">
          {[
            { label: "Total Games", value: totalGames || "—", icon: <MdTrendingUp />, sub: "All time" },
            { label: "Wins", value: wins || "—", icon: <MdEmojiEvents />, sub: "Confirmed wins" },
            { label: "Win Rate", value: totalGames > 0 ? `${winRate}%` : "—", icon: <MdAnalytics />, sub: "Win percentage" },
            { label: "Highest Score", value: highestScore > 0 ? highestScore.toLocaleString() : "—", icon: <MdGrade />, sub: "Personal best" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-2 md:p-4 rounded-xl flex flex-col gap-1 hover:border-primary/40 transition-all group">
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">{stat.label}</p>
              <p className="text-xs md:text-base text-slate-900 dark:text-white xl:text-3xl font-black">{stat.value}</p>
              <div className="mt-2 text-primary text-[10px] flex items-center gap-1 font-black">{stat.icon} {stat.sub}</div>
            </div>
          ))}
        </div>

        {/* PZA Points & Wallet only */}
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <div className="glass-card p-2 md:p-4 rounded-xl flex items-center justify-between hover:bg-primary/5 transition-all">
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">PZA Points</p>
              <p className="text-xs md:text-base text-slate-900 dark:text-white font-black">{pzaPoints.toLocaleString()}</p>
            </div>
            <div className="size-10 flex-shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl"><MdMilitaryTech /></div>
          </div>
          <div className="glass-card p-2 md:p-4 rounded-xl flex items-center justify-between hover:bg-secondary/5 transition-all">
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Wallet</p>
              <p className="text-xs md:text-base text-slate-900 dark:text-white font-black flex items-center gap-1">
                <ZASymbol className="text-xs" />{(profile?.wallet?.balance ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="size-10 flex-shrink-0 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 text-xl"><MdHistory /></div>
          </div>
        </div>

        {/* Recent Activity — only shown when there is history */}
        {recentMatches.length > 0 && (
          <section>
            <h3 className="text-slate-900 dark:text-white text-base md:text-xl font-black mb-3 md:p-4 flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center"><MdHistory className="text-primary" /></div>
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentMatches.map((match: GameHistoryItem, i: number) => (
                <div key={i} className="glass-card p-2 md:p-4 rounded-xl flex items-center justify-between group hover:border-slate-300 dark:hover:border-white/10 transition-all shadow-md">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className={`size-10 rounded-xl flex items-center justify-center text-xl ${match.winnings > 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                      {match.winnings > 0 ? <MdCheckCircle className="text-green-500 text-base" /> : <MdCancel className="text-red-500 text-base" />}
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white text-xs md:text-sm font-black italic">{match.game_name}</p>
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-0.5">{new Date(match.played_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 justify-end font-black text-base ${match.winnings > 0 ? "text-primary" : "text-slate-500"}`}>
                      {match.winnings > 0 ? <><span>+</span><ZASymbol className="text-sm scale-90" /><span>{match.winnings.toLocaleString()}</span></> : "—"}
                    </div>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest opacity-60">{match.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Overview;
