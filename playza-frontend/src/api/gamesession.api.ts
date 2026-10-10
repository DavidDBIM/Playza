import axiosInstance from "./axiosInstance";

export interface RecentWinner {
  id: string;
  username: string;
  game: string;
  amountWon: number;
  playedAt: string;
}

export interface PayoutBucket {
  total: number;
  // keyed by lower-cased game title
  byGame: Record<string, number>;
}

export interface PayoutStats {
  solo: PayoutBucket;
  h2h: PayoutBucket;
}

export const getPayoutStats = async (): Promise<PayoutStats> => {
  const response = await axiosInstance.get("/gamesession/payout-stats");
  return { solo: response.data.solo, h2h: response.data.h2h };
};

export const getGames = async () => {
  const response = await axiosInstance.get("/gamesession/games");
  return response.data;
};

export const getRecentWinners = async (limit = 30): Promise<RecentWinner[]> => {
  const response = await axiosInstance.get("/gamesession/recent-winners", { params: { limit } });
  return response.data.winners;
};

export const getActiveSession = async (slug: string) => {

  const response = await axiosInstance.get(`/gamesession/sessions/${slug}/active`);
  return response.data;
};

export const joinSession = async (sessionId: string) => {
  const response = await axiosInstance.post(`/gamesession/sessions/${sessionId}/join`);
  return response.data;
};

export const startRound = async (sessionId: string) => {
  const response = await axiosInstance.post(`/gamesession/sessions/${sessionId}/start-round`);
  return response.data;
};

export const submitSessionScore = async (sessionId: string, score: number, roundId: string) => {
  const response = await axiosInstance.post(`/gamesession/sessions/${sessionId}/submit-score`, { score, roundId });
  return response.data;
};

export const getSessionLeaderboard = async (sessionId: string) => {
  const response = await axiosInstance.get(`/gamesession/sessions/${sessionId}/leaderboard`);
  return response.data;
};

export const getMySessionStats = async (sessionId: string) => {
  const response = await axiosInstance.get(`/gamesession/sessions/${sessionId}/my-stats`);
  return response.data;
};

export const getGameSessions = async (gameId: string) => {
  const response = await axiosInstance.get(`/gamesession/games/${gameId}/sessions`);
  return response.data;
};

export const deductWallet = async (amount: number, description: string) => {
  const response = await axiosInstance.post(`/wallet/deduct`, { amount, description });
  return response.data;
};
export const getRecentSessionActivity = async (sessionId: string) => {
  const response = await axiosInstance.get(`/gamesession/sessions/${sessionId}/recent-activity`);
  return response.data;
};