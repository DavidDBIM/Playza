import axiosInstance from "./axiosInstance";

export const getGames = async () => {
  const response = await axiosInstance.get("/gamesession/games");
  return response.data;
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
