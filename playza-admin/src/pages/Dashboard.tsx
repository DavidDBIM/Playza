
import React from 'react';
import { 
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
import { useDashboardMetrics } from '../hooks/use-admin';
import { formatNaira, formatNumber } from '../lib/utils';
import type { MetricData } from '../data/adminData';

const Dashboard: React.FC = () => {
  const { data: metrics, isLoading, isError } = useDashboardMetrics();

  const mappedMetrics: MetricData[] = metrics ? [
    { 
      id: '1', title: 'Total Users', 
      value: formatNumber(metrics.total_users), 
      change: '+12.5%', trend: 'up', icon: 'MdGroup', color: '#ffd700' 
    },
    { 
      id: '2', title: 'Active Players', 
      value: formatNumber(metrics.active_users), 
      change: '+8.2%', trend: 'up', icon: 'MdSportsEsports', color: '#a855f7' 
    },
    { 
      id: '3', title: 'Total Revenue', 
      value: formatNaira(metrics.total_deposited), 
      change: '+15.4%', trend: 'up', icon: 'MdPayments', color: '#ffd700' 
    },
    { 
      id: '4', title: 'Total Payouts', 
      value: formatNaira(metrics.total_withdrawn), 
      change: '+10.1%', trend: 'up', icon: 'MdAccountBalanceWallet', color: '#a855f7' 
    },
    { 
      id: '5', title: 'Platform Profit', 
      value: formatNaira(metrics.platform_profit), 
      change: '+18.2%', trend: 'up', icon: 'MdTrendingUp', color: '#ffd700' 
    },
    { 
      id: '6', title: 'Pending Withdrawals', 
      value: metrics.pending_withdrawals_count.toString(), 
      change: 'Action Required', trend: 'down', icon: 'MdPendingActions', color: '#ef4444' 
    },
  ] : [];

  const updatedReferralStats = metrics ? [
    ...referralStats.slice(0, 2),
    { id: '3', label: 'Conversion Rate', value: metrics.referral_conversion_rate, icon: 'MdPieChart', color: '#f59e0b' },
    ...referralStats.slice(3)
  ] : referralStats;

  return (
    <main className="p-4 md:p-8 space-y-12 max-w-400 mx-auto w-full min-h-screen bg-background text-foreground transition-all duration-500">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-5xl font-black font-headline text-primary shadow-sm uppercase italic tracking-widest">Empire Command</h2>
          <p className="text-muted-foreground/80 font-black uppercase text-[10px] tracking-[0.4em]">Strategic Overview • Skill-Gaming Performance • Nigeria Region</p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-primary animate-pulse">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Syncing Empire Data...</span>
          </div>
        )}
      </header>

      {isError ? (
        <div className="glass-card p-12 text-center border-rose-500/20">
          <p className="text-rose-500 font-headline uppercase font-black tracking-widest">Communication Array Offline</p>
          <p className="text-muted-foreground/60 text-xs mt-2">Failed to fetch metrics from core servers.</p>
        </div>
      ) : (
        <EmpireMetrics metrics={isLoading ? [] : mappedMetrics} />
      )}

      <RevenuePulse liveActivity={livePulseData} />
      <GrowthInsights referralStats={updatedReferralStats} loyaltyPulse={loyaltyPulse} />
      <GamingArenas sessions={activeSessions} popularGames={popularGames} />
      <LiquidityOverview data={liquidityData} />
    </main>
  );
};

export default Dashboard;
