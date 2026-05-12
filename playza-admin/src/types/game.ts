export type Session = {
  id: string;
  title: string;
  type: string;
  status: string;
  pool_amount: number;
  entry_fee: number;
  start_time: string;
  end_time: string;
  max_players: number;
  winnersCount?: number;
};

export type GameBadge =
  | "HOT"
  | "NEW"
  | "POPULAR"
  | "TRENDING"
  | "HIGH_STAKES"
  | null;

export type Game = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  thumbnail_url?: string;

  category: "Arcade" | "Action" | "Strategy" | "Puzzle" | "Trivia" | string;
  mode: "1v1" | "Tournament" | "Quick Match" | "Multiplayer" | string;

  entryFee: number;
  platformFeePercentage: number;
  platform_fee_percentage?: number;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  durationInSeconds: number;
  duration_seconds?: number;

  activePlayers: number;
  unique_players?: number;
  total_revenue?: number;

  isActive: boolean;
  is_active?: boolean;
  ctaLabel: string;
  badge: GameBadge;

  iframeUrl?: string;
  iframe_url?: string;
  controls?: string;
  rules?: string;
  scoring?: string;
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

  createdAt: string;
  created_at?: string;
  updatedAt: string;

  /**
   * Optional JSONB column added to Supabase `games` table.
   * Controls which platform features are enabled for this game.
   * Shape: { powerUps, bundles, rivalBanner, powerUpDefs[], bundlePacks[] }
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
};
