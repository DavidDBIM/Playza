import React from 'react';
import { 
  MdEmojiEvents, 
  MdSportsScore, 
  MdMonetizationOn 
} from 'react-icons/md';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import type { PlayerRank } from '../../data/leaderboardData';

interface SessionLeaderboardTableProps {
  leaderboard: PlayerRank[];
}

const SessionLeaderboardTable: React.FC<SessionLeaderboardTableProps> = ({ leaderboard }) => {
  if (leaderboard.length === 0) {
    return (
      <div className="p-20 text-center opacity-30 bg-black/5 dark:bg-white/5 rounded-3xl border border-dashed border-white/10">
        <MdEmojiEvents className="text-6xl mx-auto mb-4" />
        <p className="text-xl font-headline font-black">No Records Yet</p>
        <p className="text-sm">The competition hasn't yielded any standings for this session.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg bg-white/50 dark:bg-black/20">
      <div className="overflow-x-auto no-scrollbar">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-white/10">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="px-6 py-4 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-10 h-auto shadow-none border-none font-black">Rank</TableHead>
              <TableHead className="px-6 py-4 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-15 h-auto shadow-none border-none font-black">Player</TableHead>
              <TableHead className="px-6 py-4 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right pr-20 h-auto shadow-none border-none font-black">Score</TableHead>
              <TableHead className="px-6 py-4 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right pr-15 h-auto shadow-none border-none font-black">Prize Estimate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/5 font-headline">
            {leaderboard.map((player) => (
              <TableRow 
                key={player.userId} 
                className={`group transition-all duration-300 hover:bg-primary/10 border-border/10 ${
                  player.rank === 1 ? 'bg-primary/5 dark:bg-amber-500/5' : 
                  player.rank === 2 ? 'bg-slate-500/5 dark:bg-slate-400/5' : 
                  player.rank === 3 ? 'bg-amber-800/5 dark:bg-amber-700/5' : ''
                }`}
              >
                <TableCell className="px-6 py-4 pl-10 text-center relative w-20">
                  <div className={`text-xl font-bold flex items-center justify-center h-10 w-10 rounded-xl transition-transform group-hover:scale-110 shadow-sm border ${
                    player.rank === 1 ? 'bg-amber-400/20 text-amber-500 border-amber-400/40 text-2xl scale-110' :
                    player.rank === 2 ? 'bg-slate-300/20 text-slate-400 border-slate-300/40' :
                    player.rank === 3 ? 'bg-amber-700/20 text-amber-800 dark:text-amber-600 border-amber-700/40' :
                    'bg-white/5 text-slate-500 border-white/10'
                  }`}>
                    {player.rank === 1 ? <MdEmojiEvents /> : player.rank}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 pl-15">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary/20 group-hover:border-primary/50 transition-all shadow-md">
                      <img src={player.avatar} alt={player.username} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-opacity" />
                    </div>
                    <div className="space-y-0.5">
                      <p className={`font-black text-base tracking-tight transition-colors ${
                        player.rank === 1 ? 'text-amber-500' : 'text-slate-900 dark:text-white'
                      }`}>@{player.username}</p>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">ID: {player.userId}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-right pr-20 font-black text-slate-900 dark:text-white text-lg font-headline">
                  <div className="flex flex-col items-end">
                    <span className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                       <MdSportsScore className="text-primary/30" />
                       {player.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Pts Accumulated</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-right pr-15">
                  <div className="flex flex-col items-end">
                    <span className={`text-2xl font-black tracking-tight flex items-center gap-2 ${
                      player.prize > 0 ? 'text-emerald-500 glow-emerald-sm' : 'text-slate-300 dark:text-slate-600'
                    }`}>
                       <MdMonetizationOn className="text-emerald-500/30" />
                       ₦{player.prize.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Potential Winnings</span>
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

export default SessionLeaderboardTable;
