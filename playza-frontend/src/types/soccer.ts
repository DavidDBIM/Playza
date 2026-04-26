export type PitchTheme = "classic" | "night" | "snow" | "desert" | "neon";
export type Difficulty = "easy" | "medium" | "hard";
export type GameMode = "timed" | "sudden-death" | "tournament";

export const TEAM_COLORS = [
  { primary: "#e63946", secondary: "#fff", name: "Red Devils" },
  { primary: "#1a8cff", secondary: "#fff", name: "Blue Force" },
  { primary: "#FFD700", secondary: "#000", name: "Gold Kings" },
  { primary: "#4CAF50", secondary: "#fff", name: "Green Giants" },
  { primary: "#9C27B0", secondary: "#fff", name: "Purple Reign" },
  { primary: "#FF9800", secondary: "#000", name: "Orange Blaze" },
  { primary: "#ffffff", secondary: "#222", name: "White Wolves" },
  { primary: "#111111", secondary: "#fff", name: "Black Panther" },
];

export const PITCH_THEMES: Record<PitchTheme, { floor: string; floorAlt: string; line: string; wall: string; goal: string; crowd: string }> = {
  classic: { floor: "#4a7c59", floorAlt: "#3d6b4a", line: "rgba(255,255,255,0.85)", wall: "#2a3a8a", goal: "#ddd", crowd: "#8B7355" },
  night:   { floor: "#1a2f1f", floorAlt: "#162819", line: "rgba(100,200,255,0.8)", wall: "#0a0a3a", goal: "#aaa", crowd: "#333" },
  snow:    { floor: "#c8dff0", floorAlt: "#b8d0e8", line: "rgba(80,120,200,0.8)", wall: "#6080b0", goal: "#fff", crowd: "#9aabbc" },
  desert:  { floor: "#c8952a", floorAlt: "#b8851a", line: "rgba(255,240,180,0.8)", wall: "#7a3a10", goal: "#e8d080", crowd: "#9a7040" },
  neon:    { floor: "#050f08", floorAlt: "#040c06", line: "rgba(0,255,120,0.9)", wall: "#050520", goal: "#00ff88", crowd: "#050a05" },
};

export interface Vec2 {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  team: 0 | 1;
  isKeeper: boolean;
  number: number;
  radius: number;
  hasBall: boolean;
  name: string;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  drawPath: Vec2[];
  isDrawing: boolean;
}

export interface GameState {
  players: Player[];
  ball: Ball;
  score: [number, number];
  timeLeft: number;
  phase: "kickoff" | "playing" | "draw-shot" | "goal" | "finished" | "halftime";
  lastGoalTeam: 0 | 1 | null;
  controlledIdx: number;
  isMyTeam0: boolean;
  myTeam: 0 | 1;
  kickoffTeam: 0 | 1;
  drawStart: Vec2 | null;
  drawEnd: Vec2 | null;
  aiDifficulty: Difficulty;
  gameMode: GameMode;
}
