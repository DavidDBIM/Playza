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
import { Maximize, Minimize } from "lucide-react";
import ChessWinner from "./ChessWinner";

interface ChessArenaProps {
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

const PIECE_NAME: Record<string, string> = {
  K: "KING",
  Q: "QUEEN",
  R: "ROOK",
  B: "BISHOP",
  N: "KNIGHT",
  P: "PAWN",
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

const ChessArena = ({ room, user }: ChessArenaProps) => {
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

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDeduction, setShowDeduction] = useState(true);
  const [showRules, setShowRules] = useState(false);

  // ── Prevent Accidental Leave ────────────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Leaving will forfeit your stake to the opponent. Are you sure?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ── Auto-scroll battle log ──────────────────────────────────────────────────
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [game]);

  // ── Fullscreen Support ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error("Fullscreen error:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

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
          const { isCheck, isCheckmate, isCapture, pieceChar } = parseSAN(
            result.san,
          );
          const pIcon = PIECE_ICON[pieceChar.toLowerCase()] || "♟";
          const pName = PIECE_NAME[pieceChar.toLocaleUpperCase()] || "PAWN";

          let msg = `Rival moved ${pIcon} ${pName} to ${result.to}`;
          if (isCheckmate)
            msg = `💥 CHECKMATE — Rival played ${pIcon} ${result.san}`;
          else if (isCheck)
            msg = `⚠️ CHECK! Rival played ${pIcon} ${result.san}`;
          else if (isCapture) msg = `⚔️ Rival captured with ${pIcon} ${pName}`;

          toast.custom("move", msg, "BATTLE LOG");

