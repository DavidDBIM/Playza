import { Chess } from "chess.js";

// ─── Piece Values (centipawns) ────────────────────────────────────────────────
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 975,
  k: 20000,
};

// ─── Piece-Square Tables (from White's perspective, rank 0 = rank 8) ─────────
// Source: Tomasz Michniewski's simplified evaluation tables (widely used)
const PST: Record<string, number[]> = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    98,134, 61, 95, 68,126, 34,-11,
    -6,  7, 26, 31, 65, 56, 25,-20,
   -14, 13,  6, 21, 23, 12, 17,-23,
   -27, -2, -5, 12, 17,  6, 10,-25,
   -26, -4, -4,-10,  3,  3, 33,-12,
   -35, -1,-20,-23,-15, 24, 38,-22,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
   -167,-89,-34,-49, 61,-97,-15,-107,
    -73,-41, 72, 36, 23, 62,  7, -17,
    -47, 60, 37, 65, 84,129, 73,  44,
     -9, 17, 19, 53, 37, 69, 18,  22,
    -13,  4, 16, 13, 28, 19, 21,  -8,
    -23, -9, 12, 10, 19, 17, 25, -16,
    -29,-53,-12, -3, -1, 18,-14, -19,
   -105,-21,-58,-33,-17,-28,-19, -23,
  ],
  b: [
    -29,  4,-82,-37,-25,-42,  7, -8,
    -26, 16,-18,-13, 30, 59, 18,-47,
    -16, 37, 43, 40, 35, 50, 37, -2,
     -4,  5, 19, 50, 37, 37,  7, -2,
     -6, 13, 13, 26, 34, 12, 10,  4,
      0, 15, 15, 15, 14, 27, 18, 10,
      4, 15, 16,  0,  7, 21, 33,  1,
    -33,-3,-14,-21,-13,-12,-39,-21,
  ],
  r: [
     32, 42, 32, 51, 63,  9, 31, 43,
     27, 32, 58, 62, 80, 67, 26, 44,
     -5, 19, 26, 36, 17, 45, 61, 16,
    -24,-11,  7, 26, 24, 35, -8,-20,
    -36,-26,-12, -1,  9,-7,  6,-23,
    -45,-25,-16,-17,  3,  0, -5,-33,
    -44,-16,-20, -9, -1, 11, -6,-71,
    -19,-13,  1, 17, 16,  7,-37,-26,
  ],
  q: [
    -28,  0, 29, 12, 59, 44, 43, 45,
    -24,-39, -5,  1,-16, 57, 28, 54,
    -13,-17,  7,  8, 29, 56, 47, 57,
    -27,-27,-16,-16, -1, 17, -2,  1,
     -9,-26, -9,-10, -2, -4,  3, -3,
    -14,  2,-11, -2, -5,  2, 14,  5,
    -35, -8, 11,  2,  8, 15,-3,  1,
     -1,-18, -9, 10,-15,-25,-31,-50,
  ],
  // Middlegame king: stay in corner / castle
  k_mg: [
    -65, 23, 16,-15,-56,-34,  2, 13,
     29, -1,-20, -7, -8, -4,-38,-29,
     -9, 24,  2,-16,-20,  6, 22,-22,
    -17,-20,-12,-27,-30,-25,-14,-36,
    -49, -1,-27,-39,-46,-44,-33,-51,
    -14,-14,-22,-46,-44,-30,-15,-27,
      1,  7, -8,-64,-43,-16,  9,  8,
    -15, 36, 12,-54,  8,-28, 24, 14,
  ],
  // Endgame king: centralize
  k_eg: [
    -74,-35,-18,-18,-11, 15,  4,-17,
    -12, 17, 14, 17, 17, 38, 23, 11,
     10, 17, 23, 15, 20, 45, 44, 13,
     -8, 22, 24, 27, 26, 33, 26,  3,
    -18, -4, 21, 24, 27, 23,  9,-11,
    -19, -3, 11, 21, 23, 16,  7, -9,
    -27,-11,  4, 13, 14,  4,-5,-17,
    -53,-34,-21,-11,-28,-14,-24,-43,
  ],
};

// ─── Endgame detection ────────────────────────────────────────────────────────
function isEndgame(chess: Chess): boolean {
  const board = chess.board();
  let queens = 0;
  let minors = 0;
  for (const row of board) {
    for (const p of row) {
      if (!p || p.type === 'k') continue;
      if (p.type === 'q') queens++;
      if (p.type === 'n' || p.type === 'b') minors++;
    }
  }
  // Endgame: no queens, or queen + max 1 minor per side
  return queens === 0 || (queens <= 2 && minors <= 2);
}

