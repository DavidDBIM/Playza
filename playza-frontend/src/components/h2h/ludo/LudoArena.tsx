import React, { useState, useEffect } from "react";
import { Maximize, Minimize, Trophy, Zap, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/toast";
import type { UserProfile } from "@/context/auth";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { useLudoGame } from "./useLudoGame";
import LudoBoard from "./LudoBoard";
import H2HWinner from "../H2HWinner";
import ResignConfirmationModal from "../chess/ResignConfirmationModal";
import type { ChessRoom } from "@/types/chess";
import { resignLudoGame } from "@/api/ludo.api";
import { AlertTriangle } from "lucide-react";

interface LudoArenaProps {
  room: ChessRoom;
  user: UserProfile | null;
}

// Visual Dice Component
const DiceFace = ({ value }: { value: number }) => {
  const dots = {
    1: ["col-start-2 row-start-2"],
    2: ["col-start-1 row-start-1", "col-start-3 row-start-3"],
    3: ["col-start-1 row-start-1", "col-start-2 row-start-2", "col-start-3 row-start-3"],
    4: ["col-start-1 row-start-1", "col-start-3 row-start-1", "col-start-1 row-start-3", "col-start-3 row-start-3"],
    5: ["col-start-1 row-start-1", "col-start-3 row-start-1", "col-start-2 row-start-2", "col-start-1 row-start-3", "col-start-3 row-start-3"],
    6: ["col-start-1 row-start-1", "col-start-1 row-start-2", "col-start-1 row-start-3", "col-start-3 row-start-1", "col-start-3 row-start-2", "col-start-3 row-start-3"],
  }[value] || [];

  return (
    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-[inset_0_-4px_0_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.2)] border border-slate-200 grid grid-cols-3 grid-rows-3 p-2 gap-1 place-items-center">
      {dots.map((pos, i) => (
        <div key={i} className={`w-3 h-3 md:w-4 md:h-4 bg-slate-800 rounded-full ${pos}`} />
      ))}
    </div>
  );
};

