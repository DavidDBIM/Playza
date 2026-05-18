import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQuizTournamentApi, joinQuizTournamentApi } from "@/api/quiz.api";
import { useQuizSocket, type LeaderboardEntry } from "@/hooks/quiz/useQuizSocket";
import { useToast } from "@/context/toast";
import { ZASymbol } from "@/components/currency/ZASymbol";
import {
  MdPeople, MdCheckCircle,
  MdCancel, MdArrowBack, MdWifi, MdWifiOff,
} from "react-icons/md";
import { Trophy, Zap, Crown } from "lucide-react";

// ── Round config metadata ──────────────────────────────────────────────────────
const ROUND_META = [
  { name: "Warm Up",        color: "#22c55e", bg: "from-green-500/20",  border: "border-green-500/30",  badge: "bg-green-500" },
  { name: "Rising",         color: "#3b82f6", bg: "from-blue-500/20",   border: "border-blue-500/30",   badge: "bg-blue-500" },
  { name: "Heat Up",        color: "#f97316", bg: "from-orange-500/20", border: "border-orange-500/30", badge: "bg-orange-500" },
  { name: "Danger Zone",    color: "#ef4444", bg: "from-red-500/20",    border: "border-red-500/30",    badge: "bg-red-500" },
  { name: "Final Showdown", color: "#a855f7", bg: "from-purple-500/20", border: "border-purple-500/30", badge: "bg-purple-500" },
];

const OPTION_KEYS = ["A", "B", "C", "D"] as const;
const OPTION_COLORS = [
  "from-sky-500/10 border-sky-500/30 hover:border-sky-400 hover:from-sky-500/20",
  "from-violet-500/10 border-violet-500/30 hover:border-violet-400 hover:from-violet-500/20",
  "from-amber-500/10 border-amber-500/30 hover:border-amber-400 hover:from-amber-500/20",
  "from-rose-500/10 border-rose-500/30 hover:border-rose-400 hover:from-rose-500/20",
];
const OPTION_LABELS = ["A", "B", "C", "D"];

// ── Timer Ring ─────────────────────────────────────────────────────────────────
function TimerRing({ timeLeftMs, totalMs, round }: { timeLeftMs: number; totalMs: number; round: number }) {
  const pct = totalMs > 0 ? timeLeftMs / totalMs : 0;
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const meta = ROUND_META[(round - 1)] ?? ROUND_META[0];
  const secs = Math.ceil(timeLeftMs / 1000);
  const isUrgent = timeLeftMs < 5000;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={meta.color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.1s linear", filter: `drop-shadow(0 0 6px ${meta.color})` }}
        />
      </svg>
      <div className={`flex flex-col items-center ${isUrgent ? "animate-pulse" : ""}`}>
        <span className="text-3xl font-black text-white leading-none">{secs}</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">secs</span>
      </div>
    </div>
  );
}

