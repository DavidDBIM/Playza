import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Trophy, Swords, Handshake, Clock, ListOrdered, Table2 } from "lucide-react";
import type { UserProfile } from "@/context/auth";
import type { ChessRoom } from "@/types/chess";
import type { TournamentFixture } from "@/api/chess-tournament.api";

// Football-style scoring used across all Playza chess tournaments.
export const POINTS_WIN = 3;
export const POINTS_DRAW = 1;
export const POINTS_LOSS = 0;

const RESULT_LABEL: Record<string, string> = {
  checkmate: "Checkmate",
  resignation: "Resignation",
  timeout: "Time Out",
  stalemate: "Stalemate",
  insufficient_material: "Insufficient Material",
  threefold_repetition: "Threefold Repetition",
  draw: "Draw Agreed",
  unknown: "Game Over",
};

function fmtClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface ChessTournamentWinnerProps {
  room: ChessRoom;
  user: UserProfile | null;
  tournamentId: string;
  fixture?: TournamentFixture | null;
  /** The very next fixture this player is due to play, if it exists yet. */
  nextFixture?: TournamentFixture | null;
  finalWinnerId: string | null;
  isDraw: boolean;
  isSyncing?: boolean;
  resultReason: string;
  moveCount: number;
  whiteTimeLeft: number;
  blackTimeLeft: number;
}

export default function ChessTournamentWinner({
  room,
  user,
  tournamentId,
  fixture,
  nextFixture,
  finalWinnerId,
  isDraw,
  isSyncing,
  resultReason,
  moveCount,
  whiteTimeLeft,
  blackTimeLeft,
}: ChessTournamentWinnerProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const isWinner = finalWinnerId === user?.id;

  const opponentName = fixture
    ? fixture.player1_id === user?.id
      ? fixture.player2?.username ?? "Opponent"
      : fixture.player1?.username ?? "Opponent"
    : room.host_id === user?.id
      ? room.guest?.username ?? "Opponent"
      : room.host?.username ?? "Opponent";

  const points = isWinner ? POINTS_WIN : isDraw ? POINTS_DRAW : POINTS_LOSS;

  const bracketPath = `/chess-tournament/${tournamentId}`;
  const nextMatchPath = nextFixture?.chess_room_id
    ? `/chess-tournament/${tournamentId}/match/${nextFixture.chess_room_id}`
    : bracketPath;

  const accent = isWinner ? "#22c55e" : isDraw ? "#f59e0b" : "#ef4444";
  const accentBg = isWinner ? "rgba(34,197,94,0.12)" : isDraw ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)";

  const nextOpponentName = nextFixture
    ? nextFixture.player1_id === user?.id
      ? nextFixture.player2?.username ?? "TBD"
      : nextFixture.player1?.username ?? "TBD"
    : null;

  const fmtNextMatchTime = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    // hour12 explicit — some locales default to a bare 24-hour clock with no
    // AM/PM otherwise. No timeZone override, so this shows the player's own
    // device-local time.
    return d.toLocaleString(undefined, sameDay
      ? { hour: "numeric", minute: "2-digit", hour12: true }
      : { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true });
  };
  const nextMatchTime = fmtNextMatchTime(nextFixture?.scheduled_at);

  return (
    <div className="w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 bg-white dark:bg-slate-950 text-center">
      {/* Header */}
      <div className="px-6 pt-8 pb-6" style={{ background: accentBg }}>
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
          style={{ background: accent }}>
          {isWinner ? <Trophy className="w-8 h-8 text-white" /> : isDraw ? <Handshake className="w-8 h-8 text-white" /> : <Swords className="w-8 h-8 text-white" />}
        </div>
        <h1 className="font-black italic uppercase tracking-tighter text-3xl md:text-4xl" style={{ color: accent }}>
          {isWinner ? "Victory!" : isDraw ? "Draw" : "Defeat"}
        </h1>
        <p className="mt-2 text-sm md:text-base font-bold text-slate-700 dark:text-slate-200">
          {isWinner
            ? `Congratulations — you won against ${opponentName}!`
            : isDraw
              ? `The game ended in a draw against ${opponentName}.`
              : `You lost to ${opponentName}.`}
        </p>
        {isSyncing && (
          <p className="mt-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
            Syncing result…
          </p>
        )}
        {fixture?.round_name && (
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {fixture.round_name}
          </p>
        )}
      </div>

      {/* Points earned */}
      <div className="px-6 py-5 border-t border-black/5 dark:border-white/10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Tournament Points Earned</p>
        <div className="text-4xl md:text-5xl font-black italic" style={{ color: accent }}>
          +{points}
        </div>
        <p className="mt-2 text-[11px] text-slate-500 font-medium">
          Win = {POINTS_WIN} pts · Draw = {POINTS_DRAW} pt · Loss = {POINTS_LOSS} pts
        </p>
      </div>

      {/* Analytics */}
      <div className="px-6 py-5 border-t border-black/5 dark:border-white/10 grid grid-cols-3 gap-3 text-left">
        <div className="rounded-xl p-3 bg-black/5 dark:bg-white/5">
          <ListOrdered className="w-4 h-4 text-slate-400 mb-1" />
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Moves</p>
          <p className="text-sm font-black text-slate-900 dark:text-white">{moveCount}</p>
        </div>
        <div className="rounded-xl p-3 bg-black/5 dark:bg-white/5">
          <Swords className="w-4 h-4 text-slate-400 mb-1" />
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Result</p>
          <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{RESULT_LABEL[resultReason] ?? "Game Over"}</p>
        </div>
        <div className="rounded-xl p-3 bg-black/5 dark:bg-white/5">
          <Clock className="w-4 h-4 text-slate-400 mb-1" />
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Clock Left</p>
          <p className="text-xs font-black text-slate-900 dark:text-white">
            {fmtClock(whiteTimeLeft)} / {fmtClock(blackTimeLeft)}
          </p>
        </div>
      </div>

      {/* Next match — opponent + kickoff time shown directly here, instead
          of only being discoverable after tapping through to the bracket */}
      {nextFixture && (
        <div className="px-6 pt-5 border-t border-black/5 dark:border-white/10">
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
              <Swords className="w-5 h-5 text-white" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-violet-500">
                {nextFixture.round_name ?? "Next Match"}
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                Your next match is against {nextOpponentName}
              </p>
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                {nextMatchTime ? `Kicks off ${nextMatchTime}` : nextFixture.chess_room_id ? "Ready now" : "Time TBD"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 pb-6 pt-5 flex flex-col gap-3">
        <button
          onClick={() => nextFixture?.chess_room_id && navigate(nextMatchPath)}
          disabled={!nextFixture?.chess_room_id}
          className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
        >
          {nextFixture?.chess_room_id
            ? "Next Match →"
            : nextFixture
              ? "Next Match — Starting Soon"
              : "No Match Scheduled Yet"}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(`${bracketPath}?tab=standings`)}
            className="flex items-center justify-center gap-1.5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-violet-500 text-violet-500"
          >
            <Table2 className="w-3.5 h-3.5" /> Table
          </button>
          <button
            onClick={() => navigate(bracketPath)}
            className="py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-900 dark:bg-indigo-600 text-white"
          >
            Bracket
          </button>
        </div>
      </div>
    </div>
  );
}