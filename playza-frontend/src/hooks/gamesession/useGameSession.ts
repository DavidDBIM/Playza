import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as GameSessionApi from "@/api/gamesession.api";
import { useEffect } from "react";
import { supabase } from "@/config/supabase";

export const useGames = () => {
  return useQuery({
    queryKey: ["all-games"],
    queryFn: () => GameSessionApi.getGames(),
  });
};

export const useActiveSession = (slug: string) => {

  return useQuery({
    queryKey: ["active-session", slug],
    queryFn: () => GameSessionApi.getActiveSession(slug),
    enabled: !!slug,
  });
};

export const useSessionLeaderboard = (sessionId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    // Listen for real-time updates
    const channel = supabase
      .channel(`session_${sessionId}`)
      .on("broadcast", { event: "LEADERBOARD_UPDATE" }, () => {
        // Refetch the leaderboard and user stats when a new score is submitted
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
  });
};

export const useMySessionStats = (sessionId: string) => {
  return useQuery({
    queryKey: ["my-stats", sessionId],
    queryFn: () => GameSessionApi.getMySessionStats(sessionId),
    enabled: !!sessionId,
  });
};

export const useGameSessions = (gameId: string) => {
  return useQuery({
    queryKey: ["game-sessions", gameId],
    queryFn: () => GameSessionApi.getGameSessions(gameId),
    enabled: !!gameId,
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
