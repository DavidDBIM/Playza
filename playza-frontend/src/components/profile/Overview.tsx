import {
  MdAnalytics, MdCancel, MdCheckCircle, MdEmojiEvents,
  MdFavorite, MdGrade, MdHistory, MdLocalFireDepartment,
  MdMilitaryTech, MdTrendingUp, MdVerified,
} from "react-icons/md";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { useMe } from "@/hooks/users/useMe";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";

const Overview = () => {
  const { data: user } = useMe();

  const { data: historyData } = useQuery({
    queryKey: ["game-history"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/profile/history?limit=3");
      return data.data;
    },
  });

  const recentMatches = historyData?.history ?? [];
  const totalGames = historyData?.total ?? 0;
  const wins = recentMatches.filter((m: any) => m.status === "completed" && m.winnings > 0).length;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const highestScore = recentMatches.reduce((max: number, m: any) => Math.max(max, m.score || 0), 0);
  const pzaPoints = user?.pza_points ?? 0;

  const rankInfo = (() => {
    if (pzaPoints >= 100000) return { label: "PLATINUM", next: null, pct: 100 };
    if (pzaPoints >= 10000) return { label: "GOLD", next: 100000, pct: Math.round((pzaPoints / 100000) * 100) };
    if (pzaPoints >= 1000) return { label: "SILVER", next: 10000, pct: Math.round((pzaPoints / 10000) * 100) };
    return { label: "BRONZE", next: 1000, pct: Math.round((pzaPoints / 1000) * 100) };
  })();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
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

        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <div className="glass-card p-2 md:p-4 rounded-xl flex items-center justify-between hover:bg-primary/5 transition-all">
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">PZA Points</p>
              <p className="text-xs md:text-base text-slate-900 dark:text-white font-black">{pzaPoints.toLocaleString()}</p>
            </div>
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl"><MdMilitaryTech /></div>
          </div>
          <div className="glass-card p-2 md:p-4 rounded-xl flex items-center justify-between hover:bg-secondary/5 transition-all">
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Wallet Balance</p>
              <p className="text-xs md:text-base text-slate-900 dark:text-white font-black flex items-center gap-1">
                <ZASymbol className="text-xs" />{(user?.wallet?.balance ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 text-xl"><MdHistory /></div>
          </div>
        </div>

        <section>
          <h3 className="text-slate-900 dark:text-white text-base md:text-xl font-black mb-3 md:p-4 flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center"><MdHistory className="text-primary" /></div>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentMatches.length === 0 ? (
              <div className="glass-card p-8 rounded-xl text-center text-slate-500 text-sm font-bold">
                No game history yet. Play your first game!
              </div>
            ) : (
              recentMatches.map((match: any, i: number) => (
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
              ))
            )}
          </div>
        </section>
      </div>

      <div className="space-y-8">
        <div className="glass-card p-4 md:p-8 rounded-xl relative overflow-hidden text-center group shadow-2xl border-primary/20 bg-linear-to-br from-primary/10 to-transparent">
          <div className="relative z-10">
            <div className="inline-flex size-14 rounded-xl bg-primary/20 items-center justify-center mb-3 shadow-inner animate-pulse">
              <MdLocalFireDepartment className="text-primary text-3xl" />
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">PZA Rank</h3>
            <p className="text-slate-900 dark:text-white font-black text-xl mb-1">{rankInfo.label}</p>
            <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-4">{pzaPoints.toLocaleString()} PZA Points</p>
            <div className="mt-4 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${rankInfo.pct}%` }} />
            </div>
            {rankInfo.next && (
              <p className="text-slate-500 text-[10px] mt-2 font-bold">{rankInfo.next.toLocaleString()} PZA to next rank</p>
            )}
          </div>
        </div>

        <div className="glass-card p-4 md:p-8 rounded-xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-2xl shadow-inner border border-primary/20">
                <MdMilitaryTech />
              </div>
              <div>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em]">Current Rank</p>
                <h3 className="text-slate-900 dark:text-white font-black text-xl tracking-tighter italic leading-none">{rankInfo.label}</h3>
              </div>
            </div>
            <span className="text-primary text-xs font-black bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{rankInfo.pct}%</span>
          </div>
          <div className="relative h-3 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden border border-slate-300 dark:border-white/5">
            <div className="absolute h-full inset-y-0.5 left-0.5 bg-primary rounded-full transition-all duration-1000" style={{ width: `calc(${rankInfo.pct}% - 4px)` }} />
          </div>
        </div>

        <div className="glass-card p-4 md:p-8 rounded-xl shadow-xl border-slate-200 dark:border-white/5">
          <div className="flex items-center justify-between mb-4 md:p-4">
            <h3 className="text-slate-900 dark:text-white font-black text-sm md:text-lg">Milestones</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {[
              { icon: <MdVerified className="text-primary" />, title: user?.is_email_verified ? "Verified" : "Unverified" },
              { icon: <MdMilitaryTech className="text-amber-500" />, title: rankInfo.label },
              { icon: <MdFavorite className="text-red-400" />, title: "Player" },
            ].map((item, i) => (
              <div key={i} className="size-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 hover:scale-110 transition-all cursor-help relative shadow-lg" title={item.title}>
                <span className="text-2xl">{item.icon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
