import { useState, useMemo } from "react";
import {
  MdAnalytics,
  MdCancel,
  MdCheckCircle,
  MdEmojiEvents,
  MdGrade,
  MdHistory,
  MdSearch,
  MdTrendingUp,
  MdChevronLeft,
  MdChevronRight,
  MdVideogameAsset,
  MdRefresh,
  MdFilterList,
  MdOutlineClear,
} from "react-icons/md";
import { useGameHistory } from "@/hooks/profile/useProfile";
import type { GameHistoryItem } from "@/api/profile.api";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { useAuth } from "@/context/auth";

const LIMIT = 15;

const MyGames = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filterBy, setFilterBy] = useState<"all" | "win" | "loss" | "draw">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: historyData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGameHistory(page, LIMIT);

  const history = historyData?.history ?? [];
  const total = historyData?.total ?? 0;
  const totalPages = historyData?.total_pages ?? Math.ceil(total / LIMIT);

  // Calculate advanced summary metrics across available history
  const winsCount = useMemo(() => {
    return history.filter((m) => m.status === "win" || m.winnings > 0).length;
  }, [history]);

  const winRate = useMemo(() => {
    if (history.length === 0) return 0;
    return Math.round((winsCount / history.length) * 100);
  }, [winsCount, history]);

  const highestScore = useMemo(() => {
    return history.reduce((max, m) => Math.max(max, m.score || 0), 0);
  }, [history]);

  const totalWinnings = useMemo(() => {
    return history.reduce((sum, m) => sum + (m.winnings || 0), 0);
  }, [history]);

  // Client-side filtering & search
  const filteredHistory = useMemo(() => {
    return history.filter((m) => {
      const gameName = m.game_name || "Unknown Game";
      const matchesSearch = gameName.toLowerCase().includes(searchQuery.toLowerCase());
      if (filterBy === "win") return matchesSearch && (m.status === "win" || m.winnings > 0);
      if (filterBy === "loss") return matchesSearch && m.status === "loss" && m.winnings <= 0;
      if (filterBy === "draw") return matchesSearch && m.status === "draw";
      return matchesSearch;
    });
  }, [history, searchQuery, filterBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setFilterBy("all");
    setPage(1);
  };

  return (
    <div className="flex-1 min-w-0 space-y-8 pb-24 md:pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {!user ? (
        <div className="glass-card rounded-2xl p-6 md:p-16 text-center min-h-[50vh] flex flex-col items-center justify-center border border-white/5 relative overflow-hidden shadow-2xl bg-surface-elevated/30 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="size-20 md:size-28 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform">
            <MdVideogameAsset className="text-5xl md:text-7xl animate-pulse" />
          </div>
          <h2 className="text-xl md:text-3xl font-black font-headline uppercase text-slate-900 dark:text-white tracking-tight mb-2 relative z-10">
            Authentication Required
          </h2>
          <p className="text-xs md:text-sm font-bold tracking-widest text-slate-500 mt-2 max-w-md relative z-10 leading-relaxed uppercase">
            Access your permanent battle log, financial ledger, and performance analytics by logging into your account.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header Panel */}
          <div className="glass-card p-6 md:p-8 rounded-2xl border border-primary/10 bg-surface-elevated/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
            <div className="absolute right-0 top-0 w-72 h-72 bg-primary/10 blur-[90px] pointer-events-none" />
            <div className="relative z-10 max-w-xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Combat Ledger</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-slate-900 dark:text-white uppercase flex items-center gap-2 md:gap-3">
                Battle <span className="text-primary">History</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed">
                Review your permanent gameplay records, verified earnings, and tactical performance history across all game sectors.
              </p>
            </div>
            <div className="relative z-10 flex items-center gap-3">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <MdRefresh className={`text-base ${isFetching ? "animate-spin" : ""}`} />
                {isFetching ? "Syncing..." : "Sync Records"}
              </button>
            </div>
          </div>

          {/* Summary Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {[
              {
                label: "Total Deployments",
                value: total.toLocaleString(),
                icon: <MdHistory className="text-primary" />,
                subText: "Lifetime matches",
                accent: "border-primary/20 group-hover:border-primary/50",
                bg: "bg-primary/5 group-hover:bg-primary/10",
              },
              {
                label: "Tactical Wins",
                value: winsCount.toLocaleString(),
                icon: <MdEmojiEvents className="text-emerald-500" />,
                subText: "Verified victories",
                accent: "border-emerald-500/20 group-hover:border-emerald-500/50",
                bg: "bg-emerald-500/5 group-hover:bg-emerald-500/10",
              },
              {
                label: "Win Rate",
                value: `${winRate}%`,
                icon: <MdAnalytics className="text-primary" />,
                subText: "Success ratio",
                accent: "border-primary/20 group-hover:border-primary/50",
                bg: "bg-primary/5 group-hover:bg-primary/10",
              },
              {
                label: "Total Loot Secured",
                value: totalWinnings.toLocaleString(),
                icon: <MdTrendingUp className="text-amber-500" />,
                subText: "Confirmed payouts",
                accent: "border-amber-500/20 group-hover:border-amber-500/50",
                bg: "bg-amber-500/5 group-hover:bg-amber-500/10",
                isCurrency: true,
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`glass-card p-4 md:p-6 rounded-2xl flex flex-col justify-between border transition-all duration-500 group overflow-hidden relative shadow-lg ${stat.accent} ${stat.bg}`}
              >
                <div className="absolute right-3 top-3 opacity-20 group-hover:opacity-40 transition-opacity text-2xl md:text-3xl">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">
                    {stat.label}
                  </p>
                  <p className="text-xl md:text-3xl lg:text-4xl font-black font-headline text-slate-900 dark:text-white flex items-center gap-1 tracking-tight">
                    {stat.isCurrency && <ZASymbol className="text-base md:text-2xl text-amber-500" />}
                    {stat.value}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {stat.icon}
                  <span>{stat.subText}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Main Activity Console */}
          <div className="glass-card rounded-2xl border border-primary/10 overflow-hidden shadow-xl bg-surface-elevated/20 backdrop-blur-md">
            {/* Toolbar */}
            <div className="p-4 md:p-6 bg-slate-100/50 dark:bg-white/5 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                {[
                  { label: "All Battles", value: "all" },
                  { label: "Victories", value: "win" },
                  { label: "Defeats", value: "loss" },
                  { label: "Draws", value: "draw" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setFilterBy(tab.value as any);
                      setPage(1);
                    }}
                    className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shrink-0 border ${
                      filterBy === tab.value
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                        : "bg-slate-200/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-300/50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  placeholder="Search combat arena..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 bg-slate-200/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
                  >
                    <MdOutlineClear className="text-slate-400 text-sm" />
                  </button>
                )}
              </div>
            </div>

            {/* History Table / Content */}
            <div className="min-h-[40vh] relative">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/20 backdrop-blur-sm z-10">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">
                    Interrogating Database Records...
                  </p>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
                  <div className="p-8 rounded-3xl bg-rose-500/5 border border-rose-500/20 max-w-md">
                    <MdCancel className="text-5xl text-rose-500 mx-auto mb-4" />
                    <h3 className="text-rose-500 font-headline font-black text-xl uppercase tracking-widest mb-2">
                      Registry Interruption
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed mb-6 font-medium">
                      {(error as Error)?.message || "A secure connection to the battle history database could not be established."}
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest px-8 py-3 rounded-xl transition-all shadow-lg shadow-rose-500/20"
                    >
                      Retry Connection
                    </button>
                  </div>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] p-12 text-center opacity-70">
                  <div className="size-24 rounded-3xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-6 shadow-inner">
                    <MdHistory className="text-5xl animate-pulse" />
                  </div>
                  <h3 className="text-lg md:text-xl font-headline font-black uppercase tracking-tight text-slate-800 dark:text-slate-200 mb-2">
                    No Combat Intelligence Found
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 max-w-sm leading-relaxed mb-6">
                    {searchQuery || filterBy !== "all"
                      ? "No records matched your specific search or filter criteria. Try adjusting your parameters."
                      : "Your battle history ledger is currently empty. Deploy into an arena or solo challenge to register your first match."}
                  </p>
                  {(searchQuery || filterBy !== "all") && (
                    <button
                      onClick={resetFilters}
                      className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-200/50 dark:divide-white/5">
                  {filteredHistory.map((m: GameHistoryItem) => {
                    const isWin = m.status === "win" || m.winnings > 0;
                    const isDraw = m.status === "draw";
                    const statusColor = isWin
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : isDraw
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-500 border-rose-500/20";

                    return (
                      <div
                        key={m.id}
                        className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-100/50 dark:hover:bg-white/[0.02] transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={`size-12 md:size-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner group-hover:scale-105 transition-transform ${statusColor}`}
                          >
                            {isWin ? (
                              <MdCheckCircle className="text-2xl md:text-3xl" />
                            ) : isDraw ? (
                              <MdEmojiEvents className="text-2xl md:text-3xl" />
                            ) : (
                              <MdCancel className="text-2xl md:text-3xl" />
                            )}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest">
                                {m.game_name?.startsWith("Solo:") ? "Solo Earn" : m.game_name?.includes("H2H") ? "H2H Duel" : "Arena"}
                              </span>
                              <span className="text-slate-400 text-[10px] font-mono font-bold tracking-wider">
                                ID: {m.id?.slice(0, 8) || "SYS-GEN"}
                              </span>
                            </div>
                            <h3 className="text-slate-900 dark:text-white text-base md:text-lg font-black font-headline truncate uppercase tracking-tight group-hover:text-primary transition-colors">
                              {m.game_name?.replace("Solo: ", "") || "Arena Championship"}
                            </h3>
                            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">
                              {new Date(m.played_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {m.score !== undefined && m.score !== null ? ` • Score Rating: ${m.score.toLocaleString()}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center pt-3 md:pt-0 border-t border-slate-200 dark:border-white/5 md:border-none shrink-0 ml-0 md:ml-4 gap-1">
                          <div
                            className={`flex items-center gap-1 font-black font-headline text-lg md:text-xl ${
                              isWin ? "text-emerald-500" : isDraw ? "text-amber-500" : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {m.winnings > 0 ? (
                              <>
                                <span>+</span>
                                <ZASymbol className="text-base md:text-lg" />
                                <span>{m.winnings.toLocaleString()}</span>
                              </>
                            ) : (
                              <span className="text-sm tracking-widest uppercase">No Payout</span>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${statusColor}`}
                          >
                            {m.status ? m.status.toUpperCase() : isWin ? "VICTORY" : "DEFEAT"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="p-4 md:p-6 bg-slate-100/50 dark:bg-white/5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[10px] md:text-xs text-slate-500 font-black uppercase tracking-widest">
                  Showing Page {page} of {totalPages} · Total Ledger Entries: {total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-slate-200 disabled:hover:dark:bg-white/5 disabled:hover:text-slate-700 disabled:hover:dark:text-slate-300 transition-all flex items-center gap-1 shadow-sm"
                  >
                    <MdChevronLeft className="text-base" /> Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-slate-200 disabled:hover:dark:bg-white/5 disabled:hover:text-slate-700 disabled:hover:dark:text-slate-300 transition-all flex items-center gap-1 shadow-sm"
                  >
                    Next <MdChevronRight className="text-base" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGames;
