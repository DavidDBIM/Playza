import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuizTournamentsApi, joinQuizTournamentApi, getLobbyPlayersApi, type QuizTournament, type PrizeTier } from "@/api/quiz.api";
import { Search, Trophy, X, Users, ChevronDown, Zap, Eye, Brain, CheckCircle, Loader2, Info, Calendar, Clock, Shield, Send, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useToast } from "@/context/toast";
import { useLobbySocket } from "@/hooks/quiz/useLobbySocket";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SEO from "@/components/SEO";

const STATUS = {
  active:       { label: "LIVE NOW",     short: "LIVE",     color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   live: true  },
  registration: { label: "REGISTER NOW", short: "REGISTER", color: "#16a34a", bg: "rgba(22,163,74,0.12)",  border: "rgba(22,163,74,0.3)",   live: false },
  lobby:        { label: "LOBBY",        short: "LOBBY",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)",  live: false },
  draft:        { label: "COMING SOON",  short: "SOON",     color: "#6366f1", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.25)", live: false },
  completed:    { label: "ENDED",        short: "ENDED",    color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)", live: false },
  cancelled:    { label: "CANCELLED",    short: "OFF",      color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)", live: false },
} as const;

function useCountdown(targetIso: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    if (!targetIso) return;
    function calc() {
      const diff = new Date(targetIso!).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(null); setExpired(true); return; }
      const s = Math.floor(diff / 1000);
      setTimeLeft({ d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return { timeLeft, expired };
}

const ROUNDS = [
  { name: "Warm Up",        color: "#22c55e", secs: 45, emoji: "🟢" },
  { name: "Rising",         color: "#3b82f6", secs: 35, emoji: "🔵" },
  { name: "Heat Up",        color: "#f97316", secs: 30, emoji: "🟠" },
  { name: "Danger Zone",    color: "#ef4444", secs: 25, emoji: "🔴" },
  { name: "Final Showdown", color: "#a855f7", secs: 20, emoji: "👑" },
];

const PRIZE_OPTIONS = [
  { value: "all",  label: "All Prizes"         },
  { value: "high", label: "High Stakes (100k+)" },
  { value: "low",  label: "Standard"            },
];

function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return;
    const el = ref.current; if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = ((e.clientX - left) / width  - 0.5) * 10;
    const y = ((e.clientY - top)  / height - 0.5) * -10;
    el.style.transform  = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
    el.style.transition = "transform 0.06s linear";
  }, []);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform  = "none";
    el.style.transition = "transform 0.5s cubic-bezier(.23,1,.32,1)";
  }, []);
  return { ref, onMove, onLeave };
}

const REACTIONS = ['🔥', '💪', '👑', '😤', '🎯', '⚡', '🚀', '😂'];

