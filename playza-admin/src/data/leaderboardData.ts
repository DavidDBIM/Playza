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

export const gamesLeaderboardData: GameLeaderboard[] = [
  {
    id: 'G1',
    title: 'Whiz Trivia Pro',
    category: 'Educational',
    thumbnail: 'https://images.unsplash.com/photo-1606326666490-457574d56v1?auto=format&fit=crop&q=80&w=200',
    sessions: [
      {
        id: 'S101',
        title: 'Pro Challenge #4',
        status: 'Live',
        playersJoined: '18/100',
        prizePool: 50000,
        startTime: 'Live Now',
        leaderboard: [
          { rank: 1, userId: 'U1', username: 'olanrewaju_77', avatar: 'https://i.pravatar.cc/150?u=1', score: 4820, prize: 25000 },
          { rank: 2, userId: 'U2', username: 'chidimma_ox', avatar: 'https://i.pravatar.cc/150?u=2', score: 4500, prize: 15000 },
          { rank: 3, userId: 'U3', username: 'musa_king', avatar: 'https://i.pravatar.cc/150?u=3', score: 4200, prize: 10000 },
          { rank: 4, userId: 'U4', username: 'amaka_p', avatar: 'https://i.pravatar.cc/150?u=4', score: 3800, prize: 0 },
          { rank: 5, userId: 'U5', username: 'tunde_dev', avatar: 'https://i.pravatar.cc/150?u=5', score: 3500, prize: 0 },
        ]
      },
      {
        id: 'S102',
        title: 'Morning Sprint',
        status: 'Completed',
        playersJoined: '50/50',
        prizePool: 10000,
        startTime: 'Ended 2h ago',
        leaderboard: [
          { rank: 1, userId: 'U10', username: 'ngozi_p', avatar: 'https://i.pravatar.cc/150?u=10', score: 5200, prize: 5000 },
          { rank: 2, userId: 'U11', username: 'osita_i', avatar: 'https://i.pravatar.cc/150?u=11', score: 4900, prize: 3000 },
          { rank: 3, userId: 'U12', username: 'simi_s', avatar: 'https://i.pravatar.cc/150?u=12', score: 4700, prize: 2000 },
        ]
      }
    ]
  },
  {
    id: 'G2',
    title: 'Penalty Shootout Elite',
    category: 'Sports',
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=200',
    sessions: [
      {
        id: 'S201',
        title: 'Saturday Showdown',
        status: 'Upcoming',
        playersJoined: '0/200',
        prizePool: 100000,
        startTime: 'In 4 hours',
        leaderboard: []
      }
    ]
  }
];

export const referralLeaderboard: ReferralLead[] = [
  { rank: 1, username: 'donjazzy_m', avatar: 'https://i.pravatar.cc/150?u=don', totalReferrals: 2500, earnings: 1250000, dateJoined: 'Jan 2023' },
  { rank: 2, username: 'davido_f', avatar: 'https://i.pravatar.cc/150?u=dav', totalReferrals: 500, earnings: 250000, dateJoined: 'Jun 2023' },
  { rank: 3, username: 'burna_b', avatar: 'https://i.pravatar.cc/150?u=bur', totalReferrals: 400, earnings: 200000, dateJoined: 'Apr 2023' },
  { rank: 4, username: 'wizkid_s', avatar: 'https://i.pravatar.cc/150?u=wiz', totalReferrals: 320, earnings: 160000, dateJoined: 'May 2023' },
];

export const loyaltyLeaderboard: LoyaltyLead[] = [
  { rank: 1, username: 'donjazzy_m', avatar: 'https://i.pravatar.cc/150?u=don', pzaPoints: 300000, tier: 'Elite', activityScore: 99 },
  { rank: 2, username: 'davido_f', avatar: 'https://i.pravatar.cc/150?u=dav', pzaPoints: 150000, tier: 'Elite', activityScore: 95 },
  { rank: 3, username: 'wizkid_s', avatar: 'https://i.pravatar.cc/150?u=wiz', pzaPoints: 120000, tier: 'Gold', activityScore: 92 },
  { rank: 4, username: 'burna_b', avatar: 'https://i.pravatar.cc/150?u=bur', pzaPoints: 110000, tier: 'Gold', activityScore: 90 },
];
