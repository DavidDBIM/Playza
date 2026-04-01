import { MdChevronLeft, MdChevronRight, MdSearch, MdFilterList, MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useState, useEffect } from "react";
import { ZASymbol } from "../currency/ZASymbol";
import axiosInstance from "@/api/axiosInstance";

interface GameHistoryItem {
  id: string;
  game_name: string;
  game_slug?: string;
  score: number;
  position?: string;
  winnings: number;
  status: string;
  played_at: string;
}

const LIMIT = 10;

const History = () => {
  const [page, setPage] = useState(1);
  const [filterBy, setFilterBy] = useState("all");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/profile/history?page=${page}&limit=${LIMIT}`);
        setHistory(data.data.history ?? []);
        setTotal(data.data.total ?? 0);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [page]);

  const filtered = history.filter(m => {
    const matchesSearch = m.game_name.toLowerCase().includes(search.toLowerCase());
    if (filterBy === "win") return matchesSearch && m.winnings > 0;
    if (filterBy === "loss") return matchesSearch && m.winnings === 0;
    return matchesSearch;
  });

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="flex flex-col gap-2 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="md:hidden text-lg font-black text-slate-900 dark:text-white tracking-tight">Game History</h2>

      <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-6">
        <div className="w-full lg:w-auto overflow-x-auto no-scrollbar">
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5 w-max">
            {[{ label: "History", slug: "all" }, { label: "Victories", slug: "win" }, { label: "Defeats", slug: "loss" }].map(({ label, slug }) => (
              <button key={slug} onClick={() => { setFilterBy(slug); setPage(1); }}
                className={`flex-none h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filterBy === slug ? "bg-primary text-white shadow-lg scale-105" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <div className="relative flex-1 lg:w-64 group">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search matches..."
              className="w-full h-11 pl-11 pr-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600" />
          </div>
          <button className="h-11 w-11 flex items-center justify-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-500 hover:text-primary transition-all">
            <MdFilterList className="text-xl" />
          </button>
        </div>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 rounded-xl text-center">
            <p className="text-slate-500 font-bold text-sm">No game history found. Play some games first!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-2 md:gap-3 md:hidden">
              {filtered.map((match) => (
                <div key={match.id} className="glass-card p-3 rounded-xl border-white/5 flex items-center justify-between hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-xl flex items-center justify-center ${match.winnings > 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                      {match.winnings > 0 ? <MdTrendingUp className="text-green-500" /> : <MdTrendingDown className="text-red-500" />}
                    </div>
                    <div>
                      <h4 className="text-slate-900 dark:text-white font-black text-sm italic">{match.game_name}</h4>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{new Date(match.played_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black text-sm italic flex items-center justify-end gap-1 ${match.winnings > 0 ? "text-primary" : "text-slate-500"}`}>
                      {match.winnings > 0 ? <><span>+</span><ZASymbol className="text-[10px]" /><span>{match.winnings.toLocaleString()}</span></> : "—"}
                    </div>
                    {match.position && <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">{match.position}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/2 backdrop-blur-xl shadow-2xl">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100 dark:border-white/5 hover:bg-transparent">
                    <TableHead className="px-4 py-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Date</TableHead>
                    <TableHead className="px-4 py-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Game</TableHead>
                    <TableHead className="px-4 py-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Score</TableHead>
                    <TableHead className="px-4 py-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] text-right">Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((match) => (
                    <TableRow key={match.id} className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/3 transition-colors group">
                      <TableCell className="px-4 py-3"><span className="text-slate-400 font-bold text-xs">{new Date(match.played_at).toLocaleDateString()}</span></TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-xl flex items-center justify-center ${match.winnings > 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                            {match.winnings > 0 ? <MdTrendingUp className="text-green-500" /> : <MdTrendingDown className="text-red-500" />}
                          </div>
                          <span className="text-slate-900 dark:text-white font-black italic group-hover:text-primary transition-colors">{match.game_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3"><span className="text-slate-500 font-bold text-sm">{match.score?.toLocaleString() || "—"}</span></TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className={`text-lg font-black tracking-tighter flex items-center justify-end gap-1.5 ${match.winnings > 0 ? "text-primary italic" : "text-slate-400 font-bold"}`}>
                          {match.winnings > 0 ? <><span>+</span><ZASymbol className="text-xs" /><span>{match.winnings.toLocaleString()}</span></> : "—"}
                        </div>
                        <span className={`px-3 py-1 text-[9px] font-black rounded-lg border uppercase tracking-widest ${match.winnings > 0 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                          {match.winnings > 0 ? "WIN" : "LOSS"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-10">
              <p className="text-slate-600 dark:text-slate-500 text-xs font-bold order-2 md:order-1">
                Showing <span className="text-slate-900 dark:text-white">{filtered.length}</span> of <span className="text-slate-900 dark:text-white">{total}</span> matches
              </p>
              <div className="flex items-center gap-3 order-1 md:order-2">
                <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}
                  className="size-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 flex items-center justify-center hover:text-primary hover:border-primary/20 transition-all disabled:opacity-20">
                  <MdChevronLeft className="text-2xl" />
                </button>
                <div className="flex gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)}
                      className={`size-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${page === i + 1 ? "bg-primary text-white shadow-lg scale-105" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}
                  className="size-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 flex items-center justify-center hover:text-primary hover:border-primary/20 transition-all disabled:opacity-20">
                  <MdChevronRight className="text-2xl" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default History;
