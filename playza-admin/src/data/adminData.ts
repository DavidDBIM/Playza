
export interface MetricData {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

export interface LivePulseData {
  id: string;
  user: string;
  action: string;
  time: string;
  location: string;
  status: 'online' | 'playing' | 'transaction' | 'win' | 'pending' | string;
}

export interface ReferralStat {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
}

export interface LoyaltyPulse {
  id: string;
  tier: string;
  users: number;
  icon: string;
  color: string;
}

export interface PopularGame {
  id: string;
  name: string;
  plays: string;
  revenue: string;
  icon: string;
}

export interface LiquidityData {
  id: string;
  category: string;
  value: string;
  growth: string;
  color: string;
}

export interface ActiveSession {
  id: string;
  name: string;
  league: string;
  prize: string;
  players: string;
  status: string;
  type: string;
}

export const metricsData: MetricData[] = [
  { id: '1', title: 'Total Users', value: '85.2k', change: '12.5%', trend: 'up', icon: 'MdGroup', color: '#ffd700' },
  { id: '2', title: 'Active Players', value: '12.4k', change: '8.2%', trend: 'up', icon: 'MdSportsEsports', color: '#a855f7' },
  { id: '3', title: 'Total Revenue', value: '₦14.2M', change: '15.4%', trend: 'up', icon: 'MdPayments', color: '#ffd700' },
  { id: '4', title: 'Total Payouts', value: '₦10.8M', change: '10.1%', trend: 'up', icon: 'MdAccountBalanceWallet', color: '#a855f7' },
  { id: '5', title: 'Platform Profit', value: '₦3.4M', change: '18.2%', trend: 'up', icon: 'MdTrendingUp', color: '#ffd700' },
  { id: '6', title: 'Pending Withdrawals', value: '₦420k', change: '2.1%', trend: 'down', icon: 'MdPendingActions', color: '#ef4444' },
];

export const livePulseData: LivePulseData[] = [
  { id: '1', user: 'adebayo_x', action: 'registered a new account', time: '2 mins ago', location: 'Lagos, NG', status: 'online' },
  { id: '2', user: 'emeka_win', action: "started 'Ludo Master Live'", time: '4 mins ago', location: 'Abuja, NG', status: 'playing' },
  { id: '3', user: 'chioma_stakes', action: 'deposited ₦10,000', time: '7 mins ago', location: 'Enugu, NG', status: 'transaction' },
  { id: '4', user: 'tunde_nuggets', action: 'won ₦25,000 in Trivia', time: '12 mins ago', location: 'Ibadan, NG', status: 'win' },
  { id: '5', user: 'femi_fast', action: 'requested withdrawal ₦5,000', time: '15 mins ago', location: 'Port Harcourt, NG', status: 'pending' },
];

export const referralStats: ReferralStat[] = [
  { id: '1', label: 'Total Links Clicked', value: '124,500', icon: 'MdLink', color: '#3b82f6' },
  { id: '2', label: 'Successful Signups', value: '12,240', icon: 'MdPersonAdd', color: '#22c55e' },
  { id: '3', label: 'Conversion Rate', value: '9.8%', icon: 'MdPieChart', color: '#f59e0b' },
  { id: '4', label: 'Total Commissions Paid', value: '₦1.2M', icon: 'MdAttachMoney', color: '#a855f7' },
];

export const loyaltyPulse: LoyaltyPulse[] = [
  { id: '1', tier: 'Iron', users: 45200, icon: 'MdStarOutline', color: '#94a3b8' },
  { id: '2', tier: 'Gold', users: 12500, icon: 'MdStar', color: '#fbbf24' },
  { id: '3', tier: 'Elite', users: 2400, icon: 'MdWorkspacePremium', color: '#a855f7' },
  { id: '4', tier: 'Missions Completed', users: 85200, icon: 'MdAssignmentTurnedIn', color: '#22c55e' },
];

export const popularGames: PopularGame[] = [
  { id: '1', name: 'Whiz Trivia Pro', plays: '45.2k', revenue: '₦2.1M', icon: 'MdLiveHelp' },
  { id: '2', name: 'Penalty Shootout', plays: '32.1k', revenue: '₦1.8M', icon: 'MdSportsSoccer' },
  { id: '3', name: 'Ludo Master', plays: '28.4k', revenue: '₦1.4M', icon: 'MdCasino' },
];

export const liquidityData: LiquidityData[] = [
  { id: '1', category: 'Paystack Deposits', value: '₦850k', growth: '+12%', color: '#00c3f8' },
  { id: '2', category: 'Manual Deposits', value: '₦350k', growth: '-5%', color: '#a855f7' },
  { id: '3', category: 'Bonus Conversions', value: '₦120k', growth: '+8%', color: '#fbbf24' },
  { id: '4', category: 'Platform Reserve', value: '₦24.5M', growth: '+2.4%', color: '#22c55e' },
];

export const activeSessions: ActiveSession[] = [
  { id: '1', name: 'Draft Day Fantasy', league: 'Premier Skills', prize: '50,000', players: '8/10', status: 'Live', type: 'PvP' },
  { id: '2', name: 'Elite Trivia Night', league: 'Standard', prize: '10,000', players: '45/100', status: 'Starting Soon', type: 'PvE' },
  { id: '3', name: 'Ludo Pro Arena', league: 'Diamond', prize: '100,000', players: '2/4', status: 'Live', type: 'PvP' },
];
