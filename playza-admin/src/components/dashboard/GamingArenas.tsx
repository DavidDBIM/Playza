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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-9">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
            Active Gaming Arenas
          </h3>
          <Link
            className="text-primary text-[10px] uppercase font-black tracking-widest hover:underline"
            to="/sessions"
          >
            View All Systems
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <MdMilitaryTech className="text-2xl animate-pulse" />
                </div>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black tracking-widest uppercase border border-emerald-500/10">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                  {session.status}
                </span>
              </div>
              <h4 className="text-lg font-black text-foreground mb-1 tracking-tight uppercase">
                {session.name}
              </h4>
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider mb-8">
                League: {session.league}
              </p>
              <div className="flex justify-between items-end border-t border-border pt-6">
                <div>
                  <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">
                    Prize Pool
                  </p>
                  <p className="text-lg font-black text-primary font-number">
                    ₦{session.prize}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">
                    Occupancy
                  </p>
                  <p className="text-lg font-black text-foreground font-number">
                    {session.players}{" "}
                    <span className="text-[10px] font-black text-muted-foreground">
                      / 100
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="xl:col-span-3 space-y-6">
        <div>
          <h3 className="text-[10px] font-black text-muted-foreground mb-6 uppercase tracking-widest border-b border-border pb-4">
            Popular Games Feed
          </h3>
          <div className="space-y-3">
            {popularGames.map((game) => {
              const Icon = getGameIcon(game.icon);
              return (
                <div
                  key={game.id}
                  className="p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-all group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <Icon className="text-xl" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-foreground uppercase tracking-tight">
                        {game.name}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-0.5 font-number">
                        {game.plays} PLAYS
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-emerald-500 font-number uppercase">
                        {game.revenue}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-destructive/5 border border-destructive/20 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-4 text-destructive">
            <MdWarning className="text-xl animate-bounce" />
            <span className="text-[9px] font-black uppercase tracking-widest">
              Security Alert
            </span>
          </div>
          <p className="text-sm font-black text-foreground tracking-tight leading-tight mb-1">
            Suspicious Activity
          </p>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mt-2">
            Node:{" "}
            <Link to="/users" className="text-destructive hover:underline">
              Olanrewaju_77
            </Link>
          </p>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest bg-destructive text-white rounded-lg hover:brightness-110 transition-all">
              Freeze
            </button>
            <button className="flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all border border-border">
              Ignore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
