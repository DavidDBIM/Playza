// MatchOver Component
import React from 'react';

interface MatchOverProps {
  winner: string | null;
  onRestart: () => void;
}

const MatchOver: React.FC<MatchOverProps> = ({ winner, onRestart }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="max-w-md w-full p-8 text-center bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl">
        <div className="mb-6">
          <div className="text-indigo-400 text-xs font-bold tracking-[0.3em] uppercase mb-2">Match Finished</div>
          <h1 className="text-white text-6xl font-black italic tracking-tighter uppercase leading-none">
            {winner === 'player1' ? 'Victory!' : 'Defeat'}
          </h1>
        </div>

        <div className="p-6 bg-white/5 rounded-2xl mb-8">
          <div className="text-white/40 text-sm font-medium mb-1">
            {winner === 'player1' ? 'You dominated the arena.' : 'Better luck next time.'}
          </div>
          <div className="text-indigo-200 text-lg font-bold">
            Winner: {winner === 'player1' ? 'Player 1' : 'Player 2'}
          </div>
        </div>

        <button 
          onClick={onRestart}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-widest uppercase rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          Rematch
        </button>
      </div>
    </div>
  );
};

export default MatchOver;
