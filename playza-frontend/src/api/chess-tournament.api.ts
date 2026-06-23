import axiosInstance from "./axiosInstance";

export interface ChessTournament {
  id: string;
  title: string;
  description?: string;
  format: "knockout" | "group_knockout";
  bracket_size: number;
  group_count?: number;
  advance_per_group?: number;
  time_control_secs: number;
  increment_secs: number;
  entry_fee: number;
  prize_pool: number;
  platform_fee_percentage: number;
  prize_distribution?: { rank: number; percentage: number }[];
  consolation_pza: number;
  status: "registration" | "lobby" | "active" | "completed" | "cancelled";
  current_round: number;
  registration_end?: string;
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  player_count?: number;
}

export interface TournamentFixture {
  id: string;
  round_number: number;
  round_name: string;
  bracket_position: number;
  group_number?: number;
  player1_id?: string;
  player2_id?: string;
  chess_room_id?: string;
  winner_id?: string;
  is_bye: boolean;
  status: "pending" | "scheduled" | "active" | "completed" | "bye";
  player1?: { username: string; avatar_url?: string };
  player2?: { username: string; avatar_url?: string };
}

export interface TournamentStanding {
  id: string;
  group_number: number;
  user_id: string;
  username: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  game_wins_margin: number;
  group_rank?: number;
  advanced: boolean;
}

export const getChessTournaments = async (): Promise<ChessTournament[]> => {
  const { data } = await axiosInstance.get("/chess-tournament/tournaments");
  return data.data ?? [];
};

export const getChessTournament = async (id: string): Promise<ChessTournament> => {
  const { data } = await axiosInstance.get(`/chess-tournament/tournaments/${id}`);
  return data.data;
};

export const registerChessTournament = async (id: string): Promise<void> => {
  await axiosInstance.post(`/chess-tournament/tournaments/${id}/register`);
};

export const getChessTournamentFixtures = async (id: string): Promise<TournamentFixture[]> => {
  const { data } = await axiosInstance.get(`/chess-tournament/tournaments/${id}/fixtures`);
  return data.data ?? [];
};

export const getChessTournamentStandings = async (id: string): Promise<TournamentStanding[]> => {
  const { data } = await axiosInstance.get(`/chess-tournament/tournaments/${id}/standings`);
  return data.data ?? [];
};
