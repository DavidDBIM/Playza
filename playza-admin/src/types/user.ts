export interface UserRecord {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatar: string;
  status: 'Active' | 'Banned' | 'Suspended' | 'Pending';
  kycStatus: 'Verified' | 'Pending' | 'Rejected';
  walletBalance: number;
  pzaPoints: number;
  totalGames: number;
  totalWinnings: number;
  joinedDate: string;
  joinedTimestamp: number;
  level: number;
  referrals: number;
  referralCode?: string;
  lastActive: string;
}

export interface MatchRecord {
  id: string;
  game: string;
  score: string;
  position: string;
  winnings: number;
  date: string;
  status: string;
}

export interface TransactionRecord {
  id: string;
  type: string;
  amount: number;
  method: string;
  date: string;
  status: string;
  username: string;
}

export interface ReferralRecord {
  id: string;
  username: string;
  date: string;
  reward: number;
  status: string;
}
