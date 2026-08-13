import axiosInstance from "./axiosInstance";

export interface ChessTournament {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
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
  user_registered?: boolean;  // included when user is authenticated
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
  scheduled_at?: string;
  draw_count?: number;
  is_armageddon?: boolean;
  armageddon_draw_winner_id?: string;
  player1?: { username: string; avatar_url?: string };
  player2?: { username: string; avatar_url?: string };
}

export interface TiebreakBreakdownRow {
  user_id: string;
  username: string;
  points: number;
  head_to_head_points: number;
  head_to_head_margin: number;
  overall_margin: number;
  sonneborn_berger: number;
  registered_at: string;
  final_group_rank: number;
}

export type TiebreakDecidedBy = "head_to_head" | "head_to_head_margin" | "overall_margin" | "sonneborn_berger" | "registration_order";

export interface TiebreakBreakdown {
  decided_by: TiebreakDecidedBy;
  entries: TiebreakBreakdownRow[];
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
  // Only present for players who were genuinely tied with someone on
  // points — shows every number that was checked and which one actually
  // decided it, so a player who gets cut on a tiebreak can see exactly why.
  tiebreak_breakdown?: TiebreakBreakdown | null;
}

export interface MyChessStatus {
  registered: boolean;
  status: string | null;
  final_rank: number | null;
  prize_won: number | null;
  group_number: number | null;
  active_fixture: TournamentFixture | null;
}

export interface TournamentResult {
  user_id: string;
  username: string;
  avatar_url?: string;
  final_rank: number;
  prize_won: number;
  status: string;
}

export const getChessTournaments = async (): Promise<ChessTournament[]> => {
  const { data } = await axiosInstance.get("/chess-tournament/tournaments");
  return data.data ?? [];
};

export const getChessTournament = async (id: string): Promise<ChessTournament> => {
  const { data } = await axiosInstance.get(`/chess-tournament/tournaments/${id}`);
  return data.data;
};

export const getMyChessStatus = async (tournamentId: string): Promise<MyChessStatus> => {
  const { data } = await axiosInstance.get(`/chess-tournament/tournaments/${tournamentId}/my-status`);
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

export const getChessTournamentResults = async (id: string): Promise<TournamentResult[]> => {
  const { data } = await axiosInstance.get(`/chess-tournament/tournaments/${id}/results`);
  return data.data ?? [];
};