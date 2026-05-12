import type { DAYS_OF_WEEK, MONTHS } from "@/constants/constants";
export interface Transaction {
  id: number;
  type: "deposit" | "withdrawal" | "game";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending";
}

export interface TransactionUI {
  id: string;
  type: "Prize Win" | "Deposit" | "Game Entry" | "Withdrawal" | "Refund" | "Bet" | "Win" | string;
  amount: string;
  status: "Completed" | "Pending" | "Failed" | "Cancelled" | "Successful" | string;
  date: string;
  reference: string;
  typeKey?: string;
}

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
  flag: string;
}

export interface GameCardProps {
  title: string;
  image: string;
  isTopGame: boolean;
  editMode?: boolean;
  onUpdate?: (updates: {
    title?: string;
    image?: string;
    isTopGame?: boolean;
  }) => void;
  onRemove?: () => void;
  onPlayGame?: (mode: "demo" | "live") => void;
}

export type Game = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  thumbnail_url?: string; // Backend field

  category: "Arcade" | "Action" | "Strategy" | "Puzzle" | "Trivia" | "Adventure";
  mode: "1v1" | "Tournament" | "Quick Match" | "Multiplayer" | "Arcade" | "Adventure" | "Solo Earn" | "Head to Head" | "Arena" | string;

  entryFee: number;
  entry_fee?: number; // Backend field
  platformFeePercentage: number;
  platform_fee_percentage?: number; // Backend field
  difficulty: "Easy" | "Medium" | "Hard";
  durationInSeconds: number;
  duration_seconds?: number; // Backend field

  activePlayers: number;
  unique_players?: number; // Backend field

  status: "live" | "active" | "upcoming" | "ended" | "completed" | "coming soon" | "not starting soon";
  is_active?: boolean; // Backend field
  ctaLabel: string;

  badge: GameBadge;

  iframeUrl?: string;
  iframe_url?: string; // Backend field
  howToPlay?: {
    controls: string;
    rules: string;
    scoring: string;
  };
  how_to_play?: {
    controls: string;
    rules: string;
    scoring: string;
  };
  controls?: string;
  rules?: string;
  scoring?: string;
  createdAt: string;
  created_at?: string; // Backend field
  updatedAt: string;

  /**
   * Optional JSONB column from Supabase `games` table.
   * Set via the admin panel's Game Capabilities section.
   * Controls which platform features are active for this specific game.
   */
  capabilities?: {
    powerUps?: boolean;
    bundles?: boolean;
    rivalBanner?: boolean;
    powerUpDefs?: { id: string; label: string; cost: number }[];
    bundlePacks?: {
      id: string;
      label: string;
      description: string;
      cost: number;
      grants: Record<string, number>;
    }[];
  };
  sessions?: Session[];
};

export type GameBadge =
  | "HOT"
  | "NEW"
  | "POPULAR"
  | "TRENDING"
  | "HIGH_STAKES"
  | null;

export type LeaderboardPlayer = {
  id: string;
  rank: number;
  avatar: string;
  username: string;
  points: number;
  prizeWon: string;
};

export type PlayerStatus =
  | "waiting"
  | "playing"
  | "eliminated"
  | "ended"
  | "disconnected"
  | "spectating";

export type Team = "Red" | "Blue" | "Solo";

export interface Player {
  id: string;
  username: string;
  avatar: string;
  score: number;
  status: PlayerStatus;
  rank: number;
  kills: number;
  level: number;
  team: Team;
  ping: number;
  country: string;
  joinedAt: string;
  isHost: boolean;
}

export type GameName =
  | "Crystal Match"
  | "2048 Premium"
  | "Zelda Maze Shooter"
  | "VelocityGL"
  | "Bullet Fury"
  | "Rubik's Cube"
  | "Neon Tetris"
  | "StrikeForce: Dust 2"
  | "Cyber Surge"
  | "Vocal Ring Rush"
  | "Mob Swarm: Legion"
  | "Word Forge"
  | "Crossword Quest+"
  | "Sugar Storm Smash"
  | "Bubble Shooter Blitz"
  | "Aim Trainer Pro";

export type GameLeaderboard = Record<GameName, LeaderboardPlayer[]>;

export interface Match {
  id: string;
  gameId: string;
  playersJoined: number;
  totalCollected: number;
  platformFeeAmount: number;
  prizePool: number;
}

export type Month = (typeof MONTHS)[number];
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export interface Session {
  id: string;
  title: string;
  entryFee: number;
  entry_fee?: number; // Backend field
  playersJoined: number;
  maxPlayers: number;
  max_players?: number; // Backend field
  prizePool: string;
  pool_amount?: number; // Backend field
  startTime: string;
  start_time?: string; // Backend field
  endTime: string;
  end_time?: string; // Backend field
  status: "live" | "upcoming" | "starting soon" | "completed" | "active";
  type: "tournament" | "daily";
  winnersCount?: number;
  winners_count?: number; // Backend field
}
