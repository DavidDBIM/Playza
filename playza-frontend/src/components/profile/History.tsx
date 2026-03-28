import { MdChevronLeft, MdChevronRight, MdSearch, MdFilterList, MdTrendingUp, MdTrendingDown } from "react-icons/md";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { matchHistory } from "@/data/matchHistory";
import { useState } from "react";
import { pagination } from "@/lib/pagination";
import { GameResultModal } from "./GameResultModal";
import type { MatchHistory } from "@/data/matchHistory";
import { ZASymbol } from "../currency/ZASymbol";

const History = () => {
  const [page, setPage] = useState(1);
  const [filterBy, setFilterBy] = useState("all");
  const [selectedMatch, setSelectedMatch] = useState<MatchHistory | null>(null);

  const filterHistory = () => {
    let dataSet = matchHistory;

    switch (filterBy) {
      case "win":
        dataSet = matchHistory.filter((h) => h.result === "WIN");
        break;

      case "loss":
        dataSet = matchHistory.filter((h) => h.result === "LOSS");
        break;

      default:
        dataSet = matchHistory;
        break;
    }

    return pagination(page, dataSet);
  };

  const { paginatedData, totalPages } = filterHistory();

  return (
    <div className="flex flex-col gap-2 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {selectedMatch && (
        <GameResultModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
      {/* Mobile Page Title */}
      <h2 className="md:hidden text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
        Game History
      </h2>

      {/* Filters Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-6">
        <div className="w-full lg:w-auto overflow-x-auto no-scrollbar">
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-md w-max lg:w-auto">
            {[
              { label: "History", slug: "all" },
              { label: "Victories", slug: "win" },
              { label: "Defeats", slug: "loss" },
            ].map(({ label, slug }) => (
              <button
                key={slug}
                onClick={() => {
                  setFilterBy(slug);
                  setPage(1);
                }}
                className={`flex-none h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  filterBy === slug
                    ? "bg-primary text-white shadow-lg glow-accent scale-105"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <div className="relative flex-1 lg:w-64 group">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search matches..."
              className="w-full h-11 pl-2 md:pl-11 pr-2 md:pr-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>
          <button className="h-11 w-11 flex items-center justify-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-500 hover:text-primary transition-all">
            <MdFilterList className="text-base md:text-xl" />
          </button>
        </div>
      </div>

      {/* Table for Desktop, Cards for Mobile */}
      <div className="w-full">
        {/* Mobile View (Cards) */}
        <div className="grid grid-cols-1 gap-2 md:gap-3 md:hidden">
          {paginatedData.map((match) => (
            <div
              key={match.id}
              onClick={() => setSelectedMatch(match)}
              className="glass-card p-2 md:p-4 rounded-xl border-white/5 flex items-center justify-between cursor-pointer hover:border-primary/20 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 md:gap-4">
                <div className="relative group/banner">
                  <img
                    src={match.banner}
                    alt=""
                    className="size-14 rounded-2xl object-cover border border-slate-200 dark:border-white/10 group-hover/banner:scale-110 transition-transform duration-500"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 size-5 rounded-lg flex items-center justify-center border border-background-dark text-[10px] shadow-lg ${
                      match.result === "WIN"
                        ? "bg-playza-green"
                        : "bg-playza-red"
                    }`}
                  >
                    {match.result === "WIN" ? (
                      <MdTrendingUp className="text-white" />
                    ) : (
                      <MdTrendingDown className="text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-slate-900 dark:text-white font-black text-sm italic tracking-tight">
                    {match.game}
                  </h4>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {match.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-black text-sm italic flex items-center justify-end gap-1 ${match.result === "WIN" ? "text-primary" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {match.result === "WIN" ? (
                    <>
                      <span>+</span>
                      <ZASymbol className="text-[10px]" />
                      <span>2,500</span>
                    </>
                  ) : "—"}
                </div>
                <p className="text-slate-500 dark:text-slate-600 text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">
                  #{match.leaderboardRank} Rank
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/2 backdrop-blur-xl shadow-2xl">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-slate-100 dark:border-white/5 hover:bg-transparent">
                <TableHead className="px-2 md:px-4 py-2 md:py-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  Date
                </TableHead>
                <TableHead className="px-2 md:px-4 py-2 md:py-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  Game
                </TableHead>
                <TableHead className="px-2 md:px-4 py-2 md:py-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] text-right">
                  Outcome
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((match) => (
                <TableRow
                  key={match.id}
                  className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/3 transition-colors group"
                >
                  <TableCell className="px-2 md:px-4 py-2 md:py-3">
                    <span className="text-slate-400 font-bold text-xs">
                      {match.date}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 md:px-4 py-2 md:py-3">
                    <div
                      className="flex items-center gap-2 md:gap-4 cursor-pointer"
                      onClick={() => setSelectedMatch(match)}
                    >
                      <div className="relative">
                        <img
                          src={match.banner}
                          className="size-12 rounded-2xl object-cover border border-slate-200 dark:border-white/10 group-hover:scale-110 transition-transform duration-500"
                          alt={match.game}
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 size-5 rounded-lg flex items-center justify-center border border-background-dark text-[10px] shadow-lg ${
                            match.result === "WIN"
                              ? "bg-playza-green"
                              : "bg-playza-red"
                          }`}
                        >
                          {match.result === "WIN" ? (
                            <MdTrendingUp className="text-white" />
                          ) : (
                            <MdTrendingDown className="text-white" />
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-900 dark:text-white text-base font-black italic tracking-tight group-hover:text-primary transition-colors">
                          {match.game}
                        </span>
                        <p className="text-xs md:text-base text-primary text-[9px] font-black uppercase tracking-widest mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          Match Rank #{match.leaderboardRank}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className="px-2 md:px-4 py-2 md:py-3 text-right cursor-pointer"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="flex flex-col items-end gap-1">
                      <div
                        className={`text-lg font-black tracking-tighter flex items-center gap-1.5 ${match.result === "WIN" ? "text-primary italic scale-105" : "text-slate-400 dark:text-slate-600 font-bold"}`}
                      >
                        {match.result === "WIN" ? (
                          <>
                            <span>+</span>
                            <ZASymbol className="text-xs" />
                            <span>2,500</span>
                          </>
                        ) : "—"}
                      </div>
                      <span
                        className={`px-3 py-1 text-[9px] font-black rounded-lg border uppercase tracking-widest ${
                          match.result === "WIN"
                            ? "bg-playza-green/10 text-playza-green border-playza-green/20"
                            : "bg-playza-red/10 text-playza-red border-playza-red/20"
                        }`}
                      >
                        {match.result}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-6 mt-10">
          <p className="text-slate-600 dark:text-slate-500 text-xs font-bold order-2 md:order-1">
            Displaying <span className="text-slate-900 dark:text-white">5</span>{" "}
            of <span className="text-slate-900 dark:text-white">142</span>{" "}
            competitive matches
          </p>

          <div className="flex items-center gap-2 md:gap-3 order-1 md:order-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="size-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 flex items-center justify-center hover:text-primary hover:border-primary/20 transition-all disabled:opacity-20 disabled:hover:text-slate-500"
            >
              <MdChevronLeft className="text-lg md:text-2xl" />
            </button>

            <div className="flex gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`size-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                    page === i + 1
                      ? "bg-primary text-white shadow-lg glow-accent scale-105"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="size-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 flex items-center justify-center hover:text-primary hover:border-primary/20 transition-all disabled:opacity-20 disabled:hover:text-slate-500"
            >
              <MdChevronRight className="text-lg md:text-2xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
