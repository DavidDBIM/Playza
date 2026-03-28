import { useParams, useNavigate } from "react-router";
import { games } from "@/data/games";
import { X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const GamePlay = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    
    const game = games.find((g) => g.slug === id);

    useEffect(() => {
      
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    if (!game) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white p-2 md:p-6 text-center">
                <h2 className="text-lg md:text-2xl font-black uppercase tracking-widest mb-4">Arena Error</h2>
                <p className="text-slate-400 font-bold mb-8 uppercase text-xs tracking-tighter italic">
                    Game sequence "{id}" not found in our database.
                </p>
                <button 
                    onClick={() => navigate("/games")}
                    className="bg-primary text-slate-950 px-2 md:px-8 py-2 md:py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all"
                >
                    Return to Lobby
                </button>
            </div>
        );
    }

    if (!game.iframeUrl) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white p-2 md:p-6 text-center">
                <h2 className="text-lg md:text-2xl font-black uppercase tracking-widest mb-4">Configuration Error</h2>
                <p className="text-slate-400 font-bold mb-8 uppercase text-xs tracking-tighter italic">
                    The game "{game.title}" is currently being maintained.
                </p>
                <button 
                    onClick={() => navigate(`/games/${game.slug}/session`)}
                    className="bg-primary text-slate-950 px-2 md:px-8 py-2 md:py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all"
                >
                    Back to Session
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
            {/* Top Bar / Header Overlay */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-100 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-2 md:px-4 py-2 rounded-full border border-white/10 shadow-xl flex items-center gap-2 md:gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 italic">{game.title} - LIVE ARENA</span>
                </div>

                <div className="pointer-events-auto">
                    <button 
                        onClick={() => navigate(`/games/${game.slug}/session`)}
                        className="bg-black/40 backdrop-blur-md p-2 md:p-3 rounded-full text-white/50 hover:text-white transition-all border border-white/10 shadow-lg hover:scale-110 active:scale-95 group"
                        title="Exit Game"
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            {/* Game Loader */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20">
                    <Loader2 size={40} className="text-primary animate-spin mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic animate-pulse">Initialising Battle Sequence...</p>
                </div>
            )}

            {/* Iframe Container */}
            <div className="flex-1 w-full h-full relative">
                <iframe 
                    src={game.iframeUrl} 
                    className="w-full h-full border-none shadow-2xl" 
                    title={game.title}
                    allow="autoplay; fullscreen; keyboard; gamepad"
                    onLoad={() => setIsLoading(false)}
                />
            </div>
        </div>
    );
};

export default GamePlay;
