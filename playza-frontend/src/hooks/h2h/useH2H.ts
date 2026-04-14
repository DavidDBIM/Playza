import { useQuery, useMutation } from "@tanstack/react-query";
import * as chessApi from "@/api/chess.api";
import { speedBattleApi } from "@/api/speedbattle.api";
import { wordScrambleApi } from "@/api/wordscramble.api";
import { poolApi } from "@/api/poolApi";
import * as ludoApi from "@/api/ludo.api";

export type GameType = "chess" | "speed-battle" | "word-scramble" | "pool" | "arena-duel" | "ludo";

export interface GameApi {
  getRoom?: (roomId: string) => Promise<unknown>;
  createRoom?: (stake: number, isBot?: boolean, botDifficulty?: string) => Promise<unknown>;
  joinRoom?: (code: string) => Promise<unknown>;
  findQuickMatch?: (stake: number) => Promise<unknown>;
  getWaitingRooms?: () => Promise<unknown[]>;
  listRooms?: () => Promise<unknown[]>;
}

export const getApiForGame = (gameType: GameType): GameApi => {
  if (gameType === "speed-battle") return speedBattleApi as unknown as GameApi;
  if (gameType === "word-scramble") return wordScrambleApi as unknown as GameApi;
  if (gameType === "pool") return poolApi as unknown as GameApi;
  if (gameType === "ludo") return ludoApi as unknown as GameApi;
  return chessApi as unknown as GameApi; // Fallback to chess for unified interface
};

export const useWaitingRooms = (gameType: GameType) => {
  return useQuery({
    queryKey: ["h2h", "waiting-rooms", gameType],
    queryFn: async () => {
      if (gameType === "chess") return chessApi.getWaitingRooms();
      if (gameType === "ludo") return ludoApi.getWaitingRooms();
      if (gameType === "pool") return poolApi.listRooms();
      return [];
    },
    staleTime: 1000 * 5, // 5 seconds
    refetchInterval: 1000 * 5,
  });
};

export const useH2HRoom = (roomId: string | undefined, gameType: GameType) => {
  return useQuery({
    queryKey: ["h2h", "room", roomId],
    queryFn: async () => {
      if (!roomId) throw new Error("Room ID required");
      if (gameType === "chess") return chessApi.getChessRoom(roomId);
      if (gameType === "ludo") return ludoApi.getLudoRoom(roomId);
      
      const api = getApiForGame(gameType);
      if (api.getRoom) {
        return api.getRoom(roomId);
      }
      return null;
    },
    enabled: !!roomId,
    refetchInterval: (query) => {
      const data = query.state.data as { status?: string };
      const status = data?.status;
      if (status === "waiting" || status === "active") return 2000;
      return false;
    },
  });
};

export const useH2HMutations = (gameType: GameType) => {
  const api = getApiForGame(gameType);

  const createRoom = useMutation({
    mutationFn: (stake: number) => {
      if (gameType === "chess") return chessApi.createChessRoom(stake);
      if (gameType === "ludo") return ludoApi.createLudoRoom(stake);
      if (!api.createRoom) throw new Error("Creation not supported for this game");
      return api.createRoom(stake);
    },
  });

  const createBotRoom = useMutation({
    mutationFn: (stake: number) => {
      if (gameType === "chess") return chessApi.createBotRoom(stake);
      if (gameType === "ludo") return ludoApi.createBotRoom(stake);
      if (!api.createRoom) throw new Error("Bot match not supported for this game");
      return api.createRoom(stake, true, "medium");
    },
  });

  const joinRoom = useMutation({
    mutationFn: (code: string) => {
      if (gameType === "chess") return chessApi.joinChessRoom(code);
      if (gameType === "ludo") return ludoApi.joinLudoRoom(code);
      if (!api.joinRoom) throw new Error("Joining by code not supported");
      return api.joinRoom(code);
    },
  });

  const quickMatch = useMutation({
    mutationFn: (stake: number) => {
      if (gameType === "chess") return chessApi.findQuickMatch(stake);
      if (gameType === "ludo") return ludoApi.findQuickMatch(stake);
      if (!api.findQuickMatch) throw new Error("Quick match not supported");
      return api.findQuickMatch(stake);
    },
  });

  return {
    createRoom,
    createBotRoom,
    joinRoom,
    quickMatch,
  };
};
