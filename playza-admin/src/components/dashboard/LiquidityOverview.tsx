import { MdAccountBalance } from 'react-icons/md';
import type { LiquidityData } from '../../data/adminData';

export const LiquidityOverview: React.FC<{ data: LiquidityData[] }> = ({ data }) => {
  return (
    <section className="space-y-6">
      <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Daily Liquidity Snapshot</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((item) => (
          <div key={item.id} className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between group overflow-hidden relative shadow-sm hover:shadow-md transition-all">
            <div className="z-10">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 truncate">{item.category}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-black font-number text-primary tracking-tight">{item.value}</p>
                <span className={`text-[9px] font-black uppercase tracking-wider font-number ${item.growth.startsWith('+') ? 'text-emerald-500' : 'text-destructive'}`}>
                  {item.growth}
                </span>
              </div>
            </div>
            <MdAccountBalance 
              className="text-4xl opacity-[0.05] group-hover:opacity-10 transition-opacity z-0" 
              style={{ color: item.color }} 
            />
          </div>
        ))}
      </div>
    </section>
  );
};
