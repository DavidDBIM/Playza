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

export interface UserAdmin {
  id: string;
  username: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  avatar_url?: string;
  is_email_verified: boolean;
  created_at: string;
  wallets?: { balance: number };
  pza_points?: { total_points: number };
}

export interface UserDetails extends UserAdmin {
  game_history?: Array<{
    id: string;
    game_name: string;
    played_at: string;
    winnings: number;
    status: string;
  }>;
  transactions?: Array<{
    id: string;
    type: string;
    amount: number;
    reference: string;
    created_at: string;
    status: string;
  }>;
  referrals?: Array<{
    id: string;
    users?: { username: string };
    created_at: string;
    status: string;
  }>;
  pza_history?: Array<{
    id: string;
    event_type: string;
    points: number;
    created_at: string;
  }>;
  referral_code?: string;
  total_referrals: number;
}

export interface PaginatedResponse<T, K extends string> {
  success: boolean;
  data: {
    [key in K]: T[];
  } & {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AmbassadorApplicationAdmin {
  id: string;
  full_name: string;
  email: string;
  users?: { username?: string };
  qualification_type: string;
  follower_count?: number;
  platforms?: string[];
  status: "pending" | "approved" | "rejected" | string;
  created_at: string | Date;
  admin_note?: string;
  phone?: string;
  content_niche?: string;
  social_handles?: Record<string, string>;
  motivation: string;
  reviewed_at?: string | Date;
}

export interface PayoutRequestAdmin {
  id: string;
  users?: {
    username: string;
    email: string;
    wallet?: { balance: number };
  };
  amount: number;
  status: "pending" | "approved" | "rejected" | string;
  created_at: string | Date;
  admin_note?: string;
}

export interface UserHistoryItem {
  id: string;
  event_type: string;
  points_awarded: number;
  details?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  created_at: string | Date;
}

export interface TransactionAdmin {
  id: string;
  users?: { username?: string };
  type: "withdrawal" | "deposit" | "game_entry" | "winnings" | string;
  amount: number;
  status: "success" | "successful" | "pending" | "failed" | string;
  reference: string;
  created_at: string | Date;
}

export interface AdminLoginResponse {
  mfa_required?: boolean;
  access_token?: string;
  user?: {
    id?: string;
    username?: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
  };
}

export interface DashboardMetrics {
  total_users: number;
  active_users: number;
  total_deposited: number;
  total_withdrawn: number;
  platform_profit: number;
  pending_withdrawals_count: number;
  referral_conversion_rate: string;
}
