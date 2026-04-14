import { Chess, Move } from "chess.js";

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

const PAWN_EVAL_WHITE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_EVAL_WHITE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_EVAL_WHITE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_EVAL_WHITE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_EVAL_WHITE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_EVAL_WHITE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20]
];

function reverseArray(arr: number[][]): number[][] {
  return arr.slice().reverse();
}

const PAWN_EVAL_BLACK = reverseArray(PAWN_EVAL_WHITE);
const KNIGHT_EVAL_BLACK = reverseArray(KNIGHT_EVAL_WHITE);
const BISHOP_EVAL_BLACK = reverseArray(BISHOP_EVAL_WHITE);
const ROOK_EVAL_BLACK = reverseArray(ROOK_EVAL_WHITE);
const QUEEN_EVAL_BLACK = reverseArray(QUEEN_EVAL_WHITE);
const KING_EVAL_BLACK = reverseArray(KING_EVAL_WHITE);

function getPieceValue(piece: { type: string; color: string }, x: number, y: number): number {
  const val = PIECE_VALUES[piece.type] || 0;
  let positional = 0;
  
  if (piece.color === 'w') {
      if (piece.type === 'p') positional = PAWN_EVAL_WHITE[y][x];
      else if (piece.type === 'n') positional = KNIGHT_EVAL_WHITE[y][x];
      else if (piece.type === 'b') positional = BISHOP_EVAL_WHITE[y][x];
      else if (piece.type === 'r') positional = ROOK_EVAL_WHITE[y][x];
      else if (piece.type === 'q') positional = QUEEN_EVAL_WHITE[y][x];
      else if (piece.type === 'k') positional = KING_EVAL_WHITE[y][x];
  } else {
      if (piece.type === 'p') positional = PAWN_EVAL_BLACK[y][x];
      else if (piece.type === 'n') positional = KNIGHT_EVAL_BLACK[y][x];
      else if (piece.type === 'b') positional = BISHOP_EVAL_BLACK[y][x];
      else if (piece.type === 'r') positional = ROOK_EVAL_BLACK[y][x];
      else if (piece.type === 'q') positional = QUEEN_EVAL_BLACK[y][x];
      else if (piece.type === 'k') positional = KING_EVAL_BLACK[y][x];
  }
  
  return piece.color === 'w' ? val + positional : -(val + positional);
}

const TRANSPOSITION_TABLE = new Map<string, number>();

function evaluateBoard(chess: Chess): number {
  const fen = chess.fen().split(' ').slice(0, 4).join(' ');
  if (TRANSPOSITION_TABLE.has(fen)) return TRANSPOSITION_TABLE.get(fen)!;

  let totalEvaluation = 0;
  // Minimize board() calls as they are expensive in chess.js
  const board = chess.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        totalEvaluation += getPieceValue(piece, j, i);
      }
    }
  }

  // Bonus for checking the opponent
  if (chess.isCheck()) {
    totalEvaluation += chess.turn() === 'w' ? -70 : 70;
  }
  
  // Removed mobility bonus as chess.moves() is expensive
  // totalEvaluation += (chess.turn() === 'w' ? chess.moves().length * 2 : -chess.moves().length * 2);

  TRANSPOSITION_TABLE.set(fen, totalEvaluation);
  if (TRANSPOSITION_TABLE.size > 20000) {
    const firstKey = TRANSPOSITION_TABLE.keys().next().value;
    if (firstKey !== undefined) TRANSPOSITION_TABLE.delete(firstKey);
  }

  return totalEvaluation;
}

function sortMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.captured) {
      scoreA = 10 * PIECE_VALUES[a.captured] - PIECE_VALUES[a.piece];
    }
    if (b.captured) {
      scoreB = 10 * PIECE_VALUES[b.captured] - PIECE_VALUES[b.piece];
    }

    if (a.promotion) scoreA += 900;
    if (b.promotion) scoreB += 900;

    return scoreB - scoreA;
  });
}

function quiescenceSearch(
  chess: Chess,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  const standPat = evaluateBoard(chess);

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  const moves = sortMoves(chess.moves({ verbose: true }).filter(m => m.captured));

  for (const move of moves) {
    chess.move(move);
    const score = quiescenceSearch(chess, alpha, beta, !isMaximizing);
    chess.undo();

    if (isMaximizing) {
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    } else {
      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
  }

  return isMaximizing ? alpha : beta;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean,
): number {
  const moves = chess.moves({ verbose: true });
  
  if (moves.length === 0) {
    if (chess.isCheck()) {
      return isMaximizingPlayer ? -1000000 - depth : 1000000 + depth;
    }
    return 0;
  }

  if (depth === 0) {
    return quiescenceSearch(chess, alpha, beta, isMaximizingPlayer);
  }

  const sortedMoves = sortMoves(moves);

  if (isMaximizingPlayer) {
    let bestEval = -Infinity;
    for (const move of sortedMoves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      bestEval = Math.max(bestEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return bestEval;
  } else {
    let bestEval = Infinity;
    for (const move of sortedMoves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      bestEval = Math.min(bestEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return bestEval;
  }
}

export function getBotMove(
  fen: string,
): { from: string; to: string; promotion?: string } | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  let bestMove: Move | null = null;
  // Depth 2 + Quiescence is much faster, reducing sluggish gameplay
  const depth = 2;
  const isMaximizing = chess.turn() === "w";
  let bestValue = isMaximizing ? -Infinity : Infinity;

  const sortedMoves = sortMoves(moves);

  for (const move of sortedMoves) {
    chess.move(move);
    const boardValue = minimax(
      chess,
      depth - 1,
      -Infinity,
      Infinity,
      !isMaximizing,
    );
    chess.undo();

    if (isMaximizing) {
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    } else {
      if (boardValue < bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }
  }

  if (!bestMove) return null;

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion || "q",
  };
}

export const SYSTEM_BOT_ID = "00000000-0000-0000-0000-000000000000";
