import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getQuizTournamentsApi, type QuizTournament } from "@/api/quiz.api";
import { Search, Trophy, X, ArrowRight, Users, ChevronDown, Zap } from "lucide-react";
import { ZASymbol } from "@/components/currency/ZASymbol";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  active:       { label: "LIVE",              short: "LIVE",     accent: "#ef4444", live: true  },
  registration: { label: "REGISTRATION OPEN", short: "REGISTER", accent: "#16a34a", live: false },
  lobby:        { label: "REGISTRATION OPEN", short: "REGISTER", accent: "#16a34a", live: false },
  draft:        { label: "COMING SOON",       short: "SOON",     accent: "#6366f1", live: false },
  completed:    { label: "ENDED",             short: "ENDED",    accent: "#94a3b8", live: false },
  cancelled:    { label: "CANCELLED",         short: "OFF",      accent: "#94a3b8", live: false },
} as const;

const ROUNDS_META = [
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

// ─── 3-D tilt ─────────────────────────────────────────────────────────────────
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

// ─── Tournament Card ──────────────────────────────────────────────────────────
function TCard({ qt }: { qt: QuizTournament }) {
  const { ref, onMove, onLeave } = useTilt();
  const sc  = STATUS[qt.status as keyof typeof STATUS] ?? STATUS.draft;
  const hot = qt.status === "active" || qt.status === "registration" || qt.status === "lobby";
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transformStyle: "preserve-3d", willChange: "transform" }}>
      <div className="relative flex flex-col rounded-2xl overflow-hidden h-full" style={{ background: "var(--card)", border: `1px solid var(--border)`, boxShadow: hot ? `var(--shadow-md), 0 0 0 1px ${sc.accent}30` : "var(--shadow-sm)", transition: "box-shadow 0.3s ease" }}>
        <div className="h-1 w-full" style={{ background: sc.accent }} />
        <div className="relative flex items-center justify-between px-5 pt-5 pb-4 overflow-hidden" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl font-black select-none pointer-events-none leading-none" style={{ color: sc.accent, opacity: 0.06, fontVariantNumeric: "tabular-nums" }}>
            {qt.prize_pool > 0 ? qt.prize_pool.toLocaleString() : "—"}
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--muted-foreground)" }}>Prize Pool</p>
            <p className="text-2xl font-black leading-none" style={{ color: "var(--foreground)" }}>
              {qt.prize_pool > 0
                ? <span className="flex items-baseline gap-1"><span style={{ color: sc.accent }}><ZASymbol className="scale-90" /></span><span>{qt.prize_pool.toLocaleString()}</span></span>
                : <span style={{ color: "var(--muted-foreground)" }}>TBD</span>}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0" style={{ background: `${sc.accent}15`, border: `1px solid ${sc.accent}40` }}>
            {sc.live && <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.accent, animation: "pulse 1.4s ease-in-out infinite", boxShadow: `0 0 5px ${sc.accent}` }} />}
            <span className="text-[9px] font-black tracking-widest" style={{ color: sc.accent }}>{sc.short}</span>
          </div>
        </div>
        <div className="flex flex-col flex-1 p-5 gap-3">
          <div>
            <h3 className="font-black text-base leading-tight mb-1" style={{ color: "var(--foreground)" }}>{qt.title}</h3>
            {qt.description && <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{qt.description}</p>}
          </div>
          <div className="flex items-center gap-4 text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{qt.player_count} players</span>
            {qt.entry_fee > 0 && (
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" style={{ color: sc.accent }} />
                <span style={{ color: sc.accent }}>{qt.entry_fee} ZA</span>
                <span>entry</span>
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {ROUNDS_META.map((r, i) => (
              <div key={i} className="flex-1 group/seg relative" title={r.name}>
                <div className="h-1.5 rounded-full transition-all duration-200 group-hover/seg:h-2" style={{ background: r.color, opacity: 0.55 }} />
              </div>
            ))}
          </div>
          <Link
            to={`/quiz/${qt.id}`}
            className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.98]"
            style={hot ? { background: sc.accent, color: "#fff", boxShadow: `0 4px 16px ${sc.accent}40` } : { background: "var(--muted)", color: "var(--muted-foreground)" }}
          >
            {qt.status === "active"
              ? <><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> WATCH LIVE</>
              : hot ? <><Zap className="w-3 h-3" /> REGISTER NOW</>
              : "VIEW DETAILS"}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── "The Drop" Hero ──────────────────────────────────────────────────────────
function DropHero() {
  const [phase, setPhase] = useState<"drop" | "shake" | "settled">("drop");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // After drop animation completes (~900ms), trigger shake
    const t1 = setTimeout(() => {
      setPhase("shake");
      // Shake the wrapper
      const el = wrapRef.current;
      if (el) {
        el.style.animation = "screenShake 0.35s ease-out";
        setTimeout(() => { if (el) { el.style.animation = ""; } setPhase("settled"); }, 360);
      }
    }, 820);
    return () => clearTimeout(t1);
  }, []);

  return (
    <>
      <style>{`
        @keyframes wordDrop {
          0%   { transform: translateY(-260px); opacity: 0; }
          60%  { opacity: 1; }
          80%  { transform: translateY(8px);   }
          90%  { transform: translateY(-4px);  }
          100% { transform: translateY(0px);   opacity: 1; }
        }
        @keyframes screenShake {
          0%   { transform: translate(0, 0) rotate(0deg); }
          15%  { transform: translate(-4px, 2px) rotate(-0.4deg); }
          30%  { transform: translate(4px, -2px) rotate(0.4deg); }
          45%  { transform: translate(-3px, 1px) rotate(-0.2deg); }
          60%  { transform: translate(3px, -1px) rotate(0.2deg); }
          75%  { transform: translate(-1px, 0px) rotate(0deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes shockwave {
          0%   { transform: translate(-50%, -50%) scale(0); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
        @keyframes dustLeft {
          0%   { transform: translateX(0) translateY(0) scaleX(1); opacity: 0.6; }
          100% { transform: translateX(-80px) translateY(-12px) scaleX(2.5); opacity: 0; }
        }
        @keyframes dustRight {
          0%   { transform: translateX(0) translateY(0) scaleX(1); opacity: 0.6; }
          100% { transform: translateX(80px) translateY(-12px) scaleX(2.5); opacity: 0; }
        }
        @keyframes subtitleFade {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineFade {
          0%   { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
      `}</style>

      <div ref={wrapRef} className="relative w-full flex flex-col items-center justify-center overflow-hidden select-none" style={{ minHeight: 200, paddingTop: 24, paddingBottom: 32 }}>

        {/* Impact effects — only show during/after shake */}
        {(phase === "shake" || phase === "settled") && (
          <>
            {/* Shockwave ring */}
            <div style={{
              position: "absolute",
              left: "50%",
              top: "62%",
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "2px solid var(--primary)",
              opacity: 0,
              animation: "shockwave 0.5s ease-out forwards",
              pointerEvents: "none",
            }} />
            {/* Second ring, delayed */}
            <div style={{
              position: "absolute",
              left: "50%",
              top: "62%",
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "1px solid var(--primary)",
              opacity: 0,
              animation: "shockwave 0.6s ease-out 0.08s forwards",
              pointerEvents: "none",
            }} />
            {/* Dust left */}
            <div style={{
              position: "absolute",
              left: "calc(50% - 80px)",
              top: "64%",
              width: 40,
              height: 8,
              borderRadius: 4,
              background: "var(--primary)",
              opacity: 0,
              animation: "dustLeft 0.45s ease-out 0.05s forwards",
              pointerEvents: "none",
            }} />
            {/* Dust right */}
            <div style={{
              position: "absolute",
              left: "calc(50% + 40px)",
              top: "64%",
              width: 40,
              height: 8,
              borderRadius: 4,
              background: "var(--primary)",
              opacity: 0,
              animation: "dustRight 0.45s ease-out 0.05s forwards",
              pointerEvents: "none",
            }} />
          </>
        )}

        {/* Eyebrow label */}
        <p
          className="text-[10px] font-black uppercase tracking-[0.25em] mb-3"
          style={{
            color: "var(--primary)",
            opacity: 0,
            animation: phase === "settled" ? "subtitleFade 0.4s ease-out 0.1s forwards" : "none",
          }}
        >
          Playza · Competitive
        </p>

        {/* THE WORD THAT DROPS */}
        <h1
          className="font-black tracking-tighter leading-none text-center"
          style={{
            fontSize: "clamp(3rem, 12vw, 7rem)",
            color: "var(--foreground)",
            animation: "wordDrop 0.85s cubic-bezier(0.23, 1, 0.32, 1) forwards",
            willChange: "transform",
          }}
        >
          Tournaments
        </h1>

        {/* Divider line — fades in after settled */}
        <div
          style={{
            marginTop: 18,
            height: 2,
            width: "min(320px, 70%)",
            background: "linear-gradient(90deg, transparent, var(--primary), transparent)",
            transformOrigin: "center",
            opacity: 0,
            animation: phase === "settled" ? "lineFade 0.5s ease-out 0.15s forwards" : "none",
          }}
        />

        {/* Subtitle */}
        <p
          className="text-sm font-bold mt-3 text-center"
          style={{
            color: "var(--muted-foreground)",
            letterSpacing: "0.05em",
            opacity: 0,
            animation: phase === "settled" ? "subtitleFade 0.4s ease-out 0.25s forwards" : "none",
          }}
        >
          Compete. Eliminate. Win.
        </p>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const Tournaments = () => {
  const [activeTab,   setActiveTab]   = useState<"live" | "upcoming" | "completed">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPrize, setFilterPrize] = useState("all");

  const { data: quizTournaments = [], isError, isLoading: tournamentsLoading, refetch } = useQuery({
    queryKey: ["quiz-tournaments-public"],
    queryFn: getQuizTournamentsApi,
    staleTime: 5_000,
    refetchInterval: 15_000,
    retry: 1,
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
      <div className="flex flex-col gap-6 md:gap-8">

        {/* ── The Drop Hero ─────────────────────────────────────────── */}
        <DropHero />

        {/* ── Featured Hero ─────────────────────────────────────────── */}
        {featured && fsc && (
          <section className="relative w-full rounded-2xl overflow-hidden mx-1 md:mx-0" style={{ background: "var(--card)", border: `1px solid var(--border)`, boxShadow: "var(--shadow-xl)" }}>
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: fsc.accent }} />
            <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, var(--foreground) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
            {featured.prize_pool > 0 && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[120px] md:text-[160px] font-black leading-none select-none pointer-events-none" style={{ color: fsc.accent, opacity: 0.045, fontVariantNumeric: "tabular-nums" }}>
                {featured.prize_pool.toLocaleString()}
              </div>
            )}
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 pl-8 pr-6 py-7 md:py-9">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[10px] font-black tracking-widest uppercase" style={{ background: `${fsc.accent}15`, border: `1px solid ${fsc.accent}40`, color: fsc.accent }}>
                  {fsc.live && <span className="w-1.5 h-1.5 rounded-full" style={{ background: fsc.accent, animation: "pulse 1.2s ease-in-out infinite" }} />}
                  {fsc.label}
                </div>
                <h2 className="text-2xl md:text-4xl font-black tracking-tighter leading-none mb-2" style={{ color: "var(--foreground)" }}>{featured.title}</h2>
                {featured.description && <p className="text-sm max-w-md mb-4 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{featured.description}</p>}
                <div className="flex flex-wrap gap-3 mb-5">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold" style={{ background: "var(--muted)", color: "var(--foreground)" }}>
                    <Trophy className="w-3.5 h-3.5" style={{ color: fsc.accent }} />
                    Prize: <span className="font-black flex items-center gap-0.5"><span style={{ color: fsc.accent }}><ZASymbol className="scale-90" /></span>{featured.prize_pool.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold" style={{ background: "var(--muted)", color: "var(--foreground)" }}>
                    <Users className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                    <span className="font-black">{featured.player_count}</span>
                    <span style={{ color: "var(--muted-foreground)" }}>players</span>
                  </div>
                </div>
                <Link to={`/quiz/${featured.id}`} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: fsc.accent, boxShadow: `0 6px 24px ${fsc.accent}45` }}>
                  {featured.status === "active" ? "Watch Live" : featured.status === "registration" || featured.status === "lobby" ? "Register Now" : "View Details"}
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="hidden md:flex flex-col items-center gap-2 pr-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2" style={{ background: `${fsc.accent}12`, border: `2px solid ${fsc.accent}35`, boxShadow: `0 0 40px ${fsc.accent}20`, transform: "perspective(500px) rotateY(-6deg) rotateX(3deg)" }}>
                  <Trophy className="w-10 h-10" style={{ color: fsc.accent }} />
                </div>
                <div className="flex flex-col gap-1.5 items-center">
                  {ROUNDS_META.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                      <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>{r.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Filters + Grid ────────────────────────────────────────── */}
        <section className="flex flex-col gap-4 px-2 md:px-0">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex gap-1" style={{ borderBottom: "2px solid var(--border)" }}>
              {([
                { id: "live",      label: "🔴 Live Now"  },
                { id: "upcoming",  label: "🟢 Upcoming"  },
                { id: "completed", label: "⚫ Completed"  },
              ] as const).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="px-4 pb-3 pt-1 text-xs font-black uppercase tracking-widest transition-all -mb-[2px]"
                  style={activeTab === tab.id ? { color: "var(--primary)", borderBottom: "2px solid var(--primary)" } : { color: "var(--muted-foreground)" }}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)", "--tw-ring-color": "var(--primary)" } as React.CSSProperties} />
                {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70" style={{ color: "var(--muted-foreground)" }}><X className="w-3.5 h-3.5" /></button>}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none transition-all" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", minWidth: 148 }}>
                  <span className="flex-1 text-left">{PRIZE_OPTIONS.find(o => o.value === filterPrize)?.label}</span>
                  <ChevronDown size={12} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 rounded-xl p-1" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }} align="end">
                  {PRIZE_OPTIONS.map(opt => (
                    <DropdownMenuItem key={opt.value} onClick={() => setFilterPrize(opt.value)} className="text-xs font-bold uppercase tracking-wider cursor-pointer py-2 px-3 rounded-lg outline-none transition-all"
                      style={filterPrize === opt.value ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}>
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tournamentsLoading ? (
              <div className="col-span-full py-20 flex flex-col items-center gap-3" style={{ border: "2px dashed var(--border)", borderRadius: 16 }}>
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Loading tournaments...</p>
              </div>
            ) : isError ? (
              <div className="col-span-full py-20 flex flex-col items-center gap-4 text-center" style={{ border: "2px dashed var(--border)", borderRadius: 16 }}>
                <Trophy className="w-12 h-12 opacity-20" style={{ color: "var(--foreground)" }} />
                <p className="font-black text-lg" style={{ color: "var(--foreground)" }}>Could Not Load Tournaments</p>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Check your connection and try again.</p>
                <button onClick={() => refetch()} className="px-5 py-2.5 rounded-xl font-black text-sm text-white" style={{ background: "var(--primary)" }}>Retry</button>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map(qt => <TCard key={qt.id} qt={qt} />)
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center rounded-2xl" style={{ border: "2px dashed var(--border)" }}>
                <Trophy className="w-12 h-12 mb-4 opacity-20" style={{ color: "var(--foreground)" }} />
                <h3 className="font-black text-lg mb-1" style={{ color: "var(--foreground)" }}>No Tournaments Found</h3>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Try adjusting your filters or check back later.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Tournaments;
