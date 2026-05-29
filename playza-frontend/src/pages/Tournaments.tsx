import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuizTournamentsApi, joinQuizTournamentApi, type QuizTournament } from "@/api/quiz.api";
import { Search, Trophy, X, Users, ChevronDown, Zap, Eye, Brain, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useToast } from "@/context/toast";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  active:       { label: "LIVE NOW",          short: "LIVE",     color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  live: true  },
  registration: { label: "REGISTER NOW",      short: "REGISTER", color: "#16a34a", bg: "rgba(22,163,74,0.12)", border: "rgba(22,163,74,0.3)",  live: false },
  lobby:        { label: "REGISTER NOW",      short: "REGISTER", color: "#16a34a", bg: "rgba(22,163,74,0.12)", border: "rgba(22,163,74,0.3)",  live: false },
  draft:        { label: "COMING SOON",       short: "SOON",     color: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.25)", live: false },
  completed:    { label: "ENDED",             short: "ENDED",    color: "#64748b", bg: "rgba(100,116,139,0.1)",border: "rgba(100,116,139,0.2)", live: false },
  cancelled:    { label: "CANCELLED",         short: "OFF",      color: "#64748b", bg: "rgba(100,116,139,0.1)",border: "rgba(100,116,139,0.2)", live: false },
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

// ─── 3-D tilt ──────────────────────────────────────────────────────────────────
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = ((e.clientX - left) / width  - 0.5) * 10;
    const y = ((e.clientY - top)  / height - 0.5) * -10;
    el.style.transform  = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
    el.style.transition = "transform 0.06s linear";
  }, []);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform  = "perspective(700px) rotateY(0deg) rotateX(0deg) translateY(0px)";
    el.style.transition = "transform 0.5s cubic-bezier(.23,1,.32,1)";
  }, []);
  return { ref, onMove, onLeave };
}

