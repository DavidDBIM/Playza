import { useMemo, useState, type ComponentType } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { MdLogin, MdClose } from "react-icons/md";
import { Swords, Zap, Play } from "lucide-react";

interface GameType {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string; size?: string | number }>;
  players: string;
  color: string;
  thumbnailUrl: string;
  comingSoon?: boolean;
}

interface LobbyHubProps {
  games: GameType[];
  setSelectedGame: (game: GameType | null) => void;
}

const LobbyHub = ({ games, setSelectedGame }: LobbyHubProps) => {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Real numbers derived from the actual games list — not invented. Total
  // players currently active across every H2H game, and how many of those
  // games have any live activity right now.
  const { totalPlayers, liveGameCount } = useMemo(() => {
    let players = 0;
    let liveGames = 0;
    for (const g of games) {
      if (g.comingSoon) continue;
      const n = parseInt(g.players, 10);
      if (!isNaN(n)) {
        players += n;
        if (n > 0) liveGames++;
      }
    }
    return { totalPlayers: players, liveGameCount: liveGames };
  }, [games]);

  const handleGameClick = (game: GameType) => {
    if (game.comingSoon) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setSelectedGame(game);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero — shrunk down from the first pass (less top/bottom padding,
          smaller headline) so it doesn't dominate the screen before you
          even reach the games. */}
      <header className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-slate-950 px-5 md:px-8 py-6 md:py-8 text-center">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[420px] h-[220px] bg-indigo-500/30 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative space-y-3">
          {/* "Flashy" badge — solid gradient + glow + shimmer instead of a
              flat, subtle transparent pill, since that's specifically the
              piece that read as too plain. */}
          <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Head-to-Head Arena
          </div>

          <h1 className="font-headline text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-tight text-white">
            Challenge. Compete. <span className="text-indigo-400">Cash Out.</span>
          </h1>

          <p className="text-slate-400 max-w-xl mx-auto text-[11px] md:text-sm font-medium">
            Go head-to-head with real players across chess, darts, ludo, and more — winner takes the stake.
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2">
              <Swords className="w-3.5 h-3.5 text-indigo-400" />
              <div className="text-left">
                <p className="text-white text-xs font-black leading-none">{totalPlayers}</p>
                <p className="text-slate-500 text-[7px] font-bold uppercase tracking-widest leading-none mt-1">Players Now</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2">
              <span className="w-3.5 h-3.5 flex items-center justify-center text-indigo-400 font-black text-xs">{liveGameCount}</span>
              <div className="text-left">
                <p className="text-white text-xs font-black leading-none">{liveGameCount} Live</p>
                <p className="text-slate-500 text-[7px] font-bold uppercase tracking-widest leading-none mt-1">Games Active</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <div className="text-left">
                <p className="text-white text-xs font-black leading-none">&lt;10s</p>
                <p className="text-slate-500 text-[7px] font-bold uppercase tracking-widest leading-none mt-1">Avg. Match Wait</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Game cards — matches Solo Earn's card style now: clean image card
          with the title below it, instead of the previous full-bleed
          image-with-text-overlay treatment. */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {games.map((game) => {
          const playerCount = parseInt(game.players, 10) || 0;
          const isLive = !game.comingSoon && playerCount > 0;
          return (
            <div
              key={game.id}
              onClick={() => handleGameClick(game)}
              className={`group flex flex-col gap-3 ${game.comingSoon ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="w-full aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden relative shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                <img
                  src={game.thumbnailUrl}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {game.comingSoon ? (
                  <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10 text-white">
                    Coming Soon
                  </div>
                ) : isLive ? (
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-red-500 text-white text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    Live
                  </div>
                ) : null}

                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/50 backdrop-blur-md text-indigo-300 text-[9px] font-black px-2 py-1 rounded-full">
                  {game.players} online
                </div>

                {/* Play Button Overlay */}
                {!game.comingSoon && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-indigo-500 text-white flex items-center justify-center opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                      <Play fill="currentColor" className="w-6 h-6 md:w-8 md:h-8 ml-1" />
                    </div>
                  </div>
                )}
              </div>

              <h3 className="font-heading font-black text-base md:text-xl text-slate-900 dark:text-white uppercase tracking-wide text-center group-hover:text-indigo-500 transition-colors">
                {game.name}
              </h3>
            </div>
          );
        })}
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-500 md:hover:text-slate-900 md:dark:hover:text-white transition-colors"
            >
              <MdClose size={24} />
            </button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="size-16 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                <MdLogin className="text-3xl text-indigo-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Login Required</h3>
                <p className="text-sm font-medium text-slate-500">You need to sign in or create an account to challenge other players in the Arena.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                <Link to="/registration?view=login" className="flex-1">
                  <Button className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-colors">Sign In</Button>
                </Link>
                <Link to="/registration?view=signup" className="flex-1">
                  <Button variant="outline" className="w-full h-12 border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 font-black uppercase tracking-widest text-xs rounded-xl transition-colors">Register</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LobbyHub;