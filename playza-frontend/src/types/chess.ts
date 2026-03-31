export interface ChessPlayer {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface ChessRoom {
  id: string;
  code: string;
  status: 'waiting' | 'active' | 'finished';
  stake: number;
  host_id: string;
  guest_id?: string | null;
  winner_id?: string | null;
  current_turn?: string | null;
  board_state?: {
    fen: string;
    last_move?: { from: string; to: string; promotion?: string } | null;
  };
  host: ChessPlayer;
  guest?: ChessPlayer | null;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}
