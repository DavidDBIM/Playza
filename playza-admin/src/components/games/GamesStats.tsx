import React from 'react';
import { MdGamepad, MdTrendingUp, MdGroup, MdAccountBalanceWallet } from 'react-icons/md';

export interface GameStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export const GamesStats: React.FC<{ stats: GameStat[] }> = ({ stats }) => {
  const getIcon = (label: string) => {
    switch (label) {
      case 'Total Games': return <MdGamepad />;
      case 'Active Games': return <MdTrendingUp />;
      case 'Total Players': return <MdGroup />;
      case 'Revenue (MTD)': return <MdAccountBalanceWallet />;
      default: return <MdGamepad />;
    }
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="glass-card bg-card text-card-foreground rounded-3xl p-6 relative overflow-hidden group hover:bg-accent/5 transition-all duration-500 border border-border/50 shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-primary/10 transition-all duration-700"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-inner">
              {getIcon(stat.label)}
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm border ${
              stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-rose-500/10 text-rose-500 border-rose-500/10'
            }`}>
              {stat.change}
            </span>
          </div>
          <h4 className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">{stat.label}</h4>
          <p className="font-headline text-3xl font-black text-foreground tracking-tight">{stat.value}</p>
        </div>
      ))}
    </section>
  );
};
