import React from 'react';
import { 
  MdPayments, 
  MdEmojiEvents, 
  MdAccountBalanceWallet, 
  MdAccountTree, 
  MdTrendingUp 
} from 'react-icons/md';
import type { UserRecord } from '../../data/usersData';

interface UserAdvancedMetricsProps {
  user: UserRecord;
}

export const UserAdvancedMetrics: React.FC<UserAdvancedMetricsProps> = ({ user }) => {
  const metrics = [
    { icon: MdPayments, color: 'text-primary', bg: 'bg-primary/10', label: 'Wallet Balance', value: user.walletBalance, currency: '₦', sub: 'Active Capital' },
    { icon: MdEmojiEvents, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Victory Loot', value: user.totalWinnings, currency: '₦', sub: 'Life-time Profit' },
    { icon: MdAccountBalanceWallet, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Playza Points', value: user.pzaPoints, currency: '', sub: 'Loyalty Level' },
    { icon: MdAccountTree, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Network Size', value: user.referrals, currency: '', sub: 'Referral Chain' }
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, i) => (
        <div key={i} className="glass-card bg-card p-4 rounded-xl flex flex-col justify-between group hover:bg-accent/5 transition-all duration-500 border border-border/40 shadow-xl relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 ${metric.bg} rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
          <div className="flex justify-between items-start mb-6 text-xl">
            <div className={`w-11 h-11 rounded-xl ${metric.bg} flex items-center justify-center ${metric.color} shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
              <metric.icon className="text-2xl" />
            </div>
            <MdTrendingUp className={`${metric.color} opacity-30 text-2xl`} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground/50 mb-1 font-black uppercase tracking-[0.3em]">{metric.label}</p>
            <h3 className="text-2xl font-headline font-black text-foreground tracking-tight">
              {metric.currency}{metric.value.toLocaleString()}
            </h3>
            <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mt-1">{metric.sub}</p>
          </div>
        </div>
      ))}
    </section>
  );
};
