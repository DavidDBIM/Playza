export interface Game {
  id: string | number;
  title: string;
  thumbnail: string;
  difficulty: string;
  label: string;
  description: string;
  path: string;
}

export interface GameProps {
  game: Game;
  onSelect?: (game: Game) => void;
  onBack?: () => void;
  onStart?: (stake: string) => void;
  onResult?: (multiplier?: number) => void;
  onPlayAgain?: () => void;
  stake?: string;
  // Total paid out to players on this game so far (shown on the card).
  payout?: number;
  multiplier?: number;
}