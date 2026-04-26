import { 
  MdQuiz, 
  MdSportsSoccer, 
  MdVideogameAsset, 
  MdShield,
  MdPayments,
  MdGroup,
  MdMilitaryTech
} from 'react-icons/md';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import type { MatchRecord, TransactionRecord, ReferralRecord } from '../../data/usersData';
import type { UserHistoryItem } from '../../types/admin';

// Combat Log Component
export const CombatLog = ({ data }: { data: MatchRecord[] }) => (
  <div className="p-3 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-auto no-scrollbar">
    <Table>
      <TableHeader>
        <TableRow className="border-none hover:bg-transparent">
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40">Battle Arena</TableHead>
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40 text-center">Outcome Status</TableHead>
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40 text-center">Session ID</TableHead>
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40 text-right">Loot Won</TableHead>
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40">Timestamp</TableHead>
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40 text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((match) => (
          <TableRow key={match.id} className="group hover:bg-primary/5 transition-all border-border/10 rounded-xl overflow-hidden">
            <TableCell className="px-5 py-3.5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center text-primary transition-all duration-500 shadow-inner group-hover:rotate-12 border border-border/30">
                  {match.game.includes('Trivia') ? <MdQuiz className="text-2xl" /> : 
                   match.game.includes('Soccer') || match.game.includes('Shootout') ? <MdSportsSoccer className="text-2xl" /> : 
                   <MdVideogameAsset className="text-2xl" />}
                </div>
                <div>
                  <span className="font-black text-sm text-foreground uppercase tracking-widest group-hover:text-primary transition-colors">{match.game}</span>
                  <div className="flex items-center gap-2 mt-1 opacity-40">
                    <MdShield className="text-xs" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Global Server</span>
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="px-5 py-3.5 text-center">
              <span className="font-headline font-black text-primary text-base uppercase">{match.score}</span>
              <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1">Final Result</p>
            </TableCell>
            <TableCell className="px-5 py-3.5 text-center">
              <span className="font-black text-xs text-foreground uppercase tracking-widest bg-muted px-4 py-1.5 rounded-xl border border-border/50 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20 transition-all">{match.position}</span>
            </TableCell>
            <TableCell className="px-5 py-3.5 text-right">
              <div className="flex flex-col items-end">
                <span className="text-foreground font-black text-base leading-none">₦{match.winnings.toLocaleString()}</span>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Loot Authenticated</span>
              </div>
            </TableCell>
            <TableCell className="px-5 py-3.5">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground/80">{match.date}</span>
                <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest mt-1">Regional Time</span>
              </div>
            </TableCell>
            <TableCell className="px-5 py-3.5">
              <div className="flex justify-center">
                <span className={`text-[9px] font-black px-5 py-2 rounded-xl border ${
                  match.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-destructive/10 text-destructive border-destructive/10'
                } uppercase tracking-[0.2em] shadow-sm`}>
                  {match.status}
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

// Financial Flow Component
export const FinancialFlow = ({ data }: { data: TransactionRecord[] }) => (
  <div className="p-3 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-auto no-scrollbar">
    <Table>
      <TableHeader>
        <TableRow className="border-none hover:bg-transparent">
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40">Record Identity</TableHead>
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40">Transaction Type</TableHead>
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40 text-right">Ledger Amount</TableHead>
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40">Access Channel</TableHead>
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40">Registry Date</TableHead>
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40 text-center">Outcome</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((tx) => (
          <TableRow key={tx.id} className="group hover:bg-accent/5 transition-all border-border/10">
            <TableCell className="px-5 py-3.5 font-mono text-[10px] text-muted-foreground/60 font-black tracking-widest uppercase">REF-PZA-{tx.id}-X09</TableCell>
            <TableCell className="px-5 py-3.5">
               <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg ${tx.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                   <MdPayments className="text-lg" />
                 </div>
                 <span className="font-black text-xs uppercase tracking-[0.2em] text-foreground">{tx.type}</span>
               </div>
            </TableCell>
            <TableCell className="px-5 py-3.5 text-right">
              <span className={`font-black text-base ${tx.type === 'Deposit' ? 'text-emerald-500' : 'text-primary'}`}>₦{tx.amount.toLocaleString()}</span>
            </TableCell>
            <TableCell className="px-5 py-3.5">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{tx.method}</span>
                <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">Verified Channel</span>
              </div>
            </TableCell>
            <TableCell className="px-5 py-3.5 text-muted-foreground text-[10px] font-black uppercase tracking-widest">{tx.date}</TableCell>
            <TableCell className="px-5 py-3.5">
              <div className="flex justify-center">
                <span className={`text-[9px] font-black px-5 py-2 rounded-xl border ${
                  tx.status === 'Successful' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-amber-500/10 text-amber-500 border-amber-500/10'
                } uppercase tracking-[0.2em]`}>
                  {tx.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

// Downline Network Component
export const DownlineNetwork = ({ data }: { data: ReferralRecord[] }) => (
  <div className="p-4 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-auto no-scrollbar">
    <Table>
      <TableHeader>
        <TableRow className="border-none hover:bg-transparent">
          <TableHead className="px-8 py-5 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40">Recruited Citizen</TableHead>
          <TableHead className="px-6 py-5 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40">Authentication Date</TableHead>
          <TableHead className="px-6 py-5 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40 text-right">Referral Reward</TableHead>
          <TableHead className="px-8 py-5 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40 text-center">Certification Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((ref) => (
          <TableRow key={ref.id} className="group hover:bg-accent/5 transition-all border-border/10">
            <TableCell className="px-5 py-3.5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1rem] bg-muted flex items-center justify-center text-primary border border-border/50 group-hover:rotate-6 transition-transform">
                  <MdGroup className="text-2xl" />
                </div>
                <div>
                  <span className="font-black text-sm text-foreground uppercase tracking-widest group-hover:text-primary transition-colors">@{ref.username}</span>
                  <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1">Level 1 Direct</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="px-6 py-7 text-muted-foreground text-xs font-bold">{ref.date}</TableCell>
            <TableCell className="px-6 py-7 text-right">
              <span className="text-primary font-black text-lg">₦{(ref.reward || 0).toLocaleString()}</span>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Credited to Wallet</p>
            </TableCell>
            <TableCell className="px-5 py-3.5">
              <div className="flex justify-center">
                <span className={`text-[10px] font-black px-6 py-2 rounded-xl border ${
                  ref.status === 'Qualified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-amber-500/10 text-amber-500 border-amber-500/10'
                } uppercase tracking-[0.2em]`}>
                  {ref.status?.toUpperCase() || 'PENDING'}
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
// Loyalty Log Component
export const LoyaltyLog = ({ data }: { data: UserHistoryItem[] }) => (
  <div className="p-3 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-auto no-scrollbar">
    <Table>
      <TableHeader>
        <TableRow className="border-none hover:bg-transparent">
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40">Event Type</TableHead>
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40 text-center">PZA Points</TableHead>
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40 text-right">Details</TableHead>
          <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground/40">Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((event) => (
          <TableRow key={event.id} className="group hover:bg-amber-500/5 transition-all border-border/10">
            <TableCell className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <MdMilitaryTech className="text-xl" />
                </div>
                <span className="font-black text-xs uppercase tracking-widest text-foreground">{event.event_type}</span>
              </div>
            </TableCell>
            <TableCell className="px-5 py-3.5 text-center">
              <span className="font-black text-base text-amber-500">+{event.points_awarded}</span>
            </TableCell>
            <TableCell className="px-5 py-3.5 text-right">
              <div className="flex flex-col items-end gap-1">
                {Object.entries(event.details || (event as any).meta || {}).length > 0 ? (
                  Object.entries(event.details || (event as any).meta || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md border border-border/50">
                      <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-tighter">{key}:</span>
                      <span className="text-[9px] font-black text-foreground uppercase tracking-tight">{String(val)}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Default Parameters</span>
                )}
              </div>
            </TableCell>
            <TableCell className="px-5 py-3.5 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
              {new Date(event.created_at).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
