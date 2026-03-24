import type { LivePulseData } from '../../data/adminData';

// Simplified revenue chart and live activity pulse
export const RevenuePulse: React.FC<{ liveActivity: LivePulseData[] }> = ({ liveActivity }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Revenue Performance */}
      <div className="lg:col-span-2 glass-card rounded-2xl p-8 relative overflow-hidden border border-white/5 bg-white/2">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xs font-black font-headline text-[#E5E2E3] uppercase tracking-[0.2em]">Revenue Performance</h3>
            <p className="text-sm text-[#E5E2E3]/40 font-bold">30-day transactional flow analysis</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-[#ffd700]/10 rounded-full border border-[#ffd700]/10">
              <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-pulse"></span>
              <span className="text-[10px] font-black font-headline text-[#ffd700] uppercase tracking-widest">REVENUE</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/10">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-[10px] font-black font-headline text-primary uppercase tracking-widest">PAYOUTS</span>
            </div>
          </div>
        </div>
        <div className="h-64 w-full relative">
          <div className="absolute inset-0 flex items-end gap-1.5">
            {[40, 55, 45, 70, 65, 80, 60, 30, 45, 50, 65, 75, 40, 30].map((h, i) => (
              <div 
                key={i} 
                className={`flex-1 bg-linear-to-t ${i < 10 ? 'from-[#ffd700]/20 to-[#ffd700]/5 border-[#ffd700]/30' : 'from-primary/20 to-primary/5 border-primary/30'} rounded-t-lg border-t transition-all hover:opacity-80`} 
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-white/5"></div>
        </div>
      </div>

      {/* Live Activity Monitor */}
      <div className="glass-card rounded-2xl p-6 flex flex-col h-112.5 border border-white/5 bg-white/2 shadow-2xl">
        <h3 className=" font-black font-headline text-[#E5E2E3] mb-6 flex items-center justify-between uppercase tracking-widest text-xs">
          Live Pulse
          <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-sm border border-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-Time
          </span>
        </h3>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
          {liveActivity.map((item) => (
            <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-all border border-white/5 group">
              <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-lg ${
                item.status === 'online' ? 'bg-emerald-500 shadow-emerald-500/10' : 
                item.status === 'win' ? 'bg-[#ffd700] shadow-[#ffd700]/10' : 
                item.status === 'transaction' ? 'bg-blue-400 shadow-blue-400/10' : 'bg-[#E5E2E3]/40'
              }`}></div>
              <div>
                <p className="text-sm font-bold text-[#E5E2E3] group-hover:text-white transition-colors"><span className="text-primary/80">@{item.user}</span> {item.action}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#E5E2E3]/20 mt-1.5">{item.time} • {item.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
