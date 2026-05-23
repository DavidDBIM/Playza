import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getQuizTournamentsApi, type QuizTournament } from "@/api/quiz.api";
import { Search, Trophy, X, ArrowRight, Users, ChevronDown, Zap } from "lucide-react";
import { ZASymbol } from "@/components/currency/ZASymbol";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── 3-D tilt ────────────────────────────────────────────────────────────────
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = ((e.clientX - left) / width  - 0.5) * 10;
    const y = ((e.clientY - top)  / height - 0.5) * -10;
    el.style.transform  = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
    el.style.transition = "transform 0.06s linear";
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform  = "perspective(800px) rotateY(0) rotateX(0) translateY(0)";
    el.style.transition = "transform 0.45s cubic-bezier(.23,1,.32,1)";
  };
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
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl font-black select-none pointer-events-none leading-none" style={{ color: sc.accent, opacity: 0.06, fontVariantNumeric: "tabular-nums" }}>{qt.prize_pool > 0 ? qt.prize_pool.toLocaleString() : "—"}</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--muted-foreground)" }}>Prize Pool</p>
            <p className="text-2xl font-black leading-none" style={{ color: "var(--foreground)" }}>
              {qt.prize_pool > 0 ? <span className="flex items-baseline gap-1"><span style={{ color: sc.accent }}><ZASymbol className="scale-90" /></span><span>{qt.prize_pool.toLocaleString()}</span></span> : <span style={{ color: "var(--muted-foreground)" }}>TBD</span>}
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
            {qt.entry_fee > 0 && <span className="flex items-center gap-1"><Zap className="w-3 h-3" style={{ color: sc.accent }} /><span style={{ color: sc.accent }}>{qt.entry_fee} ZA</span><span>entry</span></span>}
          </div>
          <div className="flex gap-1">
            {ROUNDS_META.map((r, i) => <div key={i} className="flex-1 group/seg relative" title={r.name}><div className="h-1.5 rounded-full transition-all duration-200 group-hover/seg:h-2" style={{ background: r.color, opacity: 0.55 }} /></div>)}
          </div>
          <Link to={`/quiz/${qt.id}`} className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.98]"
            style={hot ? { background: sc.accent, color: "#fff", boxShadow: `0 4px 16px ${sc.accent}40` } : { background: "var(--muted)", color: "var(--muted-foreground)" }}>
            {qt.status === "active" ? <><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> WATCH LIVE</> : hot ? <><Zap className="w-3 h-3" /> REGISTER NOW</> : "VIEW DETAILS"}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── ANIMATED ARENA HERO ──────────────────────────────────────────────────────
const PLAYERS = [
  { name: "Ade",   color: "#a855f7", icon: "⚡" },
  { name: "Kemi",  color: "#3b82f6", icon: "🎯" },
  { name: "Tayo",  color: "#22c55e", icon: "🔥" },
  { name: "Bisi",  color: "#f97316", icon: "💎" },
  { name: "Chidi", color: "#ef4444", icon: "⭐" },
  { name: "Ngozi", color: "#eab308", icon: "🚀" },
  { name: "Emeka", color: "#06b6d4", icon: "🎮" },
  { name: "Fola",  color: "#ec4899", icon: "👑" },
];

const QUESTIONS = [
  { q: "Longest river in Africa?",           opts: ["Nile", "Congo", "Niger", "Zambezi"],           correct: 0 },
  { q: "Nigeria gained independence in?",    opts: ["1960", "1963", "1956", "1962"],                correct: 0 },
  { q: "Atomic symbol Au stands for?",       opts: ["Silver", "Platinum", "Gold", "Aluminum"],      correct: 2 },
];

// step → which question (0–2), whether showing answers, whether revealed
// 0: lobby  1: q0  2: ans0  3: rev0  4: q1  5: ans1  6: rev1  7: q2  8: ans2  9: rev2  10: winner
const STEP_DURATIONS = [2200, 1800, 1400, 2200, 1800, 1400, 2200, 1800, 1400, 2200, 4000];
// Survivors after each round
const SURVIVE: number[][] = [
  [0,1,2,3],   // after round 0: left side survives
  [0,1],       // after round 1: top two survive
  [0],         // winner
];

