
import { 
  metricsData, 
  livePulseData, 
  referralStats, 
  loyaltyPulse, 
  popularGames, 
  liquidityData, 
  activeSessions 
} from '../data/adminData';
import { EmpireMetrics } from '../components/dashboard/EmpireMetrics';
import { RevenuePulse } from '../components/dashboard/RevenuePulse';
import { GrowthInsights } from '../components/dashboard/GrowthInsights';
import { GamingArenas } from '../components/dashboard/GamingArenas';
import { LiquidityOverview } from '../components/dashboard/LiquidityOverview';

const Dashboard: React.FC = () => {
  return (
    <main className="p-4 md:p-8 space-y-12 max-w-400 mx-auto w-full min-h-screen bg-background text-foreground transition-all duration-500">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-5xl font-black font-headline text-primary tracking-tighter shadow-sm uppercase italic tracking-widest">Empire Command</h2>
          <p className="text-muted-foreground/60 font-black uppercase text-[10px] tracking-[0.4em]">Strategic Overview • Skill-Gaming Performance • Nigeria Region</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-8 h-12 rounded-xl bg-card border border-border/50 text-foreground text-xs font-black uppercase tracking-widest hover:bg-accent/10 transition-all shadow-lg active:scale-95">Export Intel</button>
          <button className="flex-1 md:flex-none px-8 h-12 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_rgb(var(--primary-rgb),0.3)] hover:scale-105 transition-all active:scale-95 border border-white/10">Launch Mission</button>
        </div>
      </header>

      {/* 1. Key Metrics - Factored */}
      <EmpireMetrics metrics={metricsData} />

      {/* Analytics & Live Activity - Factored */}
      <RevenuePulse liveActivity={livePulseData} />

      {/* Referral & Loyalty Stats - Factored */}
      <GrowthInsights referralStats={referralStats} loyaltyPulse={loyaltyPulse} />

      {/* Gaming Arenas & Popular games - Factored */}
      <GamingArenas sessions={activeSessions} popularGames={popularGames} />

      {/* Daily Liquidity Snapshot - Factored */}
      <LiquidityOverview data={liquidityData} />
    </main>
  );
};

export default Dashboard;
