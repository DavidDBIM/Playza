import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getQuizTournamentsApi } from "@/api/quiz.api";
import {
  Search,
  Trophy,
  X,
  ArrowRight,
  Users,
  ChevronDown,
  Brain,
  Zap,
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

  const { data: quizTournaments = [] } = useQuery({
    queryKey: ["quiz-tournaments-public"],
    queryFn: getQuizTournamentsApi,
    staleTime: 30_000,
  });

  const featuredTournament = quizTournaments.find(qt => qt.status === "active" || qt.status === "registration" || qt.status === "lobby") || quizTournaments[0];

  const filteredTournaments = quizTournaments.filter((qt) => {
    const isLive      = qt.status === "active";
    const isCompleted = qt.status === "completed";
    // FIX: registration is also "upcoming"
    const isUpcoming  = qt.status === "lobby" || qt.status === "draft" || qt.status === "registration";

    const matchTab =
      activeTab === "live"      ? isLive :
      activeTab === "completed" ? isCompleted :
      activeTab === "upcoming"  ? isUpcoming : false;

    const matchSearch = qt.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchPrize =
      filterPrize === "all" ||
      (filterPrize === "high" && qt.prize_pool >= 100000) ||
      (filterPrize === "low"  && qt.prize_pool < 100000);

    return matchTab && matchSearch && matchPrize;
  });

  return (
    <div className="flex flex-col flex-1 pb-2 md:pb-20 w-full overflow-x-hidden">
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
        {featuredTournament && (
          <section className="relative w-full h-87.5 md:h-112.5 rounded-xl overflow-hidden border border-white/5 bg-slate-950 select-none mx-1 md:mx-0">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/80 to-transparent z-10" />
              <div className="absolute inset-0 w-full h-full opacity-40 bg-gradient-to-br from-primary/30 to-violet-600/30" />
              <div className="absolute inset-0 bg-linear-to-r from-primary/30 to-transparent z-10" />
            </div>

            <div className="relative z-20 h-full flex flex-col justify-end p-6 md:p-10">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-500 border border-red-500/30 px-2 md:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 w-max">
                <span className="w-2 h-2 rounded-full bg-red-500" />{" "}
                {featuredTournament.status === "active" ? "LIVE EVENT" :
                 featuredTournament.status === "registration" || featuredTournament.status === "lobby" ? "REGISTRATION OPEN" :
                 featuredTournament.status.toUpperCase()}
              </div>

              <h2 className="text-4xl md:text-6xl font-black font-headline text-white uppercase tracking-tighter mb-2 max-w-2xl">
                {featuredTournament.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8 text-slate-300 font-bold tracking-widest text-xs uppercase">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 md:px-4 py-2 rounded-lg border border-white/10">
                  <Trophy className="text-yellow-500" size={16} />
                  Prize Pool: <ZASymbol className="text-yellow-500 scale-90" />{" "}
                  {featuredTournament.prize_pool.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 md:px-4 py-2 rounded-lg border border-white/10">
                  <Users className="text-primary" size={16} />
                  {featuredTournament.player_count} Participants
                </div>
              </div>

              <Link
                to={`/quiz/${featuredTournament.id}`}
                className="inline-flex items-center justify-center gap-2 bg-primary md:hover:bg-primary/90 text-white font-black uppercase tracking-widest px-8 md:px-12 py-2 md:py-4 rounded-xl w-full md:w-auto"
              >
                {featuredTournament.status === "registration" || featuredTournament.status === "lobby" ? "Register Now" : "Join Tournament"} <ArrowRight size={18} />
              </Link>
            </div>
          </section>
        )}

        {/* Filters & Tabs */}
        <section className="flex flex-col gap-2 md:gap-4 mt-4 px-2 md:px-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4 bg-slate-50 border border-slate-200 dark:border-white/5 dark:bg-white/5 p-2 md:p-4 rounded-xl">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar pb-1 md:pb-0">
              {(["live", "upcoming", "completed"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-primary text-white"
                      : "bg-black/5 dark:bg-black/20 text-slate-500 md:hover:text-slate-900 md:dark:hover:text-white"
                  }`}
                >
                  {tab === "live" ? "🔴 Live Now" : tab === "upcoming" ? "🟡 Upcoming" : "⚫ Completed"}
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
                  <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg py-3 px-4 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 hover:border-primary/50 transition-colors hidden sm:flex items-center justify-between gap-2 min-w-50">
                  <span>{PRIZE_OPTIONS.find((opt) => opt.value === filterPrize)?.label || "All Prizes"}</span>
                  <ChevronDown size={14} className="opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-2 rounded-xl" align="end">
                  {PRIZE_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => setFilterPrize(opt.value)}
                      className={`text-xs font-bold uppercase tracking-widest cursor-pointer py-2 px-3 rounded-lg outline-none ${filterPrize === opt.value ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-400 md:hover:bg-slate-100 md:dark:hover:bg-white/5 md:hover:text-slate-900 md:dark:hover:text-white"}`}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 mt-4">
            {filteredTournaments.length > 0 ? (
              filteredTournaments.map((qt) => (
                <div key={qt.id} className="glass-card rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 hover:border-primary/30 transition-all">
                  <div className="h-28 bg-gradient-to-br from-primary/20 via-violet-500/10 to-slate-900 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute top-3 right-3">
                      {/* FIX: handle registration status badge */}
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                        qt.status === "active"       ? "bg-red-500/90 text-white" :
                        qt.status === "lobby"        ? "bg-green-500/90 text-white" :
                        qt.status === "registration" ? "bg-green-500/90 text-white" :
                        "bg-white/20 text-white"
                      }`}>
                        {qt.status === "active"       ? "🔴 LIVE" :
                         qt.status === "lobby"        ? "✅ REGISTER NOW" :
                         qt.status === "registration" ? "✅ REGISTER NOW" :
                         qt.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="relative z-10 text-center">
                      <Brain className="w-8 h-8 text-white mx-auto mb-1 drop-shadow-lg" />
                      <p className="text-xs font-black uppercase tracking-widest text-white/80">Quiz Championship</p>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-black text-slate-900 dark:text-white text-sm mb-1">{qt.title}</h3>
                    {qt.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{qt.description}</p>
                    )}
                    <div className="flex items-center gap-3 mb-4 text-xs text-slate-500 dark:text-slate-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Users size={12} className="opacity-60" />
                        {qt.player_count} joined
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy size={12} className="opacity-60" />
                        {qt.prize_pool > 0 ? `${qt.prize_pool.toLocaleString()} ZA` : "Growing"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-4">
                      {["#22c55e","#3b82f6","#f97316","#ef4444","#a855f7"].map((c, i) => (
                        <div key={i} className="flex-1 h-1 rounded-full" style={{ background: c }} />
                      ))}
                    </div>
                    {/* FIX: handle registration status CTA */}
                    <Link
                      to={`/quiz/${qt.id}`}
                      className={`w-full py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] text-center transition-all mt-auto flex items-center justify-center gap-1 ${
                        qt.status === "active" || qt.status === "lobby" || qt.status === "registration"
                          ? "bg-gradient-to-r from-primary to-violet-600 text-white hover:opacity-90"
                          : "bg-slate-100 dark:bg-white/5 text-slate-500"
                      }`}
                    >
                      {qt.status === "active"       ? "WATCH LIVE" :
                       qt.status === "lobby"        ? <><Zap size={12} /> REGISTER NOW</> :
                       qt.status === "registration" ? <><Zap size={12} /> REGISTER NOW</> :
                       "VIEW DETAILS"}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-2 md:py-20 flex flex-col items-center justify-center text-center glass-card rounded-xl border border-white/5">
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
