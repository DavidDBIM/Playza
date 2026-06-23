import { lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth";
import { useH2HRoom } from "@/hooks/h2h/useH2H";
import { getChessTournament, getChessTournamentFixtures } from "@/api/chess-tournament.api";

const ChessArena = lazy(() => import("@/components/h2h/chess/ChessArena"));

// ── Chess Tournament Match ────────────────────────────────────────────────────
// Wraps the existing ChessArena (unchanged) with a tournament context banner
// showing which round/match they're in and a back-to-bracket button.
// URL: /chess-tournament/:tournamentId/match/:roomId
export default function ChessTournamentMatch() {
  const { tournamentId, roomId } = useParams<{ tournamentId: string; roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load the chess room exactly how H2HZone does it
  const { data: room, isError: roomError } = useH2HRoom(roomId, "chess");

  // Load tournament + fixtures to build the context banner
  const { data: tournament } = useQuery({
    queryKey: ["chess-tournament", tournamentId],
    queryFn: () => getChessTournament(tournamentId!),
    enabled: !!tournamentId,
  });

  const { data: fixtures = [] } = useQuery({
    queryKey: ["ct-fixtures", tournamentId],
    queryFn: () => getChessTournamentFixtures(tournamentId!),
    enabled: !!tournamentId,
    refetchInterval: 5000,
  });

  const myFixture = fixtures.find(f => f.chess_room_id === roomId);

  const opponent = myFixture
    ? myFixture.player1_id === user?.id
      ? myFixture.player2?.username
      : myFixture.player1?.username
    : null;

  if (roomError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center"
        style={{ background: "#080810" }}>
        <span className="text-4xl">♟</span>
        <p className="font-black text-white text-lg">Match not found</p>
        <p className="text-sm text-white/30">This match may have already ended or the link is invalid.</p>
        <button onClick={() => navigate(`/chess-tournament/${tournamentId}`)}
          className="mt-2 px-5 py-2.5 rounded-xl text-sm font-black text-white"
          style={{ background: "rgba(124,58,237,0.3)", border: "1px solid rgba(124,58,237,0.4)" }}>
          ← Back to Tournament
        </button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080810" }}>
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#080810" }}>
      {/* Tournament context banner */}
      <div className="shrink-0 px-4 py-2.5 flex items-center justify-between"
        style={{ background: "rgba(124,58,237,0.12)", borderBottom: "1px solid rgba(124,58,237,0.2)" }}>
        <button onClick={() => navigate(`/chess-tournament/${tournamentId}`)}
          className="flex items-center gap-1.5 text-violet-400/70 hover:text-violet-300 transition-colors text-xs font-bold">
          <span>←</span>
          <span className="hidden sm:inline">Back to Bracket</span>
          <span className="sm:hidden">Bracket</span>
        </button>

        <div className="flex items-center gap-2 text-center">
          {myFixture && (
            <>
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">
                {myFixture.round_name}
              </span>
              {opponent && (
                <>
                  <span className="text-white/15 text-xs">vs</span>
                  <span className="text-[10px] font-bold text-white/50">{opponent}</span>
                </>
              )}
            </>
          )}
          {!myFixture && tournament && (
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">
              {tournament.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-red-400">Live</span>
        </div>
      </div>

      {/* Chess arena — completely unmodified, same component as H2H */}
      <div className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full py-20">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        }>
          <ChessArena room={room} user={user} />
        </Suspense>
      </div>
    </div>
  );
}
