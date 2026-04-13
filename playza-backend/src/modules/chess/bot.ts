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
  if (piece === null) return 0;
  
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

function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    // Current turn in 'chess' is the one who IS checkmated
    return chess.turn() === 'w' ? -1000000 : 1000000;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return 0;
  }

  let totalEvaluation = 0;
  const board = chess.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (board[i][j]) {
        totalEvaluation += getPieceValue(board[i][j]!, j, i);
      }
    }
  }

  // Bonus for checking the opponent
  if (chess.isCheck()) {
    totalEvaluation += chess.turn() === 'w' ? -50 : 50;
  }

  return totalEvaluation;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean,
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });

  if (isMaximizingPlayer) {
    let bestEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(
        chess,
        depth - 1,
        alpha,
        beta,
        !isMaximizingPlayer,
      );
      chess.undo();
      bestEval = Math.max(bestEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return bestEval;
  } else {
    let bestEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(
        chess,
        depth - 1,
        alpha,
        beta,
        !isMaximizingPlayer,
      );
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
  if (chess.isGameOver()) return null;

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  let bestMove: Move | null = null;
  const depth = 3; // Increased depth for better tactical awareness (checkmates etc)
  console.log(`[Bot] Evaluating move at depth ${depth} for fen: ${fen}`);
  const isMaximizing = chess.turn() === "w";
  let bestValue = isMaximizing ? -Infinity : Infinity;

  // Prioritize captures and checks to optimize alpha-beta pruning
  const sortedMoves = moves.sort((a, b) => {
    if (a.flags.includes('c') || a.flags.includes('p')) return -1;
    if (b.flags.includes('c') || b.flags.includes('p')) return 1;
    return 0;
  });

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
