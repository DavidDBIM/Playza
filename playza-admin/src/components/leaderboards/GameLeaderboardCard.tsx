import React, { useState } from 'react';
import { 
  MdKeyboardArrowDown, 
  MdKeyboardArrowRight, 
  MdSportsEsports 
} from 'react-icons/md';
import type { GameLeaderboard } from '../../data/leaderboardData';
import SessionLeaderboardCard from './SessionLeaderboardCard';

interface GameLeaderboardCardProps {
  game: GameLeaderboard;
}

const GameLeaderboardCard: React.FC<GameLeaderboardCardProps> = ({ game }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const liveSessions = game.sessions.filter(s => s.status === 'Live').length;
  const upcomingSessions = game.sessions.filter(s => s.status === 'Upcoming').length;

  return (
    <div className="glass-card rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg bg-white/50 dark:bg-transparent transition-all group">
      {/* Header Container */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-6 md:p-8 cursor-pointer hover:bg-white/40 dark:hover:bg-white/5 transition-colors flex items-center justify-between group"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl border-2 border-primary/20 shrink-0 transform group-hover:scale-105 transition-transform duration-500">
            <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <MdSportsEsports className="text-primary opacity-50" />
              {game.title}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{game.category}</span>
              <div className="flex items-center gap-2">
                {liveSessions > 0 && <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest animate-pulse border border-emerald-500/20">{liveSessions} Live</span>}
                {upcomingSessions > 0 && <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">{upcomingSessions} Upcoming</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="text-primary transform group-hover:scale-110 transition-transform">
          {isExpanded ? <MdKeyboardArrowDown className="text-3xl" /> : <MdKeyboardArrowRight className="text-3xl" />}
        </div>
      </div>

      {/* Sessions Container */}
      {isExpanded && (
        <div className="p-6 md:p-8 pt-0 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="h-px bg-slate-200 dark:bg-white/10 mb-8 w-full opacity-50"></div>
          <div className="grid grid-cols-1 gap-4">
            {game.sessions.map(session => (
              <SessionLeaderboardCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLeaderboardCard;