function LobbyModal({ qt, onClose, onGameStart }: {
  qt: QuizTournament; onClose: () => void; onGameStart: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { timeLeft, expired } = useCountdown(qt.scheduled_at ?? null);
  const { connected, playerCount, gameStarted, messages, reactions, sendMessage, sendReaction } = useLobbySocket(qt.id);
  const { data: players = [] } = useQuery({ queryKey: ["lobby-players", qt.id], queryFn: () => getLobbyPlayersApi(qt.id), staleTime: 30_000, refetchInterval: 30_000 });
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (gameStarted || expired) { onGameStart(); navigate(`/quiz/${qt.id}`); } }, [gameStarted, expired, qt.id, navigate, onGameStart]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);
  function handleSend() { if (!msg.trim()) return; sendMessage(msg.trim()); setMsg(""); }

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fadeInBackdrop 0.2s ease" }}>
      <div style={{ width: "100%", maxWidth: 540, maxHeight: "95dvh", background: "var(--card)", borderRadius: "20px 20px 0 0", overflow: "hidden", display: "flex", flexDirection: "column", animation: "slideUp 0.3s cubic-bezier(0.23,1,0.32,1)", boxShadow: "0 -8px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ height: 4, background: `linear-gradient(90deg,#f59e0b,#f59e0b80)`, flexShrink: 0 }} />
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, borderBottom: "1px solid var(--border)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.1em" }}>🏟️ Tournament Lobby</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: connected ? "rgba(34,197,94,0.1)" : "rgba(100,116,139,0.1)", borderRadius: 20, padding: "2px 8px", border: `1px solid ${connected ? "rgba(34,197,94,0.3)" : "rgba(100,116,139,0.2)"}` }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: connected ? "#22c55e" : "#64748b", display: "block" }} />
                <span style={{ fontSize: 8, fontWeight: 700, color: connected ? "#22c55e" : "#64748b" }}>{connected ? "LIVE" : "CONNECTING"}</span>
              </div>
            </div>
            <h3 style={{ fontSize: "clamp(13px,3vw,15px)", fontWeight: 800, color: "var(--foreground)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{qt.title}</h3>
          </div>
          <button onClick={onClose} style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "50%", width: 32, height: 32, minWidth: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginLeft: 8 }}>
            <X size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
        {qt.scheduled_at && !expired && timeLeft && (
          <div style={{ padding: "12px 16px", background: "rgba(245,158,11,0.06)", borderBottom: "1px solid rgba(245,158,11,0.15)", flexShrink: 0 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(245,158,11,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>🕐 Game starts in</p>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {timeLeft.d > 0 && <div style={{ textAlign: "center" }}><p style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", margin: 0, lineHeight: 1 }}>{timeLeft.d}</p><p style={{ fontSize: 8, color: "rgba(245,158,11,0.6)", margin: "2px 0 0" }}>DAYS</p></div>}
              <div style={{ textAlign: "center" }}><p style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", margin: 0, lineHeight: 1 }}>{String(timeLeft.h).padStart(2,"0")}</p><p style={{ fontSize: 8, color: "rgba(245,158,11,0.6)", margin: "2px 0 0" }}>HRS</p></div>
              <p style={{ fontSize: 20, fontWeight: 900, color: "rgba(245,158,11,0.4)", margin: 0 }}>:</p>
              <div style={{ textAlign: "center" }}><p style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", margin: 0, lineHeight: 1 }}>{String(timeLeft.m).padStart(2,"0")}</p><p style={{ fontSize: 8, color: "rgba(245,158,11,0.6)", margin: "2px 0 0" }}>MIN</p></div>
              <p style={{ fontSize: 20, fontWeight: 900, color: "rgba(245,158,11,0.4)", margin: 0 }}>:</p>
              <div style={{ textAlign: "center" }}><p style={{ fontSize: 24, fontWeight: 900, color: "#f59e0b", margin: 0, lineHeight: 1 }}>{String(timeLeft.s).padStart(2,"0")}</p><p style={{ fontSize: 8, color: "rgba(245,158,11,0.6)", margin: "2px 0 0" }}>SEC</p></div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: "var(--foreground)", margin: 0 }}>{playerCount || players.length} <span style={{ fontSize: 10, color: "var(--muted-foreground)", fontWeight: 600 }}>in lobby</span></p>
                {qt.max_players && <p style={{ fontSize: 9, color: "var(--muted-foreground)", margin: "2px 0 0" }}>of {qt.max_players} max</p>}
              </div>
            </div>
          </div>
        )}
        {expired && (<div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.08)", borderBottom: "1px solid rgba(239,68,68,0.2)", flexShrink: 0, textAlign: "center" }}><p style={{ fontSize: 14, fontWeight: 800, color: "#ef4444", margin: 0 }}>🚀 Game is starting — heading to game...</p></div>)}
        <div style={{ position: "relative", height: 0, overflow: "visible", zIndex: 10 }}>
          {reactions.map((r: { id: number; emoji: string }) => (<div key={r.id} style={{ position: "absolute", bottom: 0, left: `${20 + Math.random() * 60}%`, fontSize: 24, animation: "floatUp 2.5s ease-out forwards", pointerEvents: "none" }}>{r.emoji}</div>))}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px 8px", flexShrink: 0 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>👥 Players ({players.length}{qt.max_players ? `/${qt.max_players}` : ""})</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {players.slice(0, 30).map((p: { user_id: string; username: string; avatar_url: string | null }) => (
                <div key={p.user_id} style={{ display: "flex", alignItems: "center", gap: 5, background: p.user_id === user?.id ? "rgba(168,85,247,0.12)" : "var(--muted)", border: `1px solid ${p.user_id === user?.id ? "rgba(168,85,247,0.3)" : "var(--border)"}`, borderRadius: 20, padding: "3px 10px 3px 4px" }}>
                  {p.avatar_url ? <img src={p.avatar_url} style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover" }} alt="" /> : <div style={{ width: 18, height: 18, borderRadius: "50%", background: p.user_id === user?.id ? "#7c3aed" : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#fff" }}>{p.username[0]?.toUpperCase()}</div>}
                  <span style={{ fontSize: 10, fontWeight: p.user_id === user?.id ? 800 : 600, color: p.user_id === user?.id ? "#c084fc" : "var(--foreground)" }}>{p.user_id === user?.id ? "You" : p.username}</span>
                </div>
              ))}
              {players.length > 30 && <div style={{ display: "flex", alignItems: "center", background: "var(--muted)", borderRadius: 20, padding: "3px 10px", fontSize: 10, color: "var(--muted-foreground)" }}>+{players.length - 30} more</div>}
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "6px 16px", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}><MessageCircle size={11} style={{ color: "var(--muted-foreground)" }} /><p style={{ fontSize: 9, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Lobby Chat</p></div>
            <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 8px", display: "flex", flexDirection: "column", gap: 6, WebkitOverflowScrolling: "touch" } as any}>
              {messages.length === 0 && (<p style={{ fontSize: 11, color: "var(--muted-foreground)", textAlign: "center", padding: "16px 0", fontStyle: "italic" }}>No messages yet — say something! 👋</p>)}
              {messages.map((m: { user_id: string; username: string; avatar_url: string | null; message: string; ts: number }, i: number) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: m.user_id === user?.id ? "rgba(124,58,237,0.3)" : "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: m.user_id === user?.id ? "#c084fc" : "var(--foreground)", flexShrink: 0 }}>
                    {m.avatar_url ? <img src={m.avatar_url} style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} alt="" /> : m.username[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: m.user_id === user?.id ? "#c084fc" : "var(--foreground)", marginRight: 6 }}>{m.user_id === user?.id ? "You" : m.username}</span>
                    <span style={{ fontSize: 9, opacity: 0.5, color: "var(--muted-foreground)" }}>{new Date(m.ts).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</span>
                    <p style={{ fontSize: 12, color: "var(--foreground)", margin: "2px 0 0", wordBreak: "break-word", lineHeight: 1.4 }}>{m.message}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", padding: "8px 16px 12px", flexShrink: 0, background: "var(--card)" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {REACTIONS.map(e => (<button key={e} onClick={() => sendReaction(e)} style={{ fontSize: 18, background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 8, width: 36, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.1s", flexShrink: 0 }} onMouseDown={ev => (ev.currentTarget.style.transform = "scale(0.85)")} onMouseUp={ev => (ev.currentTarget.style.transform = "scale(1)")}>{e}</button>))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="text" placeholder={connected ? "Say something..." : "Connecting..."} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && msg.trim()) handleSend(); }} maxLength={200} style={{ flex: 1, padding: "9px 12px", borderRadius: 10, fontSize: 13, background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)", outline: "none", opacity: connected ? 1 : 0.5 }} />
            <button onClick={handleSend} disabled={!msg.trim() || !connected} style={{ padding: "9px 14px", borderRadius: 10, background: msg.trim() && connected ? "#7c3aed" : "var(--muted)", border: "none", cursor: msg.trim() && connected ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
              <Send size={14} style={{ color: msg.trim() && connected ? "#fff" : "var(--muted-foreground)" }} />
            </button>
          </div>
        </div>
      </div>
      <style>{TOURNAMENTS_CSS}</style>
    </div>
  );
}

function TournamentDetailModal({ qt, onClose, onRegister, isRegistering, registered }: { qt: QuizTournament; onClose: () => void; onRegister: () => void; isRegistering: boolean; registered: boolean; }) {
  const sc = STATUS[qt.status as keyof typeof STATUS] ?? STATUS.draft;
  const maxPlayers = (qt as any).max_players as number | null;
  const isFull = maxPlayers !== null && qt.player_count >= maxPlayers;
  const isLobby = qt.status === "lobby";
  const canRegister = qt.status === "registration" && !registered && !isFull;
  const { timeLeft, expired } = useCountdown(isLobby ? (qt.scheduled_at ?? null) : null);
  useEffect(() => { const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", handler); return () => document.removeEventListener("keydown", handler); }, [onClose]);
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  const scheduledDate = qt.scheduled_at ? new Date(qt.scheduled_at).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fadeInBackdrop 0.2s ease" }}>
      <style>{TOURNAMENTS_CSS}</style>
      <div style={{ width: "100%", maxWidth: 540, maxHeight: "92dvh", background: "var(--card)", borderRadius: "20px 20px 0 0", overflow: "hidden", display: "flex", flexDirection: "column", animation: "slideUp 0.3s cubic-bezier(0.23,1,0.32,1)", boxShadow: "0 -8px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ height: 4, background: `linear-gradient(90deg,${sc.color},${sc.color}80)`, flexShrink: 0 }} />
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0", flexShrink: 0 }}><div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)" }} /></div>
        <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 20, padding: "3px 10px", marginBottom: 8 }}>
              {sc.live && <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.color, display: "block", animation: "pulse-glow 1.2s ease-in-out infinite" }} />}
              <span style={{ fontSize: 9, fontWeight: 700, color: sc.color, letterSpacing: "0.12em", textTransform: "uppercase" }}>{sc.label}</span>
            </div>
            <h2 style={{ fontSize: "clamp(16px,4vw,20px)", fontWeight: 800, color: "var(--foreground)", margin: "0 0 5px", lineHeight: 1.2, wordBreak: "break-word" }}>{qt.title}</h2>
            {qt.description && (<p style={{ fontSize: "clamp(11px,3vw,13px)", color: "var(--muted-foreground)", lineHeight: 1.5, margin: 0 }}>{qt.description}</p>)}
          </div>
          <button onClick={onClose} style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "50%", width: 32, height: 32, minWidth: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><X size={14} style={{ color: "var(--muted-foreground)" }} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0", WebkitOverflowScrolling: "touch" } as any}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 12 }}>
            {[{ icon: "🏆", val: qt.prize_pool > 0 ? `${qt.prize_pool.toLocaleString()} ZA` : "TBD", lbl: "Prize Pool" }, { icon: "👥", val: maxPlayers ? `${qt.player_count}/${maxPlayers}` : qt.player_count.toLocaleString(), lbl: "Players" }, { icon: "💎", val: qt.entry_fee > 0 ? `${qt.entry_fee} ZA` : "FREE", lbl: "Entry" }].map((s, i) => (
              <div key={i} style={{ background: "var(--muted)", borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 16, marginBottom: 3 }}>{s.icon}</div>
                <p style={{ fontSize: "clamp(10px,2.5vw,13px)", fontWeight: 700, color: "var(--foreground)", margin: 0, lineHeight: 1, wordBreak: "break-word" }}>{s.val}</p>
                <p style={{ fontSize: 9, color: "var(--muted-foreground)", margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.lbl}</p>
              </div>
            ))}
          </div>
          {maxPlayers && (() => { const pct = Math.min(qt.player_count / maxPlayers * 100, 100); const isFull2 = qt.player_count >= maxPlayers; const isAlmost = pct >= 80; const barColor = isFull2 ? "#ef4444" : isAlmost ? "#f97316" : sc.color; return (<div style={{ background: "var(--muted)", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 4 }}><span style={{ fontSize: "clamp(10px,2.5vw,11px)", fontWeight: 700, color: "var(--foreground)" }}>{isFull2 ? "🔴 Full" : isAlmost ? "🟠 Almost Full" : "🟢 Spots Available"}</span><span style={{ fontSize: "clamp(10px,2.5vw,11px)", fontWeight: 800, color: barColor }}>{qt.player_count} / {maxPlayers}</span></div><div style={{ height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: barColor, transition: "width 0.4s ease" }} /></div><p style={{ fontSize: 10, color: "var(--muted-foreground)", margin: "5px 0 0" }}>{isFull2 ? "No spots remaining" : `${maxPlayers - qt.player_count} spot${maxPlayers - qt.player_count !== 1 ? "s" : ""} remaining`}</p></div>); })()}
          {isLobby && qt.scheduled_at && !expired && timeLeft && (<div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}><p style={{ fontSize: 10, fontWeight: 700, color: "rgba(245,158,11,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>🕐 Game starts in</p><div style={{ display: "flex", gap: 12, alignItems: "center" }}>{timeLeft.d > 0 && (<div style={{ textAlign: "center" }}><p style={{ fontSize: 28, fontWeight: 900, color: "#f59e0b", margin: 0, lineHeight: 1 }}>{timeLeft.d}</p><p style={{ fontSize: 9, color: "rgba(245,158,11,0.6)", margin: "3px 0 0" }}>DAYS</p></div>)}<div style={{ textAlign: "center" }}><p style={{ fontSize: 28, fontWeight: 900, color: "#f59e0b", margin: 0, lineHeight: 1 }}>{String(timeLeft.h).padStart(2,"0")}</p><p style={{ fontSize: 9, color: "rgba(245,158,11,0.6)", margin: "3px 0 0" }}>HRS</p></div><p style={{ fontSize: 24, fontWeight: 900, color: "rgba(245,158,11,0.5)", margin: 0 }}>:</p><div style={{ textAlign: "center" }}><p style={{ fontSize: 28, fontWeight: 900, color: "#f59e0b", margin: 0, lineHeight: 1 }}>{String(timeLeft.m).padStart(2,"0")}</p><p style={{ fontSize: 9, color: "rgba(245,158,11,0.6)", margin: "3px 0 0" }}>MIN</p></div><p style={{ fontSize: 24, fontWeight: 900, color: "rgba(245,158,11,0.5)", margin: 0 }}>:</p><div style={{ textAlign: "center" }}><p style={{ fontSize: 28, fontWeight: 900, color: "#f59e0b", margin: 0, lineHeight: 1 }}>{String(timeLeft.s).padStart(2,"0")}</p><p style={{ fontSize: 9, color: "rgba(245,158,11,0.6)", margin: "3px 0 0" }}>SEC</p></div></div></div>)}
          {isLobby && expired && (<div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "14px", marginBottom: 14, textAlign: "center" }}><p style={{ fontSize: 14, fontWeight: 800, color: "#ef4444", margin: 0 }}>🚀 Game is starting now!</p></div>)}
          {(qt as any).prize_distribution && (qt as any).prize_distribution.length > 0 && qt.prize_pool > 0 && (<div style={{ marginBottom: 14 }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><span style={{ fontSize: 12 }}>🎯</span><span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Prize Breakdown</span></div><div style={{ background: "var(--muted)", borderRadius: 10, overflow: "hidden" }}>{(() => { const feePct = (qt as any).platform_fee_percentage ?? 10; const pool = Math.round(qt.prize_pool * (1 - feePct / 100)); const tiers = ((qt as any).prize_distribution as PrizeTier[]).slice().sort((a, b) => a.rank - b.rank); return tiers.map((tier, i) => { const medal = tier.rank === 1 ? "🥇" : tier.rank === 2 ? "🥈" : tier.rank === 3 ? "🥉" : `#${tier.rank}`; const amount = Math.round(pool * tier.percentage / 100); const isTop = tier.rank === 1; return (<div key={tier.rank} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < tiers.length - 1 ? "1px solid var(--border)" : "none", background: isTop ? `${sc.color}08` : "transparent" }}><span style={{ fontSize: 15, width: 22, textAlign: "center", flexShrink: 0 }}>{medal}</span><div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Rank {tier.rank}</p><div style={{ height: 3, borderRadius: 2, background: "var(--border)", marginTop: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${tier.percentage}%`, background: isTop ? sc.color : `${sc.color}80`, borderRadius: 2 }} /></div></div><p style={{ fontSize: "clamp(12px,3vw,14px)", fontWeight: 800, color: isTop ? sc.color : "var(--foreground)", margin: 0, flexShrink: 0 }}>{amount.toLocaleString()} ZA</p></div>); }); })()}</div></div>)}
          {scheduledDate && (<div style={{ background: "var(--muted)", borderRadius: 10, padding: "12px 14px", marginBottom: 12, display: "flex", gap: 10, alignItems: "flex-start" }}><Calendar size={14} style={{ color: sc.color, marginTop: 2, flexShrink: 0 }} /><div style={{ minWidth: 0 }}><p style={{ fontSize: 9, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>Scheduled</p><p style={{ fontSize: "clamp(11px,3vw,13px)", fontWeight: 600, color: "var(--foreground)", margin: 0, wordBreak: "break-word" }}>{scheduledDate}</p></div></div>)}
          <div style={{ marginBottom: 14 }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><Shield size={12} style={{ color: "var(--muted-foreground)" }} /><span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em" }}>5 Rounds of Elimination</span></div><div style={{ display: "flex", flexDirection: "column", gap: 5 }}>{ROUNDS.map((r, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--muted)", borderRadius: 10, padding: "9px 12px" }}><div style={{ width: 3, height: 28, borderRadius: 2, background: r.color, flexShrink: 0 }} /><span style={{ fontSize: 13 }}>{r.emoji}</span><div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: "clamp(10px,2.5vw,12px)", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>R{i + 1} — {r.name}</p><p style={{ fontSize: 9, color: "var(--muted-foreground)", margin: "1px 0 0" }}>{r.secs}s per question</p></div><div style={{ display: "flex", alignItems: "center", gap: 3, background: `${r.color}15`, border: `1px solid ${r.color}30`, borderRadius: 6, padding: "2px 6px", flexShrink: 0 }}><Clock size={9} style={{ color: r.color }} /><span style={{ fontSize: 9, fontWeight: 700, color: r.color }}>{r.secs}s</span></div></div>))}</div></div>
          <div style={{ marginBottom: 16 }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><Info size={12} style={{ color: "var(--muted-foreground)" }} /><span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em" }}>How It Works</span></div><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{[{ step: "01", title: "Register & wait", desc: "Register before the tournament starts. You'll get a reminder before game day." }, { step: "02", title: "Answer fast", desc: "Each question has a time limit. Wrong answer or timeout = eliminated." }, { step: "03", title: "Outlast everyone", desc: "Survive all 5 rounds to win." }, { step: "04", title: "Collect prize", desc: qt.prize_pool > 0 ? `Winners share ${qt.prize_pool.toLocaleString()} ZA, added to your wallet instantly.` : "Prize pool grows with every player." }].map((s, i) => (<div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><span style={{ fontSize: 10, fontWeight: 800, color: sc.color, width: 18, flexShrink: 0, paddingTop: 1 }}>{s.step}</span><div style={{ minWidth: 0 }}><p style={{ fontSize: "clamp(11px,2.5vw,12px)", fontWeight: 700, color: "var(--foreground)", margin: "0 0 1px" }}>{s.title}</p><p style={{ fontSize: "clamp(10px,2.5vw,11px)", color: "var(--muted-foreground)", margin: 0, lineHeight: 1.5 }}>{s.desc}</p></div></div>))}</div></div>
        </div>
        <div style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--border)", flexShrink: 0, background: "var(--card)" }}>
          {qt.status === "active" ? (<Link to={`/quiz/${qt.id}`} onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 12, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", textDecoration: "none", background: sc.color, color: "#fff" }}><Eye size={14} /> Watch Live</Link>) : registered ? (<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 12, fontSize: 13, fontWeight: 800, textTransform: "uppercase", background: isLobby ? "rgba(245,158,11,0.1)" : "rgba(22,163,74,0.1)", color: isLobby ? "#f59e0b" : "#16a34a", border: `1px solid ${isLobby ? "rgba(245,158,11,0.3)" : "rgba(22,163,74,0.3)"}` }}>{isLobby ? <><Clock size={14} /> You're in the Lobby — Game starting soon!</> : <><CheckCircle size={14} /> You're Registered!</>}</div>) : isFull ? (<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 12, fontSize: 13, fontWeight: 800, textTransform: "uppercase", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>🔴 Tournament Full</div>) : canRegister ? (<button onClick={onRegister} disabled={isRegistering} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 12, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", background: isRegistering ? `${sc.color}80` : sc.color, color: "#fff", border: "none", cursor: isRegistering ? "not-allowed" : "pointer", width: "100%", transition: "all 0.2s", boxShadow: `0 4px 20px ${sc.color}40` }}>{isRegistering ? <><Loader2 size={14} className="animate-spin" /> Registering...</> : qt.entry_fee > 0 ? <><Zap size={14} /> Register — Pay {qt.entry_fee} ZA</> : <><Zap size={14} /> Register Free</>}</button>) : qt.status === "completed" ? (<Link to={`/quiz/${qt.id}`} onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 12, fontSize: 13, fontWeight: 800, textTransform: "uppercase", textDecoration: "none", background: "var(--muted)", color: "var(--muted-foreground)" }}>View Results</Link>) : (<div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px", borderRadius: 12, fontSize: 12, fontWeight: 700, textTransform: "uppercase", background: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>Registration Not Open Yet</div>)}
          {qt.entry_fee > 0 && canRegister && (<p style={{ textAlign: "center", fontSize: 10, color: "var(--muted-foreground)", margin: "8px 0 0" }}>Entry fee is added to the prize pool · Reminder sent before game day</p>)}
        </div>
      </div>
    </div>
  );
}

function TCard({ qt, featured, onRegistered }: { qt: QuizTournament; featured?: boolean; onRegistered: (id: string) => void }) {
  const { ref, onMove, onLeave } = useTilt();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const sc = STATUS[qt.status as keyof typeof STATUS] ?? STATUS.draft;
  const maxPlayers = (qt as any).max_players as number | null;
  const isFull = maxPlayers !== null && qt.player_count >= maxPlayers;
  const canRegister = qt.status === "registration" && !isFull;
  const isLobby = qt.status === "lobby";
  const [registered, setRegistered] = useState(!!qt.user_registered);
  const [showDetail, setShowDetail] = useState(false);
  const [showLobby, setShowLobby] = useState(false);
  const { timeLeft: regTimeLeft } = useCountdown(qt.status === "registration" ? ((qt as any).registration_end ?? null) : null);
  const { timeLeft, expired } = useCountdown(isLobby ? (qt.scheduled_at ?? null) : null);
  const { mutate: join, isPending } = useMutation({
    mutationFn: () => joinQuizTournamentApi(qt.id),
    onSuccess: (data) => { if (data.data?.already_joined) { toast.info("You are already registered!"); } else { toast.success(data.message ?? "Registered! 🎉"); } setRegistered(true); onRegistered(qt.id); setShowDetail(false); },
    onError: (err: unknown) => { const e = err as Error & { response?: { data?: { message?: string } } }; toast.error(e?.response?.data?.message ?? e?.message ?? "Registration failed"); },
  });
  function handleRegister() { if (!user) { toast.error("Please log in to register."); navigate("/login"); return; } const balance = (user as any).wallet?.balance ?? 0; if (qt.entry_fee > 0 && balance < qt.entry_fee) { toast.error(`Insufficient ZA balance. You need ${qt.entry_fee} ZA but have ${balance} ZA.`); return; } join(); }

  return (
    <>
      <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transformStyle: "preserve-3d", willChange: "transform" }}>
        <div style={{ background: "var(--card)", border: `1px solid ${featured ? sc.color + "50" : "var(--border)"}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%", boxShadow: featured ? `0 0 30px ${sc.color}18, 0 4px 24px rgba(0,0,0,0.08)` : "0 2px 8px rgba(0,0,0,0.06)", transition: "box-shadow 0.3s ease" }}>
          <div style={{ height: 3, background: sc.color, width: "100%" }} />
          <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: `linear-gradient(135deg,${sc.color}08,${sc.color}03)` }}>
            {qt.status === "active" ? <Zap size={28} style={{ color: sc.color }} /> : qt.status === "completed" ? <Trophy size={28} style={{ color: sc.color }} /> : <Brain size={28} style={{ color: sc.color }} />}
            <div style={{ position: "absolute", top: 8, right: 10, display: "flex", alignItems: "center", gap: 4, background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 20, padding: "3px 8px" }}>
              {sc.live && <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.color, display: "block", animation: "pulse-glow 1.2s ease-in-out infinite" }} />}
              <span style={{ fontSize: 8, fontWeight: 700, color: sc.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{sc.short}</span>
            </div>
            {featured && (<div style={{ position: "absolute", top: 8, left: 10, background: "var(--primary)", borderRadius: 6, padding: "2px 7px", fontSize: 8, fontWeight: 700, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>Featured</div>)}
          </div>
          <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", flex: 1, gap: 9 }}>
            <div>
              <h3 style={{ fontSize: "clamp(12px,3vw,14px)", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.3, margin: "0 0 3px", wordBreak: "break-word" }}>{qt.title}</h3>
              {qt.description && (<p style={{ fontSize: "clamp(10px,2.5vw,11px)", color: "var(--muted-foreground)", lineHeight: 1.4, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as any}>{qt.description}</p>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5 }}>
              {[{ val: qt.prize_pool > 0 ? qt.prize_pool.toLocaleString() : "TBD", lbl: "ZA Prize" }, { val: maxPlayers ? `${qt.player_count}/${maxPlayers}` : qt.player_count.toString(), lbl: "Players" }, { val: qt.entry_fee > 0 ? `${qt.entry_fee} ZA` : "Free", lbl: "Entry" }].map((s, i) => (<div key={i} style={{ background: "var(--muted)", borderRadius: 8, padding: "5px 6px", textAlign: "center" }}><p style={{ fontSize: "clamp(10px,2.5vw,12px)", fontWeight: 700, color: "var(--foreground)", margin: 0, lineHeight: 1, wordBreak: "break-all" }}>{s.val}</p><p style={{ fontSize: 8, color: "var(--muted-foreground)", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.lbl}</p></div>))}
            </div>
            {maxPlayers && (() => { const pct = Math.min(qt.player_count / maxPlayers * 100, 100); const full = qt.player_count >= maxPlayers; const almost = pct >= 80; const barColor = full ? "#ef4444" : almost ? "#f97316" : sc.color; return (<div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}><span style={{ fontSize: 9, fontWeight: 700, color: "var(--muted-foreground)" }}>{full ? "🔴 Full" : almost ? "🟠 Almost Full" : "🟢 Spots Left"}</span><span style={{ fontSize: 9, fontWeight: 700, color: barColor }}>{maxPlayers - qt.player_count > 0 ? `${maxPlayers - qt.player_count} left` : "Full"}</span></div><div style={{ height: 3, borderRadius: 2, background: "var(--muted)", overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: barColor, transition: "width 0.4s ease" }} /></div></div>); })()}
            <div style={{ display: "flex", gap: 3 }}>{ROUNDS.map((r, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: r.color, opacity: 0.5 }} title={r.name} />)}</div>
            {qt.status === "registration" && regTimeLeft && (qt as any).registration_end && (<div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "6px 10px" }}><p style={{ fontSize: 8, fontWeight: 700, color: "rgba(239,68,68,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>⏳ Registration closes in</p><p style={{ fontSize: 12, fontWeight: 800, color: "#ef4444", margin: 0, fontVariantNumeric: "tabular-nums" }}>{regTimeLeft.d > 0 ? `${regTimeLeft.d}d ` : ""}{String(regTimeLeft.h).padStart(2,"0")}:{String(regTimeLeft.m).padStart(2,"0")}:{String(regTimeLeft.s).padStart(2,"0")}</p></div>)}
            {isLobby && qt.scheduled_at && !expired && timeLeft && (<div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, padding: "8px 10px" }}><p style={{ fontSize: 9, fontWeight: 700, color: "rgba(245,158,11,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>🕐 Game starts in</p><div style={{ display: "flex", gap: 6, alignItems: "center" }}>{timeLeft.d > 0 && (<div style={{ textAlign: "center" }}><p style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b", margin: 0, lineHeight: 1 }}>{timeLeft.d}</p><p style={{ fontSize: 8, color: "rgba(245,158,11,0.6)", margin: "2px 0 0" }}>DAYS</p></div>)}{(timeLeft.d > 0 || timeLeft.h > 0) && (<div style={{ textAlign: "center" }}><p style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b", margin: 0, lineHeight: 1 }}>{String(timeLeft.h).padStart(2,"0")}</p><p style={{ fontSize: 8, color: "rgba(245,158,11,0.6)", margin: "2px 0 0" }}>HRS</p></div>)}<div style={{ textAlign: "center" }}><p style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b", margin: 0, lineHeight: 1 }}>{String(timeLeft.m).padStart(2,"0")}</p><p style={{ fontSize: 8, color: "rgba(245,158,11,0.6)", margin: "2px 0 0" }}>MIN</p></div><div style={{ textAlign: "center" }}><p style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b", margin: 0, lineHeight: 1 }}>{String(timeLeft.s).padStart(2,"0")}</p><p style={{ fontSize: 8, color: "rgba(245,158,11,0.6)", margin: "2px 0 0" }}>SEC</p></div></div></div>)}
            {isLobby && expired && (<div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}><p style={{ fontSize: 11, fontWeight: 800, color: "#ef4444", margin: 0 }}>🚀 Starting now...</p></div>)}
            <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
              <button onClick={() => setShowDetail(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "9px 10px", borderRadius: 9, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)", cursor: "pointer", flexShrink: 0, transition: "all 0.2s", whiteSpace: "nowrap" }}><Info size={11} /> Details</button>
              {qt.status === "active" ? (<Link to={`/quiz/${qt.id}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px", borderRadius: 9, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none", background: sc.color, color: "#fff", boxShadow: `0 3px 12px ${sc.color}35` }}><Eye size={11} /> Watch Live</Link>) : qt.status === "completed" || qt.status === "cancelled" ? (<Link to={`/quiz/${qt.id}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "9px", borderRadius: 9, fontSize: 10, fontWeight: 700, textTransform: "uppercase", textDecoration: "none", background: "var(--muted)", color: "var(--muted-foreground)" }}>Results</Link>) : registered ? (<button onClick={() => isLobby ? setShowLobby(true) : undefined} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "9px", borderRadius: 9, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: isLobby ? "rgba(245,158,11,0.1)" : "rgba(22,163,74,0.1)", color: isLobby ? "#f59e0b" : "#16a34a", border: `1px solid ${isLobby ? "rgba(245,158,11,0.3)" : "rgba(22,163,74,0.3)"}`, cursor: isLobby ? "pointer" : "default" }}>{isLobby ? <><Clock size={11} /> In Lobby ›</> : <><CheckCircle size={11} /> Registered</>}</button>) : isFull ? (<div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "9px", borderRadius: 9, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>🔴 Full</div>) : canRegister ? (<button onClick={handleRegister} disabled={isPending} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "9px", borderRadius: 9, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: isPending ? `${sc.color}80` : sc.color, color: "#fff", border: "none", cursor: isPending ? "not-allowed" : "pointer", boxShadow: `0 3px 12px ${sc.color}35`, transition: "all 0.2s" }}>{isPending ? <><Loader2 size={11} className="animate-spin" /> Joining...</> : <><Zap size={11} /> Register</>}</button>) : isLobby ? (<div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "9px", borderRadius: 9, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: "rgba(245,158,11,0.08)", color: "rgba(245,158,11,0.6)", border: "1px solid rgba(245,158,11,0.2)" }}>🔒 Closed</div>) : (<div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "9px", borderRadius: 9, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>Coming Soon</div>)}
            </div>
          </div>
        </div>
      </div>
      {showDetail && (<TournamentDetailModal qt={qt} onClose={() => setShowDetail(false)} onRegister={handleRegister} isRegistering={isPending} registered={registered} />)}
      {showLobby && isLobby && registered && (<LobbyModal qt={qt} onClose={() => setShowLobby(false)} onGameStart={() => setShowLobby(false)} />)}
    </>
  );
}

const DROP_TITLE_CSS = String.raw`@keyframes wordDrop{0%{transform:translateY(-180px);opacity:0}60%{opacity:1}80%{transform:translateY(6px)}90%{transform:translateY(-3px)}100%{transform:translateY(0);opacity:1}} @keyframes screenShake{0%{transform:translate(0,0)}15%{transform:translate(-3px,2px)}30%{transform:translate(3px,-2px)}45%{transform:translate(-2px,1px)}60%{transform:translate(2px,-1px)}75%{transform:translate(-1px,0)}100%{transform:translate(0,0)}} @keyframes shockRing{0%{transform:translate(-50%,-50%) scale(0);opacity:0.6}100%{transform:translate(-50%,-50%) scale(5);opacity:0}} @keyframes dustL{0%{transform:translateX(0) scaleX(1);opacity:0.5}100%{transform:translateX(-50px) scaleX(2);opacity:0}} @keyframes dustR{0%{transform:translateX(0) scaleX(1);opacity:0.5}100%{transform:translateX(50px) scaleX(2);opacity:0}} @keyframes fadeUp{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}} @keyframes lineIn{0%{transform:scaleX(0);opacity:0}100%{transform:scaleX(1);opacity:1}} @keyframes pulse-glow{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}`;

function DropTitle() {
  const [phase, setPhase] = useState<"drop" | "shake" | "settled">("drop");
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => { setPhase("shake"); const el = wrapRef.current; if (el) { el.style.animation = "screenShake 0.35s ease-out"; setTimeout(() => { if (el) el.style.animation = ""; setPhase("settled"); }, 360); } }, 820);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <style>{DROP_TITLE_CSS}</style>
      <div ref={wrapRef} style={{ position: "relative", textAlign: "center", paddingTop: 8 }}>
        {(phase === "shake" || phase === "settled") && <><div style={{ position: "absolute", left: "50%", top: "72%", width: 50, height: 50, borderRadius: "50%", border: "2px solid #a855f7", opacity: 0, animation: "shockRing 0.5s ease-out forwards", pointerEvents: "none" }} /><div style={{ position: "absolute", left: "50%", top: "72%", width: 50, height: 50, borderRadius: "50%", border: "1px solid #a855f7", opacity: 0, animation: "shockRing 0.6s ease-out 0.07s forwards", pointerEvents: "none" }} /><div style={{ position: "absolute", left: "calc(50% - 50px)", top: "70%", width: 30, height: 4, borderRadius: 3, background: "#a855f7", opacity: 0, animation: "dustL 0.4s ease-out 0.04s forwards", pointerEvents: "none" }} /><div style={{ position: "absolute", left: "calc(50% + 20px)", top: "70%", width: 30, height: 4, borderRadius: 3, background: "#a855f7", opacity: 0, animation: "dustR 0.4s ease-out 0.04s forwards", pointerEvents: "none" }} /></>}
        <h1 style={{ fontSize: "clamp(2.2rem,9vw,5rem)", fontWeight: 700, color: "#fff", letterSpacing: "-2px", lineHeight: 0.95, animation: "wordDrop 0.85s cubic-bezier(0.23,1,0.32,1) forwards", willChange: "transform", margin: 0 }}>Tournaments</h1>
        <div style={{ height: 2, width: "min(240px,60%)", margin: "12px auto 0", background: "linear-gradient(90deg,transparent,#a855f7,transparent)", transformOrigin: "center", opacity: 0, animation: phase === "settled" ? "lineIn 0.5s ease-out 0.1s forwards" : "none" }} />
        <p style={{ fontSize: "clamp(11px,3vw,13px)", color: "rgba(255,255,255,0.4)", marginTop: 8, letterSpacing: "0.04em", opacity: 0, animation: phase === "settled" ? "fadeUp 0.4s ease-out 0.2s forwards" : "none", padding: "0 16px" }}>Answer fast. Outlast everyone. Take the prize.</p>
      </div>
    </>
  );
}


