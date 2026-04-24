import React, { useEffect, useRef, useState, useCallback } from "react";

import {
  type GameState,
  type Difficulty,
  type GameMode,
  type Vec2,
  type Ball,
  type Player,
} from "@/types/soccer";

export type PitchTheme = "classic" | "night" | "snow" | "desert" | "neon";

// ─── Constants ────────────────────────────────────────────────────────────────
const W = 800,
  H = 520;
const PITCH_MARGIN_X = 60,
  PITCH_MARGIN_Y = 40;
const PITCH_W = W - PITCH_MARGIN_X * 2;
const PITCH_H = H - PITCH_MARGIN_Y * 2;
const GOAL_W = 80,
  GOAL_H = 110;
const PLAYER_R = 14;
const BALL_R = 9;
const FRICTION = 0.985;
const PLAYER_SPEED = 3.2;
const BALL_MAX_SPEED = 16;
const KICKOFF_DURATION = 60; // frames

const PITCH_THEMES: Record<
  PitchTheme,
  { grass1: string; grass2: string; line: string; soil: string; board: string }
> = {
  classic: {
    grass1: "#3a8c3f",
    grass2: "#2d7a32",
    line: "rgba(255,255,255,0.9)",
    soil: "#8B6914",
    board: "#1a1a2e",
  },
  night: {
    grass1: "#1a3a1f",
    grass2: "#142d18",
    line: "rgba(150,220,255,0.9)",
    soil: "#3a2a0a",
    board: "#0f0f1a",
  },
  snow: {
    grass1: "#e8f4ff",
    grass2: "#d0e8f8",
    line: "rgba(100,150,220,0.9)",
    soil: "#c8d8e8",
    board: "#2a3a5a",
  },
  desert: {
    grass1: "#c8a84b",
    grass2: "#b8942e",
    line: "rgba(255,255,255,0.8)",
    soil: "#8B6914",
    board: "#3a1a0a",
  },
  neon: {
    grass1: "#0a1a0a",
    grass2: "#071207",
    line: "rgba(0,255,150,0.9)",
    soil: "#0a0a1a",
    board: "#000010",
  },
};