          if (isCheck && !isCheckmate) {
            toast.custom(
              "check",
              "⚠️ YOU ARE IN CHECK — Protect your king!",
              "CHECK",
            );
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
  const oppUsername = 
    user?.id === room.host_id 
      ? (room.guest_id ? (room.guest?.username || "GUEST") : "COMPUTER")
      : (room.host?.username || "HOST");

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

        const { isCheck, isCheckmate, isCapture, isCastle, pieceChar } =
          parseSAN(move.san);
        const pIcon = PIECE_ICON[pieceChar.toUpperCase()] || "♙";
        const pName = PIECE_NAME[pieceChar.toUpperCase()] || "PAWN";

        let msg = `You moved ${pIcon} ${pName} to ${move.to}`;
        if (isCheckmate) msg = `🏆 CHECKMATE! You played ${pIcon} ${move.san}`;
        else if (isCheck)
          msg = `🎯 CHECK! You placed Rival in check with ${pIcon}`;
        else if (isCastle) msg = `🏰 You castled: ${move.san}`;
        else if (isCapture) msg = `⚔️ You captured with ${pIcon} ${pName}`;
        toast.custom("move", msg, "YOU");

        if (isCheck && !isCheckmate) {
          toast.custom(
            "check",
            `You have placed ${oppUsername || "opponent"} in CHECK! 🎯`,
            "NICE MOVE",
          );
        }

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
    [game, isYourTurn, room.id, toast, oppUsername],
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
  const myTurn = isYourTurn;
  const oppTurn = !myTurn && room.status === "active";

  // Absolute move counts derived from FEN to stay in sync even if history is partial
  const fenParts = game.fen().split(" ");
  const fullMoveNum = parseInt(fenParts[fenParts.length - 1] || "1", 10);
  const currentTurn = game.turn(); // 'w' or 'b'

  // In FEN, fullMoveNum increments after Black moves.
  // If it's White's turn, both have made fullMoveNum - 1 moves.
  // If it's Black's turn, White has made fullMoveNum, Black has fullMoveNum - 1.
  const whiteMoveCount = currentTurn === "w" ? fullMoveNum - 1 : fullMoveNum;
  const blackMoveCount = fullMoveNum - 1;

  const history = game.history({ verbose: true });
  const myColor = room.host_id === user?.id ? "w" : "b";
  const myMoveCount = myColor === "w" ? whiteMoveCount : blackMoveCount;
  const oppMoveCount = myColor === "w" ? blackMoveCount : whiteMoveCount;

  // Captured pieces logic
  const fenBoard = fenParts[0];
  const startingPieces: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1, P: 8, N: 2, B: 2, R: 2, Q: 1 };
  const currentPieces: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, P: 0, N: 0, B: 0, R: 0, Q: 0 };
  for (const char of fenBoard) {
    if (currentPieces[char] !== undefined) currentPieces[char]++;
  }
  const whiteCaptured: string[] = [];
  ['p', 'n', 'b', 'r', 'q'].forEach(p => {
     const count = startingPieces[p] - currentPieces[p];
     for(let i=0; i<count; i++) whiteCaptured.push(p); 
  });
  const blackCaptured: string[] = [];
  ['P', 'N', 'B', 'R', 'Q'].forEach(p => {
     const count = startingPieces[p] - currentPieces[p];
     for(let i=0; i<count; i++) blackCaptured.push(p);
  });

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
    <div className="flex flex-col gap-2.5 w-full max-w-170 mx-auto p-2 box-border md:max-w-275 md:grid md:grid-cols-[1fr_320px] md:grid-rows-[auto_auto_1fr] md:gap-3 md:p-3 lg:gap-4 lg:p-4">
      {/* ── Arena Controls ── */}
      <div className="flex justify-end gap-2 mb-1 md:col-span-2">
        <button
          onClick={toggleFullscreen}
          className="bg-white/5 hover:bg-white/10 dark:text-white p-2 rounded-xl border border-white/10 backdrop-blur-md transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>

      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between gap-1.5 bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/[0.07] rounded-2xl px-3 py-2 backdrop-blur-xl md:col-span-2 md:px-4 md:py-2.5">
        {/* Host chip */}
        <div className="flex items-center gap-2 relative flex-1 min-w-0">
          <div
            className={`shrink-0 w-8.5 h-8.5 rounded-xl flex items-center justify-center font-black text-sm text-white border-2 bg-linear-to-br from-slate-500 to-slate-800 md:w-10.5 md:h-10.5 md:text-base lg:w-11.5 lg:h-11.5 lg:text-lg overflow-hidden
            ${(hostIsWhite && myTurn) || (!hostIsWhite && oppTurn) ? "border-indigo-400" : "border-white/10"}`}
          >
            {room.host?.avatar_url ? (
              <img
                src={room.host.avatar_url}
                className="w-full h-full object-cover rounded-md"
                alt=""
              />
            ) : (
              room.host?.username?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span
              className={`font-black text-[13px] truncate uppercase tracking-wide leading-tight md:text-[15px] ${(hostIsWhite && myTurn) || (!hostIsWhite && oppTurn) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-slate-100"}`}
            >
              {room.host?.username || "Host"}
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest leading-none">
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
              className={`font-black text-[13px] truncate uppercase tracking-wide leading-tight md:text-[15px] ${(!hostIsWhite && myTurn) || (hostIsWhite && oppTurn) ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-slate-100"}`}
            >
              {room.guest?.username || (room.guest_id ? "Waiting..." : "COMPUTER")}
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest leading-none">
              ⬛ · {room.guest_id === user?.id ? "YOU" : "RIVAL"} ·{" "}
              {room.guest_id === user?.id ? myMoveCount : oppMoveCount} moves
            </span>
          </div>
          <div
            className={`shrink-0 w-8.5 h-8.5 rounded-xl flex items-center justify-center font-black text-sm text-white border-2 bg-linear-to-br from-slate-900 to-slate-800 md:w-10.5 md:h-10.5 md:text-base lg:w-11.5 lg:h-11.5 lg:text-lg overflow-hidden
            ${(!hostIsWhite && myTurn) || (hostIsWhite && oppTurn) ? "border-indigo-400" : "border-white/10"}`}
          >
            {room.guest?.avatar_url ? (
              <img
                src={room.guest.avatar_url}
                className="w-full h-full object-cover rounded-md"
                alt=""
              />
            ) : (
              room.guest?.username?.[0]?.toUpperCase() || (room.guest_id ? "?" : "C")
            )}
          </div>
          {((!hostIsWhite && myTurn) || (hostIsWhite && oppTurn)) && (
            <span className="absolute top-0 left-0 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </div>
      </div>

      {/* ── Turn / Check Banner ── */}
      {inCheck ? (
        myTurn ? (
          <div className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-extrabold tracking-widest uppercase bg-red-500/20 border border-red-500/50 text-red-600 dark:text-red-300 animate-pulse md:col-start-1 md:text-xs">
            <ShieldAlert size={14} className="shrink-0" />
            <span>⚠️ YOU ARE IN CHECK — Protect your king!</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-extrabold tracking-widest uppercase bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 md:col-start-1 md:text-xs text-center leading-none">
            <AlertTriangle size={14} className="shrink-0" />
            <span>🎯 {oppUsername || "Rival"} IS IN CHECK — FINISH THEM!</span>
          </div>
        )
      ) : game.isCheckmate() ? (
        <div className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-extrabold tracking-widest uppercase bg-amber-500/20 border border-amber-500/50 text-amber-600 dark:text-amber-300 md:col-start-1 md:text-xs">
          <Trophy size={14} className="shrink-0" />
          <span>CHECKMATE — Game Over</span>
        </div>
      ) : (
        <div
          className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold tracking-widest uppercase md:col-start-1 md:text-xs
          ${
            myTurn
              ? "bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 animate-pulse"
              : "bg-slate-100 dark:bg-white/3 border border-slate-200 dark:border-white/6 text-slate-400 dark:text-slate-500"
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
        className={`relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 border md:col-start-1 md:row-start-3
        ${inCheck && myTurn ? "border-red-500/60" : "border-slate-200 dark:border-indigo-500/20"}`}
      >
        <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent_70%)]" />

        {/* Check overlay badge on board */}
        {inCheck && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-red-500/90 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-wider uppercase backdrop-blur-sm pointer-events-none">
            <AlertTriangle size={11} />
            CHECK!
          </div>
        )}
        <div className="relative z-1 w-full h-full">
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
              },
            }}
          />
        </div>
      </div>

      {game.isGameOver() && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500 scrollbar-hide">
          <ChessWinner 
            room={room} 
            user={user} 
            localWinnerId={
              game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial() 
              ? null 
              : (game.turn() === "w" ? room.guest_id : room.host_id)
            } 
            isSyncing={room.status !== "finished"} 
          />
        </div>
      )}

      {/* ─── DEDUCTION CONFIRMATION (Both Players) ─── */}
      {showDeduction && !game.isGameOver() && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-primary/30 rounded-3xl p-8 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldAlert className="text-primary w-12 h-12" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Stake Committed</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Transaction Authorized</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
              <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest text-center leading-relaxed italic">
                A stake of <span className="text-primary">{room.stake} ZA</span> has been successfully deducted from your wallet to secure this battle.
              </p>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="text-left">
                  <p className="text-[8px] font-black text-slate-500 uppercase">Your Entry</p>
                  <p className="font-black text-primary italic">-{room.stake} ZA</p>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-500 uppercase">Prize Pool</p>
                  <p className="font-black text-secondary italic">+{room.stake * 2} ZA</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { setShowDeduction(false); setShowRules(true); }}
              className="w-full py-4 bg-primary text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2"
            >
              Continue to Battle
            </button>
          </div>
        </div>
      )}

      {showRules && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500">
          <div className="w-full max-w-xl bg-white dark:bg-slate-950 border-4 border-primary rounded-3xl p-6 md:p-10 transform animate-in zoom-in-95 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Swords className="text-primary w-12 h-12 md:w-16 md:h-16 animate-pulse" />
                <h2 className="font-headline text-3xl md:text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                  Battle Conditions
                </h2>
                <div className="h-1 w-20 bg-primary/30 rounded-full"></div>
              </div>

              <div className="grid gap-4 md:gap-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group hover:border-primary/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 font-black text-primary italic">01</div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900 dark:text-white mb-1">Staked Match</h3>
                    <p className="text-[10px] md:text-xs text-slate-500 uppercase font-black leading-relaxed italic">Your {room.stake} ZA stake is locked in escrow. Winner takes the total prize pool minus 10% platform fee.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group hover:border-primary/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 font-black text-orange-500 italic">02</div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900 dark:text-white mb-1">Fair Play Warning</h3>
                    <p className="text-[10px] md:text-xs text-slate-500 uppercase font-black leading-relaxed italic">DO NOT navigate away. Leaving or closing the tab during an active match will forfeit your balance to your opponent.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group hover:border-primary/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 font-black text-emerald-500 italic">03</div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900 dark:text-white mb-1">Reconnection</h3>
                    <p className="text-[10px] md:text-xs text-slate-500 uppercase font-black leading-relaxed italic">If you disconnect accidentally, hurry back! Re-enter the room using the code or link to continue the battle.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowRules(false)}
                className="w-full bg-primary text-white font-headline font-black py-4 md:py-6 rounded-2xl text-lg md:text-2xl tracking-[0.2em] transition-all uppercase italic"
              >
                READY TO FIGHT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Side Panel ── */}
      <div className="flex flex-col gap-2 md:col-start-2 md:row-start-2 md:row-end-4 md:h-full">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 border bg-white dark:bg-white/5 border-slate-200 dark:border-white/6 backdrop-blur-md">
            <span className="text-[7px] font-black text-slate-400 dark:text-slate-100/40 uppercase tracking-[0.12em]">
              ENTRY FEE
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-0.5">
              {room.stake} <ZASymbol className="w-2.25 h-2.25" />
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 border bg-amber-500 dark:bg-amber-500/5 border-amber-500/25 backdrop-blur-md">
            <span className="text-[7px] font-black text-white dark:text-amber-100/30 uppercase tracking-[0.12em]">
              PRIZE POOL
            </span>
            <span className="text-xs font-black text-white dark:text-amber-400 flex items-center gap-1 leading-none">
              {room.stake * 2} <ZASymbol className="w-2.25 h-2.25" />
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 border bg-white dark:bg-white/5 border-slate-200 dark:border-white/6 backdrop-blur-md">
            <span className="text-[7px] font-black text-slate-400 dark:text-slate-100/40 uppercase tracking-[0.12em]">
              MY MOVES
            </span>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-300 flex items-center gap-0.5">
              {myMoveCount}
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 border bg-white dark:bg-white/5 border-slate-200 dark:border-white/6 backdrop-blur-md">
            <span className="text-[7px] font-black text-slate-400 dark:text-slate-100/40 uppercase tracking-[0.12em]">
              OPP MOVES
            </span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
              {oppMoveCount}
            </span>
          </div>
        </div>

        {/* Battle Log */}
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/6 rounded-xl overflow-hidden backdrop-blur-md flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-1.5 px-3 py-2 border-b border-slate-100 dark:border-white/5 shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">
              <Swords
                size={14}
                className="text-indigo-600 dark:text-indigo-400"
              />
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

          {/* Captured Pieces */}
          {(whiteCaptured.length > 0 || blackCaptured.length > 0) && (
            <div className="flex flex-col gap-1 px-3 py-1.5 bg-slate-50/50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 text-[12px] opacity-80 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none">W Cap</span>
                <div className="flex gap-0.5">
                  {whiteCaptured.map((p, i) => <span key={i} title={PIECE_NAME[p.toUpperCase()]}>{PIECE_ICON[p]}</span>)}
                </div>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none">B Cap</span>
                <div className="flex gap-0.5 text-slate-600 dark:text-slate-300">
                  {blackCaptured.map((p, i) => <span key={i} title={PIECE_NAME[p.toUpperCase()]}>{PIECE_ICON[p]}</span>)}
                </div>
              </div>
            </div>
          )}

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
                        ${latest ? "bg-indigo-500/8 border border-indigo-500/15" : "bg-slate-50 dark:bg-white/1"}`}
                    >
                      {/* Move number */}
                      <span className="w-10 flex flex-col items-center justify-center text-[8px] text-slate-400 dark:text-slate-700 font-black shrink-0 bg-slate-100 dark:bg-white/2 border-r border-slate-200 dark:border-white/4 py-1">
                        <span className="opacity-40 uppercase">Mv</span>
                        {index + 1}
                      </span>

                      <div
                        className={`flex-1 flex items-center gap-1 px-1.5 py-1 border-r border-slate-200 dark:border-white/4
                        ${latest && !black ? "text-indigo-600 dark:text-indigo-300" : "text-slate-900 dark:text-slate-300"}`}
                      >
                        {wp && (
                          <>
                            <span
                              className="text-[11px] shrink-0"
                              title={`Piece: ${wp.pieceChar}`}
                            >
                              {PIECE_ICON[wp.pieceChar] ?? "♙"}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-black uppercase tracking-wide truncate">
                                {white?.san}
                              </span>
                              <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-none">
                                {PIECE_NAME[wp.pieceChar] || "PAWN"}
                              </span>
                            </div>
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
                        ${latest && black ? "text-indigo-600 dark:text-indigo-300" : "text-slate-600 dark:text-slate-500"}`}
                      >
                        {bp ? (
                          <>
                            <span
                              className="text-[11px] shrink-0 opacity-80"
                              title={`Piece: ${bp.pieceChar}`}
                            >
                              {PIECE_ICON[bp.pieceChar.toLowerCase()] ?? "♟"}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-black uppercase tracking-wide truncate">
                                {black?.san}
                              </span>
                              <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-none">
                                {PIECE_NAME[bp.pieceChar] || "PAWN"}
                              </span>
                            </div>
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

export default ChessArena;
