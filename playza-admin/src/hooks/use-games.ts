import { useQuery } from '@tanstack/react-query';
import { gameSessionService } from '../services/gamesession.service';

export const useGames = () => {
  return useQuery({
    queryKey: ['games'],
    queryFn: () => gameSessionService.getAllGames(),
  });
};

export const useGameSessions = (gameId: string) => {
  return useQuery({
    queryKey: ['game-sessions', gameId],
    queryFn: () => gameSessionService.getGameSessions(gameId),
    enabled: !!gameId,
  });
};
