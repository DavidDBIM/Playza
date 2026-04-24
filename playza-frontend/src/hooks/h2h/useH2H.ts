import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as chessApi from "@/api/chess.api";
import { speedBattleApi } from "@/api/speedbattle.api";
import { wordScrambleApi } from "@/api/wordscramble.api";
import { poolApi } from "@/api/poolApi";
import * as ludoApi from "@/api/ludo.api";
import * as soccerApi from "@/api/soccer.api";
import { supabase } from "@/config/supabase";
import { useEffect } from "react";

export type GameType = "chess" | "speed-battle" | "word-scramble" | "pool" | "arena-duel" | "ludo" | "soccer";

export interface GameApi {
  getRoom?: (roomId: string) => Promise<unknown>;
  createRoom?: (stake: number, isBot?: boolean, botDifficulty?: string) => Promise<unknown>;
  joinRoom?: (code: string) => Promise<unknown>;
  findQuickMatch?: (stake: number) => Promise<unknown>;
  getWaitingRooms?: () => Promise<unknown[]>;
  listRooms?: () => Promise<unknown[]>;
  cancelRoom?: (roomId: string) => Promise<unknown>;
}

export const getApiForGame = (gameType: GameType): GameApi => {
  if (gameType === "speed-battle") return speedBattleApi as unknown as GameApi;
  if (gameType === "word-scramble") return wordScrambleApi as unknown as GameApi;
  if (gameType === "pool") return poolApi as unknown as GameApi;
  if (gameType === "ludo") return ludoApi as unknown as GameApi;
  if (gameType === "soccer") return soccerApi as unknown as GameApi;
  if (gameType === "chess") return chessApi as unknown as GameApi;
  return chessApi as unknown as GameApi; // Fallback
};

export const useWaitingRooms = (gameType: GameType) => {
  return useQuery({
    queryKey: ["h2h", "waiting-rooms", gameType],
    queryFn: async () => {
      if (gameType === "chess") return chessApi.getWaitingRooms();
      if (gameType === "ludo") return ludoApi.getWaitingRooms();
      if (gameType === "pool") return poolApi.listRooms();
      if (gameType === "soccer") return soccerApi.getWaitingRooms();
      return [];
    },
    staleTime: 1000 * 5, // 5 seconds
    refetchInterval: 1000 * 5,
  });
};

export const useH2HRoom = (roomId: string | undefined, gameType: GameType) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!roomId) return;

    const table =
      gameType === "ludo"
        ? "ludo_rooms"
        : gameType === "soccer"
        ? "soccer_rooms"
        : "chess_rooms";

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: table,
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          // Manually update the query cache when a change is detected
          queryClient.setQueryData(["h2h", "room", roomId], payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, gameType, queryClient]);

  return useQuery({
    queryKey: ["h2h", "room", roomId],
    queryFn: async () => {
      if (!roomId) throw new Error("Room ID required");
      if (gameType === "chess") return chessApi.getChessRoom(roomId);
      if (gameType === "ludo") return ludoApi.getLudoRoom(roomId);
      if (gameType === "soccer") return soccerApi.getSoccerRoom(roomId);

      const api = getApiForGame(gameType);
      if (api.getRoom) {
        return api.getRoom(roomId);
      }
      return null;
    },
    enabled: !!roomId,
    // Keep refetch as fallback, but the subscription will handle the speed
    refetchInterval: (query) => {
      const data = query.state.data as { status?: string };
      const status = data?.status;
      if (status === "waiting" || status === "active") return 5000;
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
      if (gameType === "soccer") return soccerApi.createSoccerRoom(stake);
      if (!api.createRoom) throw new Error("Creation not supported for this game");
      return api.createRoom(stake);
    },
  });

  const createBotRoom = useMutation({
    mutationFn: (stake: number) => {
      if (gameType === "chess") return chessApi.createBotRoom(stake);
      if (gameType === "ludo") return ludoApi.createBotRoom(stake);
      if (gameType === "soccer") return soccerApi.createBotRoom(stake);
      if (!api.createRoom) throw new Error("Bot match not supported for this game");
      return api.createRoom(stake, true, "medium");
    },
  });

  const joinRoom = useMutation({
    mutationFn: (code: string) => {
      if (gameType === "chess") return chessApi.joinChessRoom(code);
      if (gameType === "ludo") return ludoApi.joinLudoRoom(code);
      if (gameType === "soccer") return soccerApi.joinSoccerRoom(code);
      if (!api.joinRoom) throw new Error("Joining by code not supported");
      return api.joinRoom(code);
    },
  });

  const quickMatch = useMutation({
    mutationFn: (stake: number) => {
      if (gameType === "chess") return chessApi.findQuickMatch(stake);
      if (gameType === "ludo") return ludoApi.findQuickMatch(stake);
      if (gameType === "soccer") return soccerApi.findQuickMatch(stake);
      if (!api.findQuickMatch) throw new Error("Quick match not supported");
      return api.findQuickMatch(stake);
    },
  });

  const cancelRoom = useMutation({
    mutationFn: (roomId: string) => {
      const api = getApiForGame(gameType);
      if (!api.cancelRoom) throw new Error("Cancellation not supported");
      return api.cancelRoom(roomId);
    },
  });

  return {
    createRoom,
    createBotRoom,
    joinRoom,
    quickMatch,
    cancelRoom,
  };
};
