import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  gameSessionService,
  type GameData,
  type SessionInput,
} from "../services/gamesession.service";

export const useGames = () => {
  return useQuery({
    queryKey: ["games"],
    queryFn: () => gameSessionService.getAllGames(),
  });
};

export const useGameSessions = (gameId: string) => {
  return useQuery({
    queryKey: ["game-sessions", gameId],
    queryFn: () => gameSessionService.getGameSessions(gameId),
    enabled: !!gameId,
  });
};

export const useSessionDetails = (sessionId: string) => {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => gameSessionService.getSessionDetails(sessionId),
    enabled: !!sessionId,
  });
};

export const useUpdateSessionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      status,
    }: {
      sessionId: string;
      status: string;
    }) => gameSessionService.updateSessionStatus(sessionId, status),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["game-sessions"] });
    },
  });
};

export const useCreateGame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      gameData,
      sessions,
    }: {
      gameData: GameData;
      sessions: SessionInput[];
    }) => gameSessionService.createGame(gameData, sessions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
};

export const useUpdateGame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      gameId,
      gameData,
      sessions,
    }: {
      gameId: string;
      gameData: GameData;
      sessions?: SessionInput[];
    }) => gameSessionService.updateGame(gameId, gameData, sessions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
};

export const useFinalizeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => gameSessionService.finalizeSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['game-sessions'] });
    },
  });
};
