import { NavLink } from 'react-router';
import type { ChessRoom } from '@/types/chess';
import type { UserProfile } from '@/context/auth';
import { Medal } from 'lucide-react';
import { ZASymbol } from '@/components/currency/ZASymbol';

interface ChessWinnerProps {
  room: ChessRoom;
  user: UserProfile | null;
  localWinnerId?: string | null;
  isSyncing?: boolean;
}

const ChessWinner = ({ room, user, localWinnerId, isSyncing }: ChessWinnerProps) => {
  const finalWinnerId = room.winner_id || localWinnerId;
  const isWinner = finalWinnerId === user?.id;
  const isDraw = !finalWinnerId; 
  
  const totalPrize = room.stake * 2;
  const platformFee = totalPrize * 0.1;
  const winningAmount = totalPrize - platformFee;

  return (
    <div className="w-full min-h-[90vh] md:min-h-[80vh] flex items-center justify-center animate-in fade-in zoom-in-95 duration-1000 relative overflow-visible">
      
      <div className={`absolute top-0 inset-x-0 h-75 md:h-150 w-full ${isWinner ? 'bg-primary/10' : 'bg-red-500/5'} rounded-full blur-[100px] md:blur-[150px] -z-1 animate-pulse`}></div>
      
      <div className="relative z-10 w-full max-w-3xl text-center space-y-8 md:space-y-12 px-4 md:px-0">
        <div className="relative flex flex-col items-center">
            {isWinner && (
                <div className="absolute -top-8 md:-top-12 animate-bounce z-20">
                    <Medal className="text-secondary w-16 h-16 md:w-24 md:h-24 drop-shadow-[0_0_20px_rgba(var(--secondary),0.6)]" />
                </div>
            )}
            <div className={`w-40 h-40 md:w-64 md:h-64 rounded-full p-1.5 md:p-2 animate-[spin_12s_linear_infinite] shadow-2xl ${isWinner ? 'bg-linear-to-br from-primary to-accent shadow-primary/40' : 'bg-linear-to-br from-slate-700 to-slate-900 shadow-black/40'}`}>
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                </div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                <h1 className={`font-headline text-4xl md:text-8xl font-black italic tracking-tighter uppercase leading-none drop-shadow-3xl rotate-[-5deg] animate-in slide-in-from-bottom-5 duration-700 ${isWinner ? 'text-white' : 'text-muted-foreground'}`}>
                    {isWinner ? "VICTORY!" : isDraw ? "DRAW!" : "DEFEAT"}
                </h1>
                {isSyncing && (
                  <p className="mt-2 md:mt-4 text-[8px] md:text-sm font-black text-amber-500 uppercase tracking-widest animate-pulse rotate-[-5deg]">
                    Syncing Results...
                  </p>
                )}
            </div>
        </div>

        {/* Reward Stats */}
        <div className="glass backdrop-blur-3xl p-6 md:p-10 rounded-3xl border border-white/20 shadow-3xl text-center relative overflow-hidden group mx-2 md:mx-0">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground italic mb-4 md:mb-6">Match Result</p>
            <div className={`font-headline text-4xl md:text-8xl font-black italic tracking-tighter leading-none mb-6 md:mb-8 drop-shadow-2xl ${isWinner ? 'text-secondary' : 'text-foreground'}`}>
              {isWinner ? `+${winningAmount.toFixed(0)}` : `-${room.stake}`} <span className="text-xs md:text-2xl not-italic font-sans opacity-50 uppercase tracking-widest"><ZASymbol className="inline-block scale-110 md:scale-125 ml-1 md:ml-2" /></span>
            </div>
            
            <div className="h-px bg-white/10 w-24 md:w-48 mx-auto mb-6 md:mb-8"></div>
            
            <div className="grid grid-cols-2 gap-3 md:gap-8">
                <div className="space-y-1 md:space-y-2 p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all min-w-0">
                    <p className="text-[7px] md:text-[9px] font-black uppercase text-muted-foreground tracking-widest italic">Rival</p>
                    <p className="text-[10px] md:text-base font-headline font-black text-foreground italic truncate">
                        {isWinner ? (room.guest?.id === user?.id ? (room.host?.username || "HOST") : (room.guest?.username || "GUEST")) : (room.host?.id === user?.id ? (room.guest?.username || "OPPONENT") : (room.host?.username || "OPPONENT"))}
                    </p>
                </div>
                <div className="space-y-1 md:space-y-2 p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all">
                    <p className="text-[7px] md:text-[9px] font-black uppercase text-muted-foreground tracking-widest italic">Experience</p>
                    <p className="text-[10px] md:text-base font-headline font-black text-foreground italic">
                        {isWinner ? "85% BOOST" : "15% GAIN"}
                    </p>
                </div>
            </div>
        </div>

        {/* Action Group */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center px-4 md:px-0">
          <NavLink 
            to="/h2h"
            className="flex-1 md:flex-none px-6 md:px-12 py-4 md:py-6 bg-white dark:bg-black/60 border-2 md:border-[3px] border-primary text-primary font-headline font-black rounded-xl transition-all hover:scale-105 shadow-2xl uppercase tracking-widest text-[10px] md:text-lg italic hover:bg-primary hover:text-white text-center"
          >
            NEXT BATTLE
          </NavLink>
          <NavLink 
            to="/leaderboard"
            className="flex-1 md:flex-none px-6 md:px-12 py-4 md:py-6 bg-foreground text-background font-headline font-black rounded-xl transition-all hover:scale-105 shadow-2xl uppercase tracking-widest text-[10px] md:text-lg italic hover:shadow-primary/30 text-center"
          >
            LEADERBOARD
          </NavLink>
        </div>

        {/* Social Status */}
        <div className="pt-4 md:pt-8 opacity-50 hover:opacity-100 transition-opacity">
           <button className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-muted-foreground italic flex items-center justify-center gap-2 md:gap-4 hover:text-primary transition-colors w-full">
              <span className="flex-1 h-px bg-white/10 hidden sm:block"></span>
              Share Result Record
              <span className="flex-1 h-px bg-white/10 hidden sm:block"></span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default ChessWinner;
