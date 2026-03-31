import { Chess } from 'chess.js';

export function getBotMove(fen: string): { from: string; to: string; promotion?: string } | null {
  const chess = new Chess(fen);
  if (chess.isGameOver()) return null;

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Simple logic: prioritize captures, then move randomly
  const captures = moves.filter(m => m.flags.includes('c'));
  const movesToConsider = captures.length > 0 ? captures : moves;
  
  const move = movesToConsider[Math.floor(Math.random() * movesToConsider.length)];
  
  return {
    from: move.from,
    to: move.to,
    promotion: move.promotion || 'q'
  };
}

export const SYSTEM_BOT_ID = '00000000-0000-0000-0000-000000000000';