// ─── Static Evaluation ────────────────────────────────────────────────────────
function evaluate(chess: Chess): number {
  if (chess.isCheckmate()) {
    // The side that just moved delivered checkmate — from the root call perspective,
    // a negative score at this node means bad for the side to move NOW (they lost)
    return chess.turn() === 'w' ? -50000 : 50000;
  }
  if (chess.isStalemate() || chess.isDraw()) return 0;

  const endgame = isEndgame(chess);
  const board = chess.board();
  let score = 0;

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const p = board[i][j];
      if (!p) continue;

      const isWhite = p.color === 'w';
      const sign = isWhite ? 1 : -1;
      const row = isWhite ? i : 7 - i;  // flip for black
      const idx = row * 8 + j;

      let val = PIECE_VALUES[p.type] ?? 0;

      // PST bonus
      if (p.type === 'k') {
        val += endgame ? (PST['k_eg'][idx] ?? 0) : (PST['k_mg'][idx] ?? 0);
      } else {
        val += PST[p.type]?.[idx] ?? 0;
      }

      score += sign * val;
    }
  }

  // Mobility bonus (number of legal moves is a proxy for piece activity)
  const currentTurn = chess.turn();
  const myMoves = chess.moves().length;
  // Penalize lack of mobility
  score += (currentTurn === 'w' ? 1 : -1) * myMoves * 2;

  // Check bonus
  if (chess.isCheck()) {
    score += (currentTurn === 'w' ? -30 : 30); // being in check is bad
  }

  return score;
}

// ─── Killer Moves (heuristic for better move ordering) ───────────────────────
const killerMoves: Array<[string, string][]> = Array(20).fill(null).map(() => []);

// ─── History Heuristic ────────────────────────────────────────────────────────
const historyTable: Record<string, number> = {};

function historyKey(from: string, to: string) {
  return `${from}${to}`;
}

// ─── Move Ordering ────────────────────────────────────────────────────────────
function scoreMove(
  from: string,
  to: string,
  captured: string | undefined,
  promotion: string | undefined,
  depth: number
): number {
  // Checkmate/promotion is highest priority (handled separately via game-over check)
  if (promotion) return 800;

  // Captures: MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
  if (captured) {
    return 100 + (PIECE_VALUES[captured] ?? 0);
  }

  // Killer moves (non-capture moves that caused beta cutoffs at this depth)
  const killers = killerMoves[depth] ?? [];
  if (killers.some(([kf, kt]) => kf === from && kt === to)) return 90;

  // History heuristic
  return historyTable[historyKey(from, to)] ?? 0;
}

