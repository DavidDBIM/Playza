
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
          <h2 className="text-3xl md:text-5xl font-black font-headline text-primary shadow-sm uppercase italic tracking-widest">Empire Command</h2>
          <p className="text-muted-foreground/80 font-black uppercase text-[10px] tracking-[0.4em]">Strategic Overview • Skill-Gaming Performance • Nigeria Region</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
        </div>
      </header>

      <EmpireMetrics metrics={metricsData} />
      <RevenuePulse liveActivity={livePulseData} />
      <GrowthInsights referralStats={referralStats} loyaltyPulse={loyaltyPulse} />
      <GamingArenas sessions={activeSessions} popularGames={popularGames} />
      <LiquidityOverview data={liquidityData} />
    </main>
  );
};

export default Dashboard;
