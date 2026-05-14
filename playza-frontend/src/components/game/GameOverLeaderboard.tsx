import { User, Trophy, Play, Star, Loader2 } from "lucide-react";
import { QuickFeedback } from "../feedback/QuickFeedback";

interface LeaderboardEntry {
  best_score: number;
  users?: { username?: string; avatar_url?: string | null };
}

interface GameOverLeaderboardProps {
  score: number;
  playAgain: () => void;
  rank?: number;
  onBackToSession?: () => void;
  gameName?: string;
  isHighScore?: boolean;
  previousBest?: number;
  /** Live leaderboard snapshot from the backend, passed from GamePlay after submission */
  leaderboard?: LeaderboardEntry[];
  /** Error message if score submission was rejected by the backend */
  submissionError?: string | null;
}

const GameOverLeaderboard = ({
  score,
  playAgain,
  rank = 1,
  onBackToSession,
  gameName = "Current Game",
  isHighScore,
  previousBest,
  leaderboard,
  submissionError,
}: GameOverLeaderboardProps) => {
  /**
   * Neighborhood Window Algorithm
   * ─────────────────────────────
   * Always shows exactly 3 entries centered on the player's rank.
   * Examples:
   *   Rank 1  of 50  → shows #1(You), #2, #3
   *   Rank 2  of 50  → shows #1,  #2(You), #3
   *   Rank 9  of 50  → shows #8,  #9(You), #10
   *   Rank 49 of 50  → shows #48, #49(You), #50
   *   Rank 50 of 50  → shows #48, #49, #50(You)
   */
  const buildNeighborhoodWindow = () => {
    if (!leaderboard || leaderboard.length === 0) return [];
    const userIdx = rank - 1; // 0-indexed
    const total = leaderboard.length;

    // Start 1 slot above the user, clamped to array bounds
    let windowStart = Math.max(0, userIdx - 1);
    const windowEnd = Math.min(total - 1, windowStart + 2);
    // If near the end, slide the window start back to keep 3 entries
    windowStart = Math.max(0, windowEnd - 2);

    return leaderboard.slice(windowStart, windowEnd + 1).map((entry, i) => ({
      rank: windowStart + i + 1,
      name: entry.users?.username || "Player",
      score: entry.best_score,
      isCurrentUser: windowStart + i + 1 === rank,
    }));
  };

  const displayEntries = buildNeighborhoodWindow();
  const hasLiveData = displayEntries.length > 0;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center relative overflow-hidden">

        <div className="flex items-center gap-2 mb-2 text-primary z-10">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-1 z-10">Game Over</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 z-10 flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500" />
          Final Score: <span className="text-white">{score.toLocaleString()}</span>
        </p>
        
        {/* Score Rejection Warning */}
        {submissionError && (
          <div className="w-full bg-amber-500/10 border border-amber-500/20 text-amber-200 p-3 rounded-lg text-xs font-bold mb-4 z-10 text-center leading-relaxed animate-in fade-in slide-in-from-top-2">
            <span className="text-amber-400 uppercase text-[10px] tracking-widest block mb-1">Score Rejected</span>
            {submissionError}
            <br />
            <span className="italic text-[10px] text-amber-500/70 mt-1 block">
              This score was not recorded on the leaderboard.
            </span>
          </div>
        )}

        {/* Not a high score — show context */}
        {isHighScore === false && previousBest !== undefined && (
          <div className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-200 p-3 rounded-lg text-xs font-medium mb-4 z-10 text-center leading-relaxed">
            Your latest score (<span className="font-bold text-rose-100">{score.toLocaleString()}</span>) was lower than
            your previous best (<span className="font-bold text-rose-100">{previousBest.toLocaleString()}</span>).
            <br /><br />
            <span className="italic text-[10px] text-rose-300 font-bold tracking-wide">
              Note: Entry fee was deducted, but this score wasn't recorded. Try again!
            </span>
          </div>
        )}

        {/* New high score banner */}
        {isHighScore === true && (
          <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 p-3 rounded-lg text-[10px] font-black mb-4 z-10 text-center uppercase tracking-widest">
            New High Score Recorded! 🚀
          </div>
        )}

        {/* Live Neighborhood Leaderboard */}
        <div className="w-full bg-slate-950/50 rounded-xl border border-white/5 p-4 mb-6 z-10">
          <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            <User className="w-3 h-3" />
            Your Standing — Rank #{rank}
          </h3>

          {hasLiveData ? (
            <div className="flex flex-col gap-2">
              {displayEntries.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs ${
                    entry.isCurrentUser
                      ? "bg-primary/10 border border-primary/20 text-primary font-black"
                      : "text-slate-400 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-black tabular-nums ${entry.rank <= 3 ? "text-yellow-500" : ""}`}>
                      #{entry.rank}
                    </span>
                    <span>{entry.isCurrentUser ? "You ⬅" : entry.name}</span>
                  </div>
                  <span className="tabular-nums">{entry.score.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          ) : (
            // Loading fallback — shows while leaderboard is being fetched or in demo mode
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Loading rankings...
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 z-10">
          <button
            onClick={playAgain}
            className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/20 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-primary/20 transition-colors"
          >
            <Play className="w-4 h-4" />
            Play Again &amp; Climb
          </button>
          {onBackToSession && (
            <button
              onClick={onBackToSession}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-700 transition-colors"
            >
              Return to Session
            </button>
          )}
        </div>

        <QuickFeedback gameName={gameName} />
      </div>
    </div>
  );
};

export default GameOverLeaderboard;
