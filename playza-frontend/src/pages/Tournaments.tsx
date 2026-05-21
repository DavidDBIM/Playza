import { useState, useRef, useCallback } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getQuizTournamentsApi, type QuizTournament } from "@/api/quiz.api";
import { Search, Trophy, X, ArrowRight, Users, ChevronDown, Zap } from "lucide-react";
import { ZASymbol } from "@/components/currency/ZASymbol";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  active:       { label: "LIVE",              short: "LIVE",     accent: "#ef4444", live: true  },
  registration: { label: "REGISTRATION OPEN", short: "REGISTER", accent: "#16a34a", live: false },
  lobby:        { label: "REGISTRATION OPEN", short: "REGISTER", accent: "#16a34a", live: false },
  draft:        { label: "COMING SOON",       short: "SOON",     accent: "#6366f1", live: false },
  completed:    { label: "ENDED",             short: "ENDED",    accent: "#94a3b8", live: false },
  cancelled:    { label: "CANCELLED",         short: "OFF",      accent: "#94a3b8", live: false },
} as const;

const ROUNDS = [
  { name: "Warm Up",        color: "#22c55e" },
  { name: "Rising",         color: "#3b82f6" },
  { name: "Heat Up",        color: "#f97316" },
  { name: "Danger Zone",    color: "#ef4444" },
  { name: "Final Showdown", color: "#a855f7" },
];

const PRIZE_OPTIONS = [
  { value: "all",  label: "All Prizes"         },
  { value: "high", label: "High Stakes (100k+)" },
  { value: "low",  label: "Standard"            },
];

// ─── 3‑D tilt on hover ─────────────────────────────────────────────────────────
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = ((e.clientX - left) / width  - 0.5) * 10;
    const y = ((e.clientY - top)  / height - 0.5) * -10;
    el.style.transform  = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
    el.style.transition = "transform 0.06s linear";
  }, []);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform  = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0px)";
    el.style.transition = "transform 0.45s cubic-bezier(.23,1,.32,1)";
  }, []);
  return { ref, onMove, onLeave };
}

// ─── Single Tournament Card ─────────────────────────────────────────────────────
function TCard({ qt }: { qt: QuizTournament }) {
  const { ref, onMove, onLeave } = useTilt();
  const sc  = STATUS[qt.status as keyof typeof STATUS] ?? STATUS.draft;
  const hot = qt.status === "active" || qt.status === "registration" || qt.status === "lobby";

  return (
    <div
      ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      <div
        className="relative flex flex-col rounded-2xl overflow-hidden h-full"
        style={{
          background: "var(--card)",
          border: `1px solid var(--border)`,
          boxShadow: hot
            ? `var(--shadow-md), 0 0 0 1px ${sc.accent}30`
            : "var(--shadow-sm)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Accent bar — top edge */}
        <div className="h-1 w-full" style={{ background: sc.accent }} />

        {/* Prize pool — the hero number */}
        <div
          className="relative flex items-center justify-between px-5 pt-5 pb-4 overflow-hidden"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {/* Big background number for depth */}
          <span
            className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl font-black select-none pointer-events-none leading-none"
            style={{ color: sc.accent, opacity: 0.06, fontVariantNumeric: "tabular-nums" }}
          >
            {qt.prize_pool > 0 ? qt.prize_pool.toLocaleString() : "—"}
          </span>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--muted-foreground)" }}>Prize Pool</p>
            <p className="text-2xl font-black leading-none" style={{ color: "var(--foreground)" }}>
              {qt.prize_pool > 0 ? (
                <span className="flex items-baseline gap-1">
                  <span style={{ color: sc.accent }}><ZASymbol className="scale-90" /></span>
                  <span>{qt.prize_pool.toLocaleString()}</span>
                </span>
              ) : (
                <span style={{ color: "var(--muted-foreground)" }}>TBD</span>
              )}
            </p>
          </div>

          {/* Status badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
            style={{ background: `${sc.accent}15`, border: `1px solid ${sc.accent}40` }}
          >
            {sc.live && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: sc.accent, animation: "pulse 1.4s ease-in-out infinite", boxShadow: `0 0 5px ${sc.accent}` }}
              />
            )}
            <span className="text-[9px] font-black tracking-widest" style={{ color: sc.accent }}>{sc.short}</span>
          </div>
        </div>

        {/* Title + meta */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          <div>
            <h3 className="font-black text-base leading-tight mb-1" style={{ color: "var(--foreground)" }}>{qt.title}</h3>
            {qt.description && (
              <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{qt.description}</p>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {qt.player_count} players
            </span>
            {qt.entry_fee > 0 && (
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" style={{ color: sc.accent }} />
                <span style={{ color: sc.accent }}>{qt.entry_fee} ZA</span>
                <span>entry</span>
              </span>
            )}
          </div>

          {/* Round segments */}
          <div className="flex gap-1">
            {ROUNDS.map((r, i) => (
              <div key={i} className="flex-1 group/seg relative" title={r.name}>
                <div
                  className="h-1.5 rounded-full transition-all duration-200 group-hover/seg:h-2"
                  style={{ background: r.color, opacity: 0.55 }}
                />
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            to={`/quiz/${qt.id}`}
            className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.98]"
            style={hot ? {
              background: sc.accent,
              color: "#fff",
              boxShadow: `0 4px 16px ${sc.accent}40`,
            } : {
              background: "var(--muted)",
              color: "var(--muted-foreground)",
            }}
          >
            {qt.status === "active"
              ? <><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> WATCH LIVE</>
              : hot
              ? <><Zap className="w-3 h-3" /> REGISTER NOW</>
              : "VIEW DETAILS"
            }
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
const Tournaments = () => {
  const [activeTab,   setActiveTab]   = useState<"live" | "upcoming" | "completed">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPrize, setFilterPrize] = useState("all");

  const { data: quizTournaments = [] } = useQuery({
    queryKey: ["quiz-tournaments-public"],
    queryFn: getQuizTournamentsApi,
    staleTime: 5_000,   // 5s — picks up new registrations quickly
    refetchInterval: 15_000, // auto-refresh every 15s
  });

  const featured = quizTournaments.find(qt =>
    qt.status === "active" || qt.status === "registration" || qt.status === "lobby"
  ) ?? quizTournaments[0];

  const filtered = quizTournaments.filter(qt => {
    const matchTab =
      activeTab === "live"      ? qt.status === "active" :
      activeTab === "completed" ? qt.status === "completed" :
      ["lobby", "draft", "registration"].includes(qt.status);
    const matchSearch = qt.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrize  =
      filterPrize === "high" ? qt.prize_pool >= 100_000 :
      filterPrize === "low"  ? qt.prize_pool < 100_000  : true;
    return matchTab && matchSearch && matchPrize;
  });

  const fsc = featured ? (STATUS[featured.status as keyof typeof STATUS] ?? STATUS.draft) : null;

  return (
    <div className="flex flex-col flex-1 pb-16 w-full overflow-x-hidden">
      <div className="flex flex-col gap-6 md:gap-10">

        {/* ── Page heading ─────────────────────────────────────────── */}
        <div className="mt-6 px-2 md:px-0">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "var(--primary)" }}>
                Playza · Competitive
              </p>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none" style={{ color: "var(--foreground)" }}>
                Tournaments
              </h1>
            </div>
            {quizTournaments.some(t => t.status === "active") && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "#ef444418", border: "1px solid #ef444440" }}>
                <span className="w-2 h-2 rounded-full bg-red-500" style={{ animation: "pulse 1.2s ease-in-out infinite", boxShadow: "0 0 6px #ef4444" }} />
                <span className="text-[10px] font-black tracking-widest text-red-500">
                  {quizTournaments.filter(t => t.status === "active").length} LIVE
                </span>
              </div>
            )}
          </div>
          <div className="mt-3 h-px w-full" style={{ background: "var(--border)" }} />
        </div>

        {/* ── Featured Hero ─────────────────────────────────────────── */}
        {featured && fsc && (
          <section
            className="relative w-full rounded-2xl overflow-hidden mx-1 md:mx-0"
            style={{
              background: "var(--card)",
              border: `1px solid var(--border)`,
              boxShadow: "var(--shadow-xl)",
            }}
          >
            {/* Left accent strip */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: fsc.accent }} />

            {/* Background texture */}
            <div
              className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            {/* Large ghost prize behind content */}
            {featured.prize_pool > 0 && (
              <div
                className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] md:text-[180px] font-black leading-none select-none pointer-events-none"
                style={{ color: fsc.accent, opacity: 0.045, fontVariantNumeric: "tabular-nums" }}
              >
                {featured.prize_pool.toLocaleString()}
              </div>
            )}

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 pl-8 pr-6 py-8 md:py-10">
              {/* Info */}
              <div className="flex-1">
                {/* Status */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[10px] font-black tracking-widest uppercase"
                  style={{ background: `${fsc.accent}15`, border: `1px solid ${fsc.accent}40`, color: fsc.accent }}
                >
                  {fsc.live && <span className="w-1.5 h-1.5 rounded-full" style={{ background: fsc.accent, animation: "pulse 1.2s ease-in-out infinite" }} />}
                  {fsc.label}
                </div>

                <h2
                  className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  {featured.title}
                </h2>

                {featured.description && (
                  <p className="text-sm max-w-md mb-5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    {featured.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                    style={{ background: "var(--muted)", color: "var(--foreground)" }}
                  >
                    <Trophy className="w-3.5 h-3.5" style={{ color: fsc.accent }} />
                    Prize:
                    <span className="font-black flex items-center gap-0.5">
                      <span style={{ color: fsc.accent }}><ZASymbol className="scale-90" /></span>
                      {featured.prize_pool.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                    style={{ background: "var(--muted)", color: "var(--foreground)" }}
                  >
                    <Users className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                    <span className="font-black">{featured.player_count}</span>
                    <span style={{ color: "var(--muted-foreground)" }}>players</span>
                  </div>
                </div>

                <Link
                  to={`/quiz/${featured.id}`}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: fsc.accent, boxShadow: `0 6px 24px ${fsc.accent}45` }}
                >
                  {featured.status === "active" ? "Watch Live" : featured.status === "registration" || featured.status === "lobby" ? "Register Now" : "View Details"}
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Right: round visual */}
              <div className="hidden md:flex flex-col items-center gap-2 pr-4">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center mb-2"
                  style={{
                    background: `${fsc.accent}12`,
                    border: `2px solid ${fsc.accent}35`,
                    boxShadow: `0 0 40px ${fsc.accent}20`,
                    transform: "perspective(500px) rotateY(-6deg) rotateX(3deg)",
                  }}
                >
                  <Trophy className="w-12 h-12" style={{ color: fsc.accent }} />
                </div>
                {/* 5 rounds timeline */}
                <div className="flex flex-col gap-1.5 items-center">
                  {ROUNDS.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                      <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                        {r.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Filters ───────────────────────────────────────────────── */}
        <section className="flex flex-col gap-4 px-2 md:px-0">

          {/* Tabs + Search row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">

            {/* Tab underline style */}
            <div className="flex gap-1" style={{ borderBottom: "2px solid var(--border)" }}>
              {([
                { id: "live",      label: "🔴 Live Now"  },
                { id: "upcoming",  label: "🟢 Upcoming"  },
                { id: "completed", label: "⚫ Completed"  },
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 pb-3 pt-1 text-xs font-black uppercase tracking-widest transition-all -mb-[2px]"
                  style={activeTab === tab.id ? {
                    color: "var(--primary)",
                    borderBottom: "2px solid var(--primary)",
                  } : {
                    color: "var(--muted-foreground)",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search + filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)",
                  } as React.CSSProperties}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none transition-all"
                  style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", minWidth: 148 }}
                >
                  <span className="flex-1 text-left">{PRIZE_OPTIONS.find(o => o.value === filterPrize)?.label}</span>
                  <ChevronDown size={12} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-xl p-1"
                  style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}
                  align="end"
                >
                  {PRIZE_OPTIONS.map(opt => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => setFilterPrize(opt.value)}
                      className="text-xs font-bold uppercase tracking-wider cursor-pointer py-2 px-3 rounded-lg outline-none transition-all"
                      style={filterPrize === opt.value
                        ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                        : { color: "var(--muted-foreground)" }
                      }
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ── Card Grid ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.length > 0 ? (
              filtered.map(qt => <TCard key={qt.id} qt={qt} />)
            ) : (
              <div
                className="col-span-full py-20 flex flex-col items-center justify-center text-center rounded-2xl"
                style={{ border: "2px dashed var(--border)" }}
              >
                <Trophy className="w-12 h-12 mb-4 opacity-20" style={{ color: "var(--foreground)" }} />
                <h3 className="font-black text-lg mb-1" style={{ color: "var(--foreground)" }}>No Tournaments Found</h3>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                  Try adjusting your filters or check back later.
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
