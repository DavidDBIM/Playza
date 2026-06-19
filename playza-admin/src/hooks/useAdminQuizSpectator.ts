import { useEffect, useRef, useState } from "react";

type Socket = import("socket.io-client").Socket;

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://api.playza.games";

export interface LiveQuestionData {
  question_id: string;
  round: number;
  round_name?: string;
  question_index: number;
  total_questions: number;
  question_text: string;
  image_url: string | null;
  options: { A: string; B: string; C: string; D: string };
  time_limit_ms: number;
  alive_count: number;
}

export interface RevealData {
  correct_option: string;
  eliminated_count: number;
  alive_count: number;
  round: number;
  question_index: number;
}

export interface RoundSummaryData {
  round_completed: number;
  round_name: string;
  survivors: number;
  eliminated_this_round: number;
  next_round: number;
  next_round_name: string;
}

export interface GameOverData {
  leaderboard: any[];
  winners: { rank: number; username: string; prize: number }[];
  prize_pool: number;
  distributable_pool: number;
  consolation_pza: number;
}

type AdminQuizPhase = "idle" | "starting" | "question" | "revealing" | "round_summary" | "game_over";

// Read-only spectator socket for the admin Monitor modal.
// Joins the same tournament room as players but never submits answers —
// just listens to the broadcasts so admins can watch the live question flow.
export function useAdminQuizSpectator(tournamentId: string | null, enabled: boolean) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [phase, setPhase] = useState<AdminQuizPhase>("idle");
  const [currentQuestion, setCurrentQuestion] = useState<LiveQuestionData | null>(null);
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [roundSummary, setRoundSummary] = useState<RoundSummaryData | null>(null);
  const [gameOver, setGameOver] = useState<GameOverData | null>(null);
  const [aliveCount, setAliveCount] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTicker(durationMs: number) {
    if (tickRef.current) clearInterval(tickRef.current);
    const startedAt = Date.now();
    setTimeLeftMs(durationMs);
    tickRef.current = setInterval(() => {
      const remaining = Math.max(0, durationMs - (Date.now() - startedAt));
      setTimeLeftMs(remaining);
      if (remaining <= 0 && tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    }, 200);
  }

  useEffect(() => {
    if (!tournamentId || !enabled) return;

    const adminUserRaw = localStorage.getItem("admin_user");
    let adminUserId = "admin-spectator";
    try {
      const parsed = adminUserRaw ? JSON.parse(adminUserRaw) : null;
      adminUserId = parsed?.id ?? adminUserId;
    } catch (_) { /* ignore */ }

    let socket: Socket | null = null;
    let cancelled = false;

    import("socket.io-client").then(({ io }) => {
      if (cancelled) return;

      socket = io(`${SOCKET_URL}/quiz`, {
        auth: { userId: adminUserId },
        transports: ["websocket"],
        reconnectionAttempts: 5,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        setConnected(true);
        socket!.emit("quiz:join", { tournament_id: tournamentId });
      });

      socket.on("disconnect", () => setConnected(false));

      socket.on("quiz:lobby_update", ({ status }: { status: string }) => {
        if (status === "lobby") setPhase("idle");
        if (status === "active") setPhase((prev) => (prev === "idle" ? "starting" : prev));
      });

      socket.on("quiz:game_start", ({ alive_count }: { alive_count: number }) => {
        setAliveCount(alive_count);
        setPhase("starting");
      });

      socket.on("quiz:question_start", (q: LiveQuestionData) => {
        setCurrentQuestion(q);
        setRevealData(null);
        setAliveCount(q.alive_count);
        setPhase("question");
        startTicker(q.time_limit_ms);
      });

      socket.on("quiz:reveal", (data: RevealData) => {
        if (tickRef.current) clearInterval(tickRef.current);
        setRevealData(data);
        setAliveCount(data.alive_count);
        setPhase("revealing");
      });

      socket.on("quiz:round_summary", (summary: RoundSummaryData) => {
        setRoundSummary(summary);
        setAliveCount(summary.survivors);
        setPhase("round_summary");
      });

      socket.on("quiz:game_over", (data: GameOverData) => {
        if (tickRef.current) clearInterval(tickRef.current);
        setGameOver(data);
        setPhase("game_over");
      });
    });

    return () => {
      cancelled = true;
      if (tickRef.current) clearInterval(tickRef.current);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [tournamentId, enabled]);

  return { connected, phase, currentQuestion, revealData, roundSummary, gameOver, aliveCount, timeLeftMs };
}