function playerSurvivesRound(pid: number, round: number): boolean {
  return SURVIVE[round]?.includes(pid) ?? false;
}
function isEliminated(pid: number, step: number): boolean {
  if (step >= 3  && !SURVIVE[0].includes(pid)) return true;
  if (step >= 6  && !SURVIVE[1].includes(pid)) return true;
  if (step >= 9  && !SURVIVE[2].includes(pid)) return true;
  return false;
}
function isAliveAtStep(pid: number, step: number): boolean {
  return !isEliminated(pid, step);
}
function getPlayerAnswer(pid: number, roundIdx: number): number {
  const correct = QUESTIONS[roundIdx]?.correct ?? 0;
  if (playerSurvivesRound(pid, roundIdx)) return correct;
  return (correct + 1 + (pid % 3)) % 4;
}

function ArenaParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            left: `${5 + (i * 4.7) % 90}%`,
            bottom: `-${10 + (i * 7) % 30}px`,
            background: ["#a855f7","#3b82f6","#22c55e","#f97316","#ec4899"][i % 5],
            opacity: 0.4 + (i % 4) * 0.1,
            animation: `floatUp ${3 + (i % 4)}s linear infinite`,
            animationDelay: `${(i * 0.37) % 4}s`,
          }}
        />
      ))}
    </div>
  );
}

