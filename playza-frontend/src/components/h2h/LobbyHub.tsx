import React from 'react';
import GameModeModal from "./GameModeModal";

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
  selectedGame: GameType | null;
  setSelectedGame: (game: GameType | null) => void;
  setView: (view: 'hub' | 'quick' | 'invite' | 'bot') => void;
}

const LobbyHub = ({ games, selectedGame, setSelectedGame, setView }: LobbyHubProps) => {
  return (
    <div className="space-y-12">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Battle Master Arena
        </div>
        <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-tight">
          SELECT YOUR <span className="text-indigo-500">GAME</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-xs md:text-sm font-medium">
          Choose your battlefield. Compete in high-stakes matches against
          global rivals or challenge your friends for ultimate bragging
          rights.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            onClick={() => !game.comingSoon && setSelectedGame(game)}
            className={`relative group transition-all duration-300 ${game.comingSoon ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"}`}
          >
            <div className={`absolute -inset-0.5 bg-linear-to-r ${game.color} rounded-2xl md:rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity`}></div>
            <div className="relative bg-slate-900/80 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 backdrop-blur-xl h-full flex flex-col justify-between items-center text-center overflow-hidden">
              {game.comingSoon && (
                <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/30 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/10">
                  Coming Soon
                </div>
              )}
              <div className={`w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-linear-to-br ${game.color} flex items-center justify-center shadow-lg mb-4 md:mb-6 group-hover:rotate-6 transition-transform`}>
                <game.icon className="text-white w-6 h-6 md:w-10 md:h-10" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-white mb-1 md:mb-2">
                  {game.name}
                </h3>
                <div className="flex items-center justify-center gap-2 text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  {game.players} Active Now
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <GameModeModal
        isOpen={!!selectedGame}
        onClose={() => setSelectedGame(null)}
        onSelectMode={(mode: 'hub' | 'quick' | 'invite' | 'bot') => setView(mode)}
      />
    </div>
  );
};

export default LobbyHub;
