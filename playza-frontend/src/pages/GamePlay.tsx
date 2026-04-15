import { useParams, useNavigate } from "react-router";
import { games } from "@/data/games";
import { X, Loader2, Maximize, Minimize } from "lucide-react";
import { useEffect, useState } from "react";
import GameOverLeaderboard from "@/components/game/GameOverLeaderboard";
import LiveEntryModal from "@/components/gameSession/LiveEntryModal";

const GamePlay = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [gameOverData, setGameOverData] = useState<{ score: number } | null>(null);
    const [showLiveEntry, setShowLiveEntry] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const game = games.find((g) => g.slug === id);

    useEffect(() => {
        document.body.style.overflow = "hidden";

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        const enterFullscreen = async () => {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                }
            } catch (err) {
                console.log("Auto-fullscreen requires user gesture", err);
            }
        };
        // Try to auto-enter fullscreen if the browser allows (e.g. recent navigation click)
        setTimeout(enterFullscreen, 100);

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "PLAYZA_SCORE_SUBMISSION") {
                setGameOverData(event.data.payload);
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            document.body.style.overflow = "auto";
            window.removeEventListener("message", handleMessage);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            // Optionally exit fullscreen when leaving page
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(err => console.log(err));
            }
        };
    }, []);

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            try {
                await document.documentElement.requestFullscreen();
            } catch (err) {
                console.error("Error attempting to enable fullscreen:", err);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        }
    };

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
        <div className="fixed inset-0 z-200 bg-black flex flex-col overflow-hidden">
            {/* Top Bar / Header Overlay */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-100 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-2 md:px-4 py-2 rounded-full border border-white/10 shadow-xl flex items-center gap-2 md:gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 italic">{game.title} - LIVE ARENA</span>
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
                        onClick={() => navigate(`/games/${game.slug}/session`)}
                        className="bg-black/40 backdrop-blur-md p-2 md:p-3 rounded-full text-rose-500/50 hover:text-rose-500 transition-all border border-white/10 shadow-lg hover:scale-110 active:scale-95 group"
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
            <div className={`flex-1 min-h-0 w-full relative ${gameOverData ? 'hidden' : ''}`}>
                <div
                    className="h-full w-full px-2 pb-3 pt-20 md:px-4 md:pb-4 md:pt-24 lg:px-6"
                    onClick={(e) => (e.currentTarget.querySelector('iframe') as HTMLIFrameElement)?.focus()}
                >
                    <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-center overflow-hidden rounded-2xl bg-slate-950/80 shadow-2xl ring-1 ring-white/10">
                        <iframe 
                            src={game.iframeUrl} 
                            className="h-full w-full border-none" 
                            title={game.title}
                            allow="autoplay; fullscreen; gamepad"
                            onLoad={() => setIsLoading(false)}
                        />
                    </div>
                </div>
            </div>

            {/* Game Over Overlay */}
            {gameOverData && (
                <GameOverLeaderboard 
                    score={gameOverData.score} 
                    playAgain={() => {
                        setGameOverData(null);
                        setShowLiveEntry(true);
                    }} 
                    onBackToSession={() => navigate(`/games/${game.slug}/session`)}
                />
            )}

            {/* Live Entry Modal Overlay for Re-entry */}
            {showLiveEntry && game && (
                <LiveEntryModal 
                    game={game}
                    onClick={(open) => {
                        if (!open) {
                            setShowLiveEntry(false);
                            navigate(`/games/${game.slug}/session`);
                        }
                    }}
                    onConfirm={() => {
                        setShowLiveEntry(false);
                        setIsLoading(true);
                        const iframe = document.querySelector('iframe');
                        if (iframe) {
                            const originalSrc = iframe.src;
                            iframe.src = "about:blank";
                            setTimeout(() => {
                                iframe.src = originalSrc;
                            }, 10);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default GamePlay;
