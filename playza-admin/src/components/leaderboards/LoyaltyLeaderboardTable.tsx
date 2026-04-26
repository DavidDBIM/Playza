import React from 'react';
import { 
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

interface LoyaltyLead {
  rank: number;
  username: string;
  avatar: string;
  pzaPoints: number;
  level: number;
  status: string;
}

interface LoyaltyLeaderboardTableProps {
  data: LoyaltyLead[];
}

const LoyaltyLeaderboardTable: React.FC<LoyaltyLeaderboardTableProps> = ({ data }) => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
      <div className="overflow-x-auto no-scrollbar">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border">
            <TableRow className="hover:bg-transparent border-none h-auto">
              <TableHead className="px-4 py-3 text-[10px] text-muted-foreground uppercase tracking-widest text-center w-16 h-auto font-black">Rank</TableHead>
              <TableHead className="px-4 py-3 text-[10px] text-muted-foreground uppercase tracking-widest h-auto font-black">Identity</TableHead>
              <TableHead className="px-4 py-3 text-[10px] text-muted-foreground uppercase tracking-widest text-center h-auto font-black">Tier</TableHead>
              <TableHead className="px-4 py-3 text-[10px] text-muted-foreground uppercase tracking-widest text-right h-auto font-black">PZA Points</TableHead>
              <TableHead className="px-4 py-3 text-[10px] text-muted-foreground uppercase tracking-widest h-auto font-black">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {data.length > 0 ? (
              data.map((user) => (
                <TableRow 
                  key={user.username} 
                  className={`group transition-all duration-300 hover:bg-primary/5 border-border ${
                    user.rank === 1 ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <TableCell className="px-4 py-2.5">
                     <div className={`text-xs font-bold flex items-center justify-center h-8 w-8 rounded-lg mx-auto border ${
                       user.rank === 1 ? 'bg-amber-400/20 text-amber-500 border-amber-400/40' :
                       user.rank === 2 ? 'bg-slate-100 text-slate-500 border-slate-200' :
                       user.rank === 3 ? 'bg-orange-100 text-orange-600 border-orange-200' :
                       'bg-muted/50 text-muted-foreground border-border/50'
                     }`}>
                       {user.rank}
                     </div>
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-lg object-cover border border-border" />
                      <div className="space-y-0.5">
                        <p className={`font-black text-sm tracking-tight ${
                          user.rank === 1 ? 'text-amber-500' : 'text-foreground'
                        }`}>@{user.username}</p>
                        <p className="text-[8px] font-black uppercase text-muted-foreground/70 tracking-widest flex items-center gap-1">
                           <MdPersonOutline className="text-primary/50" />
                           Loyalty Citizen
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-center">
                     <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase tracking-widest border border-amber-500/20 inline-flex items-center gap-1">
                       <MdMilitaryTech className="text-xs" />
                       LVL {user.level}
                     </span>
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-right">
                    <span className="text-sm font-black text-amber-500 tracking-tight flex items-center justify-end gap-1 font-number">
                       <MdFlashOn className="text-amber-500/30" />
                       {user.pzaPoints.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                     <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                        <div 
                           className="h-full bg-linear-to-r from-primary to-amber-500 rounded-full"
                           style={{ width: `${Math.min(100, (user.pzaPoints % 1000) / 10)}%` }}
                        ></div>
                     </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center">
                   <div className="flex flex-col items-center gap-2 opacity-20 grayscale">
                      <MdMilitaryTech className="text-5xl" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Loyalty Records Found</p>
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

export default LoyaltyLeaderboardTable;
