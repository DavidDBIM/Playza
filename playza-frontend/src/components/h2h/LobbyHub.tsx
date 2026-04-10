import React, { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { MdLogin, MdClose } from "react-icons/md";

interface GameType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  players: string;
  color: string;
  comingSoon?: boolean;
}

interface LobbyHubProps {
  games: GameType[];
  setSelectedGame: (game: GameType | null) => void;
}

const LobbyHub = ({ games, setSelectedGame }: LobbyHubProps) => {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleGameClick = (game: GameType) => {
    if (game.comingSoon) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setSelectedGame(game);
  };

  return (
    <div className="space-y-12">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Battle Master Arena
        </div>
        <h1 className="font-headline text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter uppercase italic leading-tight text-slate-900 dark:text-white">
          SELECT YOUR <span className="text-indigo-500">GAME</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-[10px] md:text-xs lg:text-sm font-medium">
          Choose your battlefield. Compete in high-stakes matches against global
          rivals or challenge your friends for ultimate bragging rights.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            onClick={() => handleGameClick(game)}
            className={`relative group ${game.comingSoon ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="relative bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 h-full flex flex-col justify-between items-center text-center overflow-hidden">
              {game.comingSoon && (
                <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-black/20 dark:bg-white/30 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/10 text-white">
                  Coming Soon
                </div>
              )}
              <div
                className={`w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-linear-to-br ${game.color} flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-black/10`}
              >
                <game.icon className="text-white w-6 h-6 md:w-10 md:h-10" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-1 md:mb-2">
                  {game.name}
                </h3>
                <div className="flex items-center justify-center gap-2 text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-indigo-500 dark:text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {game.players} Active Now
                </div>
              </div>
            </div>
          </div>
        ))}
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
