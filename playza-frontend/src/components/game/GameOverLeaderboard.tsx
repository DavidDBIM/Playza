import { User, Trophy, Play, Star } from "lucide-react";

interface GameOverLeaderboardProps {
    score: number;
    playAgain: () => void;
    position?: number;
    onBackToSession?: () => void;
}

const GameOverLeaderboard = ({ score, playAgain, position = 15, onBackToSession }: GameOverLeaderboardProps) => {
    // Generate mock leaderboard based on the user's position
    const mockLeaderboard = [
        { rank: position - 2, name: "CryptoKing99", score: score + 1250 },
        { rank: position - 1, name: "NeonRider", score: score + 450 },
        { rank: position, name: "You", score: score, isCurrentUser: true },
        { rank: position + 1, name: "PixelStriker", score: score - 200 },
        { rank: position + 2, name: "GamerXYZ", score: score - 850 }
    ].filter(entry => entry.rank > 0);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center relative overflow-hidden">

                <div className="flex items-center gap-2 mb-2 text-primary z-10">
                    <Trophy className="w-8 h-8" />
                </div>
                
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-1 z-10">Game Over</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 z-10 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    Final Score: <span className="text-white">{score.toLocaleString()}</span>
                </p>

                <div className="w-full bg-slate-950/50 rounded-xl border border-white/5 p-4 mb-8 z-10">
                    <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <User className="w-3 h-3" />
                        Global Ranking
                    </h3>
                    
                    <div className="flex flex-col gap-2">
                        {mockLeaderboard.map((entry) => (
                            <div 
                                key={entry.rank}
                                className={`flex items-center justify-between p-2 rounded-xl text-xs sm:text-sm ${
                                    entry.isCurrentUser 
                                        ? "bg-primary/10 border border-primary/20 text-primary font-black" 
                                        : "text-slate-400 font-medium"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`w-5 text-center ${entry.rank <= 3 ? "text-yellow-500" : ""}`}>
                                        #{entry.rank}
                                    </span>
                                    <span>{entry.name}</span>
                                </div>
                                <span>{entry.score.toLocaleString()} pts</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full space-y-3 z-10">
                    <button 
                        onClick={playAgain}
                        className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/20 py-3 rounded-xl font-black uppercase text-xs tracking-widest"
                    >
                        <Play className="w-4 h-4" />
                        Play Again & Climb
                    </button>
                    {onBackToSession && (
                        <button 
                            onClick={onBackToSession}
                            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 py-3 rounded-xl font-black uppercase text-xs tracking-widest"
                        >
                            Return to Session
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameOverLeaderboard;
