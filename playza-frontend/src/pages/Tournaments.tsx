import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuizTournamentsApi, joinQuizTournamentApi, getLobbyPlayersApi, type QuizTournament, type PrizeTier } from "@/api/quiz.api";
import { Search, Trophy, X, ChevronDown, Zap, Eye, Brain, CheckCircle, Loader2, Info, Calendar, Clock, Shield, Send, MessageCircle } from "lucide-react";
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
      <style>{`@keyframes floatUp { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(-80px);opacity:0} }`}</style>
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
      <style>{`@keyframes fadeInBackdrop{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}} @keyframes pulse-glow{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}`}</style>
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
  function handleRegistered(id: string) { queryClient.setQueryData<QuizTournament[]>(["quiz-tournaments-public"], old => (old ?? []).map(t => t.id === id ? { ...t, player_count: t.player_count + 1, user_registered: true } : t)); }

  // ── Sponsor detection ──────────────────────────────────────────────────────
  const sponsoredCollab = quizTournaments.find(t => t.sponsor_mode === "collab" && t.sponsor);
  const sponsoredBanners = quizTournaments.filter(t => t.sponsor_mode === "banner" && t.sponsor_banner_url);

  // ── Hero slides: default Playza slide always first, sponsor slides after ───
  const defaultHeroSlide = (
    <div style={{ position: "relative", background: "#0a0618", padding: "clamp(24px,5vw,40px) clamp(16px,4vw,28px) clamp(20px,4vw,32px)" }}>
      {/* Orbs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: "clamp(200px,60vw,380px)", height: "clamp(200px,60vw,380px)", borderRadius: "50%", background: "#3b0764", opacity: 0.5, top: -100, left: -80, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", width: "clamp(140px,40vw,280px)", height: "clamp(140px,40vw,280px)", borderRadius: "50%", background: "#1e3a5f", opacity: 0.45, top: -50, right: 0, filter: "blur(70px)" }} />
        <div style={{ position: "absolute", width: "clamp(100px,30vw,200px)", height: "clamp(100px,30vw,200px)", borderRadius: "50%", background: "#4c1d95", opacity: 0.3, bottom: -40, left: "40%", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
      </div>
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", gap: "clamp(16px,4vw,32px)", alignItems: "center" }}>
        {/* Left content */}
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 20, padding: "4px 12px", marginBottom: 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", display: "block", animation: "pulse-glow 1.4s ease-in-out infinite" }} />
            <span style={{ fontSize: "clamp(8px,2.5vw,10px)", fontWeight: 600, color: "#c084fc", letterSpacing: "0.15em", textTransform: "uppercase" }}>Playza · Competitive</span>
          </div>
          <h1 style={{ fontSize: "clamp(2rem,8vw,3.5rem)", fontWeight: 700, color: "#fff", letterSpacing: "-1.5px", lineHeight: 0.95, margin: "0 0 10px" }}>Tournaments</h1>
          <p style={{ fontSize: "clamp(13px,3.5vw,18px)", color: "rgba(255,255,255,0.65)", margin: "0 0 16px" }}>
            Compete. Play. <span style={{ color: "#fbbf24", fontWeight: 700 }}>Win.</span>
          </p>
          {/* Category icons */}
          <div style={{ display: "flex", gap: "clamp(12px,3vw,20px)", marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { icon: "💬", label: "Quizzes" },
              { icon: "♟️", label: "Chess" },
              { icon: "🏆", label: "Sponsored" },
              { icon: "🎮", label: "& More" },
            ].map(c => (
              <div key={c.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: "clamp(16px,4vw,22px)" }}>{c.icon}</span>
                <span style={{ fontSize: "clamp(10px,2.5vw,13px)", fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{c.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.3)", fontSize: "clamp(11px,2.5vw,13px)", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
            <span style={{ fontSize: "clamp(13px,3vw,16px)" }}>🌐</span>
            One platform. Every game. Real rewards.
          </div>
        </div>
        {/* Trophy visual */}
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", width: "clamp(120px,28vw,200px)", height: "clamp(120px,28vw,200px)" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.3), transparent 70%)" }} />
          <span style={{ fontSize: "clamp(72px,18vw,128px)", lineHeight: 1, position: "relative", zIndex: 1 }}>🏆</span>
          <span style={{ fontSize: "clamp(28px,7vw,48px)", position: "absolute", bottom: "10%", left: "5%" }}>♟️</span>
          <span style={{ fontSize: "clamp(28px,7vw,48px)", position: "absolute", bottom: "10%", right: "5%" }}>🎮</span>
          <div style={{ position: "absolute", top: "6%", right: "6%", width: "clamp(36px,9vw,56px)", height: "clamp(36px,9vw,56px)", borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "clamp(14px,3.5vw,22px)" }}>👑</span>
          </div>
        </div>
      </div>
      {/* Stats row */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
        {[
          { icon: "🏆", val: `${totalPrize > 0 ? totalPrize.toLocaleString() : "1,024,509"} ZA`, lbl: "Global ZA Paid Out",    bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.25)" },
          { icon: "👥", val: totalPlayers > 0 ? totalPlayers.toLocaleString() : "12,450",       lbl: "Total Participation",  bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.2)"  },
          { icon: "⚡", val: quizTournaments.length > 0 ? quizTournaments.length.toLocaleString() : "1,320", lbl: "Tournaments Played", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "10px 14px", flex: "1 1 120px", minWidth: 0 }}>
            <span style={{ fontSize: "clamp(18px,4vw,24px)", flexShrink: 0 }}>{s.icon}</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "clamp(13px,3.5vw,18px)", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.val}</p>
              <p style={{ fontSize: "clamp(8px,2vw,10px)", color: "rgba(255,255,255,0.35)", margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>{s.lbl}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const heroSlides: { key: string; content: React.ReactNode }[] = [
    { key: "default", content: defaultHeroSlide },
    ...sponsoredBanners.map(t => ({
      key: t.id,
      content: (
        <div style={{ aspectRatio: "16/7", backgroundImage: `url(${t.sponsor_banner_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      ),
    })),
    ...(sponsoredCollab?.sponsor ? [{
      key: "collab",
      content: (
        <div style={{ aspectRatio: "16/7", background: "#07041a", display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(12px,4vw,28px)", flexWrap: "wrap", padding: "clamp(20px,5vw,40px)" }}>
          <img src="/logo.png" alt="Playza" style={{ height: "clamp(36px,10vw,72px)", width: "auto", objectFit: "contain" }} />
          <span style={{ fontSize: "clamp(20px,6vw,44px)", fontWeight: 300, color: "rgba(255,255,255,0.35)", lineHeight: 1 }}>×</span>
          {sponsoredCollab.sponsor!.logo_url
            ? <img src={sponsoredCollab.sponsor!.logo_url} alt={sponsoredCollab.sponsor!.name} style={{ height: "clamp(36px,10vw,72px)", width: "auto", maxWidth: "clamp(120px,30vw,260px)", objectFit: "contain" }} />
            : <div style={{ height: "clamp(36px,10vw,72px)", width: "clamp(36px,10vw,72px)", borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "clamp(16px,4vw,28px)", fontWeight: 900, color: "#fff" }}>{sponsoredCollab.sponsor!.name[0]}</span>
              </div>}
          <span style={{ fontSize: "clamp(18px,5vw,40px)", fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>{sponsoredCollab.sponsor!.name}</span>
        </div>
      ),
    }] : []),
  ];

  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = setInterval(() => setHeroIndex(i => (i + 1) % heroSlides.length), 6000);
    return () => clearInterval(id);
  }, [heroSlides.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: 64, overflowX: "hidden" }}>
      <SEO
        title="Tournaments – Compete for Big Prizes"
        description="Join live and upcoming tournaments on Playza. Compete in quiz, chess, arcade and sponsored tournaments with prize pools up to ZA100,000."
        keywords="playza tournaments, gaming tournaments Nigeria, quiz tournament, chess tournament, prize pool games"
        url="/tournaments"
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse-glow{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}`}</style>

      {/* ── Hero carousel — default Playza slide + sponsor banner/collab slides ── */}
      <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", marginBottom: 20, background: "#0a0618" }}>
        {heroSlides.map((slide, i) => (
          <div key={slide.key} style={{ position: i === 0 ? "relative" : "absolute", inset: 0, opacity: i === heroIndex ? 1 : 0, transition: "opacity 1s ease-in-out", pointerEvents: i === heroIndex ? "auto" : "none" }}>
            {slide.content}
          </div>
        ))}
        {heroSlides.length > 1 && (
          <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 5 }}>
            {heroSlides.map((_, i) => (
              <span key={i} onClick={() => setHeroIndex(i)} style={{ width: i === heroIndex ? 18 : 6, height: 6, borderRadius: 3, background: i === heroIndex ? "#a855f7" : "rgba(255,255,255,0.4)", transition: "all 0.3s ease", cursor: "pointer" }} />
            ))}
          </div>
        )}
      </div>

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
