import { 
  MdGroup, 
  MdSportsEsports, 
  MdPayments, 
  MdAccountBalanceWallet, 
  MdTrendingUp, 
  MdPendingActions 
} from 'react-icons/md';
import type { MetricData } from '../../data/adminData';

export const EmpireMetrics: React.FC<{ metrics: MetricData[] }> = ({ metrics }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'MdGroup': return MdGroup;
      case 'MdSportsEsports': return MdSportsEsports;
      case 'MdPayments': return MdPayments;
      case 'MdAccountBalanceWallet': return MdAccountBalanceWallet;
      case 'MdTrendingUp': return MdTrendingUp;
      case 'MdPendingActions': return MdPendingActions;
      default: return MdGroup;
    }
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {metrics.map((metric) => {
        const Icon = getIcon(metric.icon);
        
        return (
          <div key={metric.id} className="glass-card p-6 rounded-xl relative overflow-hidden group hover:scale-[1.02] transition-all cursor-default border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/2">
            <div className="flex justify-between items-start mb-4">
              <Icon className="text-2xl" style={{ color: metric.color }} />
              <span className={`text-[10px] font-black flex items-center gap-1 uppercase tracking-widest ${metric.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {metric.trend === 'up' ? '↑' : '↓'} {metric.change}
              </span>
            </div>
            <h3 className="text-[10px] font-headline font-black uppercase tracking-widest text-slate-500 dark:text-[#E5E2E3]/40 mb-1">{metric.title}</h3>
            <p className={`text-2xl font-black font-headline tracking-tighter ${metric.color === '#ffd700' ? 'text-amber-600 dark:text-[#ffd700]' : 'text-primary'}`}>{metric.value}</p>
            <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <Icon className="text-8xl" />
            </div>
          </div>
        );
      })}
    </section>
  );
};
