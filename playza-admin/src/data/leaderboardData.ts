import type {
  PlayerRank,
  SessionRecord,
  GameLeaderboard,
  ReferralLead,
  LoyaltyLead,
} from "../types/leaderboard";

export type {
  PlayerRank,
  SessionRecord,
  GameLeaderboard,
  ReferralLead,
  LoyaltyLead,
};

export const gamesLeaderboardData: GameLeaderboard[] = [];
export const referralLeaderboard: ReferralLead[] = [];
export const loyaltyLeaderboard: LoyaltyLead[] = [];
