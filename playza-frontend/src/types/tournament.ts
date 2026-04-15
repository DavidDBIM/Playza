export type TournamentStatus = 'upcoming' | 'live' | 'ended';
export type MatchStatus = 'pending' | 'live' | 'completed';
export type PlayerStatus = 'active' | 'eliminated';

export interface Tournament {
  id: string;
  name: string;
  status: TournamentStatus;
  entry_fee: number;
  prize_pool: number;
  max_players: number;
  game_id: string;
  start_time: string;
  match_duration: number; // in seconds
  region: string;
}

export interface TournamentPlayer {
  id: string;
  tournament_id: string;
  user_id: string;
  status: PlayerStatus;
  current_round: number;
  score?: number;
}

export interface Match {
  id: string;
  tournament_id: string;
  round: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number;
  player2_score: number;
  winner_id: string | null;
  status: MatchStatus;
  seed: number;
}

export interface BracketRound {
  number: number;
  matches: Match[];
}
