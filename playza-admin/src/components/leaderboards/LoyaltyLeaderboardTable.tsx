import React from 'react';
import { 
  MdEmojiEvents, 
  MdPersonOutline, 
  MdMilitaryTech, 
  MdFlashOn
} from 'react-icons/md';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import type { LoyaltyLead } from '../../data/leaderboardData';

interface LoyaltyLeaderboardTableProps {
  data: LoyaltyLead[];
}

const LoyaltyLeaderboardTable: React.FC<LoyaltyLeaderboardTableProps> = ({ data }) => {
  const tierColors: { [key: string]: string } = {
    Elite: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/20',
    Gold: 'bg-amber-400/10 text-amber-400 border-amber-400/20 shadow-amber-400/20',
    Silver: 'bg-slate-400/10 text-slate-400 border-slate-400/20 shadow-slate-400/20',
    Bronze: 'bg-amber-800/10 text-amber-800 dark:text-amber-700 border-amber-800/20 shadow-amber-800/20'
  };

  return (
    <div className="glass-card rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg bg-white/50 dark:bg-transparent">
      <div className="overflow-x-auto no-scrollbar">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-white/10">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="px-8 py-6 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-12 text-center w-24 h-auto shadow-none border-none font-black">Rank</TableHead>
              <TableHead className="px-6 py-6 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-12 h-auto shadow-none border-none font-black">Citizen Identity</TableHead>
              <TableHead className="px-6 py-6 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center h-auto shadow-none border-none font-black">Engagement Tier</TableHead>
              <TableHead className="px-6 py-6 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right pr-15 h-auto shadow-none border-none font-black">PZA Points</TableHead>
              <TableHead className="px-6 py-6 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest h-auto shadow-none border-none font-black">Activity Pulse</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/5 font-headline">
            {data.map((user) => (
              <TableRow 
                key={user.username} 
                className={`group transition-all duration-300 hover:bg-primary/5 border-border/10 ${
                  user.rank === 1 ? 'bg-amber-500/5' : 
                  user.rank === 2 ? 'bg-slate-400/5' : 
                  user.rank === 3 ? 'bg-amber-700/5' : ''
                }`}
              >
                <TableCell className="px-8 py-6 pl-12">
                   <div className={`text-xl font-bold flex items-center justify-center h-12 w-12 rounded-2xl mx-auto transition-transform group-hover:scale-110 shadow-md border ${
                     user.rank === 1 ? 'bg-amber-400/20 text-amber-500 border-amber-400/40 text-3xl scale-110' :
                     user.rank === 2 ? 'bg-slate-300/20 text-slate-400 border-slate-300/40' :
                     user.rank === 3 ? 'bg-amber-700/20 text-amber-800 dark:text-amber-600 border-amber-700/40' :
                     'bg-white/5 text-slate-500 border-white/10'
                   }`}>
                     {user.rank === 1 ? <MdEmojiEvents className="animate-bounce" /> : user.rank}
                   </div>
                </TableCell>
                <TableCell className="px-6 py-6 pl-12">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/20 group-hover:border-primary/50 transition-all shadow-md">
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <p className={`font-black text-lg tracking-tight transition-colors ${
                        user.rank === 1 ? 'text-amber-500' : 'text-slate-900 dark:text-white'
                      }`}>
                         @{user.username}
                         {user.rank === 1 && <span className="ml-2 inline-block animate-bounce shadow-xl">👑</span>}
                      </p>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                         <MdPersonOutline className="text-primary/50" />
                         Active Member
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm flex items-center gap-2 ${tierColors[user.tier]}`}>
                       <MdMilitaryTech className="text-lg opacity-50" />
                       {user.tier} Tier
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6 text-right pr-15">
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-amber-500 tracking-tight flex items-center gap-2 glow-amber-sm">
                       <MdFlashOn className="text-amber-500/30" />
                       {user.pzaPoints.toLocaleString()}
                    </span>
                    <span className="text-[10px] uppercase text-slate-500 tracking-widest font-black text-right block">Loyalty Capital</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6">
                   <div className="space-y-2 w-48">
                     <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-black">
                       <span className="text-primary">{user.activityScore}% Efficiency</span>
                       <span className="text-slate-400 tracking-tighter">Level {Math.floor(user.pzaPoints/1000)}</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                           className="h-full bg-linear-to-r from-primary to-amber-500 rounded-full transition-all duration-1000 shadow-lg shadow-primary/20"
                           style={{ width: `${user.activityScore}%` }}
                        ></div>
                     </div>
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LoyaltyLeaderboardTable;
