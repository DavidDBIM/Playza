import { Chess, Move } from "chess.js";

const PIECE_VALUES: Record<string, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900,
};

/**
 * Basic evaluation function using piece values
 */
function evaluateBoard(chess: Chess): number {
  let totalEvaluation = 0;
  const board = chess.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const value = PIECE_VALUES[piece.type] || 0;
        totalEvaluation += piece.color === "w" ? value : -value;
      }
    }
  }
  return totalEvaluation;
}

/**
 * Minimax algorithm with alpha-beta pruning
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean,
): number {
  if (depth === 0 || chess.isGameOver()) {
    return -evaluateBoard(chess);
  }

  const moves = chess.moves();

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
  let bestValue = -Infinity;
  const depth = 3;

  const isMaximizing = chess.turn() === "w";

  // Shuffle moves to add some variety among equal-valued moves
  const shuffledMoves = moves.sort(() => Math.random() - 0.5);

  for (const move of shuffledMoves) {
    chess.move(move);
    const boardValue = minimax(
      chess,
      depth - 1,
      -Infinity,
      Infinity,
      !isMaximizing,
    );
    chess.undo();

    // We want the HIGHEST value if it's our turn
    if (boardValue > bestValue) {
      bestValue = boardValue;
      bestMove = move;
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
