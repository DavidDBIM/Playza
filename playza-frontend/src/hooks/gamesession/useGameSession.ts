import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as GameSessionApi from "@/api/gamesession.api";
import { useEffect } from "react";
import { supabase } from "@/config/supabase";

export const useGames = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Games list rarely changes — only subscribe once and keep the channel alive.
    // Using a named channel prevents duplicate subscriptions on re-renders.
    const channel = supabase
      .channel('games_all')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-games"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["all-games"],
    queryFn: () => GameSessionApi.getGames(),
    staleTime: 5 * 60 * 1000,  // cache for 5 min — games don't change often
    gcTime: 10 * 60 * 1000,    // keep in memory for 10 min
  });
};

export const useActiveSession = (slug: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!slug) return;
    
    const channel = supabase
      .channel(`active_session_${slug}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_sessions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["active-session", slug] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug, queryClient]);

  return useQuery({
    queryKey: ["active-session", slug],
    queryFn: () => GameSessionApi.getActiveSession(slug),
    enabled: !!slug,
    staleTime: 30 * 1000, // 30s — active session changes are handled by realtime
  });
};

export const useSessionLeaderboard = (sessionId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session_${sessionId}`)
      .on("broadcast", { event: "LEADERBOARD_UPDATE" }, () => {
        queryClient.invalidateQueries({ queryKey: ["leaderboard", sessionId] });
        queryClient.invalidateQueries({ queryKey: ["my-stats", sessionId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);

  return useQuery({
    queryKey: ["leaderboard", sessionId],
    queryFn: () => GameSessionApi.getSessionLeaderboard(sessionId),
    enabled: !!sessionId,
    staleTime: 30 * 1000, // realtime handles updates, no need for short stale
  });
};

export const useMySessionStats = (sessionId: string) => {
  return useQuery({
    queryKey: ["my-stats", sessionId],
    queryFn: () => GameSessionApi.getMySessionStats(sessionId),
    enabled: !!sessionId,
    staleTime: 30 * 1000,
  });
};

export const useGameSessions = (gameId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!gameId) return;
    
    const channel = supabase
      .channel(`game_sessions_${gameId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_sessions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ["game-sessions", gameId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, queryClient]);

  return useQuery({
    queryKey: ["game-sessions", gameId],
    queryFn: () => GameSessionApi.getGameSessions(gameId),
    enabled: !!gameId,
    staleTime: 60 * 1000, // 1 min — realtime handles live updates
    gcTime: 5 * 60 * 1000,
  });
};

export const useJoinSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => GameSessionApi.joinSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["active-session"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard", sessionId] });
    },
  });
};

export const useSubmitScore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, score, roundId }: { sessionId: string; score: number; roundId: string }) => 
      GameSessionApi.submitSessionScore(sessionId, score, roundId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard", variables.sessionId] });
    },
  });
};
