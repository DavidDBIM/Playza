export interface PlayerRank {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  score: number;
  prize: number;
}

export interface SessionRecord {
  id: string;
  title: string;
  status: 'Live' | 'Upcoming' | 'Completed';
  playersJoined: string;
  prizePool: number;
  startTime: string;
  leaderboard: PlayerRank[];
}

export interface GameLeaderboard {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  sessions: SessionRecord[];
}

export interface ReferralLead {
  rank: number;
  username: string;
  avatar: string;
  totalReferrals: number;
  earnings: number;
  dateJoined: string;
}

export interface LoyaltyLead {
  rank: number;
  username: string;
  avatar: string;
  pzaPoints: number;
  tier: 'Elite' | 'Gold' | 'Silver' | 'Bronze';
  activityScore: number;
}
