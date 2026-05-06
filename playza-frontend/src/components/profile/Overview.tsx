import { useState } from "react";
import {
  MdAnalytics, MdCancel, MdCheckCircle, MdEmojiEvents,
  MdGrade, MdHistory, MdSearch, MdTrendingUp, MdChevronLeft, MdChevronRight,
} from "react-icons/md";
import { useGameHistory } from "@/hooks/profile/useProfile";
import type { GameHistoryItem } from "@/api/profile.api";
import { ZASymbol } from "../currency/ZASymbol";

const LIMIT = 10;

const Overview = () => {
  const [page, setPage] = useState(1);
  const [filterBy, setFilterBy] = useState("all");
  const [search, setSearch] = useState("");

  const { data: historyData, isLoading } = useGameHistory(page, LIMIT);

  const history = historyData?.history ?? [];
  const total = historyData?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  // Stats derived from all returned history
  const wins = history.filter((m: GameHistoryItem) => m.winnings > 0).length;
  const winRate = history.length > 0 ? Math.round((wins / history.length) * 100) : 0;
  const highestScore = history.reduce((max: number, m: GameHistoryItem) => Math.max(max, m.score || 0), 0);

  const filtered = history.filter((m: GameHistoryItem) => {
    const matchesSearch = m.game_name.toLowerCase().includes(search.toLowerCase());
    if (filterBy === "win") return matchesSearch && m.winnings > 0;
    if (filterBy === "loss") return matchesSearch && m.winnings === 0;
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-4 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="md:hidden text-lg font-black text-slate-900 dark:text-white tracking-tight">
        Overview
      </h2>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 2xl:grid-cols-4 gap-2 md:gap-4">
        {[
          { label: "Total Games", value: total || "—", icon: <MdTrendingUp />, sub: "All time" },
          { label: "Wins", value: wins || "—", icon: <MdEmojiEvents />, sub: "Confirmed wins" },
          { label: "Win Rate", value: total > 0 ? `${winRate}%` : "—", icon: <MdAnalytics />, sub: "Win percentage" },
          { label: "Highest Score", value: highestScore > 0 ? highestScore.toLocaleString() : "—", icon: <MdGrade />, sub: "Personal best" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-2 md:p-4 rounded-xl flex flex-col gap-1 hover:border-primary/40 transition-all group">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">
              {stat.label}
            </p>
            <p className="text-xs md:text-base text-slate-900 dark:text-white xl:text-3xl font-black">
              {stat.value}
            </p>
            <div className="mt-2 text-primary text-[10px] flex items-center gap-1 font-black">
              {stat.icon} {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Game History ── */}
      <section className="space-y-3">
        <h3 className="text-slate-900 dark:text-white text-base md:text-xl font-black flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <MdHistory className="text-primary" />
          </div>
          Game History
        </h3>

        {/* Filters + Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5 w-max overflow-x-auto no-scrollbar">
            {[{ label: "All", slug: "all" }, { label: "Wins", slug: "win" }, { label: "Losses", slug: "loss" }].map(({ label, slug }) => (
              <button key={slug} onClick={() => { setFilterBy(slug); setPage(1); }}
                className={`flex-none h-9 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filterBy === slug ? "bg-primary text-white shadow-lg scale-105" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-56">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search games..."
              className="w-full h-9 pl-8 pr-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary/40 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">Loading History...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <MdHistory className="text-slate-300 dark:text-white/10 text-4xl mx-auto mb-3" />
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">No games found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map((match: GameHistoryItem, i: number) => (
                <div key={i} className="p-3 md:p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/2 transition-colors group">
                  <div className="flex items-center gap-2 md:gap-4 min-w-0">
                    <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${match.winnings > 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                      {match.winnings > 0
                        ? <MdCheckCircle className="text-green-500 text-base" />
                        : <MdCancel className="text-red-500 text-base" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-900 dark:text-white text-xs font-black italic truncate">
                        {match.game_name}
                      </p>
                      <p className="text-slate-500 text-[9px] uppercase font-black tracking-widest mt-0.5">
                        {new Date(match.played_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        {match.score ? ` • Score: ${match.score.toLocaleString()}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className={`flex items-center gap-1 justify-end font-black text-sm ${match.winnings > 0 ? "text-primary" : "text-slate-400"}`}>
                      {match.winnings > 0 ? (
                        <><span>+</span><ZASymbol className="text-xs scale-90" /><span>{match.winnings.toLocaleString()}</span></>
                      ) : "—"}
                    </div>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${match.winnings > 0 ? "text-green-500" : "text-red-400"}`}>
                      {match.winnings > 0 ? "WIN" : "LOSS"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              Page {page} of {totalPages} · {total} games
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="size-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-all"
              >
                <MdChevronLeft />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="size-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-all"
              >
                <MdChevronRight />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Overview;