const TEAM_COLORS = [
  { primary: "#e63946", secondary: "#fff", name: "Red Devils" },
  { primary: "#2196F3", secondary: "#fff", name: "Blue Force" },
  { primary: "#FFD700", secondary: "#000", name: "Gold Kings" },
  { primary: "#4CAF50", secondary: "#fff", name: "Green Giants" },
  { primary: "#9C27B0", secondary: "#fff", name: "Purple Reign" },
  { primary: "#FF9800", secondary: "#000", name: "Orange Blaze" },
  { primary: "#ffffff", secondary: "#222", name: "White Wolves" },
  { primary: "#000000", secondary: "#fff", name: "Black Panther" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dist(a: Vec2, b: Vec2) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function norm(v: Vec2): Vec2 {
  const l = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / l, y: v.y / l };
}
function clamp(v: number, mn: number, mx: number) {
  return Math.max(mn, Math.min(mx, v));
}

function makePlayers(): Player[] {
  const players: Player[] = [];
  // Team 0 (left side) — keeper + 4 outfield
  const t0x = [
    PITCH_MARGIN_X + 25,
    PITCH_MARGIN_X + 150,
    PITCH_MARGIN_X + 200,
    PITCH_MARGIN_X + 180,
    PITCH_MARGIN_X + 210,
  ];
  const t0y = [H / 2, H / 2 - 90, H / 2 + 90, H / 2 - 30, H / 2 + 30];
  for (let i = 0; i < 5; i++) {
    players.push({
      id: `t0-${i}`,
      x: t0x[i],
      y: t0y[i],
      vx: 0,
      vy: 0,
      team: 0,
      isKeeper: i === 0,
      number: i + 1,
      radius: PLAYER_R,
      hasBall: false,
      name: `P${i + 1}`,
    });
  }
  // Team 1 (right side)
  const t1x = [
    W - PITCH_MARGIN_X - 25,
    W - PITCH_MARGIN_X - 150,
    W - PITCH_MARGIN_X - 200,
    W - PITCH_MARGIN_X - 180,
    W - PITCH_MARGIN_X - 210,
  ];
  const t1y = [H / 2, H / 2 - 90, H / 2 + 90, H / 2 - 30, H / 2 + 30];
  for (let i = 0; i < 5; i++) {
    players.push({
      id: `t1-${i}`,
      x: t1x[i],
      y: t1y[i],
      vx: 0,
      vy: 0,
      team: 1,
      isKeeper: i === 0,
      number: i + 1,
      radius: PLAYER_R,
      hasBall: false,
      name: `P${i + 1}`,
    });
  }
  return players;
}

function resetPositions(state: GameState, kickoffTeam: 0 | 1) {
  const players = makePlayers();
  const ball: Ball = {
    x: W / 2,
    y: H / 2,
    vx: 0,
    vy: 0,
    radius: BALL_R,
    drawPath: [],
    isDrawing: false,
  };
  return {
    ...state,
    players,
    ball,
    phase: "kickoff" as const,
    kickoffTeam,
    lastGoalTeam: null,
    drawStart: null,
    drawEnd: null,
    controlledIdx: 0,
  };
}

// ─── AI Logic ─────────────────────────────────────────────────────────────────
function runAI(state: GameState, team: 1 | 0): void {
  const { players, ball, aiDifficulty } = state;
  const teamPlayers = players.filter((p) => p.team === team);
  const oppGoalX = team === 0 ? W - PITCH_MARGIN_X : PITCH_MARGIN_X;
  const ownGoalX = team === 0 ? PITCH_MARGIN_X : W - PITCH_MARGIN_X;

  const speed =
    aiDifficulty === "easy" ? 1.4 : aiDifficulty === "medium" ? 2.2 : 3.0;
  const reactionJitter =
    aiDifficulty === "easy" ? 0.4 : aiDifficulty === "medium" ? 0.15 : 0.02;

  teamPlayers.forEach((p, idx) => {
    if (Math.random() < reactionJitter) return; // AI misses frames on easy

    let tx = p.x,
      ty = p.y;

    if (p.isKeeper) {
      // Keeper: stay near goal, track ball vertically
      tx = ownGoalX + (team === 0 ? 30 : -30);
      ty = clamp(
        ball.y,
        PITCH_MARGIN_Y + GOAL_H / 2,
        H - PITCH_MARGIN_Y - GOAL_H / 2,
      );
    } else {
      const ballOwnerTeam = players.find((q) => q.hasBall)?.team;
      if (ballOwnerTeam === team) {
        // Attacking: closest to ball charges, others spread
        const ballDist = players
          .filter((q) => q.team === team && !q.isKeeper)
          .map((q) => dist(q, ball));
        const myBallDist = dist(p, ball);
        const isChaseBall = myBallDist === Math.min(...ballDist);
        if (isChaseBall) {
          tx = ball.x + Math.sign(oppGoalX - ball.x) * 5;
          ty = ball.y;
        } else {
          // Spread ahead of ball toward goal
          const spreadY = PITCH_MARGIN_Y + (PITCH_H / 4) * (idx + 1);
          tx = clamp(
            ball.x + (oppGoalX - ball.x) * 0.4,
            PITCH_MARGIN_X,
            W - PITCH_MARGIN_X,
          );
          ty = spreadY;
        }
      } else {
        // Defending: track back toward own goal
        tx = clamp(
          ball.x * 0.5 + ownGoalX * 0.5,
          PITCH_MARGIN_X,
          W - PITCH_MARGIN_X,
        );
        ty = ball.y + (idx % 2 === 0 ? -40 : 40);
      }
    }

    const d = dist(p, { x: tx, y: ty });
    if (d > 2) {
      const n = norm({ x: tx - p.x, y: ty - p.y });
      p.vx = n.x * speed;
      p.vy = n.y * speed;
    }

    // AI kicks ball if close
    if (!p.isKeeper && dist(p, ball) < PLAYER_R + BALL_R + 4) {
      const power =
        aiDifficulty === "easy" ? 6 : aiDifficulty === "medium" ? 9 : 12;
      const dir = norm({ x: oppGoalX - ball.x, y: (H / 2 - ball.y) * 0.3 });
      ball.vx =
        dir.x * power +
        (Math.random() - 0.5) * (aiDifficulty === "easy" ? 3 : 1);
      ball.vy =
        dir.y * power +
        (Math.random() - 0.5) * (aiDifficulty === "easy" ? 3 : 1);
    }
  });
}

// ─── Physics step ────────────────────────────────────────────────────────────
function physicsTick(
  state: GameState,
  inputDir: Vec2,
  drawShot: Vec2 | null,
  isBot: boolean,
): GameState {
  const s = {
    ...state,
    players: state.players.map((p) => ({ ...p })),
    ball: { ...state.ball },
  };
  const { players, ball } = s;

  // Move controlled player
  const cp = players[s.controlledIdx];
  if (cp && s.phase === "playing") {
    cp.vx = inputDir.x * PLAYER_SPEED;
    cp.vy = inputDir.y * PLAYER_SPEED;
  }

  // AI for opponent team
  if (isBot) {
    const aiTeam = s.myTeam === 0 ? 1 : 0;
    runAI(s, aiTeam);
  }
  // AI also runs for own teammates (not controlled)
  players.forEach((p, i) => {
    if (p.team === s.myTeam && i !== s.controlledIdx && !p.isKeeper) {
      // Simple support: move toward ball loosely
      const d = dist(p, ball);
      if (d > 80) {
        const n = norm({ x: ball.x - p.x, y: ball.y - p.y });
        p.vx = n.x * 1.8;
        p.vy = n.y * 1.8;
      } else {
        p.vx *= 0.9;
        p.vy *= 0.9;
      }
    }
  });

  // Apply velocities to players
  players.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.85;
    p.vy *= 0.85;
    // Pitch bounds
    p.x = clamp(p.x, PITCH_MARGIN_X + p.radius, W - PITCH_MARGIN_X - p.radius);
    p.y = clamp(p.y, PITCH_MARGIN_Y + p.radius, H - PITCH_MARGIN_Y - p.radius);
  });

  // Draw shot: fire ball along path
  if (drawShot && s.phase === "playing") {
    const nearest = players
      .filter((p) => p.team === s.myTeam)
      .sort((a, b) => dist(a, ball) - dist(b, ball))[0];
    if (nearest && dist(nearest, ball) < PLAYER_R + BALL_R + 10) {
      const d = norm({ x: drawShot.x - ball.x, y: drawShot.y - ball.y });
      const power = clamp(dist(ball, drawShot) / 20, 4, BALL_MAX_SPEED);
      ball.vx = d.x * power;
      ball.vy = d.y * power;
    }
  }

  // Ball physics
  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.vx *= FRICTION;
  ball.vy *= FRICTION;

  // Ball pitch walls (top/bottom)
  if (ball.y - BALL_R < PITCH_MARGIN_Y) {
    ball.y = PITCH_MARGIN_Y + BALL_R;
    ball.vy *= -0.7;
  }
  if (ball.y + BALL_R > H - PITCH_MARGIN_Y) {
    ball.y = H - PITCH_MARGIN_Y - BALL_R;
    ball.vy *= -0.7;
  }

  // Goal check
  const goalTop = H / 2 - GOAL_H / 2;
  const goalBot = H / 2 + GOAL_H / 2;
  const newScore = [...s.score] as [number, number];
  let goalScored: 0 | 1 | null = null;

  // Left goal (team 1 scores)
  if (
    ball.x - BALL_R < PITCH_MARGIN_X &&
    ball.y > goalTop &&
    ball.y < goalBot
  ) {
    newScore[1]++;
    goalScored = 1;
  }
  // Right goal (team 0 scores)
  if (
    ball.x + BALL_R > W - PITCH_MARGIN_X &&
    ball.y > goalTop &&
    ball.y < goalBot
  ) {
    newScore[0]++;
    goalScored = 0;
  }
  // Side walls
  if (ball.x - BALL_R < PITCH_MARGIN_X && goalScored === null) {
    ball.x = PITCH_MARGIN_X + BALL_R;
    ball.vx *= -0.7;
  }
  if (ball.x + BALL_R > W - PITCH_MARGIN_X && goalScored === null) {
    ball.x = W - PITCH_MARGIN_X - BALL_R;
    ball.vx *= -0.7;
  }

  // Player-ball collision
  players.forEach((p) => {
    const d = dist(p, ball);
    if (d < p.radius + BALL_R) {
      const n = norm({ x: ball.x - p.x, y: ball.y - p.y });
      const overlap = p.radius + BALL_R - d;
      ball.x += n.x * overlap;
      ball.y += n.y * overlap;
      const relV = { x: ball.vx - p.vx, y: ball.vy - p.vy };
      const dot = relV.x * n.x + relV.y * n.y;
      if (dot < 0) {
        ball.vx -= dot * n.x * 1.2;
        ball.vy -= dot * n.y * 1.2;
      }
    }
  });

  // Auto-switch to nearest player with ball
  if (s.phase === "playing") {
    const myPlayers = players
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.team === s.myTeam);
    const nearest = myPlayers.sort(
      (a, b) => dist(a.p, ball) - dist(b.p, ball),
    )[0];
    if (nearest) s.controlledIdx = nearest.i;
  }

  // Sudden death check
  if (goalScored !== null && s.gameMode === "sudden-death") {
    return {
      ...s,
      score: newScore,
      phase: "finished",
      lastGoalTeam: goalScored,
    };
  }

  if (goalScored !== null) {
    return { ...s, score: newScore, phase: "goal", lastGoalTeam: goalScored };
  }

  return { ...s, score: newScore };
}

