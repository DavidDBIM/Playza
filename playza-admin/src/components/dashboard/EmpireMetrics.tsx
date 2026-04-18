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
          <div key={metric.id} className="bg-card border border-border p-5 rounded-2xl relative overflow-hidden group transition-all cursor-default shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2 rounded-xl bg-muted" style={{ color: metric.color }}>
                <Icon className="text-xl" />
              </div>
              <span className={`text-[9px] font-black flex items-center gap-1 uppercase tracking-wider ${metric.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {metric.trend === 'up' ? '↑' : '↓'} {metric.change}
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{metric.title}</h3>
              <p className={`text-xl font-black font-number tracking-tighter ${metric.color === '#ffd700' ? 'text-amber-600 dark:text-amber-500' : 'text-primary'}`}>{metric.value}</p>
            </div>
            <Icon className="absolute -bottom-6 -right-6 text-8xl opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none" />
          </div>
        );
      })}
    </section>
  );
};
