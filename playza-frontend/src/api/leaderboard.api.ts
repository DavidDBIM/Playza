import axiosInstance from "./axiosInstance";

export type LeaderboardPeriod = "today" | "7d" | "30d" | "all";

export interface LoyaltyLeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  pza_points: number;
}

export interface ReferralLeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_referrals: number;
}

export const getLoyaltyLeaderboardApi = async (
  period: LeaderboardPeriod = "all",
  limit = 50
): Promise<LoyaltyLeaderboardEntry[]> => {
  const { data } = await axiosInstance.get(`/leaderboard/loyalty`, {
    params: { period, limit },
  });
  return data.data;
};

export const getReferralLeaderboardApi = async (
  period: LeaderboardPeriod = "all",
  limit = 50
): Promise<ReferralLeaderboardEntry[]> => {
  const { data } = await axiosInstance.get(`/leaderboard/referral`, {
    params: { period, limit },
  });
  return data.data;
};
