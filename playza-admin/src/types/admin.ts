export interface DashboardMetrics {
  total_users: number;
  active_users: number;
  total_deposited: number;
  total_withdrawn: number;
  platform_profit: number;
  platform_reserve: number;
  pending_withdrawals_count: number;
  total_referrals: number;
  verified_referrals: number;
  referral_conversion_rate: string;
  new_users_week: number;
  verified_users: number;
}

export interface UserAdmin {
  id: string;
  username: string;
  email: string;
  phone: string;
  avatar_url: string;
  first_name: string;
  last_name: string;
  referral_code: string;
  is_email_verified: boolean;
  is_active: boolean;
  created_at: string;
  wallets: {
    balance: number;
    total_deposited: number;
    total_withdrawn: number;
  };
  pza_points: {
    total_points: number;
  };
}

export interface UserHistoryItem {
  id: string;
  event_type: string;
  points_awarded: number;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface UserDetails extends UserAdmin {
  referrals: {
    id: string;
    created_at: string;
    status: string;
    users?: {
       username: string;
    };
  }[];
  total_referrals: number;
  pza_history: UserHistoryItem[];
  game_history: {
    id: string;
    game_name: string;
    status: string;
    winnings: number;
    played_at: string;
  }[];
  transactions: {
    id: string;
    type: string;
    amount: number;
    status: string;
    reference: string;
    created_at: string;
  }[];
}

export interface TransactionAdmin {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  reference: string;
  created_at: string;
  users: {
    username: string;
    email: string;
  };
}

export interface PaginatedResponse<T, K extends string = string> {
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

export interface PayoutRequestAdmin {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  users: {
    id: string;
    username: string;
    email: string;
    wallet: {
      balance: number;
    } | null;
  };
}

export interface AmbassadorApplicationAdmin {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  qualification_type: 'social_influencer' | 'gold_badge' | 'referral_100';
  platforms: string[] | null;
  follower_count: number | null;
  social_handles: Record<string, string> | null;
  content_niche: string | null;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  users: {
    username: string;
    avatar_url: string | null;
  };
  pza?: {
    total_points: number;
  };
}
