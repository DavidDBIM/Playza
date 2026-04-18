import type { LivePulseData } from '../../data/adminData';

// Simplified revenue chart and live activity pulse
export const RevenuePulse: React.FC<{ liveActivity: LivePulseData[] }> = ({ liveActivity }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Performance */}
      <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Revenue Performance</h3>
            <p className="text-xs text-muted-foreground font-medium">30-day transactional flow analysis</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-wider">REVENUE</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg border border-primary/10">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span className="text-[10px] font-black text-primary uppercase tracking-wider">PAYOUTS</span>
            </div>
          </div>
        </div>
        <div className="h-48 w-full relative">
          <div className="absolute inset-0 flex items-end gap-2">
            {[40, 55, 45, 70, 65, 80, 60, 30, 45, 50, 65, 75, 40, 30].map((h, i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-t-md transition-all hover:scale-105 opacity-80 ${i < 10 
                  ? 'bg-amber-500/40 border-t border-amber-500/60' 
                  : 'bg-primary/40 border-t border-primary/60'
                }`} 
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-border"></div>
        </div>
      </div>

      {/* Live Activity Monitor */}
      <div className="bg-card rounded-2xl p-6 flex flex-col h-[400px] border border-border shadow-sm">
        <h3 className="text-xs font-black text-foreground mb-6 flex items-center justify-between uppercase tracking-wider border-b border-border pb-4">
          Live Pulse
          <span className="flex items-center gap-2 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-Time
          </span>
        </h3>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {liveActivity.map((item) => (
            <div key={item.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border group">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                item.status === 'online' ? 'bg-emerald-500' : 
                item.status === 'win' ? 'bg-amber-500' : 
                item.status === 'transaction' ? 'bg-blue-400' : 'bg-muted-foreground/30'
              }`}></div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight"><span className="text-primary">@{item.user}</span> {item.action}</p>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-tight text-muted-foreground mt-1 font-number">
                  <span>{item.time}</span>
                  <span className="w-1 h-1 bg-muted-foreground/30 rounded-full"></span>
                  <span>{item.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