function TrophyIllustration() {
  return (
    <div className="hero-trophy" style={{ flexShrink: 0, width: "clamp(0px,36vw,300px)", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 600 520" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: 300 }}>
        <defs>
          <radialGradient id="hg1" cx="50%" cy="60%" r="50%"><stop offset="0%" stopColor="#7c3aed" stopOpacity="0.55"/><stop offset="100%" stopColor="#0a0618" stopOpacity="0"/></radialGradient>
          <radialGradient id="hg2" cx="50%" cy="70%" r="40%"><stop offset="0%" stopColor="#a855f7" stopOpacity="0.35"/><stop offset="100%" stopColor="#0a0618" stopOpacity="0"/></radialGradient>
          <radialGradient id="hcup" cx="35%" cy="25%" r="75%"><stop offset="0%" stopColor="#fde68a"/><stop offset="35%" stopColor="#fbbf24"/><stop offset="70%" stopColor="#d97706"/><stop offset="100%" stopColor="#92400e"/></radialGradient>
          <radialGradient id="hshine" cx="30%" cy="20%" r="60%"><stop offset="0%" stopColor="#ffffff" stopOpacity="0.45"/><stop offset="100%" stopColor="#ffffff" stopOpacity="0"/></radialGradient>
          <radialGradient id="hhandle" cx="30%" cy="30%" r="70%"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#b45309"/></radialGradient>
          <radialGradient id="hplatform" cx="50%" cy="0%" r="80%"><stop offset="0%" stopColor="#a855f7" stopOpacity="0.8"/><stop offset="100%" stopColor="#6d28d9" stopOpacity="0.2"/></radialGradient>
          <radialGradient id="hstar" cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#fef3c7"/><stop offset="60%" stopColor="#fde68a"/><stop offset="100%" stopColor="#fbbf24"/></radialGradient>
          <linearGradient id="hstem" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#b45309"/><stop offset="40%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#92400e"/></linearGradient>
          <linearGradient id="hblack" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#374151"/><stop offset="100%" stopColor="#111827"/></linearGradient>
          <linearGradient id="hwhite" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f9fafb"/><stop offset="100%" stopColor="#d1d5db"/></linearGradient>
          <linearGradient id="hticket" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#dc2626"/><stop offset="100%" stopColor="#991b1b"/></linearGradient>
          <linearGradient id="hpad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1d4ed8"/><stop offset="100%" stopColor="#1e3a8a"/></linearGradient>
          <linearGradient id="hgift" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#4c1d95"/></linearGradient>
          <filter id="hblur"><feGaussianBlur stdDeviation="6"/></filter>
          <filter id="htblur"><feGaussianBlur stdDeviation="2"/></filter>
        </defs>
        <rect width="600" height="520" fill="#0a0618"/>
        <ellipse cx="310" cy="290" rx="200" ry="170" fill="url(#hg1)"/>
        <ellipse cx="310" cy="330" rx="150" ry="110" fill="url(#hg2)"/>
        <ellipse cx="310" cy="428" rx="125" ry="25" fill="#7c3aed" opacity="0.35" filter="url(#hblur)"/>
        <ellipse cx="310" cy="424" rx="80" ry="16" fill="#a855f7" opacity="0.4" filter="url(#htblur)"/>
        <ellipse cx="310" cy="416" rx="104" ry="15" fill="#4c1d95"/>
        <ellipse cx="310" cy="416" rx="104" ry="15" fill="url(#hplatform)" opacity="0.8"/>
        <path d="M206 416 Q206 442 310 442 Q414 442 414 416" fill="#3b0764"/>
        <rect x="206" y="406" width="208" height="18" fill="#3b0764"/>
        <ellipse cx="310" cy="416" rx="104" ry="15" fill="none" stroke="#a855f7" strokeWidth="1.5" opacity="0.6"/>
        <ellipse cx="310" cy="416" rx="86" ry="9" fill="#a855f7" opacity="0.22"/>
        <path d="M284 336 L288 416 L332 416 L336 336 Z" fill="url(#hstem)"/>
        <path d="M291 336 L294 416" stroke="#fde68a" strokeWidth="1.5" opacity="0.3"/>
        <rect x="266" y="396" width="88" height="18" rx="4" fill="#b45309"/>
        <rect x="256" y="408" width="108" height="11" rx="3" fill="#92400e"/>
        <rect x="258" y="409" width="104" height="4" rx="2" fill="#fbbf24" opacity="0.22"/>
        <path d="M206 102 C206 102 200 114 200 136 C200 198 222 258 252 292 C268 310 284 322 310 328 C336 322 352 310 368 292 C398 258 420 198 420 136 C420 114 414 102 414 102 Z" fill="url(#hcup)"/>
        <path d="M218 107 C218 107 215 119 215 139 C215 191 228 244 252 274 C264 288 278 298 310 304" fill="none" stroke="#92400e" strokeWidth="18" strokeOpacity="0.3"/>
        <path d="M206 102 C206 102 200 114 200 136 C200 198 222 258 252 292 C268 310 284 322 310 328 C336 322 352 310 368 292 C398 258 420 198 420 136 C420 114 414 102 414 102 Z" fill="url(#hshine)"/>
        <path d="M204 104 C204 104 220 92 310 92 C400 92 416 104 416 104" fill="none" stroke="#fde68a" strokeWidth="3" strokeLinecap="round"/>
        <path d="M204 104 C204 104 220 97 310 97 C400 97 416 104 416 104" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5"/>
        <path d="M228 112 C230 144 236 196 248 234" fill="none" stroke="#fde68a" strokeWidth="5" strokeLinecap="round" opacity="0.5"/>
        <path d="M234 110 C236 138 241 186 251 222" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.35"/>
        <path d="M204 142 C170 142 148 162 148 192 C148 220 168 246 198 252" fill="none" stroke="url(#hhandle)" strokeWidth="16" strokeLinecap="round"/>
        <path d="M204 142 C172 142 152 160 152 190 C152 216 170 240 198 246" fill="none" stroke="#fde68a" strokeWidth="4" strokeLinecap="round" opacity="0.4"/>
        <path d="M416 142 C450 142 472 162 472 192 C472 220 452 246 422 252" fill="none" stroke="url(#hhandle)" strokeWidth="16" strokeLinecap="round"/>
        <path d="M416 142 C448 142 468 160 468 190 C468 216 450 240 422 246" fill="none" stroke="#fde68a" strokeWidth="4" strokeLinecap="round" opacity="0.4"/>
        <path d="M310 146 L321 178 L356 178 L329 198 L339 230 L310 210 L281 230 L291 198 L264 178 L299 178 Z" fill="url(#hstar)"/>
        <path d="M310 151 L319 178 L346 178 L324 195 L332 222 L310 207 L288 222 L296 195 L274 178 L301 178 Z" fill="#ffffff" opacity="0.22"/>
        <g transform="translate(128,222) rotate(-12)">
          <rect x="-20" y="106" width="40" height="9" rx="4.5" fill="url(#hblack)"/>
          <rect x="-14" y="80" width="28" height="28" rx="3" fill="url(#hblack)"/>
          <rect x="-10" y="64" width="20" height="18" rx="3" fill="url(#hblack)"/>
          <circle cx="0" cy="50" r="14" fill="url(#hblack)"/>
          <circle cx="0" cy="50" r="8" fill="#374151"/>
          <ellipse cx="-4" cy="42" rx="5" ry="4" fill="#ffffff" opacity="0.18"/>
        </g>
        <g transform="translate(176,268) rotate(-5)">
          <rect x="-22" y="98" width="44" height="10" rx="5" fill="url(#hwhite)"/>
          <rect x="-15" y="76" width="30" height="24" rx="3" fill="url(#hwhite)"/>
          <rect x="-11" y="62" width="22" height="16" rx="3" fill="url(#hwhite)"/>
          <circle cx="0" cy="48" r="16" fill="url(#hwhite)"/>
          <circle cx="0" cy="48" r="9" fill="#e5e7eb"/>
          <ellipse cx="-5" cy="40" rx="6" ry="5" fill="#ffffff" opacity="0.65"/>
        </g>
        <g transform="translate(195,352) rotate(-18)">
          <rect x="0" y="0" width="82" height="48" rx="7" fill="url(#hticket)"/>
          <circle cx="0" cy="24" r="8" fill="#0a0618"/>
          <circle cx="82" cy="24" r="8" fill="#0a0618"/>
          <line x1="9" y1="24" x2="73" y2="24" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.4"/>
          <path d="M41 6 L44 16 L55 16 L47 22 L50 32 L41 26 L32 32 L35 22 L27 16 L38 16 Z" fill="#ffffff" opacity="0.88"/>
          <rect x="6" y="4" width="28" height="6" rx="3" fill="#ffffff" opacity="0.14"/>
        </g>
        <g transform="translate(398,294) rotate(10)">
          <path d="M8 18 C-2 18 -10 32 -12 52 C-14 68 -6 82 6 82 C16 82 24 72 32 68 L62 68 C70 72 78 82 88 82 C100 82 108 68 106 52 C104 32 96 18 86 18 Z" fill="url(#hpad)"/>
          <rect x="12" y="30" width="26" height="9" rx="3" fill="#1e40af"/>
          <rect x="15" y="25" width="19" height="20" rx="3" fill="#1e40af"/>
          <circle cx="25" cy="35" r="3.5" fill="#2563eb"/>
          <circle cx="66" cy="26" r="6.5" fill="#7c3aed"/>
          <circle cx="77" cy="37" r="6.5" fill="#16a34a"/>
          <circle cx="55" cy="37" r="6.5" fill="#dc2626"/>
          <circle cx="66" cy="48" r="6.5" fill="#d97706"/>
          <rect x="4" y="10" width="32" height="11" rx="5" fill="#1e40af"/>
          <rect x="58" y="10" width="32" height="11" rx="5" fill="#1e40af"/>
          <circle cx="20" cy="56" r="9" fill="#1e3a8a"/>
          <circle cx="20" cy="56" r="5" fill="#2563eb"/>
          <circle cx="74" cy="56" r="9" fill="#1e3a8a"/>
          <circle cx="74" cy="56" r="5" fill="#2563eb"/>
          <path d="M14 20 C18 16 32 15 42 17" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" opacity="0.38"/>
        </g>
        <g transform="translate(430,358)">
          <rect x="0" y="18" width="66" height="56" rx="5" fill="url(#hgift)"/>
          <rect x="-4" y="11" width="74" height="16" rx="4" fill="#6d28d9"/>
          <rect x="27" y="11" width="12" height="63" rx="2" fill="#fbbf24" opacity="0.9"/>
          <rect x="0" y="18" width="66" height="10" rx="2" fill="#fbbf24" opacity="0.9"/>
          <path d="M33 14 C16 2 8 -2 14 8 C18 14 27 12 33 14" fill="#fde68a"/>
          <path d="M33 14 C50 2 58 -2 52 8 C48 14 39 12 33 14" fill="#fde68a"/>
          <circle cx="33" cy="14" r="5" fill="#fbbf24"/>
          <rect x="6" y="22" width="16" height="5" rx="2" fill="#ffffff" opacity="0.18"/>
        </g>
        <g transform="translate(420,42)">
          <circle cx="64" cy="64" r="62" fill="#1e1b4b"/>
          <circle cx="64" cy="64" r="62" fill="none" stroke="#4f46e5" strokeWidth="3"/>
          <circle cx="64" cy="64" r="57" fill="none" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="5,4"/>
          <circle cx="64" cy="64" r="50" fill="#312e81"/>
          <text x="64" y="58" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="800" letterSpacing="0.5">MILLION</text>
          <text x="64" y="74" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="800" letterSpacing="0.5">AIRE</text>
          <text x="64" y="90" textAnchor="middle" fill="#c4b5fd" fontSize="7" letterSpacing="1.5">WHO WANTS TO BE</text>
          <line x1="24" y1="64" x2="42" y2="64" stroke="#a855f7" strokeWidth="1.5"/>
          <line x1="86" y1="64" x2="104" y2="64" stroke="#a855f7" strokeWidth="1.5"/>
          <circle cx="64" cy="48" r="3" fill="#fbbf24"/>
        </g>
        <rect x="222" y="65" width="9" height="9" rx="1" fill="#f97316" transform="rotate(45 226 69)"/>
        <rect x="478" y="118" width="8" height="8" rx="1" fill="#f97316" transform="rotate(30 482 122)"/>
        <rect x="350" y="72" width="8" height="8" rx="1" fill="#3b82f6" transform="rotate(20 354 76)"/>
        <rect x="532" y="88" width="7" height="7" rx="1" fill="#3b82f6" transform="rotate(50 535 91)"/>
        <circle cx="248" cy="90" r="4.5" fill="#fbbf24" opacity="0.85"/>
        <circle cx="510" cy="140" r="4" fill="#fbbf24" opacity="0.75"/>
        <circle cx="388" cy="65" r="4" fill="#a855f7" opacity="0.8"/>
        <circle cx="540" cy="165" r="4" fill="#ef4444" opacity="0.7"/>
        <circle cx="196" cy="138" r="3.5" fill="#4ade80" opacity="0.6"/>
        <path d="M262 70 C266 78 260 86 264 94" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <path d="M520 108 C524 116 518 124 522 132" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <path d="M372 60 C376 68 370 76 374 84" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <rect x="184" y="198" width="7" height="7" fill="#ef4444" opacity="0.6" transform="rotate(25 187 201)"/>
        <rect x="528" y="238" width="6" height="6" fill="#4ade80" opacity="0.55" transform="rotate(40 531 241)"/>
        <path d="M368 88 L370 80 L372 88 L380 90 L372 92 L370 100 L368 92 L360 90 Z" fill="#fde68a" opacity="0.7"/>
        <path d="M206 176 L208 171 L210 176 L215 177 L210 178 L208 183 L206 178 L201 177 Z" fill="#60a5fa" opacity="0.5"/>
        <path d="M544 256 L546 251 L548 256 L553 257 L548 258 L546 263 L544 258 L539 257 Z" fill="#fbbf24" opacity="0.6"/>
      </svg>
    </div>
  );
}

const TOURNAMENTS_CSS = `@keyframes floatUp { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(-80px);opacity:0} }`;

const Tournaments = () => {
  const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "completed">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPrize, setFilterPrize] = useState("all");
  const queryClient = useQueryClient();
  const { data: quizTournaments = [], isError, isLoading, refetch } = useQuery({ queryKey: ["quiz-tournaments-public"], queryFn: getQuizTournamentsApi, staleTime: 5_000, refetchInterval: 15_000, retry: 1 });
  const featuredT = quizTournaments.find(qt => qt.status === "active" || qt.status === "registration" || qt.status === "lobby") ?? quizTournaments[0];
  const filtered = quizTournaments.filter(qt => { const matchTab = activeTab === "live" ? qt.status === "active" : activeTab === "completed" ? qt.status === "completed" : ["lobby", "draft", "registration"].includes(qt.status); const matchSearch = qt.title.toLowerCase().includes(searchQuery.toLowerCase()); const matchPrize = filterPrize === "high" ? qt.prize_pool >= 100_000 : filterPrize === "low" ? qt.prize_pool < 100_000 : true; return matchTab && matchSearch && matchPrize; });
  const totalPlayers = quizTournaments.reduce((s, t) => s + t.player_count, 0);
  const totalPrize = quizTournaments.reduce((s, t) => s + t.prize_pool, 0);
  const liveCount = quizTournaments.filter(t => t.status === "active").length;
  function handleRegistered(id: string) { queryClient.setQueryData<QuizTournament[]>(["quiz-tournaments-public"], old => (old ?? []).map(t => t.id === id ? { ...t, player_count: t.player_count + 1, user_registered: true } : t)); }

  // ── Sponsor detection ──────────────────────────────────────────────────────
  const sponsoredCollab = quizTournaments.find(t => t.sponsor_mode === "collab" && t.sponsor);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: 64, overflowX: "hidden" }}>
      <SEO
        title="Tournaments – Compete for Big Prizes"
        description="Join live and upcoming tournaments on Playza. Compete in quiz, chess, arcade and sponsored tournaments with prize pools up to ZA100,000."
        keywords="playza tournaments, gaming tournaments Nigeria, quiz tournament, chess tournament, prize pool games"
        url="/tournaments"
      />
      <style>{TOURNAMENTS_CSS}</style>
      <div style={{ position: "relative", background: "#07041a", borderRadius: "0 0 20px 20px", overflow: "hidden", padding: "clamp(28px,6vw,48px) clamp(16px,4vw,28px) clamp(24px,5vw,36px)", marginBottom: 20 }}>

        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", width: "clamp(200px,60vw,380px)", height: "clamp(200px,60vw,380px)", borderRadius: "50%", background: "#3b0764", opacity: 0.5, top: -100, left: -80, filter: "blur(80px)" }} />
          <div style={{ position: "absolute", width: "clamp(140px,40vw,280px)", height: "clamp(140px,40vw,280px)", borderRadius: "50%", background: "#1e3a5f", opacity: 0.45, top: -50, right: 0, filter: "blur(70px)" }} />
          <div style={{ position: "absolute", width: "clamp(100px,30vw,200px)", height: "clamp(100px,30vw,200px)", borderRadius: "50%", background: "#4c1d95", opacity: 0.3, bottom: -40, left: "40%", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: sponsoredCollab?.sponsor ? 14 : 20, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 20, padding: "4px 12px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", display: "block", animation: "pulse-glow 1.4s ease-in-out infinite" }} />
            <span style={{ fontSize: "clamp(8px,2.5vw,10px)", fontWeight: 600, color: "#c084fc", letterSpacing: "0.15em", textTransform: "uppercase" }}>Playza · Competitive</span>
          </div>
          {liveCount > 0 && (<div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 20, padding: "4px 12px" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "block", animation: "pulse-glow 0.9s ease-in-out infinite" }} /><span style={{ fontSize: "clamp(8px,2.5vw,10px)", fontWeight: 600, color: "#f87171", letterSpacing: "0.1em", textTransform: "uppercase" }}>{liveCount} Live Now</span></div>)}
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "clamp(20px,5vw,48px)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {sponsoredCollab?.sponsor && (
              <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(10px,3vw,20px)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "clamp(10px,2.5vw,16px) clamp(12px,3vw,20px)", flexWrap: "wrap" }}>
                <img src="/logo.png" alt="Playza" style={{ height: "clamp(24px,5vw,36px)", width: "auto", objectFit: "contain" }} />
                <span style={{ fontSize: "clamp(14px,3vw,22px)", fontWeight: 300, color: "rgba(255,255,255,0.35)", lineHeight: 1 }}>×</span>
                {sponsoredCollab.sponsor.logo_url
                  ? <img src={sponsoredCollab.sponsor.logo_url} alt={sponsoredCollab.sponsor.name} style={{ height: "clamp(24px,5vw,36px)", width: "auto", maxWidth: "clamp(80px,18vw,140px)", objectFit: "contain" }} />
                  : <div style={{ height: "clamp(24px,5vw,36px)", width: "clamp(24px,5vw,36px)", borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "clamp(10px,2.5vw,16px)", fontWeight: 900, color: "#fff" }}>{sponsoredCollab.sponsor.name[0]}</span>
                    </div>}
                <span style={{ fontSize: "clamp(12px,3vw,20px)", fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>{sponsoredCollab.sponsor.name}</span>
              </div>
            )}

            <div style={{ marginBottom: 20 }}><DropTitle /></div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {[
                { icon: <Trophy size={14} style={{ color: "#c084fc" }} />, val: `${totalPrize.toLocaleString()} ZA`, lbl: "Total prize pool", bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.25)" },
                { icon: <Users size={14} style={{ color: "#4ade80" }} />, val: totalPlayers.toLocaleString(), lbl: "Players competing", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" },
                { icon: <Zap size={14} style={{ color: "#fbbf24" }} />, val: `${quizTournaments.length}`, lbl: "Tournaments", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: "8px 12px", flex: "1 1 100px", minWidth: 0 }}>
                  <div style={{ flexShrink: 0 }}>{s.icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "clamp(12px,1.8vw,15px)", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.val}</p>
                    <p style={{ fontSize: "clamp(8px,1vw,10px)", color: "rgba(255,255,255,0.35)", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{s.lbl}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>5 Rounds</span>
              <div style={{ display: "flex", gap: 3, flex: 1 }}>
                {["#22c55e","#3b82f6","#f97316","#ef4444","#a855f7"].map((c, i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: c, opacity: 0.7 }} />
                ))}
              </div>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>Final Showdown</span>
            </div>
          </div>
          <TrophyIllustration />

      <div style={{ padding: "0 clamp(8px,3vw,16px)", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", msOverflowStyle: "none", scrollbarWidth: "none" } as any}>
            <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--border)", minWidth: "fit-content" }}>
              {([{ id: "live", label: "🔴 Live Now" }, { id: "upcoming", label: "🟢 Upcoming" }, { id: "completed", label: "⚫ Completed" }] as const).map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "6px 14px 10px", fontSize: "clamp(9px,2.5vw,11px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", transition: "all 0.2s", background: "none", cursor: "pointer", border: "none", borderBottomStyle: "solid", borderBottomWidth: 2, borderBottomColor: activeTab === tab.id ? "var(--primary)" : "transparent", color: activeTab === tab.id ? "var(--primary)" : "var(--muted-foreground)", marginBottom: -2 }}>{tab.label}</button>))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
              <input type="text" placeholder="Search tournaments..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: "100%", paddingLeft: 30, paddingRight: searchQuery ? 30 : 10, paddingTop: 9, paddingBottom: 9, borderRadius: 10, fontSize: "clamp(11px,3vw,13px)", background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)", outline: "none", boxSizing: "border-box" }} />
              {searchQuery && (<button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "flex", padding: 0 }}><X size={13} /></button>)}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none" style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)", whiteSpace: "nowrap", flexShrink: 0, fontSize: "clamp(9px,2.5vw,12px)" }}>
                <span className="hidden sm:inline">{PRIZE_OPTIONS.find(o => o.value === filterPrize)?.label}</span>
                <span className="sm:hidden">Filter</span>
                <ChevronDown size={10} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44 rounded-xl p-1" align="end" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                {PRIZE_OPTIONS.map(opt => (<DropdownMenuItem key={opt.value} onClick={() => setFilterPrize(opt.value)} className="text-xs font-bold uppercase tracking-wider cursor-pointer py-2 px-3 rounded-lg outline-none transition-all" style={filterPrize === opt.value ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--muted-foreground)" }}>{opt.label}</DropdownMenuItem>))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%,260px), 1fr))", gap: 12 }}>
          {isLoading ? (<div style={{ gridColumn: "1/-1", padding: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, border: "2px dashed var(--border)", borderRadius: 14 }}><div style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid var(--primary)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /><p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Loading...</p></div>) : isError ? (<div style={{ gridColumn: "1/-1", padding: "60px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", border: "2px dashed var(--border)", borderRadius: 14 }}><Trophy size={36} style={{ opacity: 0.2, color: "var(--foreground)" }} /><p style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>Could Not Load Tournaments</p><p style={{ fontSize: 11, color: "var(--muted-foreground)", margin: 0 }}>Check your connection and try again</p><button onClick={() => refetch()} style={{ padding: "10px 20px", borderRadius: 10, background: "var(--primary)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Retry</button></div>) : filtered.length > 0 ? (filtered.map(qt => <TCard key={qt.id} qt={qt} featured={featuredT?.id === qt.id} onRegistered={handleRegistered} />)) : (<div style={{ gridColumn: "1/-1", padding: "60px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", border: "2px dashed var(--border)", borderRadius: 14 }}><Trophy size={36} style={{ opacity: 0.2, color: "var(--foreground)" }} /><p style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>No Tournaments Found</p><p style={{ fontSize: 11, color: "var(--muted-foreground)", margin: 0 }}>Try adjusting your filters or check back later</p></div>)}
        </div>
      </div>
    </div>
  );
};

export default Tournaments;
