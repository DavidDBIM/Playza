import { MdAccountBalance } from 'react-icons/md';
import type { LiquidityData } from '../../data/adminData';

export const LiquidityOverview: React.FC<{ data: LiquidityData[] }> = ({ data }) => {
  return (
    <section>
      <h3 className="text-3xl font-black font-headline text-[#E5E2E3] tracking-tighter uppercase text-sm tracking-widest mb-8">Daily Liquidity Snapshot</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {data.map((item) => (
          <div key={item.id} className="glass-card bg-card p-8 rounded-[2rem] flex items-center justify-between group overflow-hidden relative border border-white/5 bg-white/[0.02] shadow-2xl transition-all hover:bg-white/[0.04]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-2 truncate">{item.category}</p>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-black font-headline text-primary tracking-tighter">{item.value}</p>
                <span className={`text-[10px] font-black uppercase tracking-widest ${item.growth.startsWith('+') ? 'text-emerald-500' : 'text-destructive'}`}>
                  {item.growth}
                </span>
              </div>
            </div>
            <MdAccountBalance 
              className="text-6xl opacity-10 absolute -right-4 rotate-12 group-hover:rotate-0 transition-transform duration-700 z-0" 
              style={{ color: item.color }} 
            />
          </div>
        ))}
      </div>
    </section>
  );
};
