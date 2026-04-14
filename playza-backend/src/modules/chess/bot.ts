import { Chess, Move } from "chess.js";

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square tables for positional play
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

function evaluateBoard(chess: Chess): number {
  let totalEvaluation = 0;
  const board = chess.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        let val = PIECE_VALUES[piece.type] || 0;
        
        // Basic positional bonus for pawns and knights
        if (piece.type === 'p') {
          val += piece.color === 'w' ? PAWN_EVAL[i][j] : PAWN_EVAL[7-i][j];
        } else if (piece.type === 'n') {
          val += piece.color === 'w' ? KNIGHT_EVAL[i][j] : KNIGHT_EVAL[7-i][j];
        }

        totalEvaluation += piece.color === 'w' ? val : -val;
      }
    }
  }

  // Slight bonus for checks
  if (chess.isCheck()) {
    totalEvaluation += chess.turn() === 'w' ? -50 : 50;
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

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): number {
  if (depth === 0) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    if (chess.isCheck()) {
      return isMaximizingPlayer ? -1000000 : 1000000;
    }
    return 0;
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
  const isMaximizing = chess.turn() === "w";
  let bestValue = isMaximizing ? -Infinity : Infinity;
  
  // Depth 3 without Quiescence is very fast and decently strong
  const depth = 3;
  const sortedMoves = sortMoves(moves);

  for (const move of sortedMoves) {
    chess.move(move);
    const boardValue = minimax(chess, depth - 1, -Infinity, Infinity, !isMaximizing);
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

  if (!bestMove) return moves[Math.floor(Math.random() * moves.length)];

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion || "q",
  };
}

export const SYSTEM_BOT_ID = "00000000-0000-0000-0000-000000000000";
