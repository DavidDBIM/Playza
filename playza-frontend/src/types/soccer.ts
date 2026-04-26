export type Difficulty = "easy" | "medium" | "hard";
export type GameMode = "timed" | "sudden-death" | "tournament";

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
