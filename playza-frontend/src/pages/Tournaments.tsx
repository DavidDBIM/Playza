import { useState } from "react";
import { Link } from "react-router";
import { tournaments } from "@/data/tournaments";
import { games } from "@/data/games";
import {
  Search,
  Trophy,
  X,
  ArrowRight,
  Clock,
  Users,
  PlaySquare,
  ChevronDown,
} from "lucide-react";
import { ZASymbol } from "@/components/currency/ZASymbol";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PRIZE_OPTIONS = [
  { value: "all", label: "All Prizes" },
  { value: "high", label: "High Stakes (100k+)" },
  { value: "low", label: "Standard" },
];

const Tournaments = () => {
  const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "completed">(
    "live",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPrize, setFilterPrize] = useState<string>("all");

  const featuredTournament =
    tournaments.find((t) => t.status === "live") || tournaments[0];
  const featuredGame = games.find((g) => g.id === featuredTournament.gameId);

  const filteredTournaments = tournaments.filter((t) => {
    const matchTab = t.status === activeTab;
    const game = games.find((g) => g.id === t.gameId);
    const matchSearch =
      game?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrize =
      filterPrize === "all" ||
      (filterPrize === "high" && t.prizePool >= 100000) ||
      (filterPrize === "low" && t.prizePool < 100000);
    return matchTab && matchSearch && matchPrize;
  });

  return (
    <div className="flex flex-col flex-1 pb-2 md:pb-20 w-full animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex flex-col gap-2 md:gap-6 md:px-0">
        <div className="flex flex-col gap-2 mt-4 px-2 md:px-0">
          <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-slate-900 dark:text-white uppercase flex items-center gap-2 md:gap-3">
            X-<span className="text-primary">Tournaments</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest">
            Compete for glory and highest prizes
          </p>
        </div>

        {/* Featured Tournament Hero */}
        {featuredTournament && featuredGame && (
          <section className="relative w-full h-87.5 md:h-112.5 rounded-2xl overflow-hidden border border-white/5 bg-slate-950 group select-none shadow-lg mx-1 md:mx-0">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/80 to-transparent z-10" />
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-[10s]"
                style={{ backgroundImage: `url(${featuredGame.thumbnail})` }}
              />
              <div className="absolute inset-0 bg-linear-to-r from-primary/30 to-transparent z-10" />
            </div>

            <div className="relative z-20 h-full flex flex-col justify-end p-6 md:p-10">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-500 border border-red-500/30 px-2 md:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 w-max">
                <span className="w-2 h-2 rounded-full bg-red-500" />{" "}
                LIVE EVENT
              </div>

              <h2 className="text-4xl md:text-6xl font-black font-headline text-white uppercase tracking-tighter mb-2 max-w-2xl">
                {featuredTournament.name}
              </h2>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8 text-slate-300 font-bold tracking-widest text-xs uppercase">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 md:px-4 py-2 rounded-lg border border-white/10">
                  <Trophy className="text-yellow-500" size={16} />
                  Prize Pool: <ZASymbol className="text-yellow-500 scale-90" />{" "}
                  {featuredTournament.prizePool.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 md:px-4 py-2 rounded-lg border border-white/10">
                  <Users className="text-primary" size={16} />
                  {featuredGame.activePlayers} Participants
                </div>
              </div>

              <Link
                to={`/tournaments/${featuredTournament.id}`}
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-8 md:px-12 py-2 md:py-4 rounded-xl transition-all shadow-md w-full md:w-auto"
              >
                Join Tournament <ArrowRight size={18} />
              </Link>
            </div>
          </section>
        )}

        {/* Filters & Tabs */}
        <section className="flex flex-col gap-2 md:gap-4 mt-4 px-2 md:px-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4 bg-slate-50 border border-slate-200 dark:border-white/5 dark:bg-white/5 p-2 md:p-4 rounded-2xl">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar pb-1 md:pb-0">
              {(["live", "upcoming", "completed"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? "bg-primary text-white shadow-sm"
                      : "bg-black/5 dark:bg-black/20 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab === "live"
                    ? "🔴 Live Now"
                    : tab === "upcoming"
                      ? "🟡 Upcoming"
                      : "⚫ Completed"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search tournaments..."
                  className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg py-3 pl-9 pr-2 md:pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white font-bold placeholder:opacity-50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg py-3 px-4 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 hover:border-primary/50 transition-colors hidden sm:flex items-center justify-between gap-2 min-w-50">
                  <span>
                    {PRIZE_OPTIONS.find((opt) => opt.value === filterPrize)
                      ?.label || "All Prizes"}
                  </span>
                  <ChevronDown size={14} className="opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-2 rounded-xl shadow-lg"
                  align="end"
                >
                  {PRIZE_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => setFilterPrize(opt.value)}
                      className={`text-xs font-bold uppercase tracking-widest cursor-pointer py-2 px-3 rounded-lg outline-none transition-colors ${filterPrize === opt.value ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-6 mt-4">
            {filteredTournaments.length > 0 ? (
              filteredTournaments.map((t) => {
                const g = games.find((game) => game.id === t.gameId);
                if (!g) return null;

                return (
                  <div
                    key={t.id}
                    className="glass-card rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden group hover:border-primary/50 transition-colors shadow-sm flex flex-col h-full animate-in fade-in duration-500"
                  >
                    <div className="h-32 bg-slate-900 relative overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url(${g.thumbnail})` }}
                      />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 md:px-3 py-1 rounded border border-white/10 text-[10px] font-black uppercase text-white flex items-center gap-1.5">
                        <ZASymbol className="text-primary scale-75" />{" "}
                        {t.prizePool.toLocaleString()}
                      </div>
                      <div className="absolute inset-0 bg-linear-to-t from-slate-900 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-3">
                        <h3 className="font-headline font-black text-base md:text-xl text-white uppercase truncate">
                          {t.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-2 md:p-5 flex flex-col flex-1 justify-between bg-white dark:bg-transparent">
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <PlaySquare size={14} /> {g.title}
                          </span>
                          <span className="text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
                            Entry: <ZASymbol className="scale-75" />{" "}
                            {t.entryFee}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="opacity-50" />
                            {new Date(t.startDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users size={14} className="opacity-50" />
                            {t.status === "completed"
                              ? "Ended"
                              : `${g.activePlayers} registered`}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/tournaments/${t.id}`}
                        className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-center transition-all ${
                          t.status === "live"
                            ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                            : t.status === "completed"
                              ? "bg-slate-200 dark:bg-white/5 text-slate-500 hover:bg-slate-300 dark:hover:bg-white/10"
                              : "bg-playza-yellow/10 text-playza-yellow hover:bg-playza-yellow/20"
                        }`}
                      >
                        {t.status === "live"
                          ? "ENTER TOURNAMENT"
                          : t.status === "upcoming"
                            ? "VIEW DETAILS"
                            : "VIEW RESULTS"}
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-2 md:py-20 flex flex-col items-center justify-center text-center glass-card rounded-2xl border border-white/5">
                <Trophy className="text-slate-700 opacity-20 mb-4" size={64} />
                <h3 className="font-headline font-black text-lg md:text-2xl text-slate-900 dark:text-white uppercase mb-2">
                  No Tournaments Found
                </h3>
                <p className="text-xs md:text-sm font-bold tracking-widest text-slate-500 uppercase opacity-60">
                  Try adjusting your filters or search query.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Tournaments;
