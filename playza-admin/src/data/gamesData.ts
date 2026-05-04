import type { Game, GameBadge, Session } from '../types/game';
import type { GameStat } from '../components/games/GamesStats';

export type { Game, GameBadge, Session };

export const games: Game[] = [];

export const gamesStats: GameStat[] = [
  { label: 'Total Games', value: '0', change: '0', trend: 'up' },
  { label: 'Active Games', value: '0', change: '0', trend: 'up' },
  { label: 'Total Players', value: '0', change: '0', trend: 'up' },
  { label: 'Revenue (MTD)', value: '₦0', change: '0', trend: 'up' }
];
