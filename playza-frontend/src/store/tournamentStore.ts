import { create } from "zustand";
import type { Tournament, TournamentPlayer, Match } from "../types/tournament";

interface TournamentState {
  activeTournament: Tournament | null;
  players: TournamentPlayer[];
  matches: Match[];
  userPlayer: TournamentPlayer | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchActiveTournament: (id: string) => Promise<void>;
  joinTournament: (userId: string) => Promise<void>;
  fetchMatches: (tournamentId: string) => Promise<void>;
  submitMatchScore: (
    matchId: string,
    userId: string,
    score: number,
  ) => Promise<void>;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  activeTournament: null,
  players: [],
  matches: [],
  userPlayer: null,
  isLoading: false,
  error: null,

  fetchActiveTournament: async (id: string) => {
    set({ isLoading: true });
    try {
      // In a real app, we'd fetch from Supabase
      // const { data, error } = await supabase.from('tournaments').select('*').eq('id', id).single();

      // Mocking for now based on prompt
      const mockTournament: Tournament = {
        id: id,
        name: "Playza Speed Arena Championship #1",
        status: "live",
        entry_fee: 1000,
        prize_pool: 50000,
        max_players: 8,
        game_id: "14",
        start_time: new Date().toISOString(),
        match_duration: 60,
        region: "Global",
      };

      set({ activeTournament: mockTournament, isLoading: false });

      // Fetch players and matches if joined
      get().fetchMatches(id);
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  joinTournament: async (userId: string) => {
    const { activeTournament } = get();
    if (!activeTournament) return;

    set({ isLoading: true });
    try {
      // 1. Deduct fee (logic would be here)
      // 2. Add player to tournament_players

      const newPlayer: TournamentPlayer = {
        id: Math.random().toString(36).substr(2, 9),
        tournament_id: activeTournament.id,
        user_id: userId,
        status: "active",
        current_round: 1,
      };

      set((state) => ({
        userPlayer: newPlayer,
        players: [...state.players, newPlayer],
        isLoading: false,
      }));

      // If tournament is now full (mock logic), generate bracket
      if (get().players.length >= activeTournament.max_players) {
        // generateMatches(activeTournament.id);
      }
    } catch (error: unknown) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchMatches: async (tournamentId: string) => {
    // Mocked matches for an 8-player bracket
    const mockMatches: Match[] = [
      // Round 1
      {
        id: "m1",
        tournament_id: tournamentId,
        round: 1,
        player1_id: "p1",
        player2_id: "p2",
        player1_score: 0,
        player2_score: 0,
        winner_id: null,
        status: "pending",
        seed: 123,
      },
      {
        id: "m2",
        tournament_id: tournamentId,
        round: 1,
        player1_id: "p3",
        player2_id: "p4",
        player1_score: 0,
        player2_score: 0,
        winner_id: null,
        status: "pending",
        seed: 456,
      },
      {
        id: "m3",
        tournament_id: tournamentId,
        round: 1,
        player1_id: "p5",
        player2_id: "p6",
        player1_score: 0,
        player2_score: 0,
        winner_id: null,
        status: "pending",
        seed: 789,
      },
      {
        id: "m4",
        tournament_id: tournamentId,
        round: 1,
        player1_id: "p7",
        player2_id: "p8",
        player1_score: 0,
        player2_score: 0,
        winner_id: null,
        status: "pending",
        seed: 101,
      },
      // Round 2 (Qualifiers)
      {
        id: "m5",
        tournament_id: tournamentId,
        round: 2,
        player1_id: null,
        player2_id: null,
        player1_score: 0,
        player2_score: 0,
        winner_id: null,
        status: "pending",
        seed: 112,
      },
      {
        id: "m6",
        tournament_id: tournamentId,
        round: 2,
        player1_id: null,
        player2_id: null,
        player1_score: 0,
        player2_score: 0,
        winner_id: null,
        status: "pending",
        seed: 131,
      },
      // Final
      {
        id: "m7",
        tournament_id: tournamentId,
        round: 3,
        player1_id: null,
        player2_id: null,
        player1_score: 0,
        player2_score: 0,
        winner_id: null,
        status: "pending",
        seed: 141,
      },
    ];

    set({ matches: mockMatches });
  },

  submitMatchScore: async (matchId: string, userId: string, score: number) => {
    set((state) => ({
      matches: state.matches.map((m) => {
        if (m.id === matchId) {
          const isP1 = m.player1_id === userId;
          return {
            ...m,
            player1_score: isP1 ? score : m.player1_score,
            player2_score: !isP1 ? score : m.player2_score,
            status:
              (isP1 ? m.player2_score : m.player1_score) > 0
                ? "completed"
                : "pending",
            winner_id: isP1
              ? score > m.player2_score
                ? userId
                : m.player2_id
              : score > m.player1_score
                ? userId
                : m.player1_id,
          };
        }
        return m;
      }),
    }));
  },
}));
