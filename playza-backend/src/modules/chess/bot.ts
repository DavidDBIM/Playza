import { Chess, Move } from "chess.js";

const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

const PAWN_EVAL = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_EVAL = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_EVAL = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_EVAL = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_EVAL = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_EVAL = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20]
];

// Cache for search results
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
        if (p.type === 'p') val += isW ? PAWN_EVAL[i][j] : PAWN_EVAL[7-i][j];
        else if (p.type === 'n') val += isW ? KNIGHT_EVAL[i][j] : KNIGHT_EVAL[7-i][j];
        else if (p.type === 'b') val += isW ? BISHOP_EVAL[i][j] : BISHOP_EVAL[7-i][j];
        else if (p.type === 'r') val += isW ? ROOK_EVAL[i][j] : ROOK_EVAL[7-i][j];
        else if (p.type === 'q') val += isW ? QUEEN_EVAL[i][j] : QUEEN_EVAL[7-i][j];
        else if (p.type === 'k') val += isW ? KING_EVAL[i][j] : KING_EVAL[7-i][j];
        total += isW ? val : -val;
      }
    }
  }
  if (chess.isCheck()) total += chess.turn() === 'w' ? -50 : 50;
  return total;
}

function minimax(chess: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
  const fen = chess.fen().split(' ', 4).join(' ');
  const cached = TT.get(fen);
  if (cached && cached.depth >= depth) return cached.score;

  if (depth === 0) return evaluateBoard(chess);

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return chess.isCheck() ? (isMaximizing ? -1000000 : 1000000) : 0;

  // Move sorting (Captures first)
  const sorted = moves.sort((a,b) => (b.captured ? 10 : 0) - (a.captured ? 10 : 0));

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

  if (TT.size < 50000) TT.set(fen, { depth, score: best });
  return best;
}

export function getBotMove(fen: string): { from: string; to: string; promotion?: string } | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;
  const isMaximizing = chess.turn() === "w";
  let bestMove = null, bestVal = isMaximizing ? -Infinity : Infinity;

  // Clear Transposition Table for fresh turn
  TT.clear();

  for (const m of moves) {
    chess.move(m);
    const val = minimax(chess, 2, -Infinity, Infinity, !isMaximizing); // Depth 3 (1 here + 2 in minimax)
    chess.undo();
    if (isMaximizing ? val > bestVal : val < bestVal) {
      bestVal = val;
      bestMove = m;
    }
  }

  const final = bestMove || moves[0];
  return { from: final.from, to: final.to, promotion: final.promotion || "q" };
}

export const SYSTEM_BOT_ID = "00000000-0000-0000-0000-000000000000";
