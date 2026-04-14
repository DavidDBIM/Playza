import { Chess, Move } from "chess.js";

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
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

function evaluateBoard(chess: Chess): number {
  let totalEvaluation = 0;
  const board = chess.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        let val = PIECE_VALUES[piece.type] || 0;
        const isWhite = piece.color === 'w';
        
        // Piece-Square positional bonuses
        if (piece.type === 'p') val += isWhite ? PAWN_EVAL[i][j] : PAWN_EVAL[7-i][j];
        else if (piece.type === 'n') val += isWhite ? KNIGHT_EVAL[i][j] : KNIGHT_EVAL[7-i][j];
        else if (piece.type === 'b') val += isWhite ? BISHOP_EVAL[i][j] : BISHOP_EVAL[7-i][j];
        else if (piece.type === 'r') val += isWhite ? ROOK_EVAL[i][j] : ROOK_EVAL[7-i][j];
        else if (piece.type === 'q') val += isWhite ? QUEEN_EVAL[i][j] : QUEEN_EVAL[7-i][j];
        else if (piece.type === 'k') val += isWhite ? KING_EVAL[i][j] : KING_EVAL[7-i][j];

        totalEvaluation += isWhite ? val : -val;
      }
    }
  }

  if (chess.isCheck()) totalEvaluation += chess.turn() === 'w' ? -40 : 40;
  return totalEvaluation;
}

function sortMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => {
    let scoreA = 0, scoreB = 0;
    if (a.captured) scoreA = 10 * PIECE_VALUES[a.captured] - PIECE_VALUES[a.piece];
    if (b.captured) scoreB = 10 * PIECE_VALUES[b.captured] - PIECE_VALUES[b.piece];
    if (a.promotion) scoreA += 900;
    if (b.promotion) scoreB += 900;
    return scoreB - scoreA;
  });
}

function minimax(chess: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
  if (depth === 0) return evaluateBoard(chess);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return chess.isCheck() ? (isMaximizing ? -1000000 : 1000000) : 0;
  const sorted = sortMoves(moves);
  if (isMaximizing) {
    let best = -Infinity;
    for (const m of sorted) {
      chess.move(m);
      const val = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of sorted) {
      chess.move(m);
      const val = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      best = Math.min(best, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function getBotMove(fen: string): { from: string; to: string; promotion?: string } | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;
  const isMaximizing = chess.turn() === "w", depth = 3;
  let bestMove = null, bestVal = isMaximizing ? -Infinity : Infinity;
  for (const m of sortMoves(moves)) {
    chess.move(m);
    const val = minimax(chess, depth - 1, -Infinity, Infinity, !isMaximizing);
    chess.undo();
    if (isMaximizing ? val > bestVal : val < bestVal) { bestVal = val; bestMove = m; }
  }
  if (!bestMove) return moves[0];
  return { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion || "q" };
}

export const SYSTEM_BOT_ID = "00000000-0000-0000-0000-000000000000";
