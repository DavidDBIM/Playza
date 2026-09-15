import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { Sparkles, Loader2, Gamepad2, TrendingUp, Zap } from "lucide-react"; 
import { startSoloSession, endSoloSession } from '@/api/soloearn.api';
import { useToast } from '@/context/toast';
import { useGames } from "@/hooks/gamesession/useGameSession";

import type { Game } from '@/components/soloearn/types';
import { SoloGameCard } from '@/components/soloearn/SoloGameCard';
import { PreGameSetup } from '@/components/soloearn/PreGameSetup';
import { GameArenaLayout } from '@/components/soloearn/GameArenaLayout';
import { ResultsPanel } from '@/components/soloearn/ResultsPanel';
import type { Game as BaseGame } from "@/types/types";
import SEO from "@/components/SEO"

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

  // Arrived via a direct game link (Explore → Solo Earn points at
  // `/solo-earn?game=<id>` since this page has no per-game URL of its
  // own) — jump straight into that game's setup step instead of leaving
  // the user back at the hub to pick it again themselves.
  const [searchParams] = useSearchParams();
  const autoSelectedRef = useRef(false);
  useEffect(() => {
    if (autoSelectedRef.current) return;
    const targetId = searchParams.get('game');
    if (!targetId || liveSoloGames.length === 0) return;

    const match = liveSoloGames.find(g => g.id === targetId);
    if (match) {
      autoSelectedRef.current = true;
      handleSelectGame(match);
    }
  }, [searchParams, liveSoloGames]);

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
      <SEO
      title="Solo Earn – Play & Get Paid"
      description="Play solo games on Playza and earn real ZA rewards based on your performance. No opponent needed — just skill."
      url="/solo-earn"
      keywords="solo games earn money online, play alone and win, skill-based solo games"
      />
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
    <div className="w-full flex flex-col min-w-0 space-y-8 animate-in fade-in pb-24 md:pb-10">

      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-slate-950 px-5 md:px-8 py-10 md:py-14 text-center">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[420px] h-[260px] bg-emerald-500/30 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 animate-pulse"></span>
            </span>
            Solo Earn Challenges
          </div>

          <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase italic leading-tight text-white">
            Play Alone. <span className="text-emerald-400">Win Alone.</span>
          </h1>

          <p className="text-slate-400 max-w-xl mx-auto text-[11px] md:text-sm font-medium">
            No opponent needed. Stake your entry, chase a high score, and multiply your earnings based on how well you play.
          </p>

          <div className="flex items-center justify-center gap-2.5 flex-wrap pt-2">
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-2.5">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <p className="text-white text-sm font-black leading-none">{liveSoloGames.length}</p>
                <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest leading-none mt-1">Games Live</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-2.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <p className="text-white text-sm font-black leading-none">2.0x</p>
                <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest leading-none mt-1">Max Payout</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-2.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <p className="text-white text-sm font-black leading-none">Instant</p>
                <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest leading-none mt-1">Results</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <h2 className="font-heading font-black text-lg text-foreground uppercase tracking-wider">Available Challenges</h2>
        </div>

        {liveSoloGames.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {liveSoloGames.map(game => (
              <SoloGameCard key={game.id} game={game} onSelect={handleSelectGame} />
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-700 bg-white/5 rounded-3xl border border-dashed border-emerald-500/10">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
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