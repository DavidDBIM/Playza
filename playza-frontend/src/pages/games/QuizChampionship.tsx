import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQuizTournamentApi, joinQuizTournamentApi, type QuizTournament } from "@/api/quiz.api";
import { useQuizSocket, type LeaderboardEntry } from "@/hooks/quiz/useQuizSocket";
import { useAuth } from "@/context/auth";
import { useToast } from "@/context/toast";

const ROUNDS = [
  { name: "Warm Up",        emoji: "🟢", color: "#22c55e", secs: 45 },
  { name: "Rising",         emoji: "🔵", color: "#3b82f6", secs: 35 },
  { name: "Heat Up",        emoji: "🟠", color: "#f97316", secs: 30 },
  { name: "Danger Zone",    emoji: "🔴", color: "#ef4444", secs: 25 },
  { name: "Final Showdown", emoji: "👑", color: "#a855f7", secs: 20 },
];

const OPTS = ["A", "B", "C", "D"] as const;
const OPT_IDLE   = ["border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/15 hover:border-sky-400","border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/15 hover:border-violet-400","border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-400","border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/15 hover:border-rose-400"];
const OPT_LETTER = ["bg-sky-500","bg-violet-500","bg-amber-500","bg-rose-500"];

function TimerArc({ ms, totalMs, round }: { ms: number; totalMs: number; round: number }) {
  const pct  = totalMs > 0 ? Math.max(0, ms / totalMs) : 0;
  const r    = 40;
  const circ = 2 * Math.PI * r;
  const col  = ROUNDS[(round - 1)]?.color ?? "#a855f7";
  const secs = Math.ceil(ms / 1000);
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: 88, height: 88 }}>
      <svg className="-rotate-90 absolute inset-0" width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={col} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`}
          style={{ transition: "stroke-dasharray 0.1s linear", filter: `drop-shadow(0 0 8px ${col})` }} />
      </svg>
      <div className={`flex flex-col items-center z-10 ${secs <= 5 ? "animate-pulse" : ""}`}>
        <span className="text-3xl font-black text-white leading-none tabular-nums">{secs}</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">sec</span>
      </div>
    </div>
  );
}

function LeaderboardPanel({ entries, myId }: { entries: LeaderboardEntry[]; myId?: string }) {
  const alive   = entries.filter(e => e.status === "alive").length;
  const myEntry = entries.find(e => e.user_id === myId);
  const myRank  = myEntry?.rank;
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col">
      <div className="px-3 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">🏆 Live Board</span>
        <span className="text-[9px] font-bold text-green-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          {alive} alive
        </span>
      </div>
      <div className="overflow-y-auto divide-y divide-white/[0.04]" style={{ maxHeight: 320 }}>
        {entries.slice(0, 25).map((e, i) => {
          const isMe    = e.user_id === myId;
          const isAlive = e.status === "alive";
          return (
            <div key={i} className={`flex items-center gap-2 px-3 py-2 ${isMe ? "bg-purple-500/10 border-l-2 border-purple-500" : ""} ${!isAlive ? "opacity-30" : ""}`}>
              <span className="text-[10px] font-black w-4 text-center text-white/20">
                {e.rank === 1 ? "👑" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : e.rank}
              </span>
              <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[9px] font-black text-white shrink-0">
                {e.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-bold truncate ${isMe ? "text-purple-300" : "text-white/60"}`}>{isMe ? "You" : e.username}</p>
                <p className="text-[8px] text-white/20">{e.correct_answers}✓</p>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.status === "winner" ? "bg-yellow-400" : isAlive ? "bg-green-400" : "bg-red-500/50"}`} />
            </div>
          );
        })}
      </div>
      {myRank && myRank > 25 && myEntry && (
        <div className="border-t border-white/[0.06] px-3 py-2 bg-purple-500/10 flex items-center gap-2">
          <span className="text-[9px] font-black text-purple-300 w-4 text-center">#{myRank}</span>
          <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center text-[9px] font-black text-purple-300">{myEntry.username?.[0]?.toUpperCase()}</div>
          <p className="text-[10px] font-bold text-purple-300 flex-1">You</p>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>
      )}
    </div>
  );
}

export default function QuizChampionship() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast    = useToast();
  const { user } = useAuth();

  const [joinedState, setJoinedState] = useState(false);
  const [countdown, setCountdown]     = useState<string | null>(null);
  const prevPhase                     = useRef<string>("");

  const { data: tournament, isLoading } = useQuery({
    queryKey: ["quiz-tournament", id],
    queryFn:  () => getQuizTournamentApi(id!),
    enabled:  !!id,
    refetchInterval: (query: unknown) => {
      const q = query as { state?: { data?: QuizTournament } };
      const t = q?.state?.data;
      const isJoined = joinedState || !!t?.user_registered;
      return isJoined ? false : 4000;
    },
  });

  const joined = joinedState || !!tournament?.user_registered;

  useEffect(() => {
    if (!tournament?.scheduled_at) return;
    const tick = () => {
      const diff = new Date(tournament.scheduled_at!).getTime() - Date.now();
      if (diff <= 0) { setCountdown("Starting now!"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0)      setCountdown(`${d}d ${h}h ${m}m`);
      else if (h > 0) setCountdown(`${h}h ${m}m ${s}s`);
      else            setCountdown(`${m}m ${s}s`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [tournament?.scheduled_at]);

  const { mutate: join, isPending: joining } = useMutation({
    mutationFn: () => joinQuizTournamentApi(id!),
    onSuccess: (data) => {
      toast.success(data.data?.already_joined ? "You're already registered!" : (data.message ?? "Registered! We'll notify you before game day."));
      setJoinedState(true);
    },
    onError: (error: unknown) => {
      const err = error as Error & { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to join.");
    },
  });

  const {
    connected, phase, playerCount, currentQuestion,
    selectedOption, answerLocked, revealData,
    leaderboard, roundSummary, gameOver, elimMessage,
    timeLeftMs, submitAnswer,
  } = useQuizSocket(joined ? (id ?? null) : null);

  useEffect(() => {
    if (phase !== prevPhase.current) prevPhase.current = phase;
  }, [phase]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
    </div>
  );

  if (!tournament) return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <p className="text-white/40 font-bold">Tournament not found</p>
    </div>
  );

  const round     = currentQuestion?.round ?? 1;
  const roundMeta = ROUNDS[(round - 1)] ?? ROUNDS[4];
  const canJoin   = (tournament.status === "registration" || tournament.status === "lobby") && !tournament.user_registered;

  if (joined && phase === "idle" && (tournament.status === "active" || tournament.status === "lobby")) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-white/50 text-sm font-bold">Connecting to game...</p>
          <p className="text-white/20 text-xs">{connected ? "Connected — syncing game state" : "Establishing connection..."}</p>
        </div>
      </div>
    );
  }

  // ── PRE-JOIN ────────────────────────────────────────────────────────────────
  if (!joined || phase === "idle") {
    return (
      <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center p-4 relative overflow-hidden pb-28">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <button onClick={() => navigate("/tournaments")} className="absolute top-5 left-4 text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors z-10">← Back</button>
        <div className="w-full max-w-sm relative z-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center shadow-2xl shadow-purple-500/30 text-4xl">👑</div>
            </div>
          </div>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full mb-3">
              <span className={`w-1.5 h-1.5 rounded-full ${tournament.status === "registration" ? "bg-green-400 animate-pulse" : tournament.status === "lobby" ? "bg-blue-400 animate-pulse" : tournament.status === "active" ? "bg-red-400 animate-pulse" : "bg-yellow-400"}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                {tournament.status === "registration" ? "Registration Open" : tournament.status === "lobby" ? "Starting Soon" : tournament.status === "active" ? "In Progress" : tournament.status === "cancelled" ? "Cancelled" : "Upcoming"}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mb-1">{tournament.title}</h1>
            {tournament.description && <p className="text-white/40 text-sm">{tournament.description}</p>}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: "Players", value: (playerCount || tournament.player_count || 0).toLocaleString(), icon: "👥" },
              { label: "Entry",   value: tournament.entry_fee > 0 ? `${tournament.entry_fee} ZA` : "FREE", icon: "💎" },
              { label: "Prize",   value: tournament.prize_pool > 0 ? `${tournament.prize_pool.toLocaleString()} ZA` : "Growing", icon: "🏆" },
            ].map((s, i) => (
              <div key={i} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3 text-center">
                <div className="text-lg mb-1">{s.icon}</div>
                <div className="text-sm font-black text-white">{s.value}</div>
                <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{s.label}</div>
              </div>
            ))}
          </div>
          {countdown && tournament.scheduled_at && tournament.status !== "active" && tournament.status !== "cancelled" && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 mb-5 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-300/60 mb-1">{tournament.status === "registration" ? "Game Starts In" : "Scheduled For"}</p>
              <p className="text-3xl font-black text-white tabular-nums">{countdown}</p>
              <p className="text-[10px] text-white/30 mt-1">
                {new Date(tournament.scheduled_at).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          )}
          <div className="flex gap-1.5 mb-5 justify-center">
            {ROUNDS.map((r, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="h-1.5 rounded-full" style={{ width: 48, background: r.color, boxShadow: `0 0 8px ${r.color}60` }} />
                <span className="text-[8px] text-white/25 font-bold uppercase tracking-widest hidden sm:block">{r.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 mb-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">5 Rounds of Elimination</p>
            <div className="space-y-2">
              {ROUNDS.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm">{r.emoji}</span>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-white/60">Round {i + 1} — {r.name}</span>
                    <span className="text-[10px] text-white/25 font-bold">{r.secs}s / Q</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {tournament.user_registered ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                <span className="text-green-400 font-black">✓ Registered</span>
              </div>
              <p className="text-center text-[10px] text-white/30">
                {tournament.status === "active" ? "Game is live — connecting you now..." : tournament.status === "lobby" ? "Game starting soon — stay on this page" : "You will be notified 24h and 2h before game day"}
              </p>
            </div>
          ) : tournament.status === "cancelled" ? (
            <div className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <span className="text-red-400 font-black text-sm">🚫 Tournament Cancelled</span>
            </div>
          ) : (
            <>
              <button onClick={() => join()} disabled={joining || !canJoin}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group text-white"
                style={{ background: canJoin ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "#1a1a2e" }}>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  {joining ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Joining...</> :
                   !canJoin ? (tournament.status === "active" ? "Game In Progress" : "Not Open Yet") :
                   tournament.entry_fee > 0 ? <>⚡ Register — Pay {tournament.entry_fee} ZA</> : <>⚡ Register Free</>}
                </span>
              </button>
              {tournament.entry_fee > 0 && canJoin && (
                <p className="text-center text-[10px] text-white/20 mt-2">Entry fee added to prize pool · Reminder sent before game day</p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── LOBBY ───────────────────────────────────────────────────────────────────
  if (phase === "lobby" || phase === "starting") {
    return (
      <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center p-4 relative overflow-hidden pb-28">
        <button onClick={() => navigate("/tournaments")} className="absolute top-5 left-4 text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors z-10">← Back</button>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-white/20 rounded-full animate-ping"
              style={{ left: `${10 + i * 12}%`, top: `${15 + (i % 4) * 20}%`, animationDelay: `${i * 0.35}s`, animationDuration: "2s" }} />
          ))}
        </div>
        <div className="relative z-10 text-center w-full max-w-sm">
          {phase === "starting" ? (
            <><div className="text-6xl mb-4 animate-bounce">🚀</div>
            <h2 className="text-3xl font-black text-white mb-2">Get Ready!</h2>
            <p className="text-white/40 text-sm mb-8">First question incoming...</p></>
          ) : (
            <>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping" />
                <div className="relative w-full h-full rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-4xl">⏳</div>
              </div>
              <h2 className="text-3xl font-black text-white mb-1">Lobby</h2>
              <p className="text-white/40 text-sm mb-3">Waiting for admin to start the game</p>
              {countdown && tournament.scheduled_at && (
                <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-sm font-black text-purple-300 tabular-nums">{countdown}</span>
                </div>
              )}
            </>
          )}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6 mb-6">
            <div className="text-5xl font-black text-white mb-1 tabular-nums">{playerCount}</div>
            <div className="text-white/30 text-xs font-bold uppercase tracking-widest">Players Ready</div>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold mb-6 ${connected ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
            {connected ? "Connected — Waiting for game start" : "Reconnecting..."}
          </div>
          {leaderboard.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Players in Lobby</p>
              <div className="flex flex-wrap gap-2">
                {leaderboard.slice(0, 12).map((e, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1">
                    <div className="w-4 h-4 rounded-full bg-purple-500/30 flex items-center justify-center text-[9px] font-black text-purple-300">{e.username[0]?.toUpperCase()}</div>
                    <span className="text-[10px] text-white/50 font-bold">{e.username}</span>
                  </div>
                ))}
                {playerCount > 12 && <span className="text-[10px] text-white/30 font-bold flex items-center">+{playerCount - 12} more</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── CANCELLED ───────────────────────────────────────────────────────────────
  if (phase === "cancelled") {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4 pb-28">
        <div className="w-full max-w-sm text-center">
          <div className="text-7xl mb-4">🚫</div>
          <h2 className="text-3xl font-black text-white mb-2">Tournament Cancelled</h2>
          <p className="text-white/40 text-sm mb-6">{elimMessage || "This tournament has been cancelled."}</p>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 mb-6">
            <p className="text-amber-400 text-xs font-bold">If you paid an entry fee, your ZA tokens have been refunded to your wallet.</p>
          </div>
          <button onClick={() => navigate("/tournaments")} className="w-full py-3.5 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white font-bold text-sm">Back to Tournaments</button>
        </div>
      </div>
    );
  }

  // ── ELIMINATED ──────────────────────────────────────────────────────────────
  if (phase === "eliminated") {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4 pb-28">
        <div className="w-full max-w-sm text-center">
          <div className="text-7xl mb-4">💀</div>
          <h2 className="text-3xl font-black text-white mb-2">Eliminated!</h2>
          <p className="text-white/40 text-sm mb-8">{elimMessage || "Wrong answer. Better luck next time!"}</p>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 mb-4 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Still Fighting — {leaderboard.filter(e => e.status === "alive").length} players</p>
            {leaderboard.filter(e => e.status === "alive").slice(0, 5).map((e, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0">
                <span className="text-xs text-white/20 w-4">#{e.rank}</span>
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-[10px] font-black text-green-400">{e.username[0]?.toUpperCase()}</div>
                <span className="text-xs font-bold text-white/60 flex-1">{e.username}</span>
                <span className="text-[10px] text-green-400 font-bold">{e.correct_answers}✓</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/tournaments")} className="w-full py-3.5 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white font-bold text-sm">Back to Tournaments</button>
        </div>
      </div>
    );
  }

  // ── ROUND SUMMARY ───────────────────────────────────────────────────────────
  if (phase === "round_summary" && roundSummary) {
    const nextMeta = ROUNDS[(roundSummary.next_round - 1)];
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4 pb-28">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs font-black text-green-400 uppercase tracking-widest">Round {roundSummary.round_completed} Complete</span>
          </div>
          <div className="text-6xl font-black text-white tabular-nums mb-1">{roundSummary.survivors}</div>
          <div className="text-white/40 text-sm font-bold mb-1">survivors advancing</div>
          <div className="text-red-400/60 text-xs font-bold mb-6">{roundSummary.eliminated_this_round} eliminated this round</div>
          {nextMeta && (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Up Next</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: nextMeta.color, boxShadow: `0 0 12px ${nextMeta.color}` }} />
                <p className="text-xl font-black text-white">Round {roundSummary.next_round} — {nextMeta.name}</p>
              </div>
              <p className="text-white/30 text-xs mt-1">{nextMeta.secs} seconds per question</p>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-white/30 text-xs font-bold">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Starting shortly...
          </div>
        </div>
      </div>
    );
  }

  // ── GAME OVER ───────────────────────────────────────────────────────────────
  if (phase === "game_over" && gameOver) {
    return (
      <div className="min-h-screen bg-[#080810] overflow-y-auto pb-28">
        <div className="max-w-sm mx-auto px-4 py-10 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-black text-white mb-1">Game Over!</h2>
          <p className="text-white/40 text-sm mb-6">Prize Pool: <span className="text-yellow-400 font-black">{gameOver.prize_pool.toLocaleString()} ZA</span></p>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden mb-4">
            {gameOver.winners.map((w, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3.5 ${i < gameOver.winners.length - 1 ? "border-b border-white/[0.05]" : ""}`}>
                <span className="text-2xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${w.rank}`}</span>
                <div className="flex-1 text-left">
                  <p className="font-black text-white text-sm">{w.username}</p>
                  <p className="text-[10px] text-white/30">Rank #{w.rank}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-yellow-400">+{w.prize.toLocaleString()}</p>
                  <p className="text-[9px] text-white/30">ZA Tokens</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden mb-6">
            <div className="px-4 py-2.5 border-b border-white/[0.06]">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Final Standings</p>
            </div>
            {gameOver.leaderboard.slice(0, 10).map((e, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${i < 9 ? "border-b border-white/[0.04]" : ""}`}>
                <span className="text-xs text-white/20 w-4 text-center font-black">#{i + 1}</span>
                <div className="w-6 h-6 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] font-black text-white">{e.username[0]?.toUpperCase()}</div>
                <span className="text-xs font-bold text-white/60 flex-1 text-left">{e.username}</span>
                <span className={`text-[10px] font-black ${e.status === "winner" ? "text-yellow-400" : e.status === "alive" ? "text-green-400" : "text-white/20"}`}>{e.correct_answers}✓</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/tournaments")} className="w-full py-4 rounded-2xl font-black text-sm text-white" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  // ── ACTIVE QUESTION ─────────────────────────────────────────────────────────
  if ((phase === "question" || phase === "revealing") && currentQuestion) {
    const isRevealing = phase === "revealing";
    const totalMs     = currentQuestion.time_limit_ms;
    const aliveCount  = leaderboard.filter(e => e.status === "alive").length;
    const topAlive    = leaderboard.filter(e => e.status === "alive").slice(0, 5);
    const myEntry     = leaderboard.find(e => e.user_id === user?.id);

    return (
      <div className="min-h-screen flex flex-col bg-[#080810] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg,transparent,${roundMeta.color},transparent)`, boxShadow: `0 0 20px ${roundMeta.color}60` }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-36 rounded-full blur-3xl pointer-events-none opacity-15" style={{ background: roundMeta.color }} />

        {/* Header */}
        <div className="flex items-center gap-2 px-3 pt-4 pb-2 relative z-10">
          <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] rounded-xl px-2 py-1 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: roundMeta.color }} />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/60 whitespace-nowrap">R{currentQuestion.round} · {roundMeta.name}</span>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-2 py-1 shrink-0">
            <span className="text-[9px] font-black text-white/40">{currentQuestion.question_index + 1}/{currentQuestion.total_questions}</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-2 py-1 shrink-0">
            <span className="text-[9px]">👥</span>
            <span className="text-[9px] font-black text-white/60">{aliveCount}</span>
          </div>
        </div>

        {/* Mobile live strip */}
        <div className="lg:hidden px-3 pb-2 relative z-10">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-2 py-1.5 flex items-center gap-2 overflow-x-auto">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest shrink-0">Live</span>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {topAlive.map((e, i) => {
                const isMe = e.user_id === user?.id;
                return (
                  <div key={i} className={`flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-lg ${isMe ? "bg-purple-500/20" : ""}`}>
                    <span className="text-[8px] text-white/30 font-black">#{e.rank}</span>
                    <div className="w-4 h-4 rounded-full bg-white/[0.1] flex items-center justify-center text-[8px] font-black text-white shrink-0">{e.username[0]?.toUpperCase()}</div>
                    <span className={`text-[9px] font-bold truncate max-w-[48px] ${isMe ? "text-purple-300" : "text-white/50"}`}>{isMe ? "You" : e.username}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  </div>
                );
              })}
              {leaderboard.filter(e => e.status === "eliminated").length > 0 && (
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                  <span className="text-[8px] text-red-400/60 font-bold">{leaderboard.filter(e => e.status === "eliminated").length} out</span>
                </div>
              )}
            </div>
            {myEntry && !topAlive.find(e => e.user_id === user?.id) && (
              <div className="flex items-center gap-1 shrink-0 bg-purple-500/20 px-1.5 py-0.5 rounded-lg">
                <span className="text-[8px] font-black text-purple-300">#{myEntry.rank}</span>
                <span className="text-[8px] font-bold text-purple-300">You</span>
              </div>
            )}
          </div>
        </div>

        {/* Main content — pb-28 on mobile to clear the nav bar */}
        <div className="flex flex-1 gap-3 px-3 pb-28 lg:pb-6 relative z-10 min-h-0">

          {/* Quiz column */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Timer + Question */}
            <div className="flex items-start gap-2 mb-2">
              {!isRevealing && (
                <div className="shrink-0 scale-[0.65] origin-top-left -ml-2 -mr-4">
                  <TimerArc ms={timeLeftMs} totalMs={totalMs} round={round} />
                </div>
              )}
              <div className={`flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden ${isRevealing ? "w-full" : ""}`}>
                {currentQuestion.image_url && (
                  <img src={currentQuestion.image_url} alt="Question" className="w-full max-h-28 object-cover border-b border-white/[0.08]" />
                )}
                <div className="p-2.5">
                  <p className="text-white font-black text-xs md:text-sm leading-snug">{currentQuestion.question_text}</p>
                </div>
              </div>
            </div>

            {/* ── Answer options — 2 cols, compact on mobile ── */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 lg:gap-2">
              {OPTS.map((key, i) => {
                const text       = currentQuestion.options[key];
                const isSelected = selectedOption === key;
                const isCorrect  = isRevealing && revealData?.correct_option === key;
                const isWrong    = isRevealing && isSelected && !isCorrect;

                // Smaller padding/text on mobile
                let cardCls   = "flex items-center gap-1.5 lg:gap-3 p-2 lg:p-4 rounded-lg lg:rounded-2xl border-2 transition-all duration-200 w-full text-left select-none ";
                let letterCls = "w-5 h-5 lg:w-8 lg:h-8 rounded-md lg:rounded-xl flex items-center justify-center font-black text-[10px] lg:text-sm shrink-0 transition-all text-white ";

                if (isRevealing) {
                  if (isCorrect)    { cardCls += "border-green-400 bg-green-500/10"; letterCls += "bg-green-500"; }
                  else if (isWrong) { cardCls += "border-red-400 bg-red-500/10"; letterCls += "bg-red-500"; }
                  else              { cardCls += "border-white/[0.05] bg-white/[0.02] opacity-40"; letterCls += "bg-white/10"; }
                } else if (isSelected) {
                  cardCls   += "border-white/30 bg-white/10 ring-1 ring-white/20";
                  letterCls += OPT_LETTER[i];
                } else {
                  cardCls   += `${OPT_IDLE[i]} cursor-pointer active:scale-[0.97]`;
                  letterCls += "bg-white/[0.08] text-white/50";
                }

                return (
                  <button key={key} className={cardCls}
                    onClick={() => !answerLocked && !isRevealing && submitAnswer(key)}
                    disabled={answerLocked || isRevealing}>
                    <span className={letterCls}>{key}</span>
                    <span className="font-bold text-[11px] lg:text-sm text-white flex-1 leading-snug text-left line-clamp-2">{text}</span>
                    {isCorrect && <span className="text-green-400 shrink-0 text-sm">✓</span>}
                    {isWrong   && <span className="text-red-400 shrink-0 text-sm">✗</span>}
                  </button>
                );
              })}
            </div>

            {/* Status bar */}
            <div className="mt-2">
              {answerLocked && !isRevealing && (
                <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="w-3 h-3 border-2 border-purple-400/40 border-t-purple-400 rounded-full animate-spin" />
                  <p className="text-purple-300 font-bold text-xs">Locked in — waiting for others</p>
                </div>
              )}
              {isRevealing && revealData && (
                <div className={`flex items-center justify-center gap-1.5 py-2 rounded-xl ${selectedOption === revealData.correct_option ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                  {selectedOption === revealData.correct_option
                    ? <p className="text-green-400 font-bold text-xs">✅ Correct! {revealData.eliminated_count} eliminated</p>
                    : <p className="text-red-400 font-bold text-xs">❌ Wrong answer</p>}
                </div>
              )}
            </div>
          </div>

          {/* Desktop leaderboard */}
          <div className="w-52 hidden lg:flex flex-col shrink-0">
            <LeaderboardPanel entries={leaderboard} myId={user?.id} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
