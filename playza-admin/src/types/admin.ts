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
  amount: number;
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

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[] | number | string | boolean | undefined;
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
