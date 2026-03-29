import { useState, useEffect, useRef, useCallback } from "react";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import {
  Trophy,
  Swords,
  Crown,
  Zap,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { makeChessMove, resignChessGame } from "@/api/chess.api";
import { useToast } from "@/context/toast";
import { ZASymbol } from "@/components/currency/ZASymbol";
import type { ChessRoom } from "@/types/chess";
import type { UserProfile } from "@/context/auth";

interface H2HArenaProps {
  room: ChessRoom;
  user: UserProfile | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Map SAN piece letter → emoji */
const PIECE_ICON: Record<string, string> = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

/**
 * Annotate a SAN move with extra context badges.
 * Returns { san, piece, isCapture, isCheck, isCheckmate, isCastle, isPromotion }
 */
function parseSAN(san: string) {
  const isCheckmate = san.endsWith("#");
  const isCheck = san.endsWith("+") && !isCheckmate;
  const isCapture = san.includes("x");
  const isCastle = san.startsWith("O-O");
  const isPromotion = san.includes("=");

  // Derive piece from leading uppercase letter (P if none)
  let pieceChar = "P";
  if (!isCastle) {
    const m = san.match(/^([KQRBN])/);
    if (m) pieceChar = m[1];
  }

  return {
    san,
    pieceChar,
    isCapture,
    isCheck,
    isCheckmate,
    isCastle,
    isPromotion,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

const H2HArena = ({ room, user }: H2HArenaProps) => {
  const toast = useToast();
  const logEndRef = useRef<HTMLDivElement>(null);

  // ── Local game state ────────────────────────────────────────────────────────
  const [game, setGame] = useState(() => {
    const chess = new Chess();
    if (room.board_state?.fen) {
      try {
        chess.load(room.board_state.fen);
      } catch {
        /* use default */
      }
    }
    return chess;
  });

  const [isResigning, setIsResigning] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoveSquares, setLegalMoveSquares] = useState<string[]>([]);
  const [inCheck, setInCheck] = useState(false);
  const [checkmateDeclared, setCheckmateDeclared] = useState(false);

  // Track the last move we already applied so we don't re-apply it
  const lastAppliedMoveRef = useRef<string | null>(null);
  // Track whether we are waiting for the server to confirm our move
  const pendingMoveRef = useRef(false);

  // ── Auto-scroll battle log ──────────────────────────────────────────────────
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [game]);

  // ── Detect check / checkmate from local game state ──────────────────────────
  useEffect(() => {
    const isInCheck = game.isCheck();
    const isMated = game.isCheckmate();
    setInCheck(isInCheck && !isMated);

    if (isMated && !checkmateDeclared) {
      setCheckmateDeclared(true);
      // Who delivered mate? The side that just moved.
      // The current turn in game is the side that GOT mated.
      const matedSide = game.turn() === "w" ? "White" : "Black";
      const myColor = room.host_id === user?.id ? "w" : "b";
      const iWasMated = game.turn() === myColor;
      toast.custom(
        "checkmate",
        iWasMated
          ? `${matedSide} has been checkmated! 💀`
          : `${matedSide} is checkmated — You WIN! 🏆`,
        "GAME OVER",
      );
    }
  }, [game, checkmateDeclared, room.host_id, user?.id, toast]);

  // ── Sync opponent move from server ─────────────────────────────────────────
  useEffect(() => {
    const lastMove = room.board_state?.last_move;
    if (!lastMove) return;

    const moveKey = `${lastMove.from}${lastMove.to}${lastMove.promotion ?? ""}`;
    if (moveKey === lastAppliedMoveRef.current) return;

    const isOpponentMove = room.current_turn === user?.id;

    if (isOpponentMove) {
      setGame((prev) => {
        const copy = new Chess(prev.fen());
        try {
          const result = copy.move({
            from: lastMove.from,
            to: lastMove.to,
            promotion: lastMove.promotion ?? "q",
          });
          lastAppliedMoveRef.current = moveKey;
          pendingMoveRef.current = false;

          // Build rich toast message
          const { isCheck, isCheckmate, isCapture } = parseSAN(result.san);
          let msg = `Rival played: ${result.san}`;
          if (isCheckmate) msg = `CHECKMATE — Rival played ${result.san}`;
          else if (isCheck) msg = `CHECK! Rival played ${result.san}`;
          else if (isCapture) msg = `Rival captured: ${result.san}`;

          toast.custom("move", msg, "BATTLE LOG");

          if (isCheck && !isCheckmate) {
            toast.custom("check", "You are in CHECK! ⚠️", "CHECK");
          }

          return copy;
        } catch {
          return prev;
        }
      });
    } else {
      pendingMoveRef.current = false;
      lastAppliedMoveRef.current = moveKey;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.board_state?.last_move, room.current_turn]);

  const serverSaysMyTurn = room.current_turn === user?.id;
  const isYourTurn = serverSaysMyTurn && !pendingMoveRef.current;
  const boardOrientation = room.host_id === user?.id ? "white" : "black";

  const attemptMove = useCallback(
    (sourceSquare: string, targetSquare: string): boolean => {
      if (!isYourTurn) {
        toast.error("It's not your turn!");
        return false;
      }
      try {
        const gameCopy = new Chess(game.fen());
        const move = gameCopy.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });
        if (!move) return false;

        setGame(gameCopy);
        setSelectedSquare(null);
        setLegalMoveSquares([]);
        pendingMoveRef.current = true;

        const { isCheck, isCheckmate, isCapture, isCastle } = parseSAN(
          move.san,
        );
        let msg = `You played: ${move.san}`;
        if (isCheckmate) msg = `CHECKMATE! You played ${move.san}`;
        else if (isCheck) msg = `CHECK! You played ${move.san}`;
        else if (isCastle) msg = `You castled: ${move.san}`;
        else if (isCapture) msg = `You captured: ${move.san}`;
        toast.custom("move", msg, "YOU");

        const moveKey = `${sourceSquare}${targetSquare}q`;
        lastAppliedMoveRef.current = moveKey;

        makeChessMove(room.id, {
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        }).catch((err: unknown) => {
          const error = err as { message?: string };
          toast.error(error.message || "Failed to sync move — reverting");
          pendingMoveRef.current = false;
          setGame(new Chess(game.fen()));
        });
        return true;
      } catch {
        return false;
      }
    },
    [game, isYourTurn, room.id, toast],
  );

  // ── Click-to-move
  const handleSquareClick = useCallback(
    ({ square }: { square: string; piece: { pieceType: string } | null }) => {
      if (!isYourTurn) return;

      if (selectedSquare) {
        const moved = attemptMove(selectedSquare, square);
        if (!moved) {
          const moves = game.moves({ square: square as Square, verbose: true });
          if (moves.length > 0) {
            setSelectedSquare(square);
            setLegalMoveSquares(moves.map((m) => m.to));
          } else {
            setSelectedSquare(null);
            setLegalMoveSquares([]);
          }
        }
      } else {
        const moves = game.moves({ square: square as Square, verbose: true });
        if (moves.length > 0) {
          setSelectedSquare(square);
          setLegalMoveSquares(moves.map((m) => m.to));
        }
      }
    },
    [selectedSquare, isYourTurn, game, attemptMove],
  );

  // ── Resign
  const handleResign = async () => {
    if (!window.confirm("Are you sure you want to resign?")) return;
    setIsResigning(true);
    try {
      await resignChessGame(room.id);
      toast.success("You resigned the game.");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to resign");
    } finally {
      setIsResigning(false);
    }
  };

  // ── Square highlight styles
  const squareStyles: Record<string, React.CSSProperties> = {};
  if (selectedSquare) {
    squareStyles[selectedSquare] = {
      backgroundColor: "rgba(99,102,241,0.45)",
      borderRadius: "4px",
    };
  }
  legalMoveSquares.forEach((sq) => {
    squareStyles[sq] = {
      background:
        "radial-gradient(circle, rgba(99,102,241,0.55) 28%, transparent 30%)",
      borderRadius: "50%",
    };
  });

  // ── Derived values
  const hostIsWhite = room.host_id === user?.id;
  const oppUsername =
    user?.id === room.host_id ? room.guest?.username : room.host?.username;
  const myTurn = isYourTurn;
  const oppTurn = !myTurn && room.status === "active";

  // Per-player move counts (white = even indices, black = odd indices)
  const history = game.history({ verbose: true });
  const whiteMoveCount = history.filter((_, i) => i % 2 === 0).length;
  const blackMoveCount = history.filter((_, i) => i % 2 === 1).length;
  const myColor = room.host_id === user?.id ? "w" : "b";
  const myMoveCount = myColor === "w" ? whiteMoveCount : blackMoveCount;
  const oppMoveCount = myColor === "w" ? blackMoveCount : whiteMoveCount;

  // Pair up moves for log display using verbose history
  const movePairs = Array.from({ length: Math.ceil(history.length / 2) }).map(
    (_, i) => ({
      index: i,
      white: history[i * 2] ?? null,
      black: history[i * 2 + 1] ?? null,
    }),
  );

  const isLatestPair = (i: number) => i === movePairs.length - 1;

  // ── Render
  return (
    <div className="flex flex-col gap-2.5 w-full max-w-[680px] mx-auto p-2 box-border md:max-w-[1100px] md:grid md:grid-cols-[1fr_320px] md:grid-rows-[auto_auto_1fr] md:gap-3 md:p-3 lg:gap-4 lg:p-4">
      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between gap-1.5 bg-white/5 border border-white/[0.07] rounded-2xl px-3 py-2 backdrop-blur-xl md:col-span-2 md:px-4 md:py-2.5">
        {/* Host chip */}
        <div className="flex items-center gap-2 relative flex-1 min-w-0">
          <div
            className={`shrink-0 w-[34px] h-[34px] rounded-xl flex items-center justify-center font-black text-sm text-white border-2 bg-gradient-to-br from-slate-500 to-slate-800 md:w-[42px] md:h-[42px] md:text-base lg:w-[46px] lg:h-[46px] lg:text-lg
            ${(hostIsWhite && myTurn) || (!hostIsWhite && oppTurn) ? "border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]" : "border-white/10"}`}
          >
            {room.host?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span
              className={`font-black text-[13px] truncate uppercase tracking-wide leading-tight md:text-[15px] ${(hostIsWhite && myTurn) || (!hostIsWhite && oppTurn) ? "text-indigo-400" : "text-slate-100"}`}
            >
              {room.host?.username || "Host"}
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
              {room.host_id === user?.id ? "YOU" : "RIVAL"} · ⬜ ·{" "}
              {room.host_id === user?.id ? myMoveCount : oppMoveCount} moves
            </span>
          </div>
          {((hostIsWhite && myTurn) || (!hostIsWhite && oppTurn)) && (
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          )}
        </div>

        {/* Centre VS */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="flex items-center gap-1 bg-indigo-500/15 border border-indigo-500/30 rounded-lg px-2 py-0.5 text-indigo-400 font-black text-[11px] tracking-widest uppercase">
            <Zap size={10} />
            <span>VS</span>
            <Zap size={10} />
          </div>
          <div className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md px-1.5 py-0.5 text-amber-400 font-black text-[9px]">
            <Trophy size={9} />
            <span>{room.stake * 2}</span>
            <ZASymbol className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Guest chip */}
        <div className="flex items-center justify-end gap-2 relative flex-1 min-w-0">
          <div className="flex flex-col items-end min-w-0 overflow-hidden">
            <span
              className={`font-black text-[13px] truncate uppercase tracking-wide leading-tight md:text-[15px] ${(!hostIsWhite && myTurn) || (hostIsWhite && oppTurn) ? "text-indigo-400" : "text-slate-100"}`}
            >
              {room.guest?.username || "Waiting..."}
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
              ⬛ · {room.guest_id === user?.id ? "YOU" : "RIVAL"} ·{" "}
              {room.guest_id === user?.id ? myMoveCount : oppMoveCount} moves
            </span>
          </div>
          <div
            className={`shrink-0 w-[34px] h-[34px] rounded-xl flex items-center justify-center font-black text-sm text-white border-2 bg-gradient-to-br from-slate-900 to-slate-800 md:w-[42px] md:h-[42px] md:text-base lg:w-[46px] lg:h-[46px] lg:text-lg
            ${(!hostIsWhite && myTurn) || (hostIsWhite && oppTurn) ? "border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]" : "border-white/10"}`}
          >
            {room.guest?.username?.[0]?.toUpperCase() || "?"}
          </div>
          {((!hostIsWhite && myTurn) || (hostIsWhite && oppTurn)) && (
            <span className="absolute top-0 left-0 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </div>
      </div>

      {/* ── Turn / Check Banner ── */}
      {inCheck ? (
        <div className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-extrabold tracking-widest uppercase bg-red-500/20 border border-red-500/50 text-red-300 animate-pulse md:col-start-1 md:text-xs">
          <ShieldAlert size={14} className="shrink-0" />
          <span>⚠️ YOU ARE IN CHECK — Protect your king!</span>
        </div>
      ) : game.isCheckmate() ? (
        <div className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-extrabold tracking-widest uppercase bg-amber-500/20 border border-amber-500/50 text-amber-300 md:col-start-1 md:text-xs">
          <Trophy size={14} className="shrink-0" />
          <span>CHECKMATE — Game Over</span>
        </div>
      ) : (
        <div
          className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold tracking-widest uppercase md:col-start-1 md:text-xs
          ${
            myTurn
              ? "bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 animate-pulse"
              : "bg-white/[0.03] border border-white/[0.06] text-slate-500"
          }`}
        >
          {myTurn ? (
            <>
              <Crown size={13} className="animate-bounce" />
              <span>Your turn — make your move</span>
            </>
          ) : (
            <>
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:200ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:400ms]" />
              </span>
              <span>Waiting for {oppUsername || "opponent"}…</span>
            </>
          )}
        </div>
      )}

      {/* ── Chess Board ── */}
      <div
        className={`relative w-full aspect-square rounded-2xl overflow-hidden bg-white/5 border md:col-start-1 md:row-start-3
        ${inCheck ? "border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.25)]" : "border-indigo-500/20"}`}
      >
        <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent_70%)]" />

        {/* Check overlay badge on board */}
        {inCheck && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-red-500/90 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg tracking-wider uppercase backdrop-blur-sm pointer-events-none">
            <AlertTriangle size={11} />
            CHECK!
          </div>
        )}

        <div className="relative z-[1] w-full h-full">
          <Chessboard
            options={{
              position: game.fen(),
              boardOrientation: boardOrientation as "white" | "black",
              allowDragging: isYourTurn,
              animationDurationInMs: 250,
              onPieceDrop: ({ sourceSquare, targetSquare }) =>
                targetSquare ? attemptMove(sourceSquare, targetSquare) : false,
              onSquareClick: handleSquareClick,
              squareStyles,
              darkSquareStyle: { backgroundColor: "#1e293b" },
              lightSquareStyle: { backgroundColor: "#334155" },
              boardStyle: {
                borderRadius: "8px",
                boxShadow: "0 0 60px rgba(99,102,241,0.15)",
              },
            }}
          />
        </div>
      </div>

      {/* ── Side Panel ── */}
      <div className="flex flex-col gap-2 md:col-start-2 md:row-start-2 md:row-end-4 md:h-full">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 border bg-white/5 border-white/[0.06] backdrop-blur-md">
            <span className="text-[7px] font-black text-slate-100/40 uppercase tracking-[0.12em]">
              STAKE
            </span>
            <span className="text-xs font-black text-slate-100 flex items-center gap-0.5">
              {room.stake} <ZASymbol className="w-[9px] h-[9px]" />
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 border bg-amber-500/5 border-amber-500/25 backdrop-blur-md">
            <span className="text-[7px] font-black text-amber-100/30 uppercase tracking-[0.12em]">
              PRIZE POOL
            </span>
            <span className="text-xs font-black text-amber-400 flex items-center gap-1 leading-none">
              {room.stake * 2} <ZASymbol className="w-[9px] h-[9px]" />
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 border bg-white/5 border-white/[0.06] backdrop-blur-md">
            <span className="text-[7px] font-black text-slate-100/40 uppercase tracking-[0.12em]">
              MY MOVES
            </span>
            <span className="text-xs font-black text-indigo-300 flex items-center gap-0.5">
              {myMoveCount}
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 border bg-white/5 border-white/[0.06] backdrop-blur-md">
            <span className="text-[7px] font-black text-slate-100/40 uppercase tracking-[0.12em]">
              OPP MOVES
            </span>
            <span className="text-xs font-black text-slate-300 flex items-center gap-0.5">
              {oppMoveCount}
            </span>
          </div>
        </div>

        {/* Battle Log */}
        <div className="bg-white/5 border border-white/[0.06] rounded-xl overflow-hidden backdrop-blur-md flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-1.5 px-3 py-2 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-[0.12em]">
              <Swords size={14} className="text-indigo-400" />
              <span>Battle Log</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <span className="text-slate-300">⬜</span>
                {whiteMoveCount}
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1">
                <span className="text-slate-500">⬛</span>
                {blackMoveCount}
              </span>
              <span className="text-slate-700">·</span>
              <span className="text-slate-500">{history.length} total</span>
            </div>
          </div>

          {/* Log body */}
          <div
            className="p-2 overflow-y-auto flex-1 scrollbar-none"
            style={{ maxHeight: "220px" }}
          >
            {movePairs.length === 0 ? (
              <p className="text-[10px] text-slate-500 font-bold text-center py-4 italic uppercase tracking-widest">
                No moves yet. First move is yours!
              </p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {movePairs.map(({ index, white, black }) => {
                  const latest = isLatestPair(index);
                  const wp = white ? parseSAN(white.san) : null;
                  const bp = black ? parseSAN(black.san) : null;

                  return (
                    <div
                      key={index}
                      className={`flex items-stretch gap-1 rounded-lg overflow-hidden text-[10px]
                        ${latest ? "bg-indigo-500/8 border border-indigo-500/15" : "bg-white/[0.015]"}`}
                    >
                      {/* Move number */}
                      <span className="w-5 flex items-center justify-center text-[9px] text-slate-700 font-bold shrink-0 bg-white/[0.02] border-r border-white/[0.04] py-1">
                        {index + 1}
                      </span>

                      {/* White move */}
                      <div
                        className={`flex-1 flex items-center gap-1 px-1.5 py-1 border-r border-white/[0.04]
                        ${latest && !black ? "text-indigo-300" : "text-slate-300"}`}
                      >
                        {wp && (
                          <>
                            <span
                              className="text-[11px] shrink-0"
                              title={`Piece: ${wp.pieceChar}`}
                            >
                              {PIECE_ICON[wp.pieceChar] ?? "♙"}
                            </span>
                            <span className="font-black uppercase tracking-wide truncate">
                              {white?.san}
                            </span>
                            <span className="flex items-center gap-0.5 ml-auto shrink-0">
                              {wp.isCapture && (
                                <span className="text-red-400" title="Capture">
                                  ✕
                                </span>
                              )}
                              {wp.isCheck && !wp.isCheckmate && (
                                <span
                                  className="text-amber-400 text-[8px] font-black"
                                  title="Check"
                                >
                                  +
                                </span>
                              )}
                              {wp.isCheckmate && (
                                <span
                                  className="text-red-400 text-[8px] font-black"
                                  title="Checkmate"
                                >
                                  #
                                </span>
                              )}
                              {wp.isCastle && (
                                <span
                                  className="text-cyan-400 text-[8px]"
                                  title="Castle"
                                >
                                  🏰
                                </span>
                              )}
                              {wp.isPromotion && (
                                <span
                                  className="text-purple-400 text-[8px]"
                                  title="Promotion"
                                >
                                  ⬆
                                </span>
                              )}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Black move */}
                      <div
                        className={`flex-1 flex items-center gap-1 px-1.5 py-1
                        ${latest && black ? "text-indigo-300" : "text-slate-500"}`}
                      >
                        {bp ? (
                          <>
                            <span
                              className="text-[11px] shrink-0 opacity-80"
                              title={`Piece: ${bp.pieceChar}`}
                            >
                              {PIECE_ICON[bp.pieceChar.toLowerCase()] ?? "♟"}
                            </span>
                            <span className="font-black uppercase tracking-wide truncate">
                              {black?.san}
                            </span>
                            <span className="flex items-center gap-0.5 ml-auto shrink-0">
                              {bp.isCapture && (
                                <span className="text-red-400" title="Capture">
                                  ✕
                                </span>
                              )}
                              {bp.isCheck && !bp.isCheckmate && (
                                <span
                                  className="text-amber-400 text-[8px] font-black"
                                  title="Check"
                                >
                                  +
                                </span>
                              )}
                              {bp.isCheckmate && (
                                <span
                                  className="text-red-400 text-[8px] font-black"
                                  title="Checkmate"
                                >
                                  #
                                </span>
                              )}
                              {bp.isCastle && (
                                <span
                                  className="text-cyan-400 text-[8px]"
                                  title="Castle"
                                >
                                  🏰
                                </span>
                              )}
                              {bp.isPromotion && (
                                <span
                                  className="text-purple-400 text-[8px]"
                                  title="Promotion"
                                >
                                  ⬆
                                </span>
                              )}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-700 italic text-[9px]">
                            …
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={logEndRef} />
              </div>
            )}
          </div>

          {/* Log footer: game state summary */}
          <div className="border-t border-white/5 px-3 py-1.5 flex items-center justify-between text-[9px] text-slate-600 font-bold uppercase tracking-wider shrink-0">
            <span>
              {game.isCheckmate()
                ? "♛ Checkmate"
                : game.isStalemate()
                  ? "= Stalemate"
                  : game.isDraw()
                    ? "= Draw"
                    : inCheck
                      ? "⚠ In Check"
                      : game.isCheck()
                        ? "⚠ Check"
                        : "● Active"}
            </span>
            <span className="text-slate-700">
              Turn {Math.ceil(history.length / 2) || 1}
              {game.isGameOver() ? " · ENDED" : ""}
            </span>
          </div>
        </div>

        {/* Resign */}
        <button
          id="resign-btn"
          onClick={handleResign}
          disabled={isResigning || room.status !== "active"}
          className="w-full py-2.5 rounded-xl border border-red-500/20 bg-transparent text-red-400 text-[11px] font-black tracking-[0.12em] uppercase cursor-pointer transition-all duration-200
            hover:enabled:bg-red-500/8 hover:enabled:border-red-500/50 disabled:opacity-35 disabled:cursor-not-allowed"
        >
          {isResigning ? "Resigning…" : "⚑ Resign Battle"}
        </button>
      </div>
    </div>
  );
};

export default H2HArena;
