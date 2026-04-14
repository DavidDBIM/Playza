import { Chess, Move } from "chess.js";

const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 335, r: 500, q: 900, k: 20000,
};

// Professional positional tables
const TABLES: Record<string, number[][]> = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 27, 27, 10, 5, 5],
    [0, 0, 0, 25, 25, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -25, -25, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
  ]
};

function evaluate(chess: Chess): number {
  let score = 0;
  const board = chess.board();
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const p = board[i][j];
      if (p) {
        let v = PIECE_VALUES[p.type] || 0;
        const isW = p.color === 'w';
        if (TABLES[p.type]) v += isW ? TABLES[p.type][i][j] : TABLES[p.type][7 - i][j];
        score += isW ? v : -v;
      }
    }
  }
  return score + (chess.isCheck() ? (chess.turn() === 'w' ? -45 : 45) : 0);
}

function quiesce(chess: Chess, alpha: number, beta: number, isW: boolean): number {
  const standPat = evaluate(chess);
  if (isW) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  // Only check captures in quiescence
  const moves = chess.moves({ verbose: true }).filter(m => m.captured);
  for (const m of moves) {
    chess.move(m);
    const score = quiesce(chess, alpha, beta, !isW);
    chess.undo();
    if (isW) {
      if (score >= beta) return beta;
      alpha = Math.max(alpha, score);
    } else {
      if (score <= alpha) return alpha;
      beta = Math.min(beta, score);
    }
  }
  return isW ? alpha : beta;
}

function search(chess: Chess, depth: number, alpha: number, beta: number, isW: boolean, tt: Map<string, any>): number {
  const fen = chess.fen().split(' ', 1)[0]; // Fast key
  const cached = tt.get(fen);
  if (cached && cached.d >= depth) return cached.s;

  if (depth === 0) return quiesce(chess, alpha, beta, isW);

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return chess.isCheck() ? (isW ? -100000 - depth : 100000 + depth) : 0;

  // LVA-MVV Sorting
  const sorted = moves.sort((a, b) => {
    if (a.captured && b.captured) return (PIECE_VALUES[b.captured] - PIECE_VALUES[a.captured]);
    if (a.captured) return -1;
    if (b.captured) return 1;
    return 0;
  });

  let best = isW ? -Infinity : Infinity;
  for (const m of sorted) {
    chess.move(m);
    const score = search(chess, depth - 1, alpha, beta, !isW, tt);
    chess.undo();
    if (isW) {
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
    } else {
      best = Math.min(best, score);
      beta = Math.min(beta, score);
    }
    if (beta <= alpha) break;
  }

  tt.set(fen, { d: depth, s: best });
  return best;
}

export function getBotMove(fenString: string): { from: string; to: string; promotion?: string } | null {
  const chess = new Chess(fenString);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  const isW = chess.turn() === 'w';
  const tt = new Map<string, any>();
  let bestM = null, bestV = isW ? -Infinity : Infinity;

  // Selective Depth: Search at depth 2 but with deep Quiescence for tactical safety
  for (const m of moves) {
    chess.move(m);
    const v = search(chess, 2, -Infinity, Infinity, !isW, tt);
    chess.undo();
    if (isW ? v > bestV : v < bestV) { bestV = v; bestM = m; }
  }

  const final = bestM || moves[0];
  return { from: final.from, to: final.to, promotion: final.promotion || 'q' };
}

export const SYSTEM_BOT_ID = "00000000-0000-0000-0000-000000000000";
