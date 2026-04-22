import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Sparkles, X, Loader2, Maximize, Minimize } from "lucide-react"; 
import { useAuth } from "@/context/auth";
import { ZASymbol } from "@/components/currency/ZASymbol";

import { soloGames } from "@/data/soloGames";

// --- Sub-components ---

interface Game {
  id: string | number;
  title: string;
  thumbnail: string;
  difficulty: string;
  label: string;
  description: string;
  path: string;
}

interface GameProps {
  game: Game;
  onSelect?: (game: Game) => void;
  onBack?: () => void;
  onStart?: (stake: string) => void;
  onResult?: () => void;
  onPlayAgain?: () => void;
  stake?: string;
}

const SoloGameCard = ({ game, onSelect }: GameProps) => (
  <div className="glass-card hover:bg-surface-elevated/30 transition-all border border-primary/10 rounded-2xl p-4 flex flex-col group h-full">
    <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-slate-900 border border-white/5">
      <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-500" />
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-[10px] uppercase font-black tracking-widest text-primary border border-primary/20">
        {game.difficulty}
      </div>
    </div>
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <h3 className="font-heading font-black text-lg text-white mb-1 uppercase tracking-tight">{game.title} <span className="text-[10px] ml-1 text-slate-500 font-bold tracking-widest">{game.label}</span></h3>
        <p className="text-sm text-slate-400 mb-4">{game.description}</p>
      </div>
      <Button onClick={() => onSelect?.(game)} className="w-full font-black uppercase text-xs tracking-widest h-10 bg-primary/20 hover:bg-primary text-primary hover:text-black">
        Play Challenge
      </Button>
    </div>
  </div>
);

const PreGameSetup = ({ game, onBack, onStart }: GameProps) => {
  const [stake, setStake] = useState("10");

  return (
    <div className="w-full max-w-2xl mx-auto animation-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </button>

      <div className="glass-card border border-primary/20 rounded-[32px] p-6 md:p-8 bg-surface-elevated/40">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden aspect-square md:aspect-auto md:h-64 relative border border-white/10 shrink-0">
             <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <div>
              <h1 className="font-heading font-black text-2xl md:text-3xl text-white uppercase tracking-tight mb-2">{game.title}</h1>
              <p className="text-sm text-slate-400">{game.description}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">Entry Stake (<ZASymbol className="text-[10px]" />)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black"><ZASymbol className="text-sm" /></span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter Entry Fee..."
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    className="w-full h-12 bg-surface/50 border border-white/10 rounded-xl pl-8 pr-4 text-white font-black font-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                   {[5, 10, 25, 50].map(val => (
                     <button
                       key={val}
                       onClick={() => setStake(val.toString())}
                       className={`flex-1 h-8 rounded-lg font-black text-xs border transition-all ${stake === val.toString() ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-white/10 text-slate-300 hover:bg-surface-elevated'}`}
                     >
                       <ZASymbol className="text-[10px] mr-0.5" />{val}
                     </button>
                   ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-3 items-start">
                <Trophy className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-200/80 leading-relaxed font-medium">
                  Your final reward is based purely on your performance multiplier. High score = High multiplier.
                </p>
              </div>

              <Button onClick={() => onStart?.(stake)} className="w-full h-12 rounded-xl text-sm font-black uppercase tracking-widest text-black shadow-lg shadow-primary/20">
                Start Run
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GameArenaLayout = ({ game,  onResult }: GameProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    // Auto-fullscreen
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => { /* ignore */ });
      }
    } catch { /* ignore */ }

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => { /* ignore */ });
      }
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { /* ignore */ });
    } else {
      document.exitFullscreen().catch(() => { /* ignore */ });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col overflow-hidden">
      {/* Top Bar / Header Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-[100] pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-2 md:px-4 py-2 rounded-full border border-white/10 shadow-xl flex items-center gap-2 md:gap-3">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80 italic">
            {game.title} - SOLO RUN
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleFullscreen}
            className="bg-black/40 backdrop-blur-md p-2 md:p-3 rounded-full text-white/50 hover:text-white transition-all border border-white/10 shadow-lg hover:scale-110 active:scale-95 group"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize size={20} className="group-hover:scale-90 transition-transform duration-300" />
            ) : (
              <Maximize size={20} className="group-hover:scale-110 transition-transform duration-300" />
            )}
          </button>
          
          <button
            onClick={onResult}
            className="bg-black/40 backdrop-blur-md px-3 md:px-4 py-2 md:py-3 rounded-full text-primary hover:bg-primary/20 transition-all border border-primary/30 shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 font-black text-xs uppercase"
          >
            Terminate
            <X size={16} className="text-primary" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20">
          <Loader2 size={40} className="text-primary animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic animate-pulse">
            Initialising Solo Run...
          </p>
        </div>
      )}

      {/* Game Canvas iframe */}
      <div className="flex-1 min-h-0 w-full relative">
        <div className="h-full w-full px-2 pb-3 pt-14 md:px-4 md:pt-16 md:pb-4 lg:pt-10 lg:px-6">
          <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-center overflow-hidden rounded-2xl bg-slate-950/80 shadow-2xl ring-1 ring-white/10">
            <iframe 
              src={game.path} 
              className="w-full h-full border-none"
              title={game.title}
              allow="autoplay; fullscreen"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultsPanel = ({ stake, onBack, onPlayAgain }: GameProps) => {
  const simulatedMultiplier = 1.8;
  const simulatedEarnings = (parseFloat(stake || "0") * simulatedMultiplier).toFixed(2);

  return (
    <div className="w-full max-w-md mx-auto animation-fade-in pt-8">
      <div className="glass-card border border-primary/20 rounded-[32px] p-8 text-center bg-surface-elevated/40 relative overflow-hidden">
        
        {/* Confetti / Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/20 blur-[60px]" />

        <div className="relative z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-orange-400 mx-auto mb-6 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.4)]">
            <span className="font-heading font-black text-3xl text-black">A</span>
          </div>

          <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Rank Achieved</p>
          <h2 className="font-heading font-black text-3xl text-white uppercase tracking-tight mb-8">Excellent Run!</h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass-card bg-surface border border-white/5 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Payout Multiplier</span>
              <span className="font-heading text-2xl font-black text-white">{simulatedMultiplier.toFixed(1)}x</span>
            </div>
            <div className="glass-card bg-primary/10 border border-primary/20 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] uppercase font-black text-primary/70 tracking-widest mb-1">Total Payout</span>
              <span className="font-heading text-2xl font-black text-primary flex items-center gap-1.5"><ZASymbol className="text-3xl" />{simulatedEarnings}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
             <Button onClick={() => onPlayAgain?.()} className="h-12 w-full rounded-full font-black uppercase tracking-widest text-black">
               <span className="flex items-center gap-1">Play Again (<ZASymbol className="text-sm" />{stake})</span>
             </Button>
             <button onClick={onBack} className="h-12 w-full rounded-full font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs">
               Back to Solo Hub
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---

const SoloEarn = () => {
  const { user } = useAuth();
  
  // view: 'hub' | 'setup' | 'playing' | 'results'
  const [view, setView] = useState('hub');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [currentStake, setCurrentStake] = useState('0');

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    setView('setup');
  };

  const handleStartGame = (stake: string) => {
    setCurrentStake(stake);
    setView('playing');
  };

  const handleGameEnd = () => {
    setView('results');
  };

  if (view === 'setup' && selectedGame) {
    return <PreGameSetup game={selectedGame} onBack={() => setView('hub')} onStart={handleStartGame} />;
  }

  if (view === 'playing' && selectedGame) {
    return <GameArenaLayout game={selectedGame} onResult={handleGameEnd} />;
  }

  if (view === 'results' && selectedGame) {
    return <ResultsPanel game={selectedGame} stake={currentStake} onBack={() => setView('hub')} onPlayAgain={() => setView('setup')} />;
  }

  return (
    <div className="w-full flex flex-col min-w-0 space-y-8 animate-in fade-in pb-16">
      
      {/* Header Panel */}
      <div className="glass-card p-6 md:p-8 rounded-[32px] border border-primary/10 bg-surface-elevated/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          <h1 className="font-heading font-black text-3xl md:text-4xl text-white uppercase tracking-tight mb-2">
            Solo<span className="text-primary">Earn</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Test your limits in skill-based challenges. Stake your entry, achieve high scores, and multiply your earnings instantly based on your performance.
          </p>
        </div>

        <div className="relative z-10 flex shrink-0 gap-4">
          <div className="glass-card px-5 py-3 rounded-2xl border border-white/5 bg-background/50 flex flex-col items-end">
             <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Wallet Balance</span>
             <span className="font-heading text-xl font-black text-white flex gap-1.5 items-center"><ZASymbol className="text-2xl" />{user?.wallet?.balance?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-black text-lg text-white uppercase tracking-wider">Available Challenges</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {soloGames.map(game => (
            <SoloGameCard key={game.id} game={game} onSelect={handleSelectGame} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default SoloEarn;
