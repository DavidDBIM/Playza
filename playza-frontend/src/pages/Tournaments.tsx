import { useState, useRef, useCallback } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getQuizTournamentsApi, type QuizTournament } from "@/api/quiz.api";
import { Search, Trophy, X, ArrowRight, Users, ChevronDown, Brain, Zap, Star, Clock, Flame } from "lucide-react";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const PRIZE_OPTIONS = [
  { value: "all",  label: "All Prizes" },
  { value: "high", label: "High Stakes (100k+)" },
  { value: "low",  label: "Standard" },
];

const ROUNDS = [
  { name: "Warm Up",        color: "#22c55e", label: "W" },
  { name: "Rising",         color: "#3b82f6", label: "R" },
  { name: "Heat Up",        color: "#f97316", label: "H" },
  { name: "Danger Zone",    color: "#ef4444", label: "D" },
  { name: "Final Showdown", color: "#a855f7", label: "F" },
];

const STATUS = {
  active:       { label: "LIVE NOW",          color: "#ef4444", glow: "rgba(239,68,68,0.5)",    bg: "rgba(239,68,68,0.12)",   dot: true  },
  registration: { label: "REGISTER NOW",      color: "#22c55e", glow: "rgba(34,197,94,0.5)",    bg: "rgba(34,197,94,0.12)",   dot: false },
  lobby:        { label: "REGISTER NOW",      color: "#22c55e", glow: "rgba(34,197,94,0.5)",    bg: "rgba(34,197,94,0.12)",   dot: false },
  draft:        { label: "COMING SOON",       color: "#6366f1", glow: "rgba(99,102,241,0.3)",   bg: "rgba(99,102,241,0.08)",  dot: false },
  completed:    { label: "FINISHED",          color: "#64748b", glow: "rgba(100,116,139,0.2)",  bg: "rgba(100,116,139,0.08)", dot: false },
  cancelled:    { label: "CANCELLED",         color: "#475569", glow: "rgba(71,85,105,0.2)",    bg: "rgba(71,85,105,0.08)",   dot: false },
} as const;

