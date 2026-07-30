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
  Zap,
  AlertTriangle,
  Maximize,
  Minimize,
  Clock,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import H2HGamePrep from "../H2HGamePrep";
import { makeChessMove, resignChessGame, claimChessTimeout } from "@/api/chess.api";
import { useToast } from "@/context/toast";
import { ZASymbol } from "@/components/currency/ZASymbol";
import type { ChessRoom } from "@/types/chess";
import type { UserProfile } from "@/context/auth";
import H2HWinner from "../H2HWinner";
import ResignConfirmationModal from "./ResignConfirmationModal";

interface ChessArenaProps {
  room: ChessRoom;
  user: UserProfile | null;
  /** Where the post-game "back" buttons should go. Defaults to /h2h — pass
   * the tournament URL when this arena is rendered inside a tournament match
   * so players land back on their bracket instead of the generic H2H lobby. */
  backTo?: string;
  backLabel?: string;
  /** Set when this arena is rendered inside a tournament match. Tournament
   * matches have no per-match stake and already show their own rules modal
   * on the tournament page, so the H2H "Stake Committed" / "Battle
   * Conditions" pre-game screens are skipped entirely — those stay H2H-only. */
  isTournament?: boolean;
  /** Optional override for the post-game result screen. When provided, this
   * is rendered instead of the default H2HWinner card — used by the
   * tournament match page to show a richer result screen (points earned,
   * next-match / standings buttons, game analytics) instead of the generic
   * stake-based H2H winner screen. */
  renderWinner?: (ctx: {
    finalWinnerId: string | null;
    isDraw: boolean;
    isSyncing: boolean;
    resultReason: "checkmate" | "resignation" | "timeout" | "stalemate" | "insufficient_material" | "threefold_repetition" | "draw" | "unknown";
    moveCount: number;
    whiteTimeLeft: number;
    blackTimeLeft: number;
    /** Dismiss the result screen and stay on the board (e.g. to review the
     * final position) without being forced through a navigation button. */
    onClose: () => void;
  }) => ReactElement;
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

const ChessArena = ({ room, user, backTo = "/h2h", backLabel = "H2H ZONE", renderWinner, isTournament = false }: ChessArenaProps) => {
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
  const [showResignModal, setShowResignModal] = useState(false);
  const [resignationWinnerId, setResignationWinnerId] = useState<string | null>(null);

  // ── Timing State (10+5 Format) ──────────────────────────────────────────
  const [whiteTime, setWhiteTime] = useState(() => room.board_state?.white_time ?? 600);
  const [blackTime, setBlackTime] = useState(() => room.board_state?.black_time ?? 600);
  const [timeoutWinnerId, setTimeoutWinnerId] = useState<string | null>(null);
  // Guards against firing the claim-timeout request more than once per game
  const timeoutClaimSentRef = useRef(false);

  // Sync timers from authoritative server changes
  useEffect(() => {
    if (room.board_state?.white_time !== undefined) {
      setWhiteTime(room.board_state.white_time);
    }
    if (room.board_state?.black_time !== undefined) {
      setBlackTime(room.board_state.black_time);
    }
  }, [room.board_state?.white_time, room.board_state?.black_time]);

  // ── Promotion State ────────────────────────────────────────────────────────
  const [promotionMove, setPromotionMove] = useState<{
    from: string;
    to: string;
  } | null>(null);

  // Track the last move we already applied so we don't re-apply it
  const lastAppliedMoveRef = useRef<string | null>(null);
  // Track whether we are waiting for the server to confirm our move
  const pendingMoveRef = useRef(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [phase, setPhase] = useState<"prep" | "playing">(isTournament ? "playing" : "prep");

  // ── Battle Sentinel States (Network & Inactivity) ──────────────────────────
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [inactivityCounter, setInactivityCounter] = useState(0);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const INACTIVITY_LIMIT = 180; // 3 minutes total
  const WARNING_THRESHOLD = 120; // Warn after 2 minutes

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  const serverSaysMyTurn = room.current_turn === user?.id;
  const isYourTurn = serverSaysMyTurn && !pendingMoveRef.current;

  const confirmResign = useCallback(async () => {
    setIsResigning(true);
    try {
      await resignChessGame(room.id);
      toast.success("You resigned the game.");
      const winnerId: string =
        user && room.host_id === user.id
          ? room.guest_id || "00000000-0000-0000-0000-000000000000"
          : room.host_id || "HOST_WIN";
      setResignationWinnerId(winnerId);
      
      setShowResignModal(false);
      
      // Delay slightly then show winner screen (Resigner loses)
      setTimeout(() => {
        setShowWinnerDelayed(true);
      }, 2000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to resign");
    } finally {
      setIsResigning(false);
    }
  }, [room, user, toast]);

  // ── Network Monitoring ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online! Resyncing...");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Network disconnected! Check your connection.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  // ── Inactivity Detection ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing" || room.status !== "active" || game.isGameOver() || !isYourTurn) {
      setInactivityCounter(0);
      setShowInactivityWarning(false);
      return;
    }

    const interval = setInterval(() => {
      setInactivityCounter((prev) => {
        const next = prev + 1;
        if (next === WARNING_THRESHOLD) setShowInactivityWarning(true);
        if (next >= INACTIVITY_LIMIT) {
          clearInterval(interval);
          confirmResign(); // Auto-resign if inactive
          toast.error("Match forfeited due to inactivity.");
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, room.status, game, isYourTurn, confirmResign, toast]);
  
  // ── Navigation Blocking (Back Button) ───────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing" || room.status !== "active" || game.isGameOver()) return;

    // Push an extra entry into history so we can intercept the back button
    // This allows us to catch the back button before the user actually leaves
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // User hit back button. 
      // 1. Put the state back so we stay on this page
      window.history.pushState(null, "", window.location.href);
      // 2. Show the modal
      setShowResignModal(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      // If we are leaving because the game is over, we don't need to do anything special here
      // but if the component unmounts, we should clean up.
    };
  }, [phase, room.status, game]);

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
    // block: "nearest" ensures only the log container scrolls without jumping the main window
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
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

  // ── Show Winner Screen once the game ends ──────────────────────────────────
  // Previously this waited 10s then showed a small "Game Over — Acknowledge &
  // Proceed" card that the player had to click through before the real,
  // persistent result screen appeared. That extra step is what made the
  // result look like it "disappeared" — players saw the small card, then
  // (if they didn't click through in time / looked away) nothing. Now the
  // one persistent result screen (with its own Next Match / Table / Bracket
  // buttons) shows directly, after a short pause so the final move finishes
  // animating on the board. It never auto-closes — the player leaves it via
  // its own buttons, whenever they choose.
  useEffect(() => {
    if (game.isGameOver() && !showWinnerDelayed) {
      const timeoutId = setTimeout(() => {
        setShowWinnerDelayed(true);
      }, 1200);
      return () => clearTimeout(timeoutId);
    }
  }, [game, showWinnerDelayed]);

  // Prevent body scrolling when winner modal is open
  useEffect(() => {
    if (showWinnerDelayed) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [showWinnerDelayed]);

  // ── Sync Winner Screen for Opponent when Resignation/Timeout occurs ────────
  useEffect(() => {
    if (room.status === "finished" && !showWinnerDelayed) {
      // If the room status is finished but we haven't shown the winner screen
      // yet (which happens for the player who didn't trigger the game-over
      // themselves), show it now! It stays up until the player navigates
      // away using one of its own buttons — nothing here ever hides it again.
      const timer = setTimeout(() => {
        setShowWinnerDelayed(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [room.status, showWinnerDelayed]);

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

  // ── Timer Logic ────────────────────────────────────────────────────────────
  // Note: this always reflects the authoritative server clock (based on
  // turn_started_at), even before the local player has clicked through the
  // H2H "Stake Committed" / "Battle Conditions" screens — the server clock
  // starts the moment the room goes active, so freezing this display during
  // "prep" made it look broken (frozen, then suddenly jumping once dismissed).
  useEffect(() => {
    if (room.status !== "active" || game.isGameOver() || timeoutWinnerId) return;

    const handleTimeout = (winnerId: string, whoRanOut: "White" | "Black") => {
      setTimeoutWinnerId(winnerId);
      toast.error(`${whoRanOut} ran out of time!`);
      // Persist this server-side — otherwise the room stays "active" forever,
      // since only the timed-out player's own move attempt would normally
      // trigger the backend's timeout check, and they have no reason to
      // move. Either player can safely claim this; the server re-verifies
      // the clock before finishing the game.
      if (!timeoutClaimSentRef.current) {
        timeoutClaimSentRef.current = true;
        claimChessTimeout(room.id).catch(() => {
          // Opponent's client may have already claimed it, or the room
          // already finished via another path — safe to ignore.
        });
      }
      // Show the result screen right away rather than waiting for the next
      // poll/realtime update to confirm room.status === "finished" —
      // mirrors the resignation flow's immediate feedback.
      setTimeout(() => setShowWinnerDelayed(true), 1500);
    };

    const interval = setInterval(() => {
      const turn = game.turn();
      const turnStartedAt = room.board_state?.turn_started_at;
      if (!turnStartedAt) return;

      const elapsedMs = Date.now() - new Date(turnStartedAt).getTime();
      const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));

      if (turn === "w") {
        const baseTime = room.board_state?.white_time ?? 600;
        const currentRemaining = Math.max(0, baseTime - elapsedSeconds);
        setWhiteTime(currentRemaining);
        if (currentRemaining <= 0) {
          clearInterval(interval);
          handleTimeout(room.guest_id || "GUEST_WIN", "White");
        }
      } else {
        const baseTime = room.board_state?.black_time ?? 600;
        const currentRemaining = Math.max(0, baseTime - elapsedSeconds);
        setBlackTime(currentRemaining);
        if (currentRemaining <= 0) {
          clearInterval(interval);
          handleTimeout(room.host_id || "HOST_WIN", "Black");
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [game, room.status, room.id, room.board_state?.white_time, room.board_state?.black_time, room.board_state?.turn_started_at, room.host_id, room.guest_id, timeoutWinnerId, toast]);

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

          // Apply +5s increment to the person who just moved (the opponent) from database state
          if (room.board_state?.white_time !== undefined) {
            setWhiteTime(room.board_state.white_time);
          }
          if (room.board_state?.black_time !== undefined) {
            setBlackTime(room.board_state.black_time);
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

  // Spectators (anyone who isn't the host or guest — e.g. an anonymous
  // visitor watching a live tournament match) default to White's
  // perspective, the conventional neutral view, rather than always
  // flipping to Black just because they don't match host_id.
  const isParticipant = room.host_id === user?.id || room.guest_id === user?.id;
  const boardOrientation = room.guest_id === user?.id ? "black" : "white";

  // Board coordinates rendered ourselves (see below) instead of relying on
  // react-chessboard's built-in showBoardNotation, which was inconsistently
  // clipping/hiding the file (a–h) letters while the rank (1–8) numbers
  // stayed visible. Order flips with orientation, same as a real board.
  const rankLabels = boardOrientation === "white" ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const fileLabels = boardOrientation === "white" ? ["a", "b", "c", "d", "e", "f", "g", "h"] : ["h", "g", "f", "e", "d", "c", "b", "a"];
  const oppUsername =
    user?.id === room.host_id
      ? room.guest_id
        ? room.guest?.username || "GUEST"
        : (room.board_state?.bot?.username || "COMPUTER")
      : room.host?.username || "HOST";
  // For spectators, oppUsername above doesn't mean anything (it's relative
  // to "you", and a spectator isn't a participant) — this instead names
  // whoever's turn it actually is, for the "Live — X's move" banner.
  const currentMoverUsername =
    room.current_turn === room.host_id
      ? room.host?.username || "White"
      : room.guest?.username || "Black";

  const attemptMove = useCallback(
    (sourceSquare: string, targetSquare: string, promotion: string = "q"): boolean => {
      if (!isYourTurn) {
        toast.error("It's not your turn!");
        return false;
      }

      // Check for promotion if not already handling it
      const gameCopyForCheck = new Chess(game.fen());
      const moveOptions = gameCopyForCheck.moves({ square: sourceSquare as Square, verbose: true });
      const isPromotionMove = moveOptions.some(m => m.to === targetSquare && m.flags.includes('p'));

      if (isPromotionMove && !promotionMove && promotion === "q") {
        setPromotionMove({ from: sourceSquare, to: targetSquare });
        return true;
      }

      try {
        const gameCopy = new Chess(game.fen());
        const move = gameCopy.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: promotion,
        });
        if (!move) return false;

        setGame(gameCopy);
        setSelectedSquare(null);
        setLegalMoveSquares([]);
        setPromotionMove(null);
        pendingMoveRef.current = true;

        // Keep client side optimistic time values ready before server responds
          if (game.turn() === "w") {
            setWhiteTime(prev => prev + 5);
          } else {
            setBlackTime(prev => prev + 5);
          }

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

        const moveKey = `${sourceSquare}${targetSquare}${promotion}`;
        lastAppliedMoveRef.current = moveKey;

        makeChessMove(room.id, {
          from: sourceSquare,
          to: targetSquare,
          promotion: promotion,
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
    [game, isYourTurn, room.id, toast, oppUsername, promotionMove],
  );

  // ── Click-to-move
  const handleSquareClick = useCallback(
    (square: string) => {
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
    setShowResignModal(true);
  };

  const cancelResign = () => {
    setShowResignModal(false);
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

  // ── Helper: Format Time ────────────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isWhiteLowTime = whiteTime < 30;
  const isBlackLowTime = blackTime < 30;

  // ── Derived values ─────────────────────────────────────────────────────────
  const hostIsWhite = room.host_id === user?.id;
  const myTurn = isYourTurn;
  const oppTurn = !myTurn && room.status === "active";

  // ── Game-over summary (winner + reason + move count) ───────────────────────
  // Computed once here so both the default H2HWinner screen and any caller-
  // supplied `renderWinner` override (e.g. the tournament result screen) see
  // exactly the same result.
  const finalWinnerId: string | null =
    room.winner_id ||
    resignationWinnerId ||
    timeoutWinnerId ||
    (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()
      ? null
      : game.turn() === "w"
        ? room.guest_id || "00000000-0000-0000-0000-000000000000"
        : room.host_id);
  const isDraw = !finalWinnerId;
  const resultReason: "checkmate" | "resignation" | "timeout" | "stalemate" | "insufficient_material" | "threefold_repetition" | "draw" | "unknown" =
    resignationWinnerId ? "resignation"
    : timeoutWinnerId ? "timeout"
    : game.isCheckmate() ? "checkmate"
    : game.isStalemate() ? "stalemate"
    : game.isInsufficientMaterial() ? "insufficient_material"
    : game.isThreefoldRepetition() ? "threefold_repetition"
    : isDraw ? "draw"
    : "unknown";
  const moveCount = game.history().length;

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
    <div className="flex flex-col gap-1.5 w-full max-w-full mx-auto p-2 box-border md:grid md:grid-cols-[1fr_360px] md:grid-rows-[auto_auto_auto_auto_1fr] md:gap-4 md:p-4 lg:p-6 h-screen bg-slate-50 dark:bg-slate-950 overflow-y-auto" style={{ overscrollBehavior: "contain" }}>
      {/* ── Network Offline Overlay ── */}
      {!isOnline && (
        <div className="fixed inset-0 z-500 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <div className="text-center space-y-4 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-red-500/50 shadow-2xl max-w-sm">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-red-500 animate-pulse" size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Connection Lost</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
              We've lost your signal. Reconnecting... <br/>
              Leaving now will count as a forfeit.
            </p>
            <div className="pt-4">
              <div className="h-1 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="h-full w-1/3 bg-red-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Inactivity Warning Overlay ── */}
      <AnimatePresence>
        {showInactivityWarning && isYourTurn && isOnline && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-400 w-[90%] max-w-md"
          >
            <div className="bg-amber-500 text-slate-950 p-6 rounded-3xl shadow-2xl border-4 border-slate-950 flex flex-col items-center text-center">
              <Clock size={40} className="mb-2 animate-bounce" />
              <h4 className="font-black text-xl uppercase tracking-tighter italic">Are you still there?</h4>
              <p className="font-bold text-[10px] uppercase tracking-widest opacity-80 mt-1">
                Move now or you will forfeit in {INACTIVITY_LIMIT - inactivityCounter}s
              </p>
              <button 
                onClick={() => {
                  setInactivityCounter(0);
                  setShowInactivityWarning(false);
                }}
                className="mt-4 px-8 py-3 bg-slate-950 text-white rounded-xl font-black uppercase text-xs tracking-widest active:scale-95 transition-transform"
              >
                I'M BACK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showResignModal && (
        <ResignConfirmationModal
          stake={room.stake}
          isLoading={isResigning}
          onCancel={cancelResign}
          onConfirm={confirmResign}
        />
      )}
      {/* ── Fullscreen Toggle (NEW) ── */}
      <div className="flex justify-end w-full md:col-span-2 md:row-start-1">
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 md:hover:bg-slate-200 dark:md:hover:bg-white/10 text-slate-600 dark:text-slate-400"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>

      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-2 py-2 md:col-span-2 md:row-start-2 md:px-5 md:py-3 box-border">
        {/* Host chip */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-2 relative flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0 md:w-auto">
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
          </div>

          {/* Timer Display Host */}
          <motion.div 
            animate={isWhiteLowTime && ((hostIsWhite && myTurn) || (!hostIsWhite && oppTurn)) ? { scale: [1, 1.05, 1], color: ["#ef4444", "#ffffff", "#ef4444"] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            className={`md:ml-1 px-2 py-1 rounded-lg font-black tabular-nums text-[10px] md:text-sm flex items-center gap-1.5 border whitespace-nowrap
              ${(hostIsWhite && myTurn) || (!hostIsWhite && oppTurn) 
                ? isWhiteLowTime 
                  ? "bg-red-500/20 border-red-500 text-red-500" 
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                : "bg-slate-100 dark:bg-white/5 border-transparent text-slate-500"
              }`}
          >
            <Clock size={12} className={((hostIsWhite && myTurn) || (!hostIsWhite && oppTurn)) ? "animate-pulse" : ""} />
            {formatTime(whiteTime)}
          </motion.div>
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
        <div className="flex flex-col md:flex-row items-end md:items-center justify-end gap-1 md:gap-2 relative flex-1 min-w-0 text-right">
          <div className="flex items-center justify-end gap-2 min-w-0 md:w-auto">
            <div className="flex flex-col items-end min-w-0 overflow-hidden">
              <span
                className={`font-black text-[10px] md:text-xs truncate uppercase tracking-wide leading-tight md:text-[15px] ${(!hostIsWhite && myTurn) || (hostIsWhite && oppTurn) ? "text-indigo-600 dark:text-indigo-500" : "text-slate-900 dark:text-slate-100"}`}
              >
                {room.guest?.username ||
                  (room.guest_id ? "Waiting..." : (room.board_state?.bot?.username || "COMPUTER"))}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                ⬛ · {room.guest_id === user?.id ? "YOU" : "RIVAL"}
              </span>
            </div>

            <div
              className={`shrink-0 w-8.5 h-8.5 rounded-lg flex items-center justify-center font-black text-[10px] md:text-sm text-white border bg-slate-900 md:w-10.5 md:h-10.5 lg:w-11.5 lg:h-11.5 overflow-hidden
              ${(!hostIsWhite && myTurn) || (hostIsWhite && oppTurn) ? "border-indigo-500" : "border-slate-200 dark:border-white/10"}`}
            >
              {room.guest?.avatar_url || room.board_state?.bot?.avatar_url ? (
                <img
                  src={room.guest?.avatar_url || room.board_state?.bot?.avatar_url}
                  className="w-full h-full object-cover"
                  alt=""
                  loading="lazy"
                />
              ) : (
                room.guest?.username?.[0]?.toUpperCase() ||
                (room.guest_id ? "?" : (room.board_state?.bot?.username?.[0] || "C"))
              )}
            </div>
          </div>

          {/* Timer Display Guest */}
          <motion.div 
            animate={isBlackLowTime && ((!hostIsWhite && myTurn) || (hostIsWhite && oppTurn)) ? { scale: [1, 1.05, 1], color: ["#ef4444", "#ffffff", "#ef4444"] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
            className={`md:mr-1 px-2 py-1 rounded-lg font-black tabular-nums text-[10px] md:text-sm flex items-center gap-1.5 border whitespace-nowrap
              ${(!hostIsWhite && myTurn) || (hostIsWhite && oppTurn) 
                ? isBlackLowTime 
                  ? "bg-red-500/20 border-red-500 text-red-500" 
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                : "bg-slate-100 dark:bg-white/5 border-transparent text-slate-500"
              }`}
          >
            {formatTime(blackTime)}
            <Clock size={12} className={((!hostIsWhite && myTurn) || (hostIsWhite && oppTurn)) ? "animate-pulse" : ""} />
          </motion.div>

          {((!hostIsWhite && myTurn) || (hostIsWhite && oppTurn)) && (
            <span className="absolute top-0 left-0 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </div>
      </div>

      {/* ── Pawn Promotion Overlay (Premium) ── */}
      <AnimatePresence>
        {promotionMove && (
          <div className="fixed inset-0 z-300 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-slate-900 dark:text-white">♙</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Pawn Promotion</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Choose a piece to empower your pawn</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'q', name: 'Queen', icon: '♛', color: 'text-amber-500' },
                  { id: 'n', name: 'Knight', icon: '♞', color: 'text-indigo-500' },
                  { id: 'r', name: 'Rook', icon: '♜', color: 'text-slate-500' },
                  { id: 'b', name: 'Bishop', icon: '♝', color: 'text-emerald-500' },
                ].map((piece) => (
                  <button
                    key={piece.id}
                    onClick={() => attemptMove(promotionMove.from, promotionMove.to, piece.id)}
                    className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-transparent hover:border-indigo-500/50 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
                  >
                    <div className={`text-4xl mb-1 group-hover:scale-110 transition-transform ${piece.color}`}>
                      {piece.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {piece.name}
                    </span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setPromotionMove(null)}
                className="mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                Cancel Move
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Turn / Check Banner ── */}
      {inCheck ? (
        myTurn ? (
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-extrabold tracking-widest uppercase bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 md:col-start-1 md:row-start-3 md:text-xs">
            <AlertTriangle size={14} className="shrink-0" />
            <span>⚠️ YOU ARE IN CHECK — Protect your king!</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-extrabold tracking-widest uppercase bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 md:col-start-1 md:row-start-3 md:text-xs text-center leading-none">
            <AlertTriangle size={14} className="shrink-0" />
            <span>🎯 {oppUsername || "Rival"} IS IN CHECK — FINISH THEM!</span>
          </div>
        )
      ) : game.isCheckmate() ? (
        <div className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-extrabold tracking-widest uppercase bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 md:col-start-1 md:row-start-3 md:text-xs">
          <Trophy size={14} className="shrink-0" />
          <span>CHECKMATE — Game Over</span>
        </div>
      ) : (
        <div
          className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold tracking-widest uppercase md:col-start-1 md:row-start-3 md:text-xs
          ${
            myTurn
              ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
              : "bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-slate-500"
          }`}
        >
          {myTurn ? (
            <>
              <Zap size={12} className="shrink-0 animate-bounce" />
              <span>Your turn — make your move</span>
            </>
          ) : isParticipant ? (
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
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span className="truncate">
                Live — {currentMoverUsername}'s move
              </span>
            </>
          )}
        </div>
      )}


      {/* ── Context Info Banner ── */}
      {/* Fixed-height wrapper: this cell always reserves the same amount of
          grid space (md:row-start-4) whether or not a message is showing.
          Previously this row was "auto" sized, so it collapsed to 0px with
          no message and expanded once one appeared (check/checkmate/draw/
          timeout) — on a fixed h-screen grid, that growth ate directly into
          the board's row (1fr), which is why the board visibly shrank the
          moment checkmate happened. */}
      <div className="md:col-start-1 md:row-start-4 md:h-7 flex items-center justify-center">
        {(() => {
          if (game.isCheckmate()) {
            return (
              <div className="text-[10px] text-center md:text-sm text-amber-500 font-bold mt-1">
                Checkmate: The King is under attack and has no legal moves to escape.
              </div>
            );
          }
          if (game.isStalemate()) {
            return (
              <div className="text-[10px] text-center md:text-sm text-slate-500 font-bold mt-1">
                Stalemate: The player to move has no legal moves and is not in check. The game is a draw.
              </div>
            );
          }
          if (game.isThreefoldRepetition()) {
            return (
              <div className="text-[10px] text-center md:text-sm text-slate-500 font-bold mt-1">
                Draw: Threefold repetition. The exact same board position has occurred three times.
              </div>
            );
          }
          if (game.isInsufficientMaterial()) {
            return (
              <div className="text-[10px] text-center md:text-sm text-slate-500 font-bold mt-1">
                Draw: Insufficient material to force a checkmate.
              </div>
            );
          }
          if (game.isDraw()) {
            return (
              <div className="text-[10px] text-center md:text-sm text-slate-500 font-bold mt-1">
                Draw: The game has ended in a tie.
              </div>
            );
          }
          if (timeoutWinnerId) {
            return (
              <div className="text-[10px] text-center md:text-sm text-red-500 font-bold mt-1">
                Time Out: {timeoutWinnerId === room.host_id ? "White" : "Black"} ran out of time!
              </div>
            );
          }
          if (inCheck) {
            return (
              <div className="text-[10px] text-center md:text-sm text-red-500 font-bold mt-1">
                Check: The King is under immediate attack! Move it, block the attack, or capture the attacking piece.
              </div>
            );
          }
          return null;
        })()}
      </div>

      {/* ── Chess Board ── */}
      <div className="w-full max-w-[75vh] mx-auto md:col-start-1 md:row-start-5 flex gap-1">
        {/* Rank numbers gutter (1–8) — reserved space, never overlaps the board */}
        <div className="flex flex-col shrink-0 w-4 md:w-5">
          {rankLabels.map((r) => (
            <span
              key={r}
              className="flex-1 flex items-center justify-center text-[9px] md:text-[11px] font-bold text-slate-400 dark:text-slate-500 select-none"
            >
              {r}
            </span>
          ))}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div
            className={`relative w-full aspect-square rounded-xl overflow-hidden bg-white dark:bg-slate-900 border-4
            ${inCheck && myTurn ? "border-red-500/60" : "border-slate-800 dark:border-slate-700"}`}
            style={{ touchAction: "none" }}
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
                position={game.fen()}
                boardOrientation={boardOrientation as "white" | "black"}
                arePiecesDraggable={isYourTurn}
                animationDuration={300}
                showBoardNotation={false}
                onPieceDrop={(sourceSquare, targetSquare) => {
                  if (!targetSquare) return false;
                  return attemptMove(sourceSquare, targetSquare);
                }}
                onSquareClick={handleSquareClick}
                customSquareStyles={squareStyles}
                customPieces={customPieces}
                customDarkSquareStyle={{ backgroundColor: "#4a2d6b" }}
                customLightSquareStyle={{ backgroundColor: "#c9a96e" }}
                customBoardStyle={{
                  borderRadius: "8px",
                  border: "6px solid #1a0a2e",
                  boxSizing: "border-box",
                  boxShadow: "0 0 32px rgba(124,58,237,0.4), 0 8px 32px rgba(0,0,0,0.6)",
                }}
              />
            </div>

            {/* Subtle centered Playza brand watermark — full logo (monogram +
                wordmark) so it reads clearly as Playza rather than an
                unlabelled mark, at low opacity so it never competes with the
                squares, coordinates, or pieces for visibility. Purely
                decorative, so it's excluded from interaction and screen readers. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none opacity-[0.08] dark:opacity-[0.1]"
            >
              <img
                src="/logo/full_logo.svg"
                alt=""
                className="w-[30%] h-[30%] object-contain grayscale"
                draggable={false}
              />
            </div>
          </div>

          {/* File letters gutter (a–h) — reserved space, never overlaps the board */}
          <div className="flex shrink-0 h-4 md:h-5">
            {fileLabels.map((f) => (
              <span
                key={f}
                className="flex-1 flex items-center justify-center text-[9px] md:text-[11px] font-bold text-slate-400 dark:text-slate-500 select-none uppercase"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {showWinnerDelayed && (
        <div className="fixed inset-0 z-200 overflow-y-auto bg-slate-950/90 flex items-start justify-center p-2 py-6 md:items-center">
          {renderWinner ? (
            renderWinner({
              finalWinnerId,
              isDraw,
              isSyncing: room.status !== "finished",
              resultReason,
              moveCount,
              whiteTimeLeft: whiteTime,
              blackTimeLeft: blackTime,
              onClose: () => setShowWinnerDelayed(false),
            })
          ) : (
            <div className="relative w-full max-w-2xl my-auto bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-white/10">
              <button
                onClick={() => setShowWinnerDelayed(false)}
                aria-label="Close"
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 text-slate-500 dark:text-slate-300 hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
              <H2HWinner
                room={room}
                user={user}
                localWinnerId={finalWinnerId}
                isSyncing={room.status !== "finished"}
                backTo={backTo}
                backLabel={backLabel}
              />
            </div>
          )}
        </div>
      )}

      {/* ─── PRE-GAME PREP (Both Players) ─── */}
      {/* H2H-only: stake-committed + battle-conditions screens. Tournament
          matches skip this entirely (isTournament starts phase at "playing"). */}
      {!isTournament && phase === "prep" && !game.isGameOver() && (
        <H2HGamePrep
          gameType="chess"
          stake={room.stake}
          onComplete={() => setPhase("playing")}
        />
      )}

      {/* ── Side Panel ── */}
      <div className="flex flex-col gap-2 md:col-start-2 md:row-start-3 md:row-span-3 md:h-full">
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
            className="p-1 overflow-y-auto flex-1 scrollbar-none max-h-40"
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

        {/* Resign — only shown to the two actual players. Spectators get a
            simple "watching" indicator instead of a button that would just
            error out for them (the backend already rejects a non-participant
            resign, but hiding it here is a much cleaner experience). */}
        {isParticipant ? (
          <button
            id="resign-btn"
            onClick={handleResign}
            disabled={isResigning || room.status !== "active"}
            className="w-full py-4 rounded-xl border-2 border-red-500/20 bg-transparent text-red-500 text-[10px] font-black tracking-widest uppercase cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-500/5 active:translate-y-1 transition-all"
          >
            {isResigning ? "Resigning…" : "⚑ Resign"}
          </button>
        ) : (
          <div className="w-full py-4 rounded-xl border-2 border-foreground/10 bg-transparent text-foreground/40 text-[10px] font-black tracking-widest uppercase text-center flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/30" /> Spectating
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessArena;