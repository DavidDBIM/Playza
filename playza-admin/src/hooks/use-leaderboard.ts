import { useQuery } from "@tanstack/react-query";
import { leaderboardService } from "../services/leaderboard.service";

export const useAdminLoyaltyLeaderboard = (period = 'all') => {
  return useQuery({
    queryKey: ["admin", "leaderboard", "loyalty", period],
    queryFn: () => leaderboardService.getLoyaltyLeaderboard(period),
  });
};

export const useAdminReferralLeaderboard = (period = 'all') => {
  return useQuery({
    queryKey: ["admin", "leaderboard", "referral", period],
    queryFn: () => leaderboardService.getReferralLeaderboard(period),
  });
};

export const useAdminGamesLeaderboard = (period = 'all') => {
  return useQuery({
    queryKey: ["admin", "leaderboard", "games", period],
    queryFn: () => leaderboardService.getGamesLeaderboard(period),
  });
};