// ─── 3D Tilt Card Hook ────────────────────────────────────────────────────────
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r  = el.getBoundingClientRect();
    const x  = ((e.clientX - r.left) / r.width  - 0.5) * 14;
    const y  = ((e.clientY - r.top)  / r.height - 0.5) * -14;
    el.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg) translateZ(6px)`;
    el.style.transition = "transform 0.05s ease-out";
  }, []);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
    el.style.transition = "transform 0.4s ease-out";
  }, []);
  return { ref, onMove, onLeave };
}

// ─── Tournament Card ──────────────────────────────────────────────────────────
function TCard({ qt }: { qt: QuizTournament }) {
  const { ref, onMove, onLeave } = useTilt();
  const sc  = STATUS[qt.status as keyof typeof STATUS] ?? STATUS.draft;
  const hot = qt.status === "active" || qt.status === "registration" || qt.status === "lobby";

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      className="relative flex flex-col rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* Card body */}
      <div
        className="relative flex flex-col flex-1 rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, rgba(18,12,40,0.97) 0%, rgba(8,5,20,0.97) 100%)",
          border: `1px solid ${hot ? sc.color + "50" : "rgba(255,255,255,0.07)"}`,
          boxShadow: hot
            ? `0 0 30px ${sc.glow}, 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`
            : `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Top glow strip */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent 0%, ${sc.color} 50%, transparent 100%)`, opacity: hot ? 0.9 : 0.3 }} />

        {/* Header art */}
        <div className="relative h-32 overflow-hidden flex items-center justify-center" style={{ background: `radial-gradient(ellipse at 50% -20%, ${sc.color}25 0%, transparent 65%)` }}>
          {/* Hex grid texture */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 20 L10 0 L30 0 L40 20 L30 40 L10 40 Z' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: "40px 40px" }} />

          {/* Floating icon */}
          <div className="relative z-10 flex flex-col items-center gap-2" style={{ transform: "translateZ(20px)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${sc.color}30, ${sc.color}10)`, border: `1px solid ${sc.color}40`, boxShadow: `0 0 24px ${sc.color}30` }}>
              <Brain className="w-7 h-7" style={{ color: sc.color }} />
            </div>
          </div>

          {/* Status badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: sc.bg, border: `1px solid ${sc.color}50` }}>
            {sc.dot && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sc.color, boxShadow: `0 0 6px ${sc.color}` }} />}
            <span className="text-[9px] font-black tracking-widest" style={{ color: sc.color }}>{sc.label}</span>
          </div>

          {/* Entry fee badge */}
          {qt.entry_fee > 0 && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <Zap className="w-2.5 h-2.5 text-amber-400" />
              <span className="text-[9px] font-black text-amber-400">{qt.entry_fee} ZA</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 gap-3" style={{ transform: "translateZ(8px)" }}>
          <div>
            <h3 className="font-black text-white text-sm leading-tight mb-1">{qt.title}</h3>
            {qt.description && <p className="text-[11px] text-white/35 font-medium line-clamp-2 leading-relaxed">{qt.description}</p>}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <Users className="w-3 h-3 text-violet-400 shrink-0" />
              <div>
                <p className="text-xs font-black text-white leading-none">{qt.player_count}</p>
                <p className="text-[9px] text-white/25 font-bold uppercase">Players</p>
              </div>
            </div>
            <div className="rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-black text-white leading-none">{qt.prize_pool > 0 ? `${qt.prize_pool.toLocaleString()}` : "TBD"}</p>
                <p className="text-[9px] text-white/25 font-bold uppercase">ZA Prize</p>
              </div>
            </div>
          </div>

          {/* Round progress */}
          <div className="flex gap-1">
            {ROUNDS.map((r, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-1 rounded-full" style={{ background: r.color, opacity: 0.4 }} />
                <span className="text-[8px] font-black" style={{ color: r.color, opacity: 0.5 }}>{r.label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            to={`/quiz/${qt.id}`}
            className="w-full py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] text-center flex items-center justify-center gap-1.5 transition-all mt-auto hover:opacity-90 active:scale-[0.98]"
            style={hot ? {
              background: `linear-gradient(135deg, ${sc.color}ee, ${sc.color}99)`,
              color: "#000",
              boxShadow: `0 0 20px ${sc.glow}`,
              fontWeight: 900,
            } : {
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            {qt.status === "active"
              ? <><span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> WATCH LIVE</>
              : hot
              ? <><Zap className="w-3 h-3" /> REGISTER NOW</>
              : "VIEW DETAILS"}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const Tournaments = () => {
  const [activeTab,    setActiveTab]    = useState<"live" | "upcoming" | "completed">("upcoming");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [filterPrize,  setFilterPrize]  = useState("all");

  const { data: quizTournaments = [] } = useQuery({
    queryKey: ["quiz-tournaments-public"],
    queryFn: getQuizTournamentsApi,
    staleTime: 30_000,
  });

  const featured = quizTournaments.find(qt =>
    qt.status === "active" || qt.status === "registration" || qt.status === "lobby"
  ) ?? quizTournaments[0];

  const filtered = quizTournaments.filter(qt => {
    const matchTab =
      activeTab === "live"      ? qt.status === "active" :
      activeTab === "completed" ? qt.status === "completed" :
      ["lobby","draft","registration"].includes(qt.status);
    const matchSearch = qt.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrize  =
      filterPrize === "high" ? qt.prize_pool >= 100_000 :
      filterPrize === "low"  ? qt.prize_pool < 100_000 : true;
    return matchTab && matchSearch && matchPrize;
  });

  const sc = featured ? (STATUS[featured.status as keyof typeof STATUS] ?? STATUS.draft) : null;

  return (
    <div className="flex flex-col flex-1 pb-2 md:pb-20 w-full overflow-x-hidden" style={{ background: "linear-gradient(180deg, rgba(5,2,18,0.6) 0%, transparent 40%)" }}>
      <div className="flex flex-col gap-4 md:gap-8">

        {/* Page title */}
        <div className="flex flex-col gap-1 mt-4 px-2 md:px-0">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase flex items-center gap-2">
            <span>X-</span><span className="text-primary">Tournaments</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Compete · Win · Dominate</p>
        </div>

        {/* ── Featured Hero ─────────────────────────────────────────── */}
        {featured && sc && (
          <section className="relative w-full rounded-2xl overflow-hidden mx-1 md:mx-0 select-none" style={{ minHeight: 340 }}>
            {/* Layered BG */}
            <div className="absolute inset-0">
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0d0820 0%, #050310 50%, #0a0418 100%)" }} />
              {/* Radial glow from status colour */}
              <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 50%, ${sc.color}22 0%, transparent 60%)` }} />
              <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.12) 0%, transparent 50%)` }} />
              {/* Grid */}
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to top, rgba(5,2,18,0.9), transparent)" }} />
            </div>

            {/* Floating orbs */}
            <div className="absolute top-6 right-12 w-56 h-56 rounded-full opacity-20 blur-3xl" style={{ background: `radial-gradient(circle, ${sc.color} 0%, transparent 70%)` }} />
            <div className="absolute bottom-4 right-6 w-32 h-32 rounded-full opacity-10 blur-2xl" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />

            {/* Border glow */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ border: `1px solid ${sc.color}35`, boxShadow: `inset 0 0 60px ${sc.color}08` }} />
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${sc.color}80, transparent)` }} />

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-end md:items-center gap-6 p-6 md:p-10 h-full" style={{ minHeight: 340 }}>
              {/* Left: info */}
              <div className="flex-1">
                {/* Status pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: sc.bg, border: `1px solid ${sc.color}50` }}>
                  {sc.dot && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: sc.color, boxShadow: `0 0 8px ${sc.color}` }} />}
                  <span className="text-[10px] font-black tracking-widest" style={{ color: sc.color }}>{sc.label}</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-3 leading-none">
                  {featured.title}
                </h2>

                {featured.description && (
                  <p className="text-white/40 text-sm font-medium mb-5 max-w-lg line-clamp-2">{featured.description}</p>
                )}

                {/* Stat chips */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-white/70">Prize</span>
                    <span className="text-white font-black flex items-center gap-0.5">
                      <ZASymbol className="text-amber-400 scale-90" /> {featured.prize_pool.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
                    <Users className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-white font-black">{featured.player_count}</span>
                    <span className="text-white/50">players</span>
                  </div>
                  {featured.entry_fee > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-300 font-black">{featured.entry_fee} ZA</span>
                      <span className="text-white/30">entry</span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/quiz/${featured.id}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${sc.color}, ${sc.color}cc)`, color: "#000", boxShadow: `0 0 32px ${sc.glow}, 0 4px 20px rgba(0,0,0,0.4)` }}
                >
                  {featured.status === "registration" || featured.status === "lobby" ? "Register Now" : featured.status === "active" ? "Watch Live" : "View Details"}
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Right: 3D trophy / round map */}
              <div className="hidden md:flex flex-col items-center gap-3 shrink-0">
                <div className="w-28 h-28 rounded-3xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${sc.color}30 0%, ${sc.color}10 100%)`, border: `1px solid ${sc.color}40`, boxShadow: `0 0 50px ${sc.color}25, inset 0 1px 0 ${sc.color}40`, transform: "perspective(600px) rotateY(-8deg) rotateX(4deg)" }}>
                  <Trophy className="w-14 h-14" style={{ color: sc.color, filter: `drop-shadow(0 0 12px ${sc.color})` }} />
                </div>
                <div className="flex gap-1.5">
                  {ROUNDS.map((r, i) => (
                    <div key={i} className="flex flex-col items-center gap-1" title={r.name}>
                      <div className="w-2 h-2 rounded-full" style={{ background: r.color, boxShadow: `0 0 6px ${r.color}` }} />
                      <div className="w-px h-6" style={{ background: `linear-gradient(to bottom, ${r.color}, transparent)` }} />
                    </div>
                  ))}
                </div>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">5 Rounds</p>
              </div>
            </div>
          </section>
        )}

        {/* ── Filter Bar ────────────────────────────────────────────── */}
        <section className="flex flex-col gap-3 px-2 md:px-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {([
                { id: "live",      emoji: "🔴", label: "Live Now" },
                { id: "upcoming",  emoji: "🟢", label: "Upcoming" },
                { id: "completed", emoji: "⚫", label: "Completed" },
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all"
                  style={activeTab === tab.id ? {
                    background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(79,70,229,0.3))",
                    border: "1px solid rgba(124,58,237,0.5)",
                    color: "#c4b5fd",
                    boxShadow: "0 0 16px rgba(124,58,237,0.2)",
                  } : {
                    color: "rgba(255,255,255,0.3)",
                    border: "1px solid transparent",
                  }}
                >
                  {tab.emoji} {tab.label}
                </button>
              ))}
            </div>

            {/* Search + filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type="text"
                  placeholder="Search tournaments..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-all"><X className="w-3.5 h-3.5" /></button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white/50 hover:text-white transition-all focus:outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", minWidth: 150 }}>
                  <span className="flex-1 text-left">{PRIZE_OPTIONS.find(o => o.value === filterPrize)?.label}</span>
                  <ChevronDown size={12} className="opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 rounded-xl p-1.5" style={{ background: "rgba(12,8,30,0.97)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }} align="end">
                  {PRIZE_OPTIONS.map(opt => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => setFilterPrize(opt.value)}
                      className="text-xs font-bold uppercase tracking-wider cursor-pointer py-2 px-3 rounded-lg outline-none transition-all"
                      style={filterPrize === opt.value ? { background: "rgba(124,58,237,0.2)", color: "#c4b5fd" } : { color: "rgba(255,255,255,0.35)" }}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ── Cards Grid ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
            {filtered.length > 0 ? (
              filtered.map(qt => <TCard key={qt.id} qt={qt} />)
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center rounded-2xl" style={{ border: "1px dashed rgba(255,255,255,0.06)" }}>
                <Trophy className="w-16 h-16 text-white/8 mb-4" />
                <h3 className="font-black text-white text-xl mb-2">No Tournaments Found</h3>
                <p className="text-xs font-bold tracking-widest text-white/20 uppercase">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Tournaments;