function PlayerCard({ player, step, pid }: { player: typeof PLAYERS[0]; step: number; pid: number }) {
  const elim = isEliminated(pid, step);
  const roundIdx = step <= 3 ? 0 : step <= 6 ? 1 : 2;
  const isAnswering = (step === 2 && roundIdx === 0) || (step === 5 && roundIdx === 1) || (step === 8 && roundIdx === 2);
  const isReveal = (step === 3 && roundIdx === 0) || (step === 6 && roundIdx === 1) || (step === 9 && roundIdx === 2);
  const myAnswer = getPlayerAnswer(pid, Math.max(0, roundIdx));
  const correct = QUESTIONS[Math.max(0, roundIdx)]?.correct ?? 0;
  const gotRight = myAnswer === correct;
  const winner = step === 10 && pid === 0;

  let border = player.color + "50";
  let bg = "rgba(255,255,255,0.03)";
  let shadow = "";
  let opacity = 1;
  let scale = 1;

  if (elim && step >= 3) { opacity = 0.15; scale = 0.92; border = "#ffffff20"; bg = "transparent"; }
  else if (winner) { border = "#fbbf24"; bg = "rgba(251,191,36,0.15)"; shadow = "0 0 30px rgba(251,191,36,0.5)"; scale = 1.08; }
  else if (isReveal && gotRight) { border = "#22c55e"; bg = "rgba(34,197,94,0.15)"; shadow = `0 0 20px rgba(34,197,94,0.4)`; }
  else if (isReveal && !gotRight) { border = "#ef4444"; bg = "rgba(239,68,68,0.1)"; }
  else if (isAnswering) { border = player.color; bg = player.color + "18"; shadow = `0 0 16px ${player.color}50`; }
  else if (!elim) { shadow = `0 0 8px ${player.color}20`; }

  const answerLabels = ["A","B","C","D"];

  return (
    <div style={{
      transition: "all 0.5s cubic-bezier(.23,1,.32,1)",
      opacity,
      transform: `scale(${scale})`,
      border: `1px solid ${border}`,
      background: bg,
      boxShadow: shadow,
      borderRadius: 12,
      padding: "8px 10px",
      display: "flex",
      alignItems: "center",
      gap: 8,
      minWidth: 0,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Glow sweep on answering */}
      {isAnswering && !elim && (
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, transparent, ${player.color}15, transparent)`, animation: "sweep 1s ease-in-out infinite" }} />
      )}
      {winner && (
        <div style={{ position: "absolute", top: -2, right: -2, fontSize: 16 }}>👑</div>
      )}
      <div style={{ width: 28, height: 28, borderRadius: 8, background: elim ? "#ffffff08" : player.color + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
        {elim ? "💀" : player.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 900, color: elim ? "rgba(255,255,255,0.2)" : "#fff", lineHeight: 1.2, margin: 0, letterSpacing: "0.05em" }}>{player.name}</p>
        {isAnswering && !elim && (
          <p style={{ fontSize: 9, fontWeight: 700, color: player.color, margin: 0, animation: "fadeInUp 0.3s ease" }}>
            {answerLabels[myAnswer]}…
          </p>
        )}
        {isReveal && !elim && (
          <p style={{ fontSize: 9, fontWeight: 900, color: gotRight ? "#4ade80" : "#f87171", margin: 0 }}>
            {gotRight ? "✓ Correct!" : "✗ Wrong"}
          </p>
        )}
        {winner && (
          <p style={{ fontSize: 9, fontWeight: 900, color: "#fbbf24", margin: 0 }}>🏆 WINNER!</p>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ step }: { step: number }) {
  const showQ    = step >= 1 && step <= 3;
  const showQ2   = step >= 4 && step <= 6;
  const showQ3   = step >= 7 && step <= 9;
  const winner   = step === 10;

  const roundIdx = showQ ? 0 : showQ2 ? 1 : showQ3 ? 2 : -1;
  const q = roundIdx >= 0 ? QUESTIONS[roundIdx] : null;
  const isAnswering = step === 2 || step === 5 || step === 8;
  const isReveal    = step === 3 || step === 6 || step === 9;
  const roundLabel  = roundIdx === 0 ? "ROUND 1" : roundIdx === 1 ? "ROUND 2 · SEMI-FINAL" : "ROUND 3 · FINAL";
  const roundColor  = roundIdx === 0 ? "#22c55e" : roundIdx === 1 ? "#f97316" : "#a855f7";
  const timeLeft    = isAnswering ? "12s" : isReveal ? "—" : "30s";
  const opts        = q?.opts ?? [];
  const correct     = q?.correct ?? 0;

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px" }}>
      {step === 0 ? (
        // Lobby
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8, animation: "pulse 2s ease-in-out infinite" }}>⏳</div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>Lobby Open</p>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700, margin: "4px 0 0 0" }}>8 players registered</p>
        </div>
      ) : winner ? (
        // Winner
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 4, animation: "winner-bounce 0.5s ease-in-out infinite alternate" }}>🏆</div>
          <p style={{ color: "#fbbf24", fontSize: 13, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>Ade Wins!</p>
          <p style={{ color: "rgba(251,191,36,0.6)", fontSize: 10, fontWeight: 700, margin: "4px 0 0 0" }}>+50,000 ZA Tokens</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 8 }}>
            {["🎉","✨","🎊","⭐","🎉"].map((e,i) => (
              <span key={i} style={{ fontSize: 14, animation: `celebrate ${0.8 + i * 0.15}s ease-in-out infinite alternate`, animationDelay: `${i * 0.1}s` }}>{e}</span>
            ))}
          </div>
        </div>
      ) : q ? (
        // Question card
        <div style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 14px", animation: step % 3 === 1 ? "slideInQ 0.4s cubic-bezier(.23,1,.32,1)" : undefined }}>
          {/* Round badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.15em", color: roundColor, textTransform: "uppercase", background: roundColor + "20", border: `1px solid ${roundColor}40`, padding: "2px 6px", borderRadius: 4 }}>{roundLabel}</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: isAnswering ? "#fbbf24" : "rgba(255,255,255,0.3)", fontVariantNumeric: "tabular-nums" }}>{timeLeft}</span>
          </div>
          {/* Question */}
          <p style={{ fontSize: 11, fontWeight: 800, color: "#fff", lineHeight: 1.4, marginBottom: 10, margin: "0 0 10px 0" }}>{q.q}</p>
          {/* Options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {opts.map((opt, i) => {
              const isCorrect = isReveal && i === correct;
              const isWrong   = isReveal && i !== correct;
              return (
                <div key={i} style={{
                  background: isCorrect ? "rgba(34,197,94,0.2)" : isWrong ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isCorrect ? "#4ade8060" : isWrong ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 7,
                  padding: "5px 7px",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  opacity: isReveal && isWrong ? 0.4 : 1,
                  transition: "all 0.3s ease",
                }}>
                  <span style={{ fontSize: 8, fontWeight: 900, color: isCorrect ? "#4ade80" : "rgba(255,255,255,0.3)", flexShrink: 0 }}>{["A","B","C","D"][i]}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: isCorrect ? "#4ade80" : "rgba(255,255,255,0.5)", lineHeight: 1.2, flex: 1 }}>{opt}</span>
                  {isCorrect && <span style={{ fontSize: 10 }}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TournamentArena() {
  const [step, setStep] = useState(0);
  const [prizeCount, setPrizeCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      if (cancelled) return;
      timers.forEach(t => clearTimeout(t));
      timers = [];
      setStep(0);
      let acc = 0;
      STEP_DURATIONS.forEach((dur, i) => {
        const t = setTimeout(() => {
          if (!cancelled) setStep(i + 1);
        }, acc);
        timers.push(t);
        acc += dur;
      });
      const reset = setTimeout(() => { if (!cancelled) run(); }, acc + 100);
      timers.push(reset);
    };

    run();
    return () => { cancelled = true; timers.forEach(t => clearTimeout(t)); };
  }, []);

  // Prize counter ticks up when winner is shown
  useEffect(() => {
    if (step === 10) {
      let n = 0;
      const iv = setInterval(() => {
        n += 2500;
        if (n >= 50000) { setPrizeCount(50000); clearInterval(iv); }
        else setPrizeCount(n);
      }, 40);
      return () => clearInterval(iv);
    } else {
      setPrizeCount(0);
    }
  }, [step]);

  const left  = [0,1,2,3];
  const right = [4,5,6,7];

  const aliveCount = PLAYERS.filter((_, i) => isAliveAtStep(i, step)).length;

  return (
    <div style={{
      position: "relative",
      width: "100%",
      background: "linear-gradient(180deg, #0a0420 0%, #060215 50%, #080320 100%)",
      borderRadius: 20,
      overflow: "hidden",
      minHeight: 340,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* CSS keyframes injected */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-400px) translateX(${20}px); opacity: 0; }
        }
        @keyframes sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes slideInQ {
          0%   { opacity: 0; transform: scale(0.94) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes winner-bounce {
          0%   { transform: scale(1) rotate(-5deg); }
          100% { transform: scale(1.15) rotate(5deg); }
        }
        @keyframes celebrate {
          0%   { transform: translateY(0) rotate(-10deg); }
          100% { transform: translateY(-12px) rotate(10deg); }
        }
        @keyframes fadeInUp {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
      `}</style>

      {/* Particles */}
      <ArenaParticles />

      {/* Spotlight sweeps */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: -60, left: "15%", width: 200, height: 300, background: "radial-gradient(ellipse, rgba(168,85,247,0.12) 0%, transparent 70%)", transform: "rotate(-20deg)" }} />
        <div style={{ position: "absolute", top: -60, right: "10%", width: 200, height: 300, background: "radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%)", transform: "rotate(20deg)" }} />
        <div style={{ position: "absolute", bottom: 0, left: "40%", width: 300, height: 200, background: "radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)" }} />
      </div>

      {/* Scanline overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0) 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)", pointerEvents: "none", zIndex: 0 }} />

      {/* Top bar */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444", animation: "glow-pulse 1s ease-in-out infinite" }} />
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>LIVE · QUIZ CHAMPIONSHIP</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Prize Pool</p>
            <p style={{ fontSize: 13, fontWeight: 900, color: step === 10 ? "#fbbf24" : "rgba(255,255,255,0.7)", margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {step === 10 ? prizeCount.toLocaleString() : "50,000"} ZA
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Alive</p>
            <p style={{ fontSize: 13, fontWeight: 900, color: "#22c55e", margin: 0 }}>{aliveCount}</p>
          </div>
        </div>
      </div>

      {/* Arena: left players | center question | right players */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", gap: 8, padding: "4px 14px 14px", minHeight: 0 }}>
        {/* Left players */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 120, flexShrink: 0 }}>
          {left.map(pid => (
            <PlayerCard key={pid} player={PLAYERS[pid]} step={step} pid={pid} />
          ))}
        </div>

        {/* Center question */}
        <QuestionCard step={step} />

        {/* Right players */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 120, flexShrink: 0 }}>
          {right.map(pid => (
            <PlayerCard key={pid} player={PLAYERS[pid]} step={step} pid={pid} />
          ))}
        </div>
      </div>

      {/* Round progress bottom bar */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 6, padding: "8px 18px 14px" }}>
        <span style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>5 Rounds</span>
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          {["#22c55e","#3b82f6","#f97316","#ef4444","#a855f7"].map((c, i) => {
            const active = (step <= 3 && i === 0) || (step <= 6 && step > 3 && i === 1) || (step <= 9 && step > 6 && i === 2) || (step === 10 && i === 2);
            const done   = (step > 3 && i === 0) || (step > 6 && i === 1) || (step > 9 && i === 2);
            return (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: done ? c : active ? c : "rgba(255,255,255,0.08)", opacity: done ? 0.7 : active ? 1 : 1, transition: "all 0.5s ease", boxShadow: active ? `0 0 8px ${c}` : "none" }} />
            );
          })}
        </div>
        <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>
          {step === 0 ? "Lobby" : step <= 3 ? "Round 1" : step <= 6 ? "Round 2" : step <= 9 ? "Final" : "🏆 Complete"}
        </span>
      </div>
    </div>
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

        {/* ── ANIMATED ARENA HERO ──────────────────────────────────── */}
        <div className="mt-4 px-1 md:px-0">
          {/* Title above the arena */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--primary)" }}>Playza · Competitive</p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mt-0.5" style={{ color: "var(--foreground)" }}>Tournaments</h1>
            </div>
            {quizTournaments.some(t => t.status === "active") && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "#ef444418", border: "1px solid #ef444440" }}>
                <span className="w-2 h-2 rounded-full bg-red-500" style={{ animation: "pulse 1.2s ease-in-out infinite", boxShadow: "0 0 6px #ef4444" }} />
                <span className="text-[10px] font-black tracking-widest text-red-500">{quizTournaments.filter(t => t.status === "active").length} LIVE</span>
              </div>
            )}
          </div>

          {/* The arena */}
          <TournamentArena />
        </div>

        {/* ── Featured Hero (if active tournament) ──────────────────── */}
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
                    <Trophy className="w-3.5 h-3.5" style={{ color: fsc.accent }} />Prize: <span className="font-black flex items-center gap-0.5"><span style={{ color: fsc.accent }}><ZASymbol className="scale-90" /></span>{featured.prize_pool.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold" style={{ background: "var(--muted)", color: "var(--foreground)" }}>
                    <Users className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} /><span className="font-black">{featured.player_count}</span><span style={{ color: "var(--muted-foreground)" }}>players</span>
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
              {([{ id: "live", label: "🔴 Live Now" }, { id: "upcoming", label: "🟢 Upcoming" }, { id: "completed", label: "⚫ Completed" }] as const).map(tab => (
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
                    <DropdownMenuItem key={opt.value} onClick={() => setFilterPrize(opt.value)} className="text-xs font-bold uppercase tracking-wider cursor-pointer py-2 px-3 rounded-lg outline-none transition-all" style={filterPrize === opt.value ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}>
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
