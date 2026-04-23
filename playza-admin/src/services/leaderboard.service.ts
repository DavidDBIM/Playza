import { apiClient } from "../lib/api-client";

export const leaderboardService = {
  getLoyaltyLeaderboard: async (period = 'all') => {
    const response = await apiClient.get(`/admin/leaderboards/loyalty?period=${period}`);
    return response.data.data;
  },
  getReferralLeaderboard: async (period = 'all') => {
    const response = await apiClient.get(`/admin/leaderboards/referral?period=${period}`);
    return response.data.data;
  },
  getGamesLeaderboard: async (period = 'all') => {
    const response = await apiClient.get(`/admin/leaderboards/games?period=${period}`);
    return response.data.data;
  },
};
