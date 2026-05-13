import { apiClient } from '../lib/api-client';

export interface SessionInput {
  title: string;
  type: string;
  entryFee: number;
  maxPlayers?: number;
  winnersCount: number;
  startTime: string;
  endTime: string;
}

export interface GameData {
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  mode: string;
  thumbnailUrl: string;
  iframeUrl: string;
  durationInSeconds?: number;
  platformFeePercentage: number;
  controls: string;
  rules: string;
  scoring: string;
  /** JSONB capabilities column — set via the admin Game Capabilities section */
  capabilities?: {
    powerUps?: boolean;
    bundles?: boolean;
    rivalBanner?: boolean;
    powerUpDefs?: { id: string; label: string; cost: number }[];
    bundlePacks?: {
      id: string; label: string; description: string;
      cost: number; grants: Record<string, number>;
    }[];
  };
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

  async updateGame(gameId: string, gameData: GameData, sessions?: SessionInput[]) {
    const response = await apiClient.put(`/gamesession/games/${gameId}`, { gameData, sessions });
    return response.data;
  },


  async finalizeSession(sessionId: string) {
    const response = await apiClient.post(`/gamesession/sessions/${sessionId}/finalize`);
    return response.data;
  },

  async getSessionDetails(sessionId: string) {
    const response = await apiClient.get(`/gamesession/sessions/${sessionId}/details`);
    return response.data;
  },

  async getGameSessions(gameId: string) {
    const response = await apiClient.get(`/gamesession/games/${gameId}/sessions`);
    return response.data;
  },

  async retireGame(gameId: string, status: boolean) {
    const response = await apiClient.post(`/gamesession/games/${gameId}/retire`, { status });
    return response.data;
  },

  async updateSessionStatus(sessionId: string, status: string) {
    const response = await apiClient.patch(`/gamesession/sessions/${sessionId}/status`, { status });
    return response.data;
  },

  async getH2HMatches(slug: string, page = 1, limit = 20) {
    const response = await apiClient.get(`/admin/games/${slug}/h2h-matches`, {
      params: { page, limit }
    });
    return response.data;
  },

  async getSoloActivity(slug: string, viewMode: 'raw' | 'aggregated' = 'aggregated', page = 1, limit = 20) {
    const response = await apiClient.get(`/admin/games/${slug}/solo-activity`, {
      params: { viewMode, page, limit }
    });
    return response.data;
  }
};

