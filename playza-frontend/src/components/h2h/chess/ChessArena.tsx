import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactElement,
} from "react";
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
  Maximize,
  Minimize,
} from "lucide-react";
import H2HGamePrep from "../H2HGamePrep";
import { makeChessMove, resignChessGame } from "@/api/chess.api";
import { useToast } from "@/context/toast";
import { ZASymbol } from "@/components/currency/ZASymbol";
import type { ChessRoom } from "@/types/chess";
import type { UserProfile } from "@/context/auth";
import H2HWinner from "../H2HWinner";

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
  const [showWinnerDelayed, setShowWinnerDelayed] = useState(false);

  // Track the last move we already applied so we don't re-apply it
  const lastAppliedMoveRef = useRef<string | null>(null);
  // Track whether we are waiting for the server to confirm our move
  const pendingMoveRef = useRef(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [phase, setPhase] = useState<"prep" | "playing">("prep");

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  // ── Prevent Accidental Leave ────────────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "Leaving will forfeit your stake to the opponent. Are you sure?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ── Auto-scroll battle log ──────────────────────────────────────────────────
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "auto" });
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

  // ── Delay Winner Screen ───────────────────────────────────────────────────
  useEffect(() => {
    if (game.isGameOver() && room.status === "finished" && !showWinnerDelayed) {
      const timer = setTimeout(() => {
        setShowWinnerDelayed(true);
      }, 5000); // 5 second delay to see the final board
      return () => clearTimeout(timer);
    }
  }, [game, room.status, showWinnerDelayed]);

  // Prevent body scrolling when winner modal is open
  useEffect(() => {
    if (showWinnerDelayed) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [showWinnerDelayed]);

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
      ? room.guest_id
        ? room.guest?.username || "GUEST"
        : "COMPUTER"
      : room.host?.username || "HOST";

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
  const startingPieces: Record<string, number> = {
    p: 8,
    n: 2,
    b: 2,
    r: 2,
    q: 1,
    P: 8,
    N: 2,
    B: 2,
    R: 2,
    Q: 1,
  };
  const currentPieces: Record<string, number> = {
    p: 0,
    n: 0,
    b: 0,
    r: 0,
    q: 0,
    P: 0,
    N: 0,
    B: 0,
    R: 0,
    Q: 0,
  };
  for (const char of fenBoard) {
    if (currentPieces[char] !== undefined) currentPieces[char]++;
  }
  const whiteCaptured: string[] = [];
  ["p", "n", "b", "r", "q"].forEach((p) => {
    const count = startingPieces[p] - currentPieces[p];
    for (let i = 0; i < count; i++) whiteCaptured.push(p);
  });
  const blackCaptured: string[] = [];
  ["P", "N", "B", "R", "Q"].forEach((p) => {
    const count = startingPieces[p] - currentPieces[p];
    for (let i = 0; i < count; i++) blackCaptured.push(p);
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

  // Modern Neo style pieces mapping
  const customPieces = useMemo(() => {
    const pieces = [
      "wP",
      "wN",
      "wB",
      "wR",
      "wQ",
      "wK",
      "bP",
      "bN",
      "bB",
      "bR",
      "bQ",
      "bK",
    ];
    const piecesImages: Record<string, () => ReactElement> = {};
    pieces.forEach((piece) => {
      piecesImages[piece] = () => (
        <img
          src={`https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/${piece}.svg`}
          alt={piece}
          className="w-full h-full drop-shadow-[0_6px_8px_rgba(0,0,0,0.5)] cursor-grab pointer-events-none"
        />
      );
    });
    return piecesImages;
  }, []);

  // ── Render
  return (
    <div className="flex flex-col gap-2 w-full max-w-full mx-auto p-2 box-border md:grid md:grid-cols-[1fr_380px] md:grid-rows-[auto_auto_1fr] md:gap-4 md:p-4 lg:p-6 min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 md:col-span-2 md:px-5 md:py-3 shadow-sm">
        {/* Fullscreen Toggle (NEW) */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-400"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
        {/* Host chip */}
        <div className="flex items-center gap-2 relative flex-1 min-w-0">
          <div
            className={`shrink-0 w-8.5 h-8.5 rounded-xl flex items-center justify-center font-black text-[10px] md:text-sm text-white border-2 bg-slate-700 md:w-10.5 md:h-10.5 lg:w-11.5 lg:h-11.5 overflow-hidden
            ${(hostIsWhite && myTurn) || (!hostIsWhite && oppTurn) ? "border-indigo-500" : "border-black/10 dark:border-white/10"}`}
          >
            {room.host?.avatar_url ? (
              <img
                src={room.host.avatar_url}
                className="w-full h-full object-cover rounded-md"
                alt=""
                loading="lazy"
              />
            ) : (
              room.host?.username?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span
              className={`font-black text-[10px] md:text-xs truncate uppercase tracking-wide leading-tight md:text-[15px] ${(hostIsWhite && myTurn) || (!hostIsWhite && oppTurn) ? "text-indigo-600 dark:text-indigo-500" : "text-slate-900 dark:text-slate-100"}`}
            >
              {room.host?.username || "Host"}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
              {room.host_id === user?.id ? "YOU" : "RIVAL"} · ⬜
            </span>
          </div>
          {((hostIsWhite && myTurn) || (!hostIsWhite && oppTurn)) && (
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-indigo-500" />
          )}
        </div>

        {/* Centre VS */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2 py-0.5 text-indigo-500 font-black text-[10px] tracking-widest uppercase">
            <Zap size={10} />
            <span>VS</span>
            <Zap size={10} />
          </div>
          <div className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md px-1.5 py-0.5 text-amber-500 font-black text-[10px]">
            <Trophy size={9} />
            <span>{room.stake * 2}</span>
            <ZASymbol className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Guest chip */}
        <div className="flex items-center justify-end gap-2 relative flex-1 min-w-0 text-right">
          <div className="flex flex-col items-end min-w-0 overflow-hidden">
            <span
              className={`font-black text-[10px] md:text-xs truncate uppercase tracking-wide leading-tight md:text-[15px] ${(!hostIsWhite && myTurn) || (hostIsWhite && oppTurn) ? "text-indigo-600 dark:text-indigo-500" : "text-slate-900 dark:text-slate-100"}`}
            >
              {room.guest?.username ||
                (room.guest_id ? "Waiting..." : "COMPUTER")}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
              ⬛ · {room.guest_id === user?.id ? "YOU" : "RIVAL"}
            </span>
          </div>
          <div
            className={`shrink-0 w-8.5 h-8.5 rounded-lg flex items-center justify-center font-black text-[10px] md:text-sm text-white border bg-slate-900 md:w-10.5 md:h-10.5 lg:w-11.5 lg:h-11.5 overflow-hidden
            ${(!hostIsWhite && myTurn) || (hostIsWhite && oppTurn) ? "border-indigo-500" : "border-slate-200 dark:border-white/10"}`}
          >
            {room.guest?.avatar_url ? (
              <img
                src={room.guest.avatar_url}
                className="w-full h-full object-cover"
                alt=""
                loading="lazy"
              />
            ) : (
              room.guest?.username?.[0]?.toUpperCase() ||
              (room.guest_id ? "?" : "C")
            )}
          </div>
          {((!hostIsWhite && myTurn) || (hostIsWhite && oppTurn)) && (
            <span className="absolute top-0 left-0 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </div>
      </div>

      {/* ── Turn / Check Banner ── */}
      {inCheck ? (
        myTurn ? (
          <div className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-extrabold tracking-widest uppercase bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 md:col-start-1 md:text-xs">
            <ShieldAlert size={14} className="shrink-0" />
            <span>⚠️ YOU ARE IN CHECK — Protect your king!</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-extrabold tracking-widest uppercase bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 md:col-start-1 md:text-xs text-center leading-none">
            <AlertTriangle size={14} className="shrink-0" />
            <span>🎯 {oppUsername || "Rival"} IS IN CHECK — FINISH THEM!</span>
          </div>
        )
      ) : game.isCheckmate() ? (
        <div className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-extrabold tracking-widest uppercase bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 md:col-start-1 md:text-xs">
          <Trophy size={14} className="shrink-0" />
          <span>CHECKMATE — Game Over</span>
        </div>
      ) : (
        <div
          className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold tracking-widest uppercase md:col-start-1 md:text-xs
          ${
            myTurn
              ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
              : "bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-slate-500"
          }`}
        >
          {myTurn ? (
            <>
              <Crown size={12} className="shrink-0 animate-bounce" />
              <span>Your turn — make your move</span>
            </>
          ) : (
            <>
              <span className="flex gap-0.5 shrink-0">
                <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:200ms]" />
                <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:400ms]" />
              </span>
              <span className="truncate">
                Waiting for {oppUsername || "opponent"}…
              </span>
            </>
          )}
        </div>
      )}

      {/* ── Chess Board ── */}
      <div
        className={`relative w-full max-w-[75vh] mx-auto aspect-square rounded-xl overflow-hidden bg-white dark:bg-slate-900 border-4 shadow-2xl md:col-start-1 md:row-start-3
        ${inCheck && myTurn ? "border-red-500/60" : "border-slate-800 dark:border-slate-700"}`}
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
              animationDurationInMs: 300,
              onPieceDrop: ({ sourceSquare, targetSquare }) => {
                if (!targetSquare) return false;
                const moved = attemptMove(sourceSquare, targetSquare);
                return moved;
              },
              onSquareClick: handleSquareClick,
              squareStyles: squareStyles,
              pieces: customPieces,
              darkSquareStyle: { backgroundColor: "#739552" },
              lightSquareStyle: { backgroundColor: "#ebecd0" },
              boardStyle: {
                borderRadius: "4px",
                border: "6px solid #2d2013",
              },
            }}
          />
        </div>
      </div>

      {showWinnerDelayed && (
        <div className="fixed inset-0 z-200 overflow-y-auto bg-slate-950/90 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <H2HWinner
              room={room}
              user={user}
              localWinnerId={
                game.isDraw() ||
                game.isStalemate() ||
                game.isThreefoldRepetition() ||
                game.isInsufficientMaterial()
                  ? null
                  : game.turn() === "w"
                    ? room.guest_id
                    : room.host_id
              }
              isSyncing={room.status !== "finished"}
            />
          </div>
        </div>
      )}

      {/* ─── PRE-GAME PREP (Both Players) ─── */}
      {phase === "prep" && !game.isGameOver() && (
        <H2HGamePrep
          gameType="chess"
          stake={room.stake}
          onComplete={() => setPhase("playing")}
        />
      )}

      {/* ── Side Panel ── */}
      <div className="flex flex-col gap-2 md:col-start-2 md:row-start-2 md:row-end-4 md:h-full">
        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-1 md:gap-1.5">
          <div className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 border bg-white dark:bg-black/20 border-black/5 dark:border-white/5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
              ENTRY
            </span>
            <span className="text-[10px] md:text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-0.5">
              {room.stake} <ZASymbol className="w-2.25 h-2.25" />
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 border bg-amber-500 text-slate-950">
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
              PRIZE
            </span>
            <span className="text-[10px] md:text-xs font-black flex items-center gap-1 leading-none">
              {room.stake * 2} <ZASymbol className="w-2.25 h-2.25" />
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 border bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
              MINE
            </span>
            <span className="text-[10px] md:text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
              {myMoveCount}
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 border bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
              OPP
            </span>
            <span className="text-[10px] md:text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
              {oppMoveCount}
            </span>
          </div>
        </div>

        {/* Battle Log */}
        <div className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between gap-1.5 px-3 py-1.5 border-b border-black/5 dark:border-white/5 shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
              <Swords
                size={12}
                className="text-indigo-600 dark:text-indigo-400"
              />
              <span>LOG</span>
            </div>

            {/* Last Move Display (as requested) */}
            {history.length > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                <span className="opacity-50">LAST:</span>
                <span className="tracking-widest uppercase">
                  {history[history.length - 1]?.san}
                </span>
                {inCheck && (
                  <span className="ml-1 text-red-500">CHECK</span>
                )}
              </div>
            )}
          </div>

          {/* Captured Pieces */}
          {(whiteCaptured.length > 0 || blackCaptured.length > 0) && (
            <div className="flex flex-col gap-0.5 px-2 py-1 bg-black/5 dark:bg-black/20 border-b border-black/5 dark:border-white/5 text-[10px] opacity-80 shrink-0">
              <div className="flex flex-col gap-0.5">
                {whiteCaptured.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none shrink-0 w-8">
                      W CP
                    </span>
                    <div className="flex gap-0.5 text-[11px]">
                      {whiteCaptured.map((p, i) => (
                        <span key={i} title={PIECE_NAME[p.toUpperCase()]}>
                          {PIECE_ICON[p]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {blackCaptured.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-black/5 dark:border-white/5 pt-0.5">
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none shrink-0 w-8">
                      B CP
                    </span>
                    <div className="flex gap-0.5 text-slate-700 dark:text-slate-300 text-[11px]">
                      {blackCaptured.map((p, i) => (
                        <span key={i} title={PIECE_NAME[p.toUpperCase()]}>
                          {PIECE_ICON[p]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Log body */}
          <div
            className="p-1 overflow-y-auto flex-1 scrollbar-none max-h-[160px]"
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
                        ${latest ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-black/5 dark:bg-white/5"}`}
                    >
                      {/* Move number */}
                      <span className="w-10 flex flex-col items-center justify-center text-[10px] text-slate-500 font-black shrink-0 bg-black/5 dark:bg-white/5 border-r border-black/5 dark:border-white/5 py-1">
                        <span className="opacity-40 uppercase">MV</span>
                        {index + 1}
                      </span>

                      <div
                        className={`flex-1 flex items-center gap-1 px-1.5 py-1 border-r border-black/5 dark:border-white/5
                        ${latest && !black ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-slate-300"}`}
                      >
                        {wp && (
                          <>
                            <span
                              className="text-[10px] md:text-[11px] shrink-0"
                              title={`Piece: ${wp.pieceChar}`}
                            >
                              {PIECE_ICON[wp.pieceChar] ?? "♙"}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-black uppercase tracking-wide truncate">
                                {white?.san}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase leading-none">
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
                                  className="text-red-500 text-[8px] font-black"
                                  title="Checkmate"
                                >
                                  #
                                </span>
                              )}
                              {wp.isCastle && (
                                <span
                                  className="text-cyan-500 text-[8px]"
                                  title="Castle"
                                >
                                  🏰
                                </span>
                              )}
                              {wp.isPromotion && (
                                <span
                                  className="text-purple-500 text-[8px]"
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
                        ${latest && black ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-500"}`}
                      >
                        {bp ? (
                          <>
                            <span
                              className="text-[10px] md:text-[11px] shrink-0 opacity-80"
                              title={`Piece: ${bp.pieceChar}`}
                            >
                              {PIECE_ICON[bp.pieceChar.toLowerCase()] ?? "♟"}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-black uppercase tracking-wide truncate">
                                {black?.san}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase leading-none">
                                {PIECE_NAME[bp.pieceChar] || "PAWN"}
                              </span>
                            </div>
                            <span className="flex items-center gap-0.5 ml-auto shrink-0">
                              {bp.isCapture && (
                                <span className="text-red-500" title="Capture">
                                  ✕
                                </span>
                              )}
                              {bp.isCheck && !bp.isCheckmate && (
                                <span
                                  className="text-amber-500 text-[8px] font-black"
                                  title="Check"
                                >
                                  +
                                </span>
                              )}
                              {bp.isCheckmate && (
                                <span
                                  className="text-red-500 text-[8px] font-black"
                                  title="Checkmate"
                                >
                                  #
                                </span>
                              )}
                              {bp.isCastle && (
                                <span
                                  className="text-cyan-500 text-[8px]"
                                  title="Castle"
                                >
                                  🏰
                                </span>
                              )}
                              {bp.isPromotion && (
                                <span
                                  className="text-purple-500 text-[8px]"
                                  title="Promotion"
                                >
                                  ⬆
                                </span>
                              )}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-500 italic text-[10px]">
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
        </div>

        {/* Move Info / Game Over Reason Bar (NEW) */}
        <div className="bg-slate-50/5 dark:bg-white/5 border border-slate-300/20 dark:border-white/10 rounded-xl p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Room Status</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-[10px]">
                <div className={`w-1.5 h-1.5 rounded-full ${room.status === 'active' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className="tracking-widest">{room.status?.toUpperCase() || 'UNKNOWN'}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Game Info</span>
              <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100 text-[10px]">
                <Trophy size={10} className="text-amber-500" />
                <span className="tracking-widest">STAKE: {room.stake * 2} ZA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resign */}
        <button
          id="resign-btn"
          onClick={handleResign}
          disabled={isResigning || room.status !== "active"}
          className="w-full py-4 rounded-xl border-2 border-red-500/20 bg-transparent text-red-500 text-[10px] font-black tracking-widest uppercase cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-500/5 active:translate-y-1 transition-all"
        >
          {isResigning ? "Resigning…" : "⚑ Resign"}
        </button>
      </div>
    </div>
  );
};

export default ChessArena;
