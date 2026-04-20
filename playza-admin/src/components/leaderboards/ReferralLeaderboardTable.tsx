import React from 'react';
import { 
  MdEmojiEvents, 
  MdPersonOutline, 
  MdMonetizationOn, 
  MdGroupAdd,
  MdDateRange
} from 'react-icons/md';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import type { ReferralLead } from '../../data/leaderboardData';

interface ReferralLeaderboardTableProps {
  data: ReferralLead[];
}

const ReferralLeaderboardTable: React.FC<ReferralLeaderboardTableProps> = ({ data }) => {
  return (
    <div className="glass-card rounded-[2rem] overflow-hidden border border-border shadow-lg bg-white/50 dark:bg-transparent">
      <div className="overflow-x-auto no-scrollbar">
        <Table>
          <TableHeader className="bg-muted/30/50 dark:bg-white/5 border-b border-white/10">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="px-8 py-6 text-[10px] text-muted-foreground uppercase tracking-widest pl-12 text-center w-24 h-auto shadow-none border-none font-black">Rank</TableHead>
              <TableHead className="px-6 py-6 text-[10px] text-muted-foreground uppercase tracking-widest pl-12 h-auto shadow-none border-none font-black">Influencer Citizen</TableHead>
              <TableHead className="px-6 py-6 text-[10px] text-muted-foreground uppercase tracking-widest text-center h-auto shadow-none border-none font-black">Referrals</TableHead>
              <TableHead className="px-6 py-6 text-[10px] text-muted-foreground uppercase tracking-widest text-right pr-15 h-auto shadow-none border-none font-black">Total Earnings</TableHead>
              <TableHead className="px-6 py-6 text-[10px] text-muted-foreground uppercase tracking-widest h-auto shadow-none border-none font-black">Enlisted Since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/5 font-headline">
            {data.map((user) => (
              <TableRow 
                key={user.username} 
                className={`group transition-all duration-300 hover:bg-primary/5 border-border/10 ${
                  user.rank === 1 ? 'bg-amber-500/5' : 
                  user.rank === 2 ? 'bg-muted/20' : 
                  user.rank === 3 ? 'bg-amber-700/5' : ''
                }`}
              >
                <TableCell className="px-8 py-6 pl-12">
                   <div className={`text-xl font-bold flex items-center justify-center h-12 w-12 rounded-2xl mx-auto transition-transform group-hover:scale-110 shadow-md border ${
                     user.rank === 1 ? 'bg-amber-400/20 text-amber-500 border-amber-400/40 text-3xl scale-110' :
                     user.rank === 2 ? 'bg-muted/30 text-muted-foreground/70 border-border/30' :
                     user.rank === 3 ? 'bg-amber-700/20 text-amber-800 dark:text-amber-600 border-amber-700/40' :
                     'bg-white/5 text-muted-foreground border-white/10'
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
                        user.rank === 1 ? 'text-amber-500' : 'text-foreground'
                      }`}>@{user.username}</p>
                      <p className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest flex items-center gap-1">
                         <MdPersonOutline className="text-primary/50" />
                         Premium Citizen
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                       <MdGroupAdd className="text-primary/30" />
                       {user.totalReferrals.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Successful Invites</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6 text-right pr-15">
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-amber-500 tracking-tight flex items-center gap-2 glow-amber-sm">
                       <MdMonetizationOn className="text-amber-500/30" />
                       ₦{user.earnings.toLocaleString()}
                    </span>
                    <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-black text-right block">Ambassador Rewards</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6">
                   <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest font-black">
                     <MdDateRange className="text-primary opacity-50 text-base" />
                     {user.dateJoined}
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

export default ReferralLeaderboardTable;
