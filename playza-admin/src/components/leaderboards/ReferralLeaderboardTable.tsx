import React from 'react';
import {  
  MdPersonOutline, 
  MdMonetizationOn, 
  MdGroupAdd
} from 'react-icons/md';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';

interface ReferralLead {
  rank: number;
  username: string;
  avatar: string;
  referrals: number;
  earnings: number;
  status?: string;
}

interface ReferralLeaderboardTableProps {
  data: ReferralLead[];
}

const ReferralLeaderboardTable: React.FC<ReferralLeaderboardTableProps> = ({ data }) => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
      <div className="overflow-x-auto no-scrollbar">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border">
            <TableRow className="hover:bg-transparent border-none h-auto">
              <TableHead className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 text-center w-16 h-auto">Rank</TableHead>
              <TableHead className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 h-auto">Influencer</TableHead>
              <TableHead className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 text-center h-auto">Referrals</TableHead>
              <TableHead className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 text-right h-auto">Earnings</TableHead>
              <TableHead className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 h-auto">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/30">
            {data.length > 0 ? (
              data.map((user) => (
                <TableRow 
                  key={user.username} 
                  className={`group transition-colors hover:bg-muted/30 border-border/30 ${
                    user.rank === 1 ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <TableCell className="py-3 pr-4 pl-4">
                     <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black mx-auto ${
                       user.rank === 1 ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30' :
                       user.rank === 2 ? 'bg-slate-300 text-slate-700' :
                       user.rank === 3 ? 'bg-orange-400 text-white' :
                       'bg-muted text-muted-foreground'
                     }`}>
                       {user.rank}
                     </span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.username} className="w-7 h-7 rounded-lg object-cover border border-border" />
                      <div className="space-y-0.5">
                        <p className={`font-black text-xs tracking-tight uppercase ${
                          user.rank === 1 ? 'text-amber-500' : 'text-foreground'
                        }`}>@{user.username}</p>
                        <p className="text-[8px] font-black uppercase text-muted-foreground/70 tracking-widest flex items-center gap-1">
                           <MdPersonOutline className="text-primary/50" />
                           Ambassador
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    <span className="text-xs font-bold text-foreground font-number flex items-center justify-center gap-1.5">
                       <MdGroupAdd className="text-primary/30" />
                       {user.referrals.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right">
                    <span className="text-xs font-black text-emerald-500 font-number flex items-center justify-end gap-1">
                       <MdMonetizationOn className="text-emerald-500/30" />
                       ₦{user.earnings.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                     <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[8px] font-black uppercase tracking-widest border border-border">
                       {user.status || 'ACTIVE'}
                     </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center">
                   <div className="flex flex-col items-center gap-2 opacity-20 grayscale">
                      <MdGroupAdd className="text-5xl" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Referral Records Found</p>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReferralLeaderboardTable;