// ─── Renderer ─────────────────────────────────────────────────────────────────
function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  theme: PitchTheme,
  team0Color: string,
  team1Color: string,
  team0Name: string,
  team1Name: string,
  drawPathPoints: Vec2[],
) {
  const T = PITCH_THEMES[theme];
  ctx.clearRect(0, 0, W, H);

  // ── Pitch stripes
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? T.grass1 : T.grass2;
    ctx.fillRect(
      PITCH_MARGIN_X + (PITCH_W / 8) * i,
      PITCH_MARGIN_Y,
      PITCH_W / 8,
      PITCH_H,
    );
  }

  // ── Pitch border
  ctx.strokeStyle = T.line;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(PITCH_MARGIN_X, PITCH_MARGIN_Y, PITCH_W, PITCH_H);

  // ── Centre line & circle
  ctx.beginPath();
  ctx.moveTo(W / 2, PITCH_MARGIN_Y);
  ctx.lineTo(W / 2, H - PITCH_MARGIN_Y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = T.line;
  ctx.fill();

  // ── Penalty boxes
  const pBoxW = 120,
    pBoxH = 200;
  ctx.strokeRect(PITCH_MARGIN_X, H / 2 - pBoxH / 2, pBoxW, pBoxH);
  ctx.strokeRect(W - PITCH_MARGIN_X - pBoxW, H / 2 - pBoxH / 2, pBoxW, pBoxH);

  // ── Goals
  const goalTop = H / 2 - GOAL_H / 2;
  ctx.fillStyle = T.soil;
  ctx.fillRect(PITCH_MARGIN_X - GOAL_W, goalTop, GOAL_W, GOAL_H); // left goal
  ctx.fillRect(W - PITCH_MARGIN_X, goalTop, GOAL_W, GOAL_H); // right goal
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 2;
  ctx.strokeRect(PITCH_MARGIN_X - GOAL_W, goalTop, GOAL_W, GOAL_H);
  ctx.strokeRect(W - PITCH_MARGIN_X, goalTop, GOAL_W, GOAL_H);

  // ── Advertising boards (Playza branding)
  const boardH = 22;
  // Top board
  ctx.fillStyle = T.board;
  ctx.fillRect(PITCH_MARGIN_X, PITCH_MARGIN_Y - boardH - 4, PITCH_W, boardH);
  // Bottom board
  ctx.fillRect(PITCH_MARGIN_X, H - PITCH_MARGIN_Y + 4, PITCH_W, boardH);

  const boardTexts = [
    "PLAYZA",
    "⚽ SCORE HERO",
    "PLAYZA.GG",
    "JOIN NOW",
    "⚡ PLAYZA",
    "WIN BIG",
    "PLAYZA",
    "H2H ZONE",
  ];
  ctx.font = "bold 10px Arial";
  ctx.textAlign = "center";
  const segW = PITCH_W / boardTexts.length;
  boardTexts.forEach((txt, i) => {
    ctx.fillStyle = i % 2 === 0 ? "#FFD700" : "#ffffff";
    ctx.fillText(
      txt,
      PITCH_MARGIN_X + segW * i + segW / 2,
      PITCH_MARGIN_Y - boardH + 10,
    );
    ctx.fillText(
      txt,
      PITCH_MARGIN_X + segW * i + segW / 2,
      H - PITCH_MARGIN_Y + 18,
    );
  });

  // ── Draw shot path preview
  if (drawPathPoints.length > 1) {
    ctx.beginPath();
    ctx.moveTo(drawPathPoints[0].x, drawPathPoints[0].y);
    drawPathPoints.forEach((pt) => ctx.lineTo(pt.x, pt.y));
    ctx.strokeStyle = "rgba(255,220,0,0.7)";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    // Arrow head
    const last = drawPathPoints[drawPathPoints.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,220,0,0.9)";
    ctx.fill();
  }

  // ── Players
  state.players.forEach((p) => {
    const col = p.team === 0 ? team0Color : team1Color;
    const isControlled =
      state.players.indexOf(p) === state.controlledIdx &&
      p.team === state.myTeam;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + p.radius - 2, p.radius * 0.8, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = isControlled ? "#FFD700" : "rgba(255,255,255,0.6)";
    ctx.lineWidth = isControlled ? 3 : 1.5;
    ctx.stroke();

    // Keeper band
    if (p.isKeeper) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius - 3, 0, Math.PI * 2);
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Number
    ctx.font = `bold ${p.isKeeper ? 9 : 8}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 2;
    ctx.strokeText(String(p.number), p.x, p.y);
    ctx.fillText(String(p.number), p.x, p.y);

    // Controlled indicator
    if (isControlled) {
      ctx.beginPath();
      ctx.arc(p.x, p.y - p.radius - 6, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#FFD700";
      ctx.fill();
    }
  });

  // ── Ball
  const b = state.ball;
  ctx.beginPath();
  ctx.ellipse(b.x, b.y + b.radius - 2, b.radius * 0.8, 3, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
  const bGrad = ctx.createRadialGradient(
    b.x - 3,
    b.y - 3,
    1,
    b.x,
    b.y,
    b.radius,
  );
  bGrad.addColorStop(0, "#ffffff");
  bGrad.addColorStop(0.5, "#e0e0e0");
  bGrad.addColorStop(1, "#888888");
  ctx.fillStyle = bGrad;
  ctx.fill();
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Goal flash overlay
  if (state.phase === "goal") {
    ctx.fillStyle = "rgba(255,215,0,0.15)";
    ctx.fillRect(0, 0, W, H);
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface SoccerGameProps {
  myTeam: 0 | 1;
  team0Name: string;
  team1Name: string;
  team0Color: string;
  team1Color: string;
  isBot: boolean;
  botDifficulty?: Difficulty;
  gameMode?: GameMode;
  onGoal?: (score: [number, number]) => void;
  onGameOver?: (score: [number, number], winnerId: 0 | 1 | null) => void;
  pitchTheme?: PitchTheme;
}

const GAME_DURATION = 5 * 60; // 5 min in seconds

const SoccerGame: React.FC<SoccerGameProps> = ({
  myTeam,
  team0Name,
  team1Name,
  team0Color,
  team1Color,
  isBot,
  botDifficulty = "medium",
  gameMode = "timed",
  onGoal,
  onGameOver,
  pitchTheme = "classic",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const inputRef = useRef<Vec2>({ x: 0, y: 0 });
  const drawPathRef = useRef<Vec2[]>([]);
  const drawShotRef = useRef<Vec2 | null>(null);
  const isDrawingRef = useRef(false);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const goalTimerRef = useRef<number>(0);
  const [overlayPhase, setOverlayPhase] = useState<
    "kickoff" | "goal" | "finished" | null
  >("kickoff");
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [theme, setTheme] = useState<PitchTheme>(pitchTheme);
  const [showPitchPicker, setShowPitchPicker] = useState(false);

  // ── Init state
  const initState = useCallback((): GameState => {
    const s: GameState = {
      players: makePlayers(),
      ball: {
        x: W / 2,
        y: H / 2,
        vx: 0,
        vy: 0,
        radius: BALL_R,
        drawPath: [],
        isDrawing: false,
      },
      score: [0, 0],
      timeLeft: GAME_DURATION,
      phase: "kickoff",
      lastGoalTeam: null,
      controlledIdx: myTeam === 0 ? 1 : 6,
      isMyTeam0: myTeam === 0,
      myTeam,
      kickoffTeam: 0,
      drawStart: null,
      drawEnd: null,
      aiDifficulty: botDifficulty,
      gameMode,
    };
    return s;
  }, [myTeam, botDifficulty, gameMode]);

  // ── Game loop
  useEffect(() => {
    stateRef.current = initState();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let kickoffFrames = 0;
    let accumulatedTime = 0;

    const loop = (ts: number) => {
      const dt = Math.min(ts - lastTickRef.current, 50);
      lastTickRef.current = ts;
      accumulatedTime += dt;

      const s = stateRef.current!;

      if (s.phase === "kickoff") {
        kickoffFrames++;
        if (kickoffFrames > KICKOFF_DURATION) {
          stateRef.current = { ...s, phase: "playing" };
          setOverlayPhase(null);
          kickoffFrames = 0;
        }
      } else if (s.phase === "playing") {
        // Tick every ~16ms
        while (accumulatedTime >= 16) {
          accumulatedTime -= 16;
          stateRef.current = physicsTick(
            stateRef.current!,
            inputRef.current,
            drawShotRef.current,
            isBot,
          );
          drawShotRef.current = null;

          // Time countdown
          if (gameMode === "timed") {
            stateRef.current.timeLeft -= 16 / 1000;
            if (stateRef.current.timeLeft <= 0) {
              stateRef.current = {
                ...stateRef.current,
                timeLeft: 0,
                phase: "finished",
              };
              setOverlayPhase("finished");
              const [s0, s1] = stateRef.current!.score;
              const winner = s0 > s1 ? 0 : s1 > s0 ? 1 : null;
              onGameOver?.(stateRef.current!.score, winner as 0 | 1 | null);
            }
          }
        }
        setScore([...stateRef.current!.score] as [number, number]);
        setTimeLeft(Math.max(0, stateRef.current!.timeLeft));
      } else if (s.phase === "goal") {
        goalTimerRef.current++;
        if (goalTimerRef.current > 120) {
          goalTimerRef.current = 0;
          const nextKickoff: 0 | 1 = s.lastGoalTeam === 0 ? 1 : 0;
          stateRef.current = resetPositions(s, nextKickoff);
          stateRef.current = { ...stateRef.current, score: s.score };
          setOverlayPhase("kickoff");
          onGoal?.(s.score);
        }
      } else if (s.phase === "finished") {
        setOverlayPhase("finished");
      }

      render(
        ctx,
        stateRef.current!,
        theme,
        team0Color,
        team1Color,
        team0Name,
        team1Name,
        drawPathRef.current,
      );
      rafRef.current = requestAnimationFrame(loop);
    };

    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    initState,
    team0Color,
    team1Color,
    team0Name,
    team1Name,
    gameMode,
    theme,
  ]);

  // ── Keyboard controls
  useEffect(() => {
    const down = new Set<string>();
    const onKey = (e: KeyboardEvent, pressed: boolean) => {
      if (pressed) down.add(e.key);
      else down.delete(e.key);
      const dir = { x: 0, y: 0 };
      if (down.has("ArrowLeft") || down.has("a") || down.has("A")) dir.x -= 1;
      if (down.has("ArrowRight") || down.has("d") || down.has("D")) dir.x += 1;
      if (down.has("ArrowUp") || down.has("w") || down.has("W")) dir.y -= 1;
      if (down.has("ArrowDown") || down.has("s") || down.has("S")) dir.y += 1;
      const l = Math.hypot(dir.x, dir.y) || 1;
      inputRef.current = { x: dir.x / l, y: dir.y / l };
    };
    window.addEventListener("keydown", (e) => onKey(e, true));
    window.addEventListener("keyup", (e) => onKey(e, false));
    return () => {
      window.removeEventListener("keydown", (e) => onKey(e, true));
      window.removeEventListener("keyup", (e) => onKey(e, false));
    };
  }, []);

  // ── Canvas touch / mouse for draw-shot
  const getCanvasPos = (e: React.TouchEvent | React.MouseEvent): Vec2 => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width,
      scaleY = H / rect.height;
    if ("touches" in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    const me = e as React.MouseEvent;
    return {
      x: (me.clientX - rect.left) * scaleX,
      y: (me.clientY - rect.top) * scaleY,
    };
  };

  const onPointerDown = (e: React.TouchEvent | React.MouseEvent) => {
    const pos = getCanvasPos(e);
    isDrawingRef.current = true;
    drawPathRef.current = [pos];
  };

  const onPointerMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawingRef.current) return;
    const pos = getCanvasPos(e);
    // Also handle movement as joystick on left half of screen
    if (pos.x < W / 2) {
      const cx = W / 4,
        cy = H * 0.75;
      const dir = norm({ x: pos.x - cx, y: pos.y - cy });
      inputRef.current = dir;
    }
    drawPathRef.current = [...drawPathRef.current, pos];
  };

  const onPointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const pts = drawPathRef.current;
    if (pts.length > 1) {
      const last = pts[pts.length - 1];
      drawShotRef.current = last; // Fire toward last point
    }
    setTimeout(() => {
      drawPathRef.current = [];
    }, 300);
    inputRef.current = { x: 0, y: 0 };
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const team0BgStyle = { backgroundColor: team0Color };
  const team1BgStyle = { backgroundColor: team1Color };

  return (
    <div className="flex flex-col items-center w-full select-none">
      {/* Scoreboard */}
      <div className="flex items-center justify-between w-full max-w-3xl px-2 py-2 bg-gray-900 rounded-t-xl border-b border-white/10">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full border-2 border-white/30"
            style={team0BgStyle}
          />
          <span className="text-white font-black text-xs uppercase tracking-wider truncate max-w-20">
            {team0Name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white font-black text-2xl tabular-nums">
            {score[0]}
          </span>
          <div className="flex flex-col items-center">
            <span className="text-yellow-400 font-black text-xs">
              {gameMode === "timed" ? formatTime(timeLeft) : "SUDDEN DEATH"}
            </span>
            <span className="text-gray-500 text-[9px] uppercase tracking-widest">
              Score Hero
            </span>
          </div>
          <span className="text-white font-black text-2xl tabular-nums">
            {score[1]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-black text-xs uppercase tracking-wider truncate max-w-20">
            {team1Name}
          </span>
          <div
            className="w-5 h-5 rounded-full border-2 border-white/30"
            style={team1BgStyle}
          />
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full max-w-3xl">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full rounded-none touch-none"
          style={{ imageRendering: "crisp-edges" }}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onTouchStart={(e) => {
            e.preventDefault();
            onPointerDown(e);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            onPointerMove(e);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onPointerUp();
          }}
        />

        {/* Kickoff overlay */}
        {overlayPhase === "kickoff" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-yellow-400 font-black text-3xl uppercase tracking-widest">
                ⚽ Kick Off!
              </div>
              <div className="text-white/70 text-sm mt-2 uppercase tracking-widest">
                Draw a path to shoot
              </div>
            </div>
          </div>
        )}

        {/* Goal overlay */}
        {stateRef.current?.phase === "goal" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center animate-bounce">
              <div className="text-yellow-400 font-black text-5xl uppercase tracking-widest drop-shadow-2xl">
                ⚽ GOAL!
              </div>
              <div className="text-white font-black text-xl mt-1">
                {stateRef.current.lastGoalTeam === 0 ? team0Name : team1Name}
              </div>
            </div>
          </div>
        )}

        {/* Finished overlay */}
        {overlayPhase === "finished" && stateRef.current && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md rounded-none">
            <div className="text-center space-y-4">
              <div className="text-yellow-400 font-black text-4xl uppercase">
                Full Time!
              </div>
              <div className="flex items-center gap-6 justify-center">
                <div className="text-center">
                  <div className="text-4xl font-black text-white">
                    {score[0]}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest">
                    {team0Name}
                  </div>
                </div>
                <div className="text-2xl text-gray-500">–</div>
                <div className="text-center">
                  <div className="text-4xl font-black text-white">
                    {score[1]}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest">
                    {team1Name}
                  </div>
                </div>
              </div>
              <div className="text-white font-black text-xl uppercase tracking-widest">
                {score[0] > score[1]
                  ? `🏆 ${team0Name} Wins!`
                  : score[1] > score[0]
                    ? `🏆 ${team1Name} Wins!`
                    : "🤝 Draw!"}
              </div>
            </div>
          </div>
        )}

        {/* Pitch picker button */}
        <button
          onClick={() => setShowPitchPicker((v) => !v)}
          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-white/20 transition-all"
        >
          🏟 Pitch
        </button>

        {/* Pitch picker */}
        {showPitchPicker && (
          <div className="absolute top-8 right-2 bg-gray-900/95 border border-white/20 rounded-xl p-3 z-50 space-y-1">
            {(Object.keys(PITCH_THEMES) as PitchTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  setShowPitchPicker(false);
                }}
                className={`block w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${theme === t ? "bg-yellow-500 text-black" : "text-white hover:bg-white/10"}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile touch controls hint */}
      <div className="flex justify-between w-full max-w-3xl px-3 py-2 bg-gray-900 rounded-b-xl">
        <span className="text-gray-500 text-[9px] uppercase tracking-widest">
          ← Drag left side to move
        </span>
        <span className="text-gray-500 text-[9px] uppercase tracking-widest">
          Drag right side to shoot →
        </span>
      </div>
    </div>
  );
};

export default SoccerGame;
export {
  TEAM_COLORS,
  PITCH_THEMES,
};
