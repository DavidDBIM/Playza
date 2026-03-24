import { 
  MdMilitaryTech, 
  MdSportsEsports, 
  MdLiveHelp, 
  MdSportsSoccer, 
  MdCasino, 
  MdWarning 
} from 'react-icons/md';
import { Link } from 'react-router';
import type { ActiveSession, PopularGame } from '../../data/adminData';

export const GamingArenas: React.FC<{ 
  sessions: ActiveSession[], 
  popularGames: PopularGame[] 
}> = ({ sessions, popularGames }) => {
  const getGameIcon = (iconName: string) => {
    switch (iconName) {
      case 'MdLiveHelp': return MdLiveHelp;
      case 'MdSportsSoccer': return MdSportsSoccer;
      case 'MdCasino': return MdCasino;
      default: return MdSportsEsports;
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
      <div className="xl:col-span-3">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-black font-headline text-[#E5E2E3] uppercase text-sm tracking-widest">Active Gaming Arenas</h3>
          <Link className="text-primary text-[10px] uppercase font-black tracking-widest hover:underline shadow-sm" to="/sessions">View All Systems</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="glass-card bg-card rounded-3xl p-6 border border-white/5 border-l-4 border-l-primary hover:-translate-y-2 transition-all relative overflow-hidden group shadow-xl">
              <div className="flex justify-between items-start mb-8">
                <MdMilitaryTech className="text-4xl text-primary animate-pulse" />
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black tracking-widest uppercase border border-emerald-500/10 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {session.status}
                </span>
              </div>
              <h4 className="text-2xl font-black font-headline text-foreground mb-1 tracking-tight">{session.name}</h4>
              <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest mb-8">League: {session.league}</p>
              <div className="flex justify-between items-end border-t border-white/5 pt-6">
                <div>
                  <p className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest">Prize Pool</p>
                  <p className="text-xl font-black font-headline text-primary">₦{session.prize}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest">Occupancy</p>
                  <p className="text-xl font-black font-headline text-foreground">{session.players} <span className="text-[10px] font-black text-muted-foreground uppercase">WARRIORS</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="xl:col-span-1 space-y-8">
        <div>
          <h3 className="text-xl font-black font-headline text-[#E5E2E3] mb-8 uppercase tracking-widest text-[10px]">Popular Games Feed</h3>
          <div className="space-y-4">
            {popularGames.map((game) => {
              const Icon = getGameIcon(game.icon);
              return (
                <div key={game.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group border-l-2 border-l-transparent hover:border-l-primary cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                      <Icon className="text-2xl" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-[#E5E2E3] uppercase tracking-wide">{game.name}</p>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E5E2E3]/20 mt-1">{game.plays} PLAYS</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-emerald-400 font-headline uppercase">{game.revenue}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Security Alerts (Relocated here) */}
        <div className="glass-card p-6 rounded-3xl bg-destructive/5 border border-destructive/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/10 blur-3xl -mr-12 -mt-12 rounded-full pointer-events-none group-hover:bg-destructive/20 transition-all duration-700"></div>
          <div className="flex items-center gap-3 mb-4 text-destructive">
            <MdWarning className="text-2xl animate-bounce" />
            <span className="text-[10px] font-black font-headline uppercase tracking-widest">High Severity Alert</span>
          </div>
          <p className="text-base font-black text-foreground tracking-tight leading-none mb-1">Suspicious activity detected</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-2">Target Node: <Link to="/users" className="text-destructive hover:underline">Olanrewaju_77</Link></p>
          <div className="mt-6 flex gap-3">
            <button className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-destructive/20 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive shadow-lg hover:text-white transition-all">Freeze</button>
            <button className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-white/[0.05] text-muted-foreground/60 border border-white/5 rounded-xl hover:bg-white/10 transition-all">Ignore</button>
          </div>
        </div>
      </div>
    </div>
  );
};
