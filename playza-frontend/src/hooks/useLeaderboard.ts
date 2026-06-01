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
    staleTime: 5 * 60 * 1000,      // fresh for 5 minutes
    refetchInterval: 5 * 60 * 1000, // poll every 5 min (was every 1 min)
  });
};

export const useReferralLeaderboard = (
  period: LeaderboardPeriod = "all",
  limit = 50,
) => {
  return useQuery({
    queryKey: ["leaderboard", "referral", period, limit],
    queryFn: () => getReferralLeaderboardApi(period, limit),
    staleTime: 5 * 60 * 1000,      // fresh for 5 minutes
    refetchInterval: 5 * 60 * 1000, // poll every 5 min (was every 1 min)
  });
};
