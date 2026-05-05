import { useState } from "react";
import { Sparkles } from "lucide-react"; 
import { startSoloSession, endSoloSession } from '@/api/soloearn.api';
import { useToast } from '@/context/toast';

import { soloGames } from "@/data/soloGames";
import type { Game } from '@/components/soloearn/types';
import { SoloGameCard } from '@/components/soloearn/SoloGameCard';
import { PreGameSetup } from '@/components/soloearn/PreGameSetup';
import { GameArenaLayout } from '@/components/soloearn/GameArenaLayout';
import { ResultsPanel } from '@/components/soloearn/ResultsPanel';

// --- Main Page ---

const SoloEarn = () => {
  const toast = useToast();
  
  const [view, setView] = useState('hub');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [currentStake, setCurrentStake] = useState('0');
  const [finalMultiplier, setFinalMultiplier] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setView('setup');
  };

  // --- REACT TO BACKEND LOGIC ---
  // When the user starts a game, we contact the backend to deduct their stake
  // and create an active session in the database.
  // When the game ends, we send the session ID and the multiplier back to the
  // server so it can verify the multiplier and payout the user's wallet.
  const handleStartGame = async (stake: string) => {
    try {
      const res = await startSoloSession(selectedGame?.id, parseFloat(stake));
      if (res.success) {
        setSessionId(res.session.id);
        setCurrentStake(stake);
        setView('playing');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to start game');
    }
  };

  const handleGameEnd = async (multiplier?: number) => {
    if (!sessionId) {
      setFinalMultiplier(multiplier || 0);
      setView('results');
      return;
    }

    try {
      const res = await endSoloSession(sessionId, multiplier || 0);
      if (res.success) {
        setFinalMultiplier(res.multiplier);
        setView('results');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to process payout');
      setFinalMultiplier(0);
      setView('results');
    }
  };

  if (view === 'setup' && selectedGame) {
    return <PreGameSetup game={selectedGame} onBack={() => setView('hub')} onStart={handleStartGame} />;
  }

  if (view === 'playing' && selectedGame) {
    return <GameArenaLayout game={selectedGame} onResult={handleGameEnd} onExit={() => setView('setup')} />;
  }

  if (view === 'results' && selectedGame) {
    return <ResultsPanel game={selectedGame} stake={currentStake} multiplier={finalMultiplier} onBack={() => setView('hub')} onPlayAgain={() => setView('setup')} />;
  }

  return (
    <div className="w-full flex flex-col min-w-0 space-y-8 animate-in fade-in pb-16">
      
      {/* Header Panel */}
      <div className="glass-card p-6 md:p-8 rounded-xl border border-primary/10 bg-surface-elevated/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground uppercase tracking-tight mb-2">
            Solo<span className="text-primary">Earn</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Test your limits in skill-based challenges. Stake your entry, achieve high scores, and multiply your earnings instantly based on your performance.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-black text-lg text-foreground uppercase tracking-wider">Available Challenges</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {soloGames.map(game => (
            <SoloGameCard key={game.id} game={game} onSelect={handleSelectGame} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default SoloEarn;
