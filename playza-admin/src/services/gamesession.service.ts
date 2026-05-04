import { apiClient } from '../lib/api-client';

interface SessionInput {
  title: string;
  type: string;
  entryFee: number;
  maxPlayers: number;
  winnersCount: number;
  startTime: string;
  endTime: string;
}

interface GameData {
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  mode: string;
  thumbnailUrl: string;
  iframeUrl: string;
  durationInSeconds: number;
  platformFeePercentage: number;
  controls: string;
  rules: string;
  scoring: string;
}

export const gameSessionService = {
  async getAllGames() {
    const response = await apiClient.get('/gamesession/games');
    return response.data;
  },

  async createGame(gameData: GameData, sessions: SessionInput[]) {
    const response = await apiClient.post('/gamesession/games', { gameData, sessions });
    return response.data;
  },


  async finalizeSession(sessionId: string) {
    const response = await apiClient.post(`/gamesession/sessions/${sessionId}/finalize`);
    return response.data;
  },

  async getSessionDetails(sessionId: string) {
    const response = await apiClient.get(`/gamesession/sessions/${sessionId}/details`);
    return response.data;
  }
};

