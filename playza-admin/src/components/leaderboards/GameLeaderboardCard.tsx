import React, { useState } from 'react';
import { 
  MdKeyboardArrowDown, 
  MdKeyboardArrowRight, 
  MdSportsEsports
} from 'react-icons/md';
import { formatNaira } from '../../lib/utils';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  score: number;
  reward: number;
  status: string;
}

interface GameLeaderboardCardProps {
  game: {
    id: string;
    name: string;
    entries: LeaderboardEntry[];
  };
  activeSessionId?: string;
}

const GameLeaderboardCard: React.FC<GameLeaderboardCardProps> = ({ game }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const topThree = game.entries.slice(0, 3);

  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:border-primary/30 transition-all group">
      {/* Header Container */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 md:p-6 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-blue-500/20 flex items-center justify-center border border-primary/20 shrink-0">
            <MdSportsEsports className="text-primary text-2xl" />
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground tracking-tight uppercase">
              {game.name}
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {game.entries.length} Active Combatants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           {/* Mini Top 3 Preview */}
           {!isExpanded && (
             <div className="hidden md:flex items-center -space-x-2">
               {topThree.map((entry, i) => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-card overflow-hidden" title={entry.username}>
                   <img src={entry.avatar} alt={entry.username} className="w-full h-full object-cover" />
                 </div>
               ))}
             </div>
           )}
           
           <div className="text-primary transform transition-transform">
            {isExpanded ? <MdKeyboardArrowDown className="text-2xl" /> : <MdKeyboardArrowRight className="text-2xl" />}
          </div>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      {isExpanded && (
        <div className="p-4 pt-0 animate-in slide-in-from-top-2 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="py-2 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Rank</th>
                  <th className="py-2 text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">User</th>
                  <th className="py-2 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Wins</th>
                  <th className="py-2 text-right text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Rewards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {game.entries.map((entry) => (
                  <tr key={entry.rank} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4">
                       <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                         entry.rank === 1 ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30' :
                         entry.rank === 2 ? 'bg-slate-300 text-slate-700' :
                         entry.rank === 3 ? 'bg-orange-400 text-white' :
                         'bg-muted text-muted-foreground'
                       }`}>
                         {entry.rank}
                       </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img src={entry.avatar} alt={entry.username} className="w-7 h-7 rounded-lg object-cover border border-border" />
                        <span className="text-xs font-black text-foreground uppercase tracking-tight">@{entry.username}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="text-xs font-bold text-foreground font-number">{entry.score}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-xs font-black text-emerald-500 font-number">{formatNaira(entry.reward)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLeaderboardCard;
