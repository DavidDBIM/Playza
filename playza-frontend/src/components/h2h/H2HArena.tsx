import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import type { PieceDropHandlerArgs } from 'react-chessboard';
import { History as HistoryIcon } from 'lucide-react';
import { makeChessMove, resignChessGame } from '@/api/chess.api';
import { useToast } from '@/context/toast';

import type { ChessRoom } from '@/types/chess';
import type { UserProfile } from '@/context/auth';

interface H2HArenaProps {
  room: ChessRoom;
  user: UserProfile | null;
}

const H2HArena = ({ room, user }: H2HArenaProps) => {
  const toast = useToast();
  const [game, setGame] = useState(new Chess(room.board_state?.fen));
  const [isResigning, setIsResigning] = useState(false);

  // Sync game state when room updates from polling
  useEffect(() => {
    const currentFen = game.fen();
    if (room.board_state?.fen && room.board_state.fen !== currentFen) {
      setGame(new Chess(room.board_state.fen));
    }
  }, [room.board_state?.fen, game]);

  const onDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!targetSquare) return false;
    if (room.current_turn !== user?.id) {
       toast.error("It's not your turn!");
       return false;
    }

    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', 
      });

      if (move === null) return false;

      // Optimistic update
      setGame(gameCopy);

      // Async sync with backend
      makeChessMove(room.id, { from: sourceSquare, to: targetSquare, promotion: 'q' })
        .catch((err: unknown) => {
          const error = err as { message?: string };
          toast.error(error.message || "Failed to sync move with server");
          // Revert on failure
          if (room.board_state?.fen) {
            setGame(new Chess(room.board_state.fen));
          }
        });
        
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Invalid move");
      return false;
    }
  };

  const handleResign = async () => {
    if (!window.confirm("Are you sure you want to resign?")) return;
    setIsResigning(true);
    try {
      await resignChessGame(room.id);
      toast.success("You resigned the game.");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to resign");
    } finally {
      setIsResigning(false);
    }
  };

  const isYourTurn = room.current_turn === user?.id;
  const boardOrientation = room.host_id === user?.id ? 'white' : 'black';

  return (
    <div className="w-full animate-in fade-in duration-1000">
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-none">
        {/* Game Status Bar */}
        <div className="lg:col-span-12 glass backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-10 p-8 rounded-[3rem] border border-white/10 shadow-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none -z-10"></div>
          
          <div className="flex items-center gap-10 w-full md:w-auto relative z-10">
            {/* Host Player */}
            <div className="flex items-center gap-6">
              <div className={`relative group/avatar ${room.current_turn === room.host_id ? 'ring-2 ring-primary ring-offset-4 ring-offset-slate-950 rounded-2xl' : ''}`}>
                <div className="absolute -inset-1.5 bg-primary rounded-2xl blur-md opacity-20 group-hover/avatar:opacity-100 transition-opacity"></div>
                <img alt="Host" className="w-16 h-16 rounded-2xl relative border-2 border-slate-950 shadow-2xl" src={room.host?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAhAiatk8ur8Q-K0Le1QhqDjnbsMxjwXmHipaxc0UTBbB6GqTpa1bQsZSPyNtYShYLKMV55WZmzBcNZ3_Gq52CZV8ok1z6oE-mR7bT27msTPFJ6luvSHZvvMf-uuHTethFKlDascncDE8mm73Q8DbT2_9OX4OIpi96CRL5yF-xBIcY_9c1Kdkz8b0ajbbqgf3PGiew4rZ4BUY0AEjLtKWAxWuVcYn7cpA-K-JjjHtmItNWB80dIcLEadlSa8YyjKlr5O332LsAshaY"} />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-slate-950 shadow-lg ${room.current_turn === room.host_id ? 'bg-primary animate-pulse' : 'bg-slate-500'}`}></div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-1 italic">
                  {room.host_id === user?.id ? "YOU (WHITE)" : "RIVAL"}
                </div>
                <div className="font-headline text-2xl font-black text-foreground uppercase tracking-widest italic">{room.host?.username || "Grandmaster"}</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-primary font-headline font-black text-4xl px-6 italic rotate-[-5deg] animate-pulse drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">VS</div>
              {isYourTurn && (
                <div className="bg-primary/20 text-primary px-4 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase italic border border-primary/30">Your Turn</div>
              )}
            </div>

            {/* Guest Player */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-1 italic">
                   {room.guest_id === user?.id ? "YOU (BLACK)" : "RIVAL"}
                </div>
                <div className="font-headline text-2xl font-black text-foreground uppercase tracking-widest italic">{room.guest?.username || "Challenger"}</div>
              </div>
              <div className={`relative group/avatar2 ${room.current_turn === room.guest_id ? 'ring-2 ring-accent ring-offset-4 ring-offset-slate-950 rounded-2xl' : ''}`}>
                <div className="absolute -inset-1.5 bg-accent rounded-2xl blur-md opacity-20 group-hover/avatar2:opacity-100 transition-opacity"></div>
                <img alt="Guest" className="w-16 h-16 rounded-2xl relative border-2 border-slate-950 shadow-2xl" src={room.guest?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCim7hGebKx0EiIqRuXmzQ3l_P6WHx-mB6yTrN2PaD6PMFwbMDxBgYi_9OaO1D0TysAZLqqyGouAZ1X-Ipp_tllazKvaJepNw2_jpkGczR7EJhYVKKerfKE5uHROPq401FHiktS1lHa-FekYI4rF31WL4Rs3GVu9MFK9FrKCEG4pvh3nYOZHhUXZWdPR-40PYpFfFlG-CU9qvJvE_IWb717t-jQnVvBQtJmBeUc_V7AKxxjcnoUOBZ1T7eeHpQJZEP38DVUxQAGfcg"} />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-slate-950 shadow-lg ${room.current_turn === room.guest_id ? 'bg-accent animate-pulse' : 'bg-slate-500'}`}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-12 w-full md:w-auto justify-center md:justify-end border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-12 relative z-10">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground font-black tracking-[0.3em] uppercase italic mb-2">Stake</div>
              <div className="font-headline text-5xl font-black text-secondary italic tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(var(--secondary),0.3)]">{room.stake} <span className="text-sm font-sans font-black text-muted-foreground uppercase ml-1">ZA</span></div>
            </div>
          </div>
        </div>

        {/* Board Area */}
        <div className="lg:col-span-8 flex items-center justify-center p-4">
          <div className="relative p-6 rounded-[3rem] bg-card/60 border border-white/10 shadow-3xl w-full max-w-xl aspect-square overflow-visible group/board">
            <div className="absolute inset-x-0 -top-4 mx-auto w-32 h-8 bg-primary/20 blur-2xl -z-1"></div>
            
            <div className="w-full h-full rounded-2xl overflow-hidden border-8 border-slate-900 shadow-inner relative z-10 bg-slate-900">
               <Chessboard 
                options={{
                  position: game.fen(), 
                  onPieceDrop: onDrop, 
                  boardOrientation: boardOrientation,
                  darkSquareStyle: { backgroundColor: 'rgba(15, 23, 42, 0.4)' },
                  lightSquareStyle: { backgroundColor: 'rgba(51, 65, 85, 0.1)' }
                }}
               />
            </div>
            
            {/* Visual Flair */}
            <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-8 space-y-4 hidden md:block opacity-30">
               {[1,2,3,4].map(i => <div key={i} className="w-1 h-32 bg-linear-to-b from-transparent via-primary to-transparent rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]"></div>)}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Prize Stats */}
          <div className="glass backdrop-blur-3xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden group/prize text-center">
            <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent"></div>
            <div className="flex items-center justify-center gap-2 mb-6 uppercase tracking-[0.5em] text-[10px] font-black text-muted-foreground italic">
                <span className="material-symbols-outlined text-secondary scale-90" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                Loot Pool
                <span className="material-symbols-outlined text-secondary scale-90" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            </div>
            <div className="font-headline text-6xl font-black italic bg-linear-to-br from-primary via-white to-accent bg-clip-text text-transparent drop-shadow-2xl">
              {room.stake * 2} <span className="text-xl inline-block -translate-y-4">ZA</span>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5 flex justify-center">
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">House (10%)</p>
                  <p className="font-headline font-black text-lg text-muted-foreground italic">{(room.stake * 2 * 0.1).toFixed(0)} ZA</p>
               </div>
            </div>
          </div>

          {/* Move History */}
          <div className="flex-1 glass backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 flex flex-col min-h-120 shadow-2xl">
            <h3 className="font-headline text-xl font-black mb-8 flex items-center gap-4 tracking-widest uppercase italic">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/30">
                 <HistoryIcon size={20} className="text-primary" />
              </div>
              BATTLE LOG
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-3 custom-scrollbar">
               {game.history().map((move, i) => (
                 <div key={i} className="flex items-center gap-4 py-3 px-5 rounded-[1.2rem] bg-white/5 border border-white/5">
                    <span className="text-muted-foreground font-black text-[10px] italic w-6">{(i + 1).toString().padStart(2, '0')}</span>
                    <span className="font-headline font-black text-sm uppercase italic text-foreground tracking-widest">{move}</span>
                 </div>
               ))}
               {!isYourTurn && room.status === 'active' && (
                  <div className="py-4 px-5 rounded-[1.2rem] bg-primary/10 border border-primary/20 animate-pulse flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Rival Thinking...</span>
                     <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-0"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-300"></div>
                     </div>
                  </div>
               )}
            </div>

            <div className="mt-10 space-y-4">
              <button 
                onClick={handleResign}
                disabled={isResigning || room.status !== 'active'}
                className="w-full border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-headline font-black py-4 rounded-2xl transition-all italic uppercase tracking-[0.2em] text-xs disabled:opacity-50"
              >
                {isResigning ? "RESIGNING..." : "RESIGN BATTLE"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default H2HArena;
