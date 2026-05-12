import { useState, useMemo } from "react";
import { Sparkles, Loader2 } from "lucide-react"; 
import { startSoloSession, endSoloSession } from '@/api/soloearn.api';
import { useToast } from '@/context/toast';
import { useGames } from "@/hooks/gamesession/useGameSession";

import type { Game } from '@/components/soloearn/types';
import { SoloGameCard } from '@/components/soloearn/SoloGameCard';
import { PreGameSetup } from '@/components/soloearn/PreGameSetup';
import { GameArenaLayout } from '@/components/soloearn/GameArenaLayout';
import { ResultsPanel } from '@/components/soloearn/ResultsPanel';
import type { Game as BaseGame } from "@/types/types";

// --- Main Page ---

const SoloEarn = () => {
  const toast = useToast();
  const { data: gamesData, isLoading } = useGames();
  
  const [view, setView] = useState('hub');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [currentStake, setCurrentStake] = useState('0');
  const [finalMultiplier, setFinalMultiplier] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const liveSoloGames = useMemo(() => {
    const rawGames = (gamesData?.games || []) as BaseGame[];
    const isDev = window.location.hostname === 'localhost';
    
    return rawGames
      .filter(g => g.mode === 'Solo Earn' && (g.is_active || isDev))
      .map(g => ({
        id: g.id,
        title: g.title,
        thumbnail: g.thumbnail_url || g.thumbnail,
        difficulty: g.difficulty,
        label: g.category || "Skill Challenge",
        description: g.how_to_play?.rules || "Challenge yourself and multiply your stake.",
        path: g.iframe_url || ""
      }));
  }, [gamesData]);

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setView('setup');
  };

  const handleStartGame = async (stake: string) => {
    try {
      const res = await startSoloSession(selectedGame?.id as string, parseFloat(stake));
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

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4 animate-in fade-in">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Synchronizing Solo Modules...</p>
      </div>
    );
  }

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
        
        {liveSoloGames.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {liveSoloGames.map(game => (
              <SoloGameCard key={game.id} game={game} onSelect={handleSelectGame} />
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-700 bg-white/5 rounded-3xl border border-dashed border-primary/10">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative size-24 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
                <span className="text-5xl animate-pulse">🕹️</span>
              </div>
            </div>
            <div className="space-y-2 max-w-sm px-6 mx-auto">
              <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">
                Sector Maintenance
              </h2>
              <p className="text-muted-foreground text-[10px] md:text-xs font-bold leading-relaxed uppercase tracking-widest">
                The Solo Earn sector is currently undergoing scheduled calibration. 
                New challenges are being synced to the database. Check back soon.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default SoloEarn;
