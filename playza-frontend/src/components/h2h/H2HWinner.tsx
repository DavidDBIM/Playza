import { NavLink } from 'react-router';
import type { UserProfile } from '@/context/auth';
import { Medal } from 'lucide-react';
import { ZASymbol } from '@/components/currency/ZASymbol';

interface H2HWinnerProps {
  room: any;
  user: UserProfile | null;
  localWinnerId?: string | null;
  isSyncing?: boolean;
}

const H2HWinner = ({ room, user, localWinnerId, isSyncing }: H2HWinnerProps) => {
  const finalWinnerId = room.winner_id || localWinnerId;
  const isWinner = finalWinnerId === user?.id;
  const isDraw = !finalWinnerId; 
  
  const totalPrize = room.stake * 2;
  const platformFee = totalPrize * 0.1;
  const winningAmount = totalPrize - platformFee;

  return (
    <div className="w-full min-h-[90vh] md:min-h-[80vh] flex items-center justify-center relative overflow-visible">
      
      <div className={`absolute top-0 inset-x-0 h-75 md:h-150 w-full ${isWinner ? 'bg-primary/5' : 'bg-red-500/5'} rounded-full -z-1`}></div>
      
      <div className="relative z-10 w-full max-w-3xl text-center space-y-8 md:space-y-12 px-4 md:px-0">
        <div className="relative flex flex-col items-center">
            {isWinner && (
                <div className="absolute -top-8 md:-top-12 z-20">
                    <Medal className="text-secondary w-16 h-16 md:w-24 md:h-24" />
                </div>
            )}
            <div className={`w-40 h-40 md:w-64 md:h-64 rounded-full p-1.5 md:p-2 border border-black/10 dark:border-white/10 ${isWinner ? 'bg-primary' : 'bg-slate-700'}`}>
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
                </div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                <h1 className={`font-headline text-3xl md:text-8xl font-black italic tracking-tighter uppercase leading-none rotate-[-5deg] ${isWinner ? 'text-white' : 'text-slate-500'}`}>
                    {isWinner ? "VICTORY!" : isDraw ? "DRAW!" : "DEFEAT"}
                </h1>
                {isSyncing && (
                  <p className="mt-2 md:mt-4 text-[10px] md:text-sm font-black text-amber-500 uppercase tracking-widest rotate-[-5deg]">
                    Syncing Results...
                  </p>
                )}
            </div>
        </div>

        {/* Reward Stats */}
        <div className="bg-white/80 dark:bg-slate-900/40 p-6 md:p-10 rounded-3xl border border-black/5 dark:border-white/10 text-center relative overflow-hidden mx-2 md:mx-0">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic mb-4 md:mb-6">Match Result</p>
            <div className={`font-headline text-3xl md:text-8xl font-black italic tracking-tighter leading-none mb-6 font-headline ${isWinner ? 'text-secondary' : 'text-slate-900 dark:text-white'}`}>
              {isWinner ? `+${winningAmount.toFixed(0)}` : `-${room.stake}`} <span className="text-[10px] md:text-2xl not-italic font-sans opacity-50 uppercase tracking-widest"><ZASymbol className="inline-block scale-110 md:scale-125 ml-1 md:ml-2" /></span>
            </div>
            
            <div className="h-px bg-black/5 dark:bg-white/10 w-24 md:w-48 mx-auto mb-6 md:mb-8"></div>
            
            <div className="grid grid-cols-2 gap-3 md:gap-8">
                <div className="space-y-1 md:space-y-2 p-3 md:p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic leading-none">Rival</p>
                    <p className="text-[10px] md:text-base font-headline font-black text-slate-900 dark:text-white italic truncate">
                        {isWinner ? (room.guest?.id === user?.id ? (room.host?.username || "HOST") : (room.guest?.username || "GUEST")) : (room.host?.id === user?.id ? (room.guest?.username || "OPPONENT") : (room.host?.username || "OPPONENT"))}
                    </p>
                </div>
                <div className="space-y-1 md:space-y-2 p-3 md:p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic leading-none">Experience</p>
                    <p className="text-[10px] md:text-base font-headline font-black text-slate-900 dark:text-white italic">
                        {isWinner ? "85% BOOST" : "15% GAIN"}
                    </p>
                </div>
            </div>
        </div>

        {/* Action Group */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center px-4 md:px-0">
          <NavLink 
            to="/h2h"
            className="flex-1 md:flex-none px-6 md:px-12 py-4 md:py-6 bg-white dark:bg-slate-950 border-2 md:border-[3px] border-primary text-primary font-headline font-black rounded-xl uppercase tracking-widest text-[10px] md:text-lg italic text-center"
          >
            NEXT BATTLE
          </NavLink>
          <NavLink 
            to="/leaderboard"
            className="flex-1 md:flex-none px-6 md:px-12 py-4 md:py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-headline font-black rounded-xl uppercase tracking-widest text-[10px] md:text-lg italic text-center"
          >
            LEADERBOARD
          </NavLink>
        </div>

        {/* Social Status */}
        <div className="pt-4 md:pt-8 opacity-70">
           <button className="text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-slate-500 italic flex items-center justify-center gap-2 md:gap-4 w-full">
              <span className="flex-1 h-px bg-black/5 dark:bg-white/10 hidden sm:block"></span>
              Share Result Record
              <span className="flex-1 h-px bg-black/5 dark:bg-white/10 hidden sm:block"></span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default H2HWinner;
