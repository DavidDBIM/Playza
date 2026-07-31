import { lazy, Suspense, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth";
import { useH2HRoom } from "@/hooks/h2h/useH2H";
import { getChessTournament, getChessTournamentFixtures } from "@/api/chess-tournament.api";
import ChessTournamentWinner from "@/components/h2h/chess/ChessTournamentWinner";
import { Share2, Check } from "lucide-react";

const ChessArena = lazy(() => import("@/components/h2h/chess/ChessArena"));

// ── Chess Tournament Match ────────────────────────────────────────────────────
// Wraps the shared ChessArena with a tournament context banner (round/match,
// back-to-bracket) and a tournament-specific result screen (opponent name,
// points earned, game analytics, next-match & standings buttons) shown
// instead of the generic H2H winner screen.
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
    refetchInterval: 15000,
  });

  const { data: fixtures = [] } = useQuery({
    queryKey: ["ct-fixtures", tournamentId],
    queryFn: () => getChessTournamentFixtures(tournamentId!),
    enabled: !!tournamentId,
    refetchInterval: 5000,
  });

  const myFixture = fixtures.find(f => f.chess_room_id === roomId);

  // The next fixture this player is due to play — a different fixture,
  // involving them, that hasn't finished yet. Once the backend advances
  // them (new round / rematch after a draw) this shows up here via the
  // 5s fixtures poll, and the winner screen surfaces it as "Next Match".
  const nextFixture = fixtures.find(f =>
    f.id !== myFixture?.id &&
    f.status !== "completed" &&
    f.status !== "bye" &&
    (f.player1_id === user?.id || f.player2_id === user?.id)
  );

  const opponent = myFixture
    ? myFixture.player1_id === user?.id
      ? myFixture.player2?.username
      : myFixture.player1?.username
    : null;

  const [linkCopied, setLinkCopied] = useState(false);
  const handleShare = async () => {
    const url = `https://playza.games/chess-tournament/${tournamentId}/match/${roomId}`;
    const title = tournament ? `${tournament.title} — live on Playza` : "Live chess match on Playza";
    const text = myFixture
      ? `Watch this live chess match on Playza: ${myFixture.player1?.username ?? "Player 1"} vs ${myFixture.player2?.username ?? "Player 2"}`
      : "Watch this live chess match on Playza";
    // Web Share API opens the native share sheet on mobile (WhatsApp, SMS,
    // etc.) — the ideal path for "show family and friends". Falls back to
    // copying the link on desktop browsers that don't support it.
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // user cancelled the share sheet — fall through silently
        return;
      }
    }
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1800);
  };

  if (roomError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center"
        style={{ background: "var(--background)" }}>
        <span className="text-4xl">♟</span>
        <p className="font-black text-foreground text-lg">Match not found</p>
        <p className="text-sm text-foreground/50">This match may have already ended or the link is invalid.</p>
        <button onClick={() => navigate(`/chess-tournament/${tournamentId}`)}
          className="mt-2 px-5 py-2.5 rounded-xl text-sm font-black text-white"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
          ← Back to Tournament
        </button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
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
                  <span className="text-foreground/25 text-xs">vs</span>
                  <span className="text-[10px] font-bold text-foreground/60">{opponent}</span>
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

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleShare} title="Share this match"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors"
            style={{ background: "rgba(124,58,237,0.15)", color: linkCopied ? "#4ade80" : "#a855f7" }}>
            {linkCopied ? <Check size={11} /> : <Share2 size={11} />}
            <span className="hidden sm:inline">{linkCopied ? "Copied!" : "Share"}</span>
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-red-400">Live</span>
          </div>
        </div>
      </div>

      {myFixture && myFixture.is_armageddon && (
        <div className="shrink-0 px-4 py-2 flex items-center justify-center gap-2 text-center"
          style={{ background: "rgba(239,68,68,0.12)", borderBottom: "1px solid rgba(239,68,68,0.25)" }}>
          <span className="text-xs">⚡</span>
          <span className="text-[11px] font-black text-red-400">
            Sudden Death — {myFixture.armageddon_draw_winner_id === user?.id ? "you win" : "opponent wins"} if this game is drawn
          </span>
        </div>
      )}
      {myFixture && !myFixture.is_armageddon && (myFixture.draw_count ?? 0) > 0 && (
        <div className="shrink-0 px-4 py-2 flex items-center justify-center gap-2 text-center"
          style={{ background: "rgba(245,158,11,0.1)", borderBottom: "1px solid rgba(245,158,11,0.2)" }}>
          <span className="text-xs">⏱️</span>
          <span className="text-[11px] font-black text-amber-400">
            Rematch #{myFixture.draw_count} after a draw — time control reduced
          </span>
        </div>
      )}

      {/* Chess arena — same shared component as H2H, with a tournament-aware
          result screen swapped in via the renderWinner override */}
      <div className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full py-20">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        }>
          <ChessArena
            room={room}
            user={user}
            backTo={`/chess-tournament/${tournamentId}`}
            backLabel="BACK TO TOURNAMENT"
            isTournament
            renderWinner={(ctx) => (
              <ChessTournamentWinner
                room={room}
                user={user}
                tournamentId={tournamentId!}
                fixture={myFixture}
                nextFixture={nextFixture}
                finalWinnerId={ctx.finalWinnerId}
                isDraw={ctx.isDraw}
                isSyncing={ctx.isSyncing}
                resultReason={ctx.resultReason}
                moveCount={ctx.moveCount}
                whiteTimeLeft={ctx.whiteTimeLeft}
                blackTimeLeft={ctx.blackTimeLeft}
                onClose={ctx.onClose}
              />
            )}
          />
        </Suspense>
      </div>
    </div>
  );
}