import { useState, useEffect } from "react";
import { X, Loader2, Maximize, Minimize } from "lucide-react";
import type { GameProps } from "./types";

export const GameArenaLayout = ({ game,  onResult }: GameProps) => {
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

  // --- IFRAME TO REACT COMMUNICATION LOGIC ---
  // The HTML5 game runs in an isolated iframe. When a game completes, it calls window.parent.postMessage()
  // passing { type: 'GAME_OVER', payload: { multiplier } }.
  // This listener securely catches that message and passes the multiplier up to the parent component.
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'GAME_OVER') {
        const payloadMultiplier = e.data.payload?.multiplier || 0;
        const cappedMultiplier = Math.min(Math.max(payloadMultiplier, 0), 2.0);
        onResult?.(cappedMultiplier);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onResult]);

  return (
    <div className="fixed inset-0 z-200 bg-black flex flex-col overflow-hidden">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-100 pointer-events-none">
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
            onClick={() => onResult?.(0)}
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
