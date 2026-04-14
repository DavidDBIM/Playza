import { Chess, Move } from "chess.js";

const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

// Simplified but punchy positional tables for all pieces
const POSITION_BONUS: Record<string, number[][]> = {
  p: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 35, 35, 10,  5,  5], // Aggressive center
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

const TT = new Map<string, { depth: number; score: number }>();

function evaluateBoard(chess: Chess): number {
  let total = 0;
  const board = chess.board();
  
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const p = board[i][j];
      if (p) {
        let val = PIECE_VALUES[p.type] || 0;
        const isW = p.color === 'w';
        const table = POSITION_BONUS[p.type];
        if (table) val += isW ? table[i][j] : table[7-i][j];
        total += isW ? val : -val;
      }
    }
  }
  
  if (chess.isCheck()) total += chess.turn() === 'w' ? -50 : 50;
  return total;
}

function minimax(chess: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
  const fen = chess.fen();
  const cached = TT.get(fen);
  if (cached && cached.depth >= depth) return cached.score;

  if (depth === 0) return evaluateBoard(chess);

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return chess.isCheck() ? (isMaximizing ? -100000 – depth : 100000 + depth) : 0;

  // Faster sorting: Captures first, then positional advantage
  const sorted = moves.sort((a,b) => {
    if (a.captured && !b.captured) return -1;
    if (!a.captured && b.captured) return 1;
    return 0;
  });

  let best = isMaximizing ? -Infinity : Infinity;
  for (const m of sorted) {
    chess.move(m);
    const val = minimax(chess, depth - 1, alpha, beta, !isMaximizing);
    chess.undo();
    
    if (isMaximizing) {
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
    } else {
      best = Math.min(best, val);
      beta = Math.min(beta, val);
    }
    if (beta <= alpha) break;
  }

  if (TT.size < 30000) TT.set(fen, { depth, score: best });
  return best;
}

export function getBotMove(fen: string): { from: string; to: string; promotion?: string } | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;
  
  TT.clear();
  const isMaximizing = chess.turn() === "w";
  let bestMove = null;
  let bestVal = isMaximizing ? -Infinity : Infinity;

  // Higher sorting for the root to maximize pruning
  const sorted = moves.sort((a,b) => (b.captured ? 10 : 0) - (a.captured ? 10 : 0));

  // Depth 3 search with aggressive Alpha-Beta
  for (const m of sorted) {
    chess.move(m);
    const val = minimax(chess, 2, -Infinity, Infinity, !isMaximizing);
    chess.undo();
    
    if (isMaximizing ? val > bestVal : val < bestVal) {
      bestVal = val;
      bestMove = m;
    }
  }

  const result = bestMove || moves[0];
  return {
    from: result.from,
    to: result.to,
    promotion: result.promotion || "q"
  };
}

export const SYSTEM_BOT_ID = "00000000-0000-0000-0000-000000000000";
