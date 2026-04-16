import { useQuery } from "@tanstack/react-query";
import {
  getLoyaltyLeaderboardApi,
  getReferralLeaderboardApi,
  type LeaderboardPeriod,
} from "../api/leaderboard.api";

export const useLoyaltyLeaderboard = (
  period: LeaderboardPeriod = "all",
  limit = 50,
) => {
  return useQuery({
    queryKey: ["leaderboard", "loyalty", period, limit],
    queryFn: () => getLoyaltyLeaderboardApi(period, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useReferralLeaderboard = (
  period: LeaderboardPeriod = "all",
  limit = 50,
) => {
  return useQuery({
    queryKey: ["leaderboard", "referral", period, limit],
    queryFn: () => getReferralLeaderboardApi(period, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
