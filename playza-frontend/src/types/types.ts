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
  type: string;
  amount: string;
  status: string;
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

  category: "Arcade" | "Action" | "Strategy" | "Puzzle" | "Trivia";
  mode: "1v1" | "Tournament" | "Quick Match" | "Multiplayer";

  entryFee: number;
  platformFeePercentage: number;
  difficulty: "Easy" | "Medium" | "Hard";
  durationInSeconds: number;

  activePlayers: number;

  isActive: boolean;
  ctaLabel: string;
  badge: GameBadge;

  createdAt: string;
  updatedAt: string;
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
  | "Mystic Quest"
  | "StormRider"
  | "Battle Arena X"
  | "Speed Drift Pro"
  | "Treasure Hunt Royale";

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
  playersJoined: number;
  maxPlayers: number;
  prizePool: string;
  startTime: string;
  endTime: string;
  status: "live" | "upcoming" | "starting soon" | "ended";
  type: "tournament" | "daily";
  winnersCount?: number;
}