// ─── Quiescence Search ────────────────────────────────────────────────────────
function quiesce(chess: Chess, alpha: number, beta: number, depth: number): number {
  const standPat = evaluate(chess);
  if (standPat >= beta) return beta;
  if (standPat > alpha) alpha = standPat;

  // Limit quiescence depth to avoid infinite loops
  if (depth <= 0) return alpha;

  const moves = chess.moves({ verbose: true }).filter(m => m.captured || m.promotion);
  // Sort: promotions first, then by captured piece value
  moves.sort((a, b) => {
    const scoreA = (a.promotion ? 800 : 0) + (PIECE_VALUES[a.captured ?? ''] ?? 0);
    const scoreB = (b.promotion ? 800 : 0) + (PIECE_VALUES[b.captured ?? ''] ?? 0);
    return scoreB - scoreA;
  });

  for (const m of moves) {
    chess.move(m);
    const score = -quiesce(chess, -beta, -alpha, depth - 1);
    chess.undo();
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

// ─── Transposition Table ──────────────────────────────────────────────────────
type TTEntry = { depth: number; score: number; flag: 'exact' | 'lower' | 'upper' };
const transpositionTable = new Map<string, TTEntry>();
const TT_MAX_SIZE = 500000;

function ttKey(chess: Chess): string {
  return chess.fen().split(' ').slice(0, 4).join(' ');
}

// ─── Alpha-Beta Search (Negamax) ──────────────────────────────────────────────
function search(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  ply: number,
  deadline: number
): number {
  // Time check — abort if we've exceeded our time budget
  if (Date.now() > deadline) return 0;

  // TT lookup
  const key = ttKey(chess);
  const cached = transpositionTable.get(key);
  if (cached && cached.depth >= depth) {
    if (cached.flag === 'exact') return cached.score;
    if (cached.flag === 'lower' && cached.score >= beta) return cached.score;
    if (cached.flag === 'upper' && cached.score <= alpha) return cached.score;
  }

  if (depth === 0) return quiesce(chess, alpha, beta, 6);

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    // Checkmate or stalemate
    if (chess.isCheckmate()) return -50000 + ply; // prefer faster mates
    return 0;
  }

  // Sort moves for better pruning
  moves.sort((a, b) => {
    const sa = scoreMove(a.from, a.to, a.captured, a.promotion, ply);
    const sb = scoreMove(b.from, b.to, b.captured, b.promotion, ply);
    return sb - sa;
  });

  let bestScore = -Infinity;
  let flag: TTEntry['flag'] = 'upper';

  for (const m of moves) {
    chess.move(m);
    let score = -search(chess, depth - 1, -beta, -alpha, ply + 1, deadline);
    chess.undo();

    if (Date.now() > deadline) return 0; // abort cleanly

    if (score > bestScore) {
      bestScore = score;
      if (score > alpha) {
        alpha = score;
        flag = 'exact';
        if (score >= beta) {
          // Beta cutoff — record killer
          if (!m.captured && ply < 20) {
            const killers = killerMoves[ply];
            if (!killers.some(([kf, kt]) => kf === m.from && kt === m.to)) {
              killers.unshift([m.from, m.to]);
              if (killers.length > 2) killers.pop();
            }
          }
          // Update history
          if (!m.captured) {
            const hk = historyKey(m.from, m.to);
            historyTable[hk] = (historyTable[hk] ?? 0) + depth * depth;
          }
          flag = 'lower';
          break;
        }
      }
    }
  }

  // Store in TT (evict if too large)
  if (transpositionTable.size >= TT_MAX_SIZE) {
    const firstKey = transpositionTable.keys().next().value;
    if (firstKey) transpositionTable.delete(firstKey);
  }
  transpositionTable.set(key, { depth, score: bestScore, flag });

  return bestScore;
}

// ─── Iterative Deepening Root Search ─────────────────────────────────────────
export function getBotMove(
  fenString: string,
  timeLimitMs = 800
): { from: string; to: string; promotion?: string } | null {
  const chess = new Chess(fenString);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  // If only one legal move, play it instantly
  if (moves.length === 1) {
    const m = moves[0];
    return { from: m.from, to: m.to, promotion: m.promotion ?? 'q' };
  }

  const deadline = Date.now() + timeLimitMs;
  let bestMove = moves[0];

  // Clear history heuristic for fresh search (keep TT between calls for speed)
  Object.keys(historyTable).forEach(k => delete historyTable[k]);
  for (let i = 0; i < 20; i++) killerMoves[i] = [];

  // Immediately check for checkmate-in-1
  for (const m of moves) {
    chess.move(m);
    if (chess.isCheckmate()) {
      chess.undo();
      return { from: m.from, to: m.to, promotion: m.promotion ?? 'q' };
    }
    chess.undo();
  }

  // Iterative deepening: start at depth 1, increase until time runs out
  for (let depth = 1; depth <= 12; depth++) {
    if (Date.now() >= deadline) break;

    // Sort moves based on previous iteration results for better pruning
    moves.sort((a, b) => {
      const sa = scoreMove(a.from, a.to, a.captured, a.promotion, 0);
      const sb = scoreMove(b.from, b.to, b.captured, b.promotion, 0);
      return sb - sa;
    });

    let bestScoreThisDepth = -Infinity;
    let bestMoveThisDepth = moves[0];

    for (const m of moves) {
      if (Date.now() >= deadline) break;

      chess.move(m);
      const score = -search(chess, depth - 1, -Infinity, Infinity, 1, deadline);
      chess.undo();

      if (score > bestScoreThisDepth) {
        bestScoreThisDepth = score;
        bestMoveThisDepth = m;
      }
    }

    // Only commit result if we finished searching the depth (not timed out mid-depth)
    if (Date.now() < deadline || depth === 1) {
      bestMove = bestMoveThisDepth;
    }

    // If we found forced checkmate, stop searching deeper
    if (bestScoreThisDepth >= 49000) break;
  }

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion ?? 'q',
  };
}

export const SYSTEM_BOT_ID = "00000000-0000-0000-0000-000000000000";
