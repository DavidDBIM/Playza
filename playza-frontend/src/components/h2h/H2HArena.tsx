import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { History as HistoryIcon, Star } from 'lucide-react';
import { makeChessMove, resignChessGame } from '@/api/chess.api';
import { useToast } from '@/context/toast';
import { ZASymbol } from '@/components/currency/ZASymbol';
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

  useEffect(() => {
    const currentFen = game.fen();
    if (room.board_state?.fen && room.board_state.fen !== currentFen) {
      setGame(new Chess(room.board_state.fen));
    }
  }, [room.board_state?.fen, game]);

  const onPieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    if (room.current_turn !== user?.id) {
      toast.error("It's not your turn!");
      return false;
    }

    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });

      if (move === null) return false;

      setGame(gameCopy);

      makeChessMove(room.id, { from: sourceSquare, to: targetSquare, promotion: 'q' })
        .catch((err: unknown) => {
          const error = err as { message?: string };
          toast.error(error.message || 'Failed to sync move with server');
          if (room.board_state?.fen) setGame(new Chess(room.board_state.fen));
        });

      return true;
    } catch {
      toast.error('Invalid move');
      return false;
    }
  };

  const handleResign = async () => {
    if (!window.confirm('Are you sure you want to resign?')) return;
    setIsResigning(true);
    try {
      await resignChessGame(room.id);
      toast.success('You resigned the game.');
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Failed to resign');
    } finally {
      setIsResigning(false);
    }
  };

  const isYourTurn = room.current_turn === user?.id;
  const boardOrientation = room.host_id === user?.id ? 'white' : 'black';

  return (
    <div className="w-full animate-in fade-in duration-1000">
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-8 w-full max-w-none">

        <div className="lg:col-span-12 glass backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-2 md:gap-10 p-2 md:p-8 rounded-[3rem] border border-white/10 shadow-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none -z-10"></div>

          <div className="flex items-center gap-2 md:gap-10 w-full md:w-auto relative z-10">
            <div className="flex items-center gap-2 md:gap-6">
              <div className={`relative group/avatar ${room.current_turn === room.host_id ? 'ring-2 ring-primary ring-offset-4 ring-offset-slate-950 rounded-2xl' : ''}`}>
                <div className="absolute -inset-1.5 bg-primary rounded-2xl blur-md opacity-20 group-hover/avatar:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-950 flex items-center justify-center font-black text-white text-xl">
                  {room.host?.username?.[0]?.toUpperCase()}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-slate-950 shadow-lg ${room.current_turn === room.host_id ? 'bg-primary animate-pulse' : 'bg-slate-500'}`}></div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-1 italic">
                  {room.host_id === user?.id ? 'YOU (WHITE)' : 'RIVAL'}
                </div>
                <div className="font-headline text-lg md:text-2xl font-black text-foreground uppercase tracking-widest italic">{room.host?.username || 'Grandmaster'}</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-primary font-headline font-black text-2xl md:text-4xl px-2 md:px-6 italic rotate-[-5deg] animate-pulse">VS</div>
              {isYourTurn && (
                <div className="bg-primary/20 text-primary px-2 md:px-4 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase italic border border-primary/30">Your Turn</div>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-6">
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-1 italic">
                  {room.guest_id === user?.id ? 'YOU (BLACK)' : 'RIVAL'}
                </div>
                <div className="font-headline text-lg md:text-2xl font-black text-foreground uppercase tracking-widest italic">{room.guest?.username || 'Challenger'}</div>
              </div>
              <div className={`relative group/avatar2 ${room.current_turn === room.guest_id ? 'ring-2 ring-accent ring-offset-4 ring-offset-slate-950 rounded-2xl' : ''}`}>
                <div className="absolute -inset-1.5 bg-accent rounded-2xl blur-md opacity-20 group-hover/avatar2:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-slate-950 flex items-center justify-center font-black text-white text-xl">
                  {room.guest?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-slate-950 shadow-lg ${room.current_turn === room.guest_id ? 'bg-accent animate-pulse' : 'bg-slate-500'}`}></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-12 w-full md:w-auto justify-center md:justify-end border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-12 relative z-10">
            <div className="text-center">
              <div className="text-[10px] text-muted-foreground font-black tracking-[0.3em] uppercase italic mb-2">Stake</div>
              <div className="font-headline text-3xl md:text-5xl font-black text-secondary italic tracking-tighter tabular-nums">{room.stake} <span className="text-sm font-sans font-black text-muted-foreground uppercase ml-1"><ZASymbol className="inline-block scale-110" /></span></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex items-center justify-center p-2 md:p-4">
          <div className="relative p-2 md:p-6 rounded-[3rem] bg-card/60 border border-white/10 shadow-3xl w-full max-w-xl aspect-square overflow-visible">
            <div className="w-full h-full rounded-2xl overflow-hidden border-8 border-slate-900 shadow-inner relative z-10 bg-slate-900">
              <Chessboard
                position={game.fen()}
                onPieceDrop={onPieceDrop}
                boardOrientation={boardOrientation}
                arePiecesDraggable={isYourTurn}
                customDarkSquareStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
                customLightSquareStyle={{ backgroundColor: 'rgba(51, 65, 85, 0.4)' }}
                customBoardStyle={{ borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-2 md:gap-8">
          <div className="glass backdrop-blur-3xl rounded-xl p-2 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden group/prize text-center">
            <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent"></div>
            <div className="flex items-center justify-center gap-2 mb-6 uppercase tracking-[0.5em] text-[10px] font-black text-muted-foreground italic">
              <Star className="text-secondary size-5 fill-current" />
              Loot Pool
              <Star className="text-secondary size-5 fill-current" />
            </div>
            <div className="font-headline text-4xl md:text-6xl font-black italic bg-linear-to-br from-primary via-white to-accent bg-clip-text text-transparent">
              {room.stake * 2} <span className="text-base md:text-xl inline-block -translate-y-4"><ZASymbol className="inline-block scale-125 ml-1" /></span>
            </div>
            <div className="mt-8 pt-2 md:pt-8 border-t border-white/5 flex justify-center">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">House (10%)</p>
                <p className="font-headline font-black text-xs md:text-lg text-muted-foreground italic">{(room.stake * 2 * 0.1).toFixed(0)} <ZASymbol className="inline-block scale-75 ml-1" /></p>
              </div>
            </div>
          </div>

          <div className="flex-1 glass backdrop-blur-3xl rounded-xl p-2 md:p-8 border border-white/10 flex flex-col min-h-120 shadow-2xl">
            <h3 className="font-headline text-base md:text-xl font-black mb-8 flex items-center gap-2 md:gap-4 tracking-widest uppercase italic">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/30">
                <HistoryIcon size={20} className="text-primary" />
              </div>
              BATTLE LOG
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 md:pr-3">
              {game.history().map((move, i) => (
                <div key={i} className="flex items-center gap-2 md:gap-4 py-2 md:py-3 px-2 md:px-5 rounded-[1.2rem] bg-white/5 border border-white/5">
                  <span className="text-muted-foreground font-black text-[10px] italic w-6">{(i + 1).toString().padStart(2, '0')}</span>
                  <span className="font-headline font-black text-sm uppercase italic text-foreground tracking-widest">{move}</span>
                </div>
              ))}
              {!isYourTurn && room.status === 'active' && (
                <div className="py-2 md:py-4 px-2 md:px-5 rounded-[1.2rem] bg-primary/10 border border-primary/20 animate-pulse flex items-center justify-between">
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
                className="w-full border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-headline font-black py-2 md:py-4 rounded-2xl transition-all italic uppercase tracking-[0.2em] text-xs disabled:opacity-50"
              >
                {isResigning ? 'RESIGNING...' : 'RESIGN BATTLE'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default H2HArena;
