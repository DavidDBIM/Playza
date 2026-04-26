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
              <TableHead className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 text-center w-16 h-auto">Rank</TableHead>
              <TableHead className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 h-auto">Identity</TableHead>
              <TableHead className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 text-center h-auto">Tier</TableHead>
              <TableHead className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 text-right h-auto">PZA Points</TableHead>
              <TableHead className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 h-auto">Progress</TableHead>
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
                           Loyalty Citizen
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center">
                     <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase tracking-widest border border-amber-500/20 inline-flex items-center gap-1">
                       <MdMilitaryTech className="text-[10px]" />
                       LVL {user.level}
                     </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right">
                    <span className="text-xs font-black text-amber-500 font-number flex items-center justify-end gap-1">
                       <MdFlashOn className="text-amber-500/30" />
                       {user.pzaPoints.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
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