// ── Leaderboard Panel ─────────────────────────────────────────────────────────
function LeaderboardPanel({ entries, myUserId }: { entries: LeaderboardEntry[]; myUserId?: string }) {
  const myEntry = entries.find(e => (e as any).user_id === myUserId);
  const myRank = myEntry?.rank;

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="text-xs font-black uppercase tracking-widest text-white">Live Board</span>
        <span className="ml-auto text-[10px] font-bold text-white/40">
          {entries.filter(e => e.status === "alive").length} alive
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-white/5 max-h-96">
        {entries.slice(0, 20).map((entry, i) => {
          const isMe = (entry as any).user_id === myUserId;
          const isAlive = entry.status === "alive";
          return (
            <div
              key={i}
              className={`flex items-center gap-2.5 px-3 py-2.5 transition-all ${
                isMe ? "bg-primary/10 border-l-2 border-primary" : ""
              } ${!isAlive ? "opacity-40" : ""}`}
            >
              <span className={`text-[11px] font-black w-5 text-center ${
                entry.rank === 1 ? "text-yellow-400" :
                entry.rank === 2 ? "text-slate-300" :
                entry.rank === 3 ? "text-amber-600" : "text-white/40"
              }`}>
                {entry.rank === 1 ? "👑" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
              </span>

              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/60 to-violet-600/60 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                {entry.username[0]?.toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${isMe ? "text-primary" : "text-white/80"}`}>
                  {isMe ? "You" : entry.username}
                </p>
                <p className="text-[9px] text-white/30">
                  {entry.correct_answers} correct
                </p>
              </div>

              <div className={`w-2 h-2 rounded-full ${
                entry.status === "winner" ? "bg-yellow-400" :
                isAlive ? "bg-green-400" : "bg-red-500"
              }`} />
            </div>
          );
        })}
      </div>

      {myRank && myRank > 20 && myEntry && (
        <div className="border-t border-white/10 px-3 py-2.5 bg-primary/10 flex items-center gap-2.5">
          <span className="text-[11px] font-black w-5 text-center text-primary">#{myRank}</span>
          <div className="w-6 h-6 rounded-full bg-primary/40 flex items-center justify-center text-[10px] font-black text-white shrink-0">
            {myEntry.username[0]?.toUpperCase()}
          </div>
          <p className="text-xs font-bold text-primary flex-1">You</p>
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function QuizChampionship() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [joined, setJoined] = useState(false);

  const { data: tournament, isLoading } = useQuery({
    queryKey: ["quiz-tournament", id],
    queryFn: () => getQuizTournamentApi(id!),
    enabled: !!id,
    refetchInterval: joined ? false : 5000,
  });

  const { mutate: joinTournament, isPending: joining } = useMutation({
    mutationFn: () => joinQuizTournamentApi(id!),
    onSuccess: (data) => {
      if (data.data?.already_joined) toast.success("You're already in — get ready!");
      else toast.success("Joined! Get ready for the quiz!");
      setJoined(true);
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to join"),
  });

  const {
    connected, phase, playerCount, currentQuestion,
    selectedOption, answerLocked, revealData,
    leaderboard, roundSummary, gameOver, elimMessage,
    timeLeftMs, submitAnswer,
  } = useQuizSocket(joined ? (id ?? null) : null);

  // Auto-switch to lobby phase when socket connects
  useEffect(() => {
    if (joined && connected && phase === "idle") {
      // socket will emit lobby_update
    }
  }, [joined, connected, phase]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!tournament) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <p className="text-white/60 font-bold">Tournament not found</p>
    </div>
  );

  const meta = currentQuestion ? (ROUND_META[(currentQuestion.round - 1)] ?? ROUND_META[0]) : ROUND_META[0];

  // ── Pre-join screen ──────────────────────────────────────────────────────────
  if (!joined || phase === "idle") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <button onClick={() => navigate("/tournaments")} className="flex items-center gap-2 text-white/40 hover:text-white mb-8 text-sm font-bold transition-colors">
            <MdArrowBack /> Back to Tournaments
          </button>

          <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 blur-3xl rounded-full" />

            <div className="relative p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30">
                <Crown className="w-9 h-9 text-white" />
              </div>

              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1 rounded-full mb-4">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  {tournament.status === "lobby" ? "Open — Join Now" : tournament.status === "active" ? "In Progress" : "Upcoming"}
                </span>
              </div>

              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">{tournament.title}</h1>
              <p className="text-white/50 text-sm mb-8">{tournament.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: <MdPeople className="text-lg" />, label: "Players", value: playerCount || tournament.player_count || "—" },
                  { icon: <ZASymbol className="scale-90" />, label: "Entry Fee", value: tournament.entry_fee > 0 ? tournament.entry_fee : "FREE" },
                  { icon: <Trophy className="w-4 h-4" />, label: "Prize Pool", value: tournament.prize_pool > 0 ? `${tournament.prize_pool.toLocaleString()} ZA` : "Growing" },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-3 border border-white/10">
                    <div className="text-primary mb-1 flex justify-center">{s.icon}</div>
                    <p className="text-white font-black text-sm">{s.value}</p>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Round breakdown */}
              <div className="grid grid-cols-5 gap-1.5 mb-8">
                {ROUND_META.map((r, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-2 border border-white/5 text-center">
                    <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: r.color }} />
                    <p className="text-[8px] font-black text-white/60 uppercase tracking-widest leading-tight">{r.name}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => joinTournament()}
                disabled={joining || tournament.status === "completed" || tournament.status === "draft"}
                className="w-full py-4 rounded-2xl font-black text-base tracking-wide transition-all bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-500 text-white shadow-xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
              >
                {joining ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Joining...</>
                ) : tournament.entry_fee > 0 ? (
                  <><Zap className="w-4 h-4" /> Pay {tournament.entry_fee} ZA & Join</>
                ) : (
                  <><Zap className="w-4 h-4" /> Join Free</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Lobby waiting room ───────────────────────────────────────────────────────
  if (phase === "lobby" || phase === "starting") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-violet-600/30 border border-primary/40 flex items-center justify-center">
              <MdPeople className="text-5xl text-primary" />
            </div>
          </div>

          <h2 className="text-4xl font-black text-white mb-2">
            {phase === "starting" ? "Get Ready!" : "Lobby"}
          </h2>
          <p className="text-white/50 mb-8">
            {phase === "starting" ? "Game is starting..." : "Waiting for the game to start..."}
          </p>

          <div className="bg-slate-800/80 rounded-2xl border border-white/10 p-6 mb-6">
            <p className="text-6xl font-black text-white mb-1">{playerCount}</p>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Players Ready</p>
          </div>

          {/* Connection status */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
            connected ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            {connected ? <MdWifi /> : <MdWifiOff />}
            {connected ? "Connected" : "Reconnecting..."}
          </div>

          {leaderboard.length > 0 && (
            <div className="mt-6 bg-slate-800/60 rounded-2xl border border-white/5 p-4 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Players Joined</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {leaderboard.slice(0, 10).map((e, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-black text-primary">{e.username[0]?.toUpperCase()}</div>
                    <span className="text-xs text-white/60 font-bold">{e.username}</span>
                  </div>
                ))}
                {playerCount > 10 && <p className="text-[10px] text-white/30 font-bold">+{playerCount - 10} more</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Eliminated screen ────────────────────────────────────────────────────────
  if (phase === "eliminated") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <MdCancel className="text-5xl text-red-500" />
          </div>
          <h2 className="text-4xl font-black text-white mb-3">Eliminated!</h2>
          <p className="text-white/50 mb-8">{elimMessage || "Better luck next time!"}</p>

          <div className="bg-slate-800/80 rounded-2xl border border-white/10 p-5 mb-6 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Top Players Still Fighting</p>
            {leaderboard.filter(e => e.status === "alive").slice(0, 5).map((e, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <span className="text-xs text-white/30 w-4">#{e.rank}</span>
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-[9px] text-green-400 font-black">{e.username[0]?.toUpperCase()}</div>
                <span className="text-xs font-bold text-white/70 flex-1">{e.username}</span>
                <span className="text-[10px] text-green-400 font-bold">{e.correct_answers}✓</span>
              </div>
            ))}
          </div>

          <button onClick={() => navigate("/tournaments")} className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  // ── Round summary ────────────────────────────────────────────────────────────
  if (phase === "round_summary" && roundSummary) {
    const nextMeta = ROUND_META[(roundSummary.next_round - 1)] ?? ROUND_META[0];
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full mb-6">
            <MdCheckCircle className="text-green-400" />
            <span className="text-sm font-black text-green-400">Round {roundSummary.round_completed} Complete</span>
          </div>

          <h2 className="text-5xl font-black text-white mb-2">{roundSummary.survivors}</h2>
          <p className="text-white/50 mb-1">survivors advancing</p>
          <p className="text-red-400/70 text-sm font-bold mb-8">{roundSummary.eliminated_this_round} eliminated this round</p>

          <div className="bg-slate-800/80 rounded-2xl border border-white/10 p-5 mb-6">
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-2">Next Up</p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: nextMeta.color }} />
              <p className="text-2xl font-black text-white">{roundSummary.next_round_name}</p>
            </div>
          </div>

          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // ── Game over ────────────────────────────────────────────────────────────────
  if (phase === "game_over" && gameOver) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-yellow-500/30">
              <Crown className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-4xl font-black text-white mb-1">Game Over!</h2>
            <p className="text-white/50">Prize Pool: <span className="text-yellow-400 font-black">{gameOver.prize_pool.toLocaleString()} ZA</span></p>
          </div>

          {/* Winners podium */}
          <div className="bg-slate-800/80 rounded-2xl border border-white/10 p-5 mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Winners</p>
            {gameOver.winners.map((w, i) => (
              <div key={i} className={`flex items-center gap-3 py-3 ${i < gameOver.winners.length - 1 ? "border-b border-white/5" : ""}`}>
                <span className="text-2xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${w.rank}`}</span>
                <div className="flex-1">
                  <p className="font-black text-white">{w.username}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Rank #{w.rank}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-yellow-400">+{w.prize.toLocaleString()}</p>
                  <p className="text-[10px] text-white/30">ZA Tokens</p>
                </div>
              </div>
            ))}
          </div>

          {/* Full leaderboard top 10 */}
          <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-4 mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Final Standings</p>
            {gameOver.leaderboard.slice(0, 10).map((e, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <span className="text-xs text-white/30 w-5 text-center">#{i + 1}</span>
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-white">{e.username[0]?.toUpperCase()}</div>
                <span className="text-xs font-bold text-white/70 flex-1">{e.username}</span>
                <span className={`text-[10px] font-bold ${e.status === "winner" ? "text-yellow-400" : e.status === "alive" ? "text-green-400" : "text-white/30"}`}>
                  {e.correct_answers} correct
                </span>
              </div>
            ))}
          </div>

          <button onClick={() => navigate("/tournaments")} className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-violet-600 text-white font-black tracking-wide hover:from-primary/90 transition-all">
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  // ── Active question phase ────────────────────────────────────────────────────
  if ((phase === "question" || phase === "revealing") && currentQuestion) {
    const totalMs = currentQuestion.time_limit_ms;
    const isRevealing = phase === "revealing";

    return (
      <div className={`min-h-screen bg-slate-950 bg-gradient-to-b ${meta.bg} to-slate-950`}>
        <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">

          {/* ── Main quiz area ── */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className={`flex items-center justify-between mb-6 p-3 rounded-2xl bg-slate-900/80 border ${meta.border}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: meta.color }} />
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  Round {currentQuestion.round} — {currentQuestion.round_name}
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/50 font-bold">
                  Q{currentQuestion.question_index + 1}/{currentQuestion.total_questions}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white/50">
                  <MdPeople />
                  <span className="text-white font-black">{currentQuestion.alive_count}</span> alive
                </div>
                {!isRevealing && (
                  <TimerRing timeLeftMs={timeLeftMs} totalMs={totalMs} round={currentQuestion.round} />
                )}
              </div>
            </div>

            {/* Question card */}
            <div className="bg-slate-900/90 backdrop-blur rounded-3xl border border-white/10 p-6 mb-5 shadow-2xl">
              <p className="text-lg md:text-2xl font-black text-white leading-snug text-center">
                {currentQuestion.question_text}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OPTION_KEYS.map((key, i) => {
                const text = currentQuestion.options[key];
                const isSelected = selectedOption === key;
                const isCorrect = isRevealing && revealData?.correct_option === key;
                const isWrong = isRevealing && isSelected && !isCorrect;

                let cls = `relative flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-r cursor-pointer transition-all duration-200 select-none `;

                if (isRevealing) {
                  if (isCorrect) cls += "border-green-400 bg-green-500/20 shadow-lg shadow-green-500/20";
                  else if (isWrong) cls += "border-red-400 bg-red-500/20";
                  else cls += "border-white/5 bg-white/5 opacity-50";
                } else if (isSelected) {
                  cls += `border-primary bg-primary/20 shadow-lg shadow-primary/20`;
                } else {
                  cls += OPTION_COLORS[i] + " active:scale-95";
                }

                return (
                  <button
                    key={key}
                    className={cls}
                    onClick={() => !answerLocked && !isRevealing && submitAnswer(key)}
                    disabled={answerLocked || isRevealing}
                  >
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${
                      isCorrect ? "bg-green-400 text-slate-900" :
                      isWrong ? "bg-red-400 text-white" :
                      isSelected ? "bg-primary text-white" :
                      "bg-white/10 text-white/60"
                    }`}>
                      {OPTION_LABELS[i]}
                    </span>
                    <span className="font-bold text-sm text-white text-left flex-1 leading-snug">{text}</span>
                    {isCorrect && <MdCheckCircle className="text-green-400 text-xl shrink-0" />}
                    {isWrong && <MdCancel className="text-red-400 text-xl shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Answered feedback */}
            {answerLocked && !isRevealing && (
              <div className="mt-4 text-center py-3 rounded-2xl bg-primary/10 border border-primary/20">
                <p className="text-primary font-bold text-sm flex items-center justify-center gap-2">
                  <MdCheckCircle /> Answer locked in — waiting for others...
                </p>
              </div>
            )}

            {/* Reveal message */}
            {isRevealing && revealData && (
              <div className={`mt-4 text-center py-3 rounded-2xl ${
                selectedOption === revealData.correct_option
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}>
                <p className={`font-black text-sm flex items-center justify-center gap-2 ${
                  selectedOption === revealData.correct_option ? "text-green-400" : "text-red-400"
                }`}>
                  {selectedOption === revealData.correct_option
                    ? <><MdCheckCircle /> Correct! {revealData.eliminated_count} eliminated this question</>
                    : <><MdCancel /> Wrong answer</>
                  }
                </p>
              </div>
            )}
          </div>

          {/* ── Leaderboard sidebar (desktop) ── */}
          <div className="w-64 hidden lg:flex flex-col gap-4 sticky top-6 self-start">
            <LeaderboardPanel entries={leaderboard} />
          </div>
        </div>

        {/* Mobile leaderboard toggle */}
        <div className="lg:hidden fixed bottom-6 right-4 z-50">
          <MobileLeaderboardSheet entries={leaderboard} />
        </div>
      </div>
    );
  }

  return null;
}

// ── Mobile leaderboard sheet ──────────────────────────────────────────────────
function MobileLeaderboardSheet({ entries }: { entries: LeaderboardEntry[] }) {
  const [open, setOpen] = useState(false);
  const alive = entries.filter(e => e.status === "alive").length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-12 h-12 rounded-full bg-primary shadow-xl shadow-primary/30 flex items-center justify-center text-white relative"
      >
        <Trophy className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full text-[9px] font-black text-slate-900 flex items-center justify-center">
          {alive}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end" onClick={() => setOpen(false)}>
          <div className="w-full bg-slate-900 rounded-t-3xl border-t border-white/10 p-5 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
            <LeaderboardPanel entries={entries} />
          </div>
        </div>
      )}
    </>
  );
}