// ─── Tournament Card with one-click register ───────────────────────────────────
function TCard({ qt, featured, onRegistered }: {
  qt: QuizTournament;
  featured?: boolean;
  onRegistered: (id: string) => void;
}) {
  const { ref, onMove, onLeave } = useTilt();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const sc  = STATUS[qt.status as keyof typeof STATUS] ?? STATUS.draft;
  const canRegister = qt.status === "registration" || qt.status === "lobby";
  const [registered, setRegistered] = useState(!!qt.user_registered);

  const { mutate: join, isPending } = useMutation({
    mutationFn: () => joinQuizTournamentApi(qt.id),
    onSuccess: (data) => {
      if (data.data?.already_joined) {
        toast.info("You are already registered for this tournament!");
      } else {
        toast.success(data.message ?? "Registered! We'll remind you before game day. 🎉");
      }
      setRegistered(true);
      onRegistered(qt.id);
    },
    onError: (err: unknown) => {
      const e = err as Error & { response?: { data?: { message?: string } } };
      const msg = e?.response?.data?.message ?? e?.message ?? "Registration failed";
      toast.error(msg);
    },
  });

  function handleRegister() {
    if (!user) {
      toast.error("Please log in to register for tournaments.");
      navigate("/login");
      return;
    }
    // Balance check — reject before hitting API
    const balance = user.wallet?.balance ?? 0;
    if (qt.entry_fee > 0 && balance < qt.entry_fee) {
      toast.error(`Insufficient ZA balance. You need ${qt.entry_fee} ZA but have ${balance} ZA.`);
      return;
    }
    join();
  }

  return (
    <div
      ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transformStyle: "preserve-3d", willChange: "transform",
        transform: featured ? "perspective(700px) rotateX(-1deg) translateY(-4px)" : undefined }}
    >
      <div style={{
        background: "var(--card)",
        border: `1px solid ${featured ? sc.color + "50" : "var(--border)"}`,
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxShadow: featured
          ? `0 0 30px ${sc.color}18, 0 4px 24px rgba(0,0,0,0.08)`
          : "0 2px 8px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
      }}>
        {/* Top accent bar */}
        <div style={{ height: 3, background: sc.color, width: "100%" }} />

        {/* Card image area */}
        <div style={{
          height: 72,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
          background: `linear-gradient(135deg, ${sc.color}08, ${sc.color}03)`,
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            {qt.status === "active" ? <Zap size={30} style={{ color: sc.color }} />
              : qt.status === "completed" ? <Trophy size={30} style={{ color: sc.color }} />
              : <Brain size={30} style={{ color: sc.color }} />}
          </div>
          {/* Status badge */}
          <div style={{
            position: "absolute", top: 8, right: 10,
            display: "flex", alignItems: "center", gap: 4,
            background: sc.bg, border: `1px solid ${sc.border}`,
            borderRadius: 20, padding: "3px 8px",
          }}>
            {sc.live && <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.color, display: "block", animation: "pulse 1.2s ease-in-out infinite" }} />}
            <span style={{ fontSize: 9, fontWeight: 700, color: sc.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{sc.short}</span>
          </div>
          {featured && (
            <div style={{ position: "absolute", top: 8, left: 10, background: "var(--primary)", borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Featured
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
          {/* Title */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.3, margin: "0 0 4px" }}>{qt.title}</h3>
            {qt.description && <p style={{ fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.5, margin: 0 }} className="line-clamp-2">{qt.description}</p>}
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {[
              { val: qt.prize_pool > 0 ? qt.prize_pool.toLocaleString() : "TBD", lbl: "ZA Prize" },
              { val: qt.player_count.toString(), lbl: "Players" },
              { val: qt.entry_fee > 0 ? `${qt.entry_fee} ZA` : "Free", lbl: "Entry" },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--muted)", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", margin: 0, lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontSize: 9, color: "var(--muted-foreground)", margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.lbl}</p>
              </div>
            ))}
          </div>

          {/* Round segments */}
          <div style={{ display: "flex", gap: 3 }}>
            {ROUNDS.map((r, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: r.color, opacity: 0.5 }} title={r.name} />
            ))}
          </div>

          {/* CTA — one click or link */}
          {canRegister ? (
            registered ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.06em",
                background: "rgba(22,163,74,0.1)", color: "#16a34a",
                border: "1px solid rgba(22,163,74,0.3)",
              }}>
                <CheckCircle size={13} /> Registered
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={isPending}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "10px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  background: isPending ? `${sc.color}80` : sc.color,
                  color: "#fff", border: "none", cursor: isPending ? "not-allowed" : "pointer",
                  boxShadow: `0 4px 14px ${sc.color}35`,
                  transition: "all 0.2s ease",
                  width: "100%", marginTop: "auto",
                }}
              >
                {isPending ? <><Loader2 size={12} className="animate-spin" /> Registering...</> : <><Zap size={12} /> Register Now</>}
              </button>
            )
          ) : (
            <Link
              to={`/quiz/${qt.id}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.06em", textDecoration: "none",
                marginTop: "auto",
                background: qt.status === "active" ? sc.color : "var(--muted)",
                color: qt.status === "active" ? "#fff" : "var(--muted-foreground)",
                boxShadow: qt.status === "active" ? `0 4px 14px ${sc.color}35` : "none",
              }}
            >
              {qt.status === "active" ? <><Eye size={12} /> Watch Live</> : "View Details"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Drop animation ────────────────────────────────────────────────────────────
function DropTitle() {
  const [phase, setPhase] = useState<"drop" | "shake" | "settled">("drop");
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase("shake");
      const el = wrapRef.current;
      if (el) {
        el.style.animation = "screenShake 0.35s ease-out";
        setTimeout(() => { if (el) el.style.animation = ""; setPhase("settled"); }, 360);
      }
    }, 820);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <style>{`
        @keyframes wordDrop{0%{transform:translateY(-240px);opacity:0}60%{opacity:1}80%{transform:translateY(8px)}90%{transform:translateY(-4px)}100%{transform:translateY(0);opacity:1}}
        @keyframes screenShake{0%{transform:translate(0,0)}15%{transform:translate(-4px,2px)}30%{transform:translate(4px,-2px)}45%{transform:translate(-3px,1px)}60%{transform:translate(3px,-1px)}75%{transform:translate(-1px,0)}100%{transform:translate(0,0)}}
        @keyframes shockRing{0%{transform:translate(-50%,-50%) scale(0);opacity:0.6}100%{transform:translate(-50%,-50%) scale(5);opacity:0}}
        @keyframes dustL{0%{transform:translateX(0) scaleX(1);opacity:0.5}100%{transform:translateX(-70px) scaleX(2);opacity:0}}
        @keyframes dustR{0%{transform:translateX(0) scaleX(1);opacity:0.5}100%{transform:translateX(70px) scaleX(2);opacity:0}}
        @keyframes fadeUp{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes lineIn{0%{transform:scaleX(0);opacity:0}100%{transform:scaleX(1);opacity:1}}
        @keyframes pulse-glow{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
      `}</style>
      <div ref={wrapRef} style={{ position: "relative", textAlign: "center", paddingTop: 8 }}>
        {(phase === "shake" || phase === "settled") && <>
          <div style={{ position: "absolute", left: "50%", top: "72%", width: 50, height: 50, borderRadius: "50%", border: "2px solid #a855f7", opacity: 0, animation: "shockRing 0.5s ease-out forwards", pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: "50%", top: "72%", width: 50, height: 50, borderRadius: "50%", border: "1px solid #a855f7", opacity: 0, animation: "shockRing 0.6s ease-out 0.07s forwards", pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: "calc(50% - 70px)", top: "70%", width: 36, height: 5, borderRadius: 3, background: "#a855f7", opacity: 0, animation: "dustL 0.4s ease-out 0.04s forwards", pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: "calc(50% + 34px)", top: "70%", width: 36, height: 5, borderRadius: 3, background: "#a855f7", opacity: 0, animation: "dustR 0.4s ease-out 0.04s forwards", pointerEvents: "none" }} />
        </>}
        <h1 style={{ fontSize: "clamp(2.8rem,10vw,5.5rem)", fontWeight: 700, color: "#fff", letterSpacing: "-3px", lineHeight: 0.95, animation: "wordDrop 0.85s cubic-bezier(0.23,1,0.32,1) forwards", willChange: "transform", margin: 0 }}>
          Tournaments
        </h1>
        <div style={{ height: 2, width: "min(280px, 60%)", margin: "14px auto 0", background: "linear-gradient(90deg,transparent,#a855f7,transparent)", transformOrigin: "center", opacity: 0, animation: phase === "settled" ? "lineIn 0.5s ease-out 0.1s forwards" : "none" }} />
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 10, letterSpacing: "0.04em", opacity: 0, animation: phase === "settled" ? "fadeUp 0.4s ease-out 0.2s forwards" : "none" }}>
          Answer fast. Outlast everyone. Take the prize.
        </p>
      </div>
    </>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
const Tournaments = () => {
  const [activeTab,   setActiveTab]   = useState<"live" | "upcoming" | "completed">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPrize, setFilterPrize] = useState("all");
  const queryClient = useQueryClient();

  const { data: quizTournaments = [], isError, isLoading, refetch } = useQuery({
    queryKey: ["quiz-tournaments-public"],
    queryFn: getQuizTournamentsApi,
    staleTime: 5_000,
    refetchInterval: 15_000,
    retry: 1,
  });

  const featuredT = quizTournaments.find(qt =>
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

  const totalPlayers = quizTournaments.reduce((s, t) => s + t.player_count, 0);
  const totalPrize   = quizTournaments.reduce((s, t) => s + t.prize_pool, 0);
  const liveCount    = quizTournaments.filter(t => t.status === "active").length;

  function handleRegistered(id: string) {
    // Bump player count in cache immediately
    queryClient.setQueryData<QuizTournament[]>(["quiz-tournaments-public"], old =>
      (old ?? []).map(t => t.id === id ? { ...t, player_count: t.player_count + 1, user_registered: true } : t)
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: 64, overflowX: "hidden" }}>

      {/* ── Dark hero ─────────────────────────────────────────────── */}
      <div style={{ position: "relative", background: "#07041a", borderRadius: "0 0 24px 24px", overflow: "hidden", padding: "40px 24px 32px", marginBottom: 28 }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", background: "#3b0764", opacity: 0.5, top: -100, left: -80, filter: "blur(90px)" }} />
          <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "#1e3a5f", opacity: 0.45, top: -50, right: 0, filter: "blur(80px)" }} />
          <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "#4c1d95", opacity: 0.3, bottom: -40, left: "40%", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 20, padding: "4px 12px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", display: "block", animation: "pulse-glow 1.4s ease-in-out infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "#c084fc", letterSpacing: "0.15em", textTransform: "uppercase" }}>Playza · Competitive</span>
          </div>
          {liveCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "block", animation: "pulse-glow 0.9s ease-in-out infinite" }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: "#f87171", letterSpacing: "0.1em", textTransform: "uppercase" }}>{liveCount} Live Now</span>
            </div>
          )}
        </div>
        <div style={{ position: "relative", zIndex: 1, marginBottom: 28 }}><DropTitle /></div>
        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
          {[
            { icon: <Trophy size={16} style={{ color: "#c084fc" }} />, val: `${totalPrize.toLocaleString()} ZA`, lbl: "Total prize pool", bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.25)" },
            { icon: <Users size={16} style={{ color: "#4ade80" }} />, val: totalPlayers.toLocaleString(), lbl: "Players competing", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" },
            { icon: <Zap size={16} style={{ color: "#fbbf24" }} />, val: `${quizTournaments.length}`, lbl: "Tournaments", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "9px 14px", flex: "1 1 140px" }}>
              {s.icon}
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.lbl}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>5 Rounds</span>
          <div style={{ display: "flex", gap: 4, flex: 1 }}>
            {["#22c55e","#3b82f6","#f97316","#ef4444","#a855f7"].map((c, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: c, opacity: 0.7 }} />
            ))}
          </div>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>Warm Up → Final Showdown</span>
        </div>
      </div>

      {/* ── Below hero — uses theme vars, visible in light + dark ─── */}
      <div style={{ padding: "0 4px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Tabs + search */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div className="flex gap-1" style={{ borderBottom: "2px solid var(--border)" }}>
            {([
              { id: "live",      label: "🔴 Live Now"  },
              { id: "upcoming",  label: "🟢 Upcoming"  },
              { id: "completed", label: "⚫ Completed"  },
            ] as const).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-4 pb-3 pt-1 text-xs font-black uppercase tracking-widest transition-all -mb-[2px]"
                style={activeTab === tab.id
                  ? { color: "var(--primary)", borderBottom: "2px solid var(--primary)", background: "none", border: "none", cursor: "pointer" }
                  : { color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flex: 1, maxWidth: 340 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ width: "100%", paddingLeft: 32, paddingRight: searchQuery ? 32 : 10, paddingTop: 9, paddingBottom: 9, borderRadius: 10, fontSize: 13, background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)", outline: "none", boxSizing: "border-box" }} />
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "flex" }}><X size={14} /></button>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", whiteSpace: "nowrap", minWidth: 130 }}>
                {PRIZE_OPTIONS.find(o => o.value === filterPrize)?.label} <ChevronDown size={11} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44 rounded-xl p-1" align="end" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
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

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {isLoading ? (
            <div style={{ gridColumn: "1/-1", padding: "80px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, border: "2px dashed var(--border)", borderRadius: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--primary)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Loading...</p>
            </div>
          ) : isError ? (
            <div style={{ gridColumn: "1/-1", padding: "80px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center", border: "2px dashed var(--border)", borderRadius: 16 }}>
              <Trophy size={40} style={{ opacity: 0.2, color: "var(--foreground)" }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>Could Not Load Tournaments</p>
              <button onClick={() => refetch()} style={{ padding: "10px 20px", borderRadius: 10, background: "var(--primary)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Retry</button>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map(qt => (
              <TCard key={qt.id} qt={qt} featured={featuredT?.id === qt.id} onRegistered={handleRegistered} />
            ))
          ) : (
            <div style={{ gridColumn: "1/-1", padding: "80px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", border: "2px dashed var(--border)", borderRadius: 16 }}>
              <Trophy size={40} style={{ opacity: 0.2, color: "var(--foreground)" }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>No Tournaments Found</p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Try adjusting your filters or check back later</p>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default Tournaments;