const LudoArena: React.FC<LudoArenaProps> = ({ room, user }) => {
  const toast = useToast();
  const isHost = room.host_id === user?.id;
  const isBotRoom = room.guest_id === null; 

  const { gameState, executeRoll, movePiece, myColors, isMyTurn, animatedDice, isRolling } = useLudoGame(isHost, isBotRoom);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [isResigning, setIsResigning] = useState(false);

  // ── Battle Sentinel States (Network & Inactivity) ──────────────────────────
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [inactivityCounter, setInactivityCounter] = useState(0);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const INACTIVITY_LIMIT = 180; // 3 minutes total
  const WARNING_THRESHOLD = 120; // Warn after 2 minutes

  const confirmResign = async () => {
    setIsResigning(true);
    try {
      await resignLudoGame(room.id);
      toast.success("You resigned the game!");
      setShowResignModal(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to resign");
    } finally {
      setIsResigning(false);
    }
  };

  // ── Network Monitoring ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online! Syncing game state...");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Network disconnected! Stay on this page.");
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
    // If it's your turn (and you haven't rolled or you have pieces to move)
    // For simplicity, we check isMyTurn which covers the basic turn cycle
    if (!isMyTurn || gameState.winner) {
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
          confirmResign(); 
          toast.error("Match forfeited due to inactivity.");
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isMyTurn, gameState.winner, toast]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleResign = () => setShowResignModal(true);

  const oppUsername = isHost
    ? (room.guest?.username || "ROBOT")
    : (room.host?.username || "HOST");

  // Determine current turn name
  const turnName = gameState.turn.toUpperCase();
  const turnTextColor = { red: "text-red-500", green: "text-emerald-500", yellow: "text-yellow-500", blue: "text-blue-500" }[gameState.turn];
  const turnBadgeColor = { red: "bg-red-500", green: "bg-emerald-400", yellow: "bg-yellow-400", blue: "bg-blue-400" }[gameState.turn];

  return (
    <div className="flex flex-col gap-1 w-full max-w-full mx-auto p-1 box-border md:p-6 min-h-screen bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-1 py-1.5 md:px-5 md:py-3 shadow-sm relative z-20">
        <button
          onClick={toggleFullscreen}
          className="absolute -top-10 right-2 p-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-600 hidden md:flex items-center justify-center shadow-md hover:bg-slate-300"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex gap-1 relative">
            <div className="w-8 h-8 md:w-11 md:h-11 rounded-lg bg-red-500 flex items-center justify-center font-black text-white text-xs z-10 border-2 border-white dark:border-slate-800">
              {room.host?.username?.[0] || "H"}
            </div>
          </div>
          <div className="min-w-0 overflow-hidden">
            <span className="font-black text-[10px] md:text-sm text-slate-900 dark:text-white uppercase truncate">
              {room.host?.username || "Host"}
            </span>
            <div className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase truncate border-b-2 border-red-500 inline-block">
              Red & Yellow ({isHost ? "YOU" : "RIVAL"})
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center shrink-0 px-2 flex-none">
          <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2 py-0.5 text-indigo-500 font-black text-[10px] tracking-widest uppercase mb-1">
            <Zap size={10} /> VS <Zap size={10} />
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 md:hidden bg-slate-100 rounded-md text-slate-500 mb-1 active:scale-95"
          >
            {isFullscreen ? <Minimize size={12} /> : <Maximize size={12} />}
          </button>
          <div className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md px-1.5 py-0.5 text-amber-500 font-black text-[10px]">
            <Trophy size={9} /> {room.stake * 2}{" "}
            <ZASymbol className="w-2.5 h-2.5" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 min-w-0 flex-1 text-right">
          <div className="min-w-0 overflow-hidden">
            <span className="font-black text-[10px] md:text-sm text-slate-900 dark:text-white uppercase truncate">
              {oppUsername}
            </span>
            <div className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase truncate border-b-2 border-emerald-400 inline-block">
              Green & Blue ({!isHost ? "YOU" : "RIVAL"})
            </div>
          </div>
          <div className="flex gap-1 relative">
            <div className="w-8 h-8 md:w-11 md:h-11 rounded-lg bg-emerald-400 flex items-center justify-center font-black text-white text-xs z-10 border-2 border-white dark:border-slate-800">
              {room.guest?.username?.[0] || "R"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── flex-col on mobile, flex-row on md */}
      <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] flex-1 gap-2 md:gap-6 items-start mt-2 md:mt-4">
        {/* Mobile controls (Turn + Dice side by side on mobile) */}
        <div className="flex md:flex-col items-stretch gap-2 w-full md:w-64">
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-3 md:p-6 rounded-2xl flex flex-col justify-center shadow-lg relative overflow-hidden">
            <h3 className="uppercase font-black text-slate-400 text-[10px] md:text-xs tracking-widest mb-1 md:mb-3">
              Current Turn
            </h3>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${turnBadgeColor} animate-pulse`}
              />
              <div
                className={`text-sm md:text-2xl font-black uppercase ${turnTextColor}`}
              >
                {turnName}
              </div>
            </div>
            {isMyTurn && (
              <div className="absolute right-0 bottom-0 bg-indigo-500 text-white font-black uppercase text-[9px] md:text-xs px-2 md:px-4 py-1 rounded-tl-xl animate-pulse">
                Your Turn
              </div>
            )}
          </div>

          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 md:p-8 rounded-2xl flex flex-col items-center justify-center shadow-lg cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={executeRoll}
            style={{
              opacity:
                !isMyTurn || gameState.hasRolled || gameState.winner ? 0.6 : 1,
              pointerEvents:
                !isMyTurn || gameState.hasRolled || gameState.winner
                  ? "none"
                  : "auto",
            }}
          >
            <h3 className="uppercase font-black text-slate-400 text-[9px] md:text-xs tracking-widest mb-2 md:mb-6">
              Tap to Roll
            </h3>
            <motion.div
              animate={
                isRolling
                  ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{ duration: 0.3, repeat: isRolling ? Infinity : 0 }}
            >
              <DiceFace
                value={isRolling ? animatedDice : gameState.diceValue || 1}
              />
            </motion.div>
            {gameState.hasRolled &&
              isMyTurn &&
              !gameState.winner &&
              !isRolling && (
                <div className="mt-2 md:mt-6 text-[9px] md:text-xs font-black text-indigo-500 uppercase">
                  Move a piece
                </div>
              )}
          </div>

          <button
            onClick={handleResign}
            className="hidden md:block w-full px-4 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-black uppercase transition-colors text-sm shadow-md"
          >
            Resign Game
          </button>
        </div>

        {/* Center: Ludo Board */}
        <div className="flex-1 w-full min-h-87.5 md:min-h-125 flex justify-center items-center -mx-2 md:mx-0 py-2 md:py-0 px-4 md:px-0 relative z-10">
          <LudoBoard
            gameState={gameState}
            onPieceClick={movePiece}
            myColors={myColors}
          />

          {/* Overlay Dice on Board for mobile feeling (Optional overlay effect) */}
          <AnimatePresence>
            {isRolling && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: 360 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-2xl z-50"
              >
                <DiceFace value={animatedDice} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Log & Mobile Resign */}
        <div className="flex flex-col gap-2 w-full md:w-64 h-48 md:h-125">
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-lg">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 md:p-4 font-black uppercase text-[10px] md:text-xs text-slate-500 tracking-wider flex items-center justify-between">
              Game Log
              <Clock size={12} />
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 md:gap-2">
              {gameState.history.map((log, i) => (
                <div
                  key={i}
                  className="text-[9px] md:text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 p-2 rounded-lg font-mono border border-slate-100 dark:border-slate-800/50 shadow-sm leading-tight"
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleResign}
            className="md:hidden w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-black uppercase transition-colors text-xs text-center shadow-inner"
          >
            Resign Game
          </button>
        </div>
      </div>

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
        {showInactivityWarning && isMyTurn && isOnline && !gameState.winner && (
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
                Roll or move now or you will forfeit in {INACTIVITY_LIMIT - inactivityCounter}s
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
          onCancel={() => setShowResignModal(false)}
          onConfirm={confirmResign}
        />
      )}

      {/* Winner Screen */}
      {gameState.winner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950">
          <H2HWinner
            room={room}
            localWinnerId={
              gameState.winner === "host"
                ? room.host_id
                : room.guest_id || "BOT"
            }
            user={user}
          />
        </div>
      )}
    </div>
  );
};

export default LudoArena;
