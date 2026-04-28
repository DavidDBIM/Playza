import React, { useEffect, useRef, useState, useCallback } from "react";
import { type PitchTheme, type Difficulty, type GameMode, PITCH_THEMES } from "@/types/soccer";

interface Vec2 { x: number; y: number }

interface Player {
  id: string;
  x: number; y: number;
  vx: number; vy: number;
  team: 0 | 1;
  isKeeper: boolean;
  number: number;
  hasBall: boolean;
  animFrame: number;
  facing: number; // angle in radians
  runPhase: number; // for leg animation
}

interface Ball {
  x: number; y: number;
  vx: number; vy: number;
  trail: Vec2[];
  spin: number;
}

interface GameState {
  players: Player[];
  ball: Ball;
  score: [number, number];
  timeLeft: number;
  phase: "kickoff" | "playing" | "goal" | "finished";
  lastGoalTeam: 0 | 1 | null;
  controlledIdx: number;
  myTeam: 0 | 1;
  kickoffTeam: 0 | 1;
  aiDifficulty: Difficulty;
  gameMode: GameMode;
}

// ─── Constants ────────────────────────────────────────────────────────────────
// Elongated pitch: much wider canvas so keepers can't see the other post
const W = 780, H = 560;
// Long horizontal pitch - like a real football pitch (width >> height)
const PITCH = {
  left: 68, right: 712,
  top: 140, bottom: 430,
};
const PITCH_W = PITCH.right - PITCH.left; // 724px wide!
const PITCH_H = PITCH.bottom - PITCH.top;  // 290px tall
const GOAL_W = 120, GOAL_DEPTH = 52;
const PLAYER_R = 13;
const BALL_R = 8;
const FRICTION = 0.978;
const PLAYER_SPEED = 3.2;
const BALL_MAX_SPEED = 18;
const GAME_DURATION = 5 * 60;

// ─── Constants ────────────────────────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dist(a: Vec2, b: Vec2) { return Math.hypot(a.x - b.x, a.y - b.y); }
function norm(v: Vec2): Vec2 { const l = Math.hypot(v.x, v.y) || 1; return { x: v.x / l, y: v.y / l }; }
function clamp(v: number, mn: number, mx: number) { return Math.max(mn, Math.min(mx, v)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// Convert pitch coord to screen (simple top-down for landscape pitch)
function toScreen(px: number, py: number): Vec2 {
  return { x: px, y: py };
}

// ─── Player factory ───────────────────────────────────────────────────────────
function makePlayers(): Player[] {
  const p: Player[] = [];
  // Team 0 positions (left side, attacking right) - spread across long pitch
  const t0 = [
    { x: PITCH.left + 30, y: (PITCH.top + PITCH.bottom) / 2 }, // keeper - far left
    { x: PITCH.left + 140, y: PITCH.top + PITCH_H * 0.2 },
    { x: PITCH.left + 140, y: PITCH.top + PITCH_H * 0.5 },
    { x: PITCH.left + 140, y: PITCH.top + PITCH_H * 0.8 },
    { x: PITCH.left + 280, y: PITCH.top + PITCH_H * 0.4 },
  ];
  t0.forEach((pos, i) => p.push({ id: `t0-${i}`, x: pos.x, y: pos.y, vx: 0, vy: 0, team: 0, isKeeper: i === 0, number: i + 1, hasBall: false, animFrame: 0, facing: 0, runPhase: Math.random() * Math.PI * 2 }));

  // Team 1 positions (right side, attacking left) - spread across long pitch
  const t1 = [
    { x: PITCH.right - 30, y: (PITCH.top + PITCH.bottom) / 2 }, // keeper - far right
    { x: PITCH.right - 140, y: PITCH.top + PITCH_H * 0.2 },
    { x: PITCH.right - 140, y: PITCH.top + PITCH_H * 0.5 },
    { x: PITCH.right - 140, y: PITCH.top + PITCH_H * 0.8 },
    { x: PITCH.right - 280, y: PITCH.top + PITCH_H * 0.6 },
  ];
  t1.forEach((pos, i) => p.push({ id: `t1-${i}`, x: pos.x, y: pos.y, vx: 0, vy: 0, team: 1, isKeeper: i === 0, number: i + 1, hasBall: false, animFrame: 0, facing: Math.PI, runPhase: Math.random() * Math.PI * 2 }));

  return p;
}

function initState(myTeam: 0 | 1, difficulty: Difficulty, mode: GameMode): GameState {
  const players = makePlayers();
  return {
    players,
    ball: { x: W / 2, y: (PITCH.top + PITCH.bottom) / 2, vx: 0, vy: 0, trail: [], spin: 0 },
    score: [0, 0],
    timeLeft: GAME_DURATION,
    phase: "kickoff",
    lastGoalTeam: null,
    controlledIdx: myTeam === 0 ? 4 : 9,
    myTeam,
    kickoffTeam: 0,
    aiDifficulty: difficulty,
    gameMode: mode,
  };
}

function resetPositions(s: GameState, kickoffTeam: 0 | 1): GameState {
  const players = makePlayers();
  const ball: Ball = { x: W / 2, y: (PITCH.top + PITCH.bottom) / 2, vx: 0, vy: 0, trail: [], spin: 0 };
  const controlledIdx = s.myTeam === 0 ? 4 : 9;
  return { ...s, players, ball, phase: "kickoff", kickoffTeam, lastGoalTeam: null, controlledIdx };
}

// ─── AI ───────────────────────────────────────────────────────────────────────
function runAI(s: GameState, aiTeam: 0 | 1): void {
  const { players, ball, aiDifficulty } = s;
  const speed = aiDifficulty === "easy" ? 1.3 : aiDifficulty === "medium" ? 2.1 : 2.9;
  const missChance = aiDifficulty === "easy" ? 0.45 : aiDifficulty === "medium" ? 0.2 : 0.04;
  const oppGoalX = aiTeam === 0 ? PITCH.right - 15 : PITCH.left + 15;
  const ownGoalX = aiTeam === 0 ? PITCH.left + 15 : PITCH.right - 15;
  const midY = (PITCH.top + PITCH.bottom) / 2;

  const teamPlayers = players.filter(p => p.team === aiTeam);
  const myBallDists = teamPlayers.map(p => dist(p, ball));
  const minBallDist = Math.min(...myBallDists);

  teamPlayers.forEach((p, li) => {
    if (Math.random() < missChance) return;
    let tx = p.x, ty = p.y;

    if (p.isKeeper) {
      tx = ownGoalX + (aiTeam === 0 ? 35 : -35);
      ty = clamp(ball.y, PITCH.top + 40, PITCH.bottom - 40);
    } else {
      const isChaseBall = myBallDists[li] === minBallDist;
      const hasBallOwner = players.find(q => q.hasBall);
      if (hasBallOwner?.team === aiTeam) {
        if (isChaseBall) {
          tx = ball.x + Math.sign(oppGoalX - ball.x) * 8;
          ty = ball.y;
        } else {
          // Spread toward goal
          const slot = (li % 3) - 1;
          tx = clamp(ball.x + (oppGoalX - ball.x) * 0.5, PITCH.left + 30, PITCH.right - 30);
          ty = clamp(midY + slot * 80, PITCH.top + 30, PITCH.bottom - 30);
        }
      } else {
        // Defend
        tx = clamp((ball.x + ownGoalX) / 2, PITCH.left + 20, PITCH.right - 20);
        ty = clamp(ball.y + (li % 2 === 0 ? -50 : 50), PITCH.top + 20, PITCH.bottom - 20);
      }
    }

    const d = dist(p, { x: tx, y: ty });
    if (d > 3) {
      const n = norm({ x: tx - p.x, y: ty - p.y });
      p.vx = n.x * speed;
      p.vy = n.y * speed;
      p.facing = Math.atan2(n.y, n.x);
    }

    // AI kick
    if (!p.isKeeper && dist(p, ball) < PLAYER_R + BALL_R + 5) {
      const power = aiDifficulty === "easy" ? 5 : aiDifficulty === "medium" ? 8 : 11;
      const spread = aiDifficulty === "easy" ? 2.5 : aiDifficulty === "medium" ? 1 : 0.3;
      const goalDir = norm({ x: oppGoalX - ball.x, y: midY - ball.y });
      s.ball.vx = goalDir.x * power + (Math.random() - 0.5) * spread;
      s.ball.vy = goalDir.y * power + (Math.random() - 0.5) * spread;
    }
  });
}

// ─── Physics ──────────────────────────────────────────────────────────────────
function tick(s: GameState, inputDir: Vec2, doPass: boolean, doShoot: boolean, doDash: boolean, doTackle: boolean, doSwitch: boolean, doDefense: boolean): GameState {
  const ns = { ...s, players: s.players.map(p => ({ ...p })), ball: { ...s.ball, trail: [...s.ball.trail] } };
  const { players, ball } = ns;

  // Move controlled player
  const cp = players[ns.controlledIdx];
  if (cp && ns.phase === "playing") {
    const l = Math.hypot(inputDir.x, inputDir.y);
    if (l > 0.1) {
      const speed = doDash ? PLAYER_SPEED * 2.2 : PLAYER_SPEED;
      cp.vx = inputDir.x * speed;
      cp.vy = inputDir.y * speed;
      cp.facing = Math.atan2(inputDir.y, inputDir.x);
      cp.runPhase += doDash ? 0.55 : 0.28;
    }
  }

  // DASH - burst of speed toward ball
  if (doDash && ns.phase === "playing" && cp) {
    const d = norm({ x: ball.x - cp.x, y: ball.y - cp.y });
    cp.vx += d.x * 6;
    cp.vy += d.y * 6;
  }

  // Teammates auto-run (basic support)
  players.forEach((p, i) => {
    if (p.team === ns.myTeam && i !== ns.controlledIdx && !p.isKeeper) {
      const d = dist(p, ball);
      if (d > 100) {
        const n = norm({ x: ball.x - p.x, y: ball.y - p.y });
        p.vx = lerp(p.vx, n.x * 1.6, 0.1);
        p.vy = lerp(p.vy, n.y * 1.6, 0.1);
        p.runPhase += 0.15;
      } else {
        p.vx *= 0.88; p.vy *= 0.88;
      }
    }
    if (p.isKeeper && p.team === ns.myTeam) {
      const ownGoalX = ns.myTeam === 0 ? PITCH.left + 25 : PITCH.right - 25;
      p.vx = lerp(p.vx, (ownGoalX - p.x) * 0.08, 0.2);
      p.vy = lerp(p.vy, (ball.y - p.y) * 0.1, 0.15);
    }
  });

  // AI
  const aiTeam: 0 | 1 = ns.myTeam === 0 ? 1 : 0;
  runAI(ns, aiTeam);

  // Apply player velocities
  players.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    p.vx *= 0.82; p.vy *= 0.82;
    p.animFrame++;
    p.x = clamp(p.x, PITCH.left + PLAYER_R, PITCH.right - PLAYER_R);
    p.y = clamp(p.y, PITCH.top + PLAYER_R, PITCH.bottom - PLAYER_R);
    p.hasBall = dist(p, ball) < PLAYER_R + BALL_R + 4;
  });

  // Pass action
  if (doPass && ns.phase === "playing") {
    const myPlayers = players.filter(p => p.team === ns.myTeam);
    const carrier = myPlayers.find(p => p.hasBall) || myPlayers.sort((a, b) => dist(a, ball) - dist(b, ball))[0];
    // Find best teammate to pass to
    const teammates = myPlayers.filter(p => p.id !== carrier?.id && !p.isKeeper);
    if (teammates.length > 0 && carrier) {
      const oppGoalX = ns.myTeam === 0 ? PITCH.right : PITCH.left;
      // Pick teammate closest to goal and most forward
      const target = teammates.sort((a, b) =>
        Math.abs(a.x - oppGoalX) - Math.abs(b.x - oppGoalX)
      )[0];
      const d = norm({ x: target.x - ball.x, y: target.y - ball.y });
      const power = clamp(dist(carrier, target) / 25, 4, 10);
      ball.vx = d.x * power;
      ball.vy = d.y * power;
    }
  }

  // Shoot action
  if (doShoot && ns.phase === "playing") {
    const myPlayers = players.filter(p => p.team === ns.myTeam);
    const shooter = myPlayers.sort((a, b) => dist(a, ball) - dist(b, ball))[0];
    if (shooter && dist(shooter, ball) < PLAYER_R + BALL_R + 18) {
      const oppGoalX = ns.myTeam === 0 ? PITCH.right - 8 : PITCH.left + 8;
      const goalMidY = (PITCH.top + PITCH.bottom) / 2;
      // Add slight randomness for realism
      const jitter = (Math.random() - 0.5) * 30;
      const d = norm({ x: oppGoalX - ball.x, y: goalMidY + jitter - ball.y });
      ball.vx = d.x * BALL_MAX_SPEED;
      ball.vy = d.y * BALL_MAX_SPEED;
      ball.spin = (Math.random() - 0.5) * 0.3;
    }
  }

  // TACKLE - lunge at ball carrier
  if (doTackle && ns.phase === "playing") {
    const myPlayers = players.filter(p => p.team === ns.myTeam);
    const tackler = myPlayers.sort((a, b) => dist(a, ball) - dist(b, ball))[0];
    if (tackler) {
      const d = norm({ x: ball.x - tackler.x, y: ball.y - tackler.y });
      tackler.vx = d.x * PLAYER_SPEED * 2.5;
      tackler.vy = d.y * PLAYER_SPEED * 2.5;
      // If close enough, dispossess the ball
      if (dist(tackler, ball) < PLAYER_R + BALL_R + 20) {
        const scatter = { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6 };
        ball.vx = scatter.x + d.x * 4;
        ball.vy = scatter.y + d.y * 2;
      }
    }
  }

  // SWITCH - change controlled player to one closest to ball
  if (doSwitch && ns.phase === "playing") {
    const myP = players.map((p, i) => ({ p, i })).filter(({ p }) => p.team === ns.myTeam);
    // Pick the one closest to ball that isn't already controlled
    const next = myP.filter(({ i }) => i !== ns.controlledIdx)
      .sort((a, b) => dist(a.p, ball) - dist(b.p, ball))[0];
    if (next) ns.controlledIdx = next.i;
  }

  // DEFENSE - pull back into defensive shape
  if (doDefense && ns.phase === "playing") {
    const ownGoalX = ns.myTeam === 0 ? PITCH.left : PITCH.right;
    const midY = (PITCH.top + PITCH.bottom) / 2;
    players.forEach((p, i) => {
      if (p.team === ns.myTeam && !p.isKeeper) {
        // Pull non-keepers toward defensive third
        const defX = ns.myTeam === 0
          ? clamp(ball.x - 80, PITCH.left + 40, (PITCH.left + PITCH.right) / 2)
          : clamp(ball.x + 80, (PITCH.left + PITCH.right) / 2, PITCH.right - 40);
        const slotY = midY + ((i % 3) - 1) * 70;
        const d = norm({ x: defX - p.x, y: slotY - p.y });
        p.vx = lerp(p.vx, d.x * PLAYER_SPEED * 1.4, 0.3);
        p.vy = lerp(p.vy, d.y * PLAYER_SPEED * 1.4, 0.3);
      }
    });
  }

  // Ball physics
  ball.trail.push({ x: ball.x, y: ball.y });
  if (ball.trail.length > 8) ball.trail.shift();
  ball.x += ball.vx; ball.y += ball.vy;
  ball.vx *= FRICTION; ball.vy *= FRICTION;
  ball.spin *= 0.95;

  // Ball wall bounces - top/bottom pitch boundary
  if (ball.y - BALL_R < PITCH.top)    { ball.y = PITCH.top + BALL_R;    ball.vy *= -0.65; }
  if (ball.y + BALL_R > PITCH.bottom) { ball.y = PITCH.bottom - BALL_R; ball.vy *= -0.65; }

  // ── Goal & post physics ──────────────────────────────────────────────────
  const goalMidY = (PITCH.top + PITCH.bottom) / 2;
  const goalTop  = goalMidY - GOAL_W / 2;
  const goalBot  = goalMidY + GOAL_W / 2;
  const postR    = 4; // must match drawGoal postR

  let goalScored: 0 | 1 | null = null;

  // Helper: is ball inside a goal mouth (between the posts)?
  const inLeftGoal  = ball.y > goalTop + postR && ball.y < goalBot - postR;
  const inRightGoal = ball.y > goalTop + postR && ball.y < goalBot - postR;

  // ── LEFT GOAL ─────────────────────────────────────────────────────────────
  if (ball.x - BALL_R < PITCH.left) {
    if (inLeftGoal) {
      // Ball entered the goal mouth — let it travel into the net
      const backWall = PITCH.left - GOAL_DEPTH + BALL_R;
      if (ball.x - BALL_R < backWall) {
        // Hit the back wall → goal scored
        goalScored = 1;
        ball.x = backWall + BALL_R;
        ball.vx *= -0.35; // dead bounce in net
        ball.vy *= 0.7;
      }
      // Top/bottom inner post of left goal
      if (ball.y - BALL_R < goalTop + postR) {
        ball.y = goalTop + postR + BALL_R; ball.vy = Math.abs(ball.vy) * 0.6;
      }
      if (ball.y + BALL_R > goalBot - postR) {
        ball.y = goalBot - postR - BALL_R; ball.vy = -Math.abs(ball.vy) * 0.6;
      }
    } else {
      // Hit the goal post (not in opening) — bounce off front post
      ball.x = PITCH.left + BALL_R; ball.vx = Math.abs(ball.vx) * 0.55;
      ball.vy *= 0.8;
    }
  }

  // ── RIGHT GOAL ────────────────────────────────────────────────────────────
  if (ball.x + BALL_R > PITCH.right) {
    if (inRightGoal) {
      const backWall = PITCH.right + GOAL_DEPTH - BALL_R;
      if (ball.x + BALL_R > backWall) {
        goalScored = 0;
        ball.x = backWall - BALL_R;
        ball.vx *= -0.35;
        ball.vy *= 0.7;
      }
      // Top/bottom inner post of right goal
      if (ball.y - BALL_R < goalTop + postR) {
        ball.y = goalTop + postR + BALL_R; ball.vy = Math.abs(ball.vy) * 0.6;
      }
      if (ball.y + BALL_R > goalBot - postR) {
        ball.y = goalBot - postR - BALL_R; ball.vy = -Math.abs(ball.vy) * 0.6;
      }
    } else {
      ball.x = PITCH.right - BALL_R; ball.vx = -Math.abs(ball.vx) * 0.55;
      ball.vy *= 0.8;
    }
  }

  // Player-ball collisions
  players.forEach(p => {
    const d = dist(p, ball);
    if (d < PLAYER_R + BALL_R) {
      const n = norm({ x: ball.x - p.x, y: ball.y - p.y });
      const overlap = PLAYER_R + BALL_R - d;
      ball.x += n.x * overlap; ball.y += n.y * overlap;
      const rv = { x: ball.vx - p.vx, y: ball.vy - p.vy };
      const dot = rv.x * n.x + rv.y * n.y;
      if (dot < 0) { ball.vx -= dot * n.x * 1.3; ball.vy -= dot * n.y * 1.3; }
    }
  });

  // Auto-switch controlled player to nearest with ball
  if (ns.phase === "playing") {
    const myP = players.map((p, i) => ({ p, i })).filter(({ p }) => p.team === ns.myTeam);
    const nearest = myP.sort((a, b) => dist(a.p, ball) - dist(b.p, ball))[0];
    if (nearest) ns.controlledIdx = nearest.i;
  }

  // Sudden death goal
  if (goalScored !== null && ns.gameMode === "sudden-death") {
    const newScore: [number, number] = [...ns.score] as [number, number];
    newScore[goalScored]++;
    return { ...ns, score: newScore, phase: "finished", lastGoalTeam: goalScored };
  }

  if (goalScored !== null) {
    const newScore: [number, number] = [...ns.score] as [number, number];
    newScore[goalScored]++;
    return { ...ns, score: newScore, phase: "goal", lastGoalTeam: goalScored };
  }

  return ns;
}

// ─── 3D Stick Figure Renderer ─────────────────────────────────────────────────
function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, isControlled: boolean, teamColor: string) {
  const s = toScreen(p.x, p.y);
  const sx = s.x, sy = s.y;

  // Shadow ellipse
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.ellipse(sx, sy + PLAYER_R - 2, PLAYER_R * 0.85, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.globalAlpha = 1;

  // Glow ring for player with ball / controlled
  if (isControlled || p.hasBall) {
    ctx.beginPath();
    ctx.arc(sx, sy, PLAYER_R + 6, 0, Math.PI * 2);
    const grd = ctx.createRadialGradient(sx, sy, PLAYER_R - 2, sx, sy, PLAYER_R + 8);
    grd.addColorStop(0, isControlled ? "rgba(255,220,0,0.6)" : "rgba(255,255,255,0.35)");
    grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd;
    ctx.fill();
  }

  // --- 3D stick figure ---
  const run = Math.sin(p.runPhase) * 5; // leg swing
  const bodyBob = Math.abs(Math.sin(p.runPhase)) * 2;
  const color = teamColor;
  const lw = 3.2;

  // Body torso (capsule-like)
  const bodyTop = sy - 18 - bodyBob;
  const bodyBot = sy - 4 - bodyBob;

  // Legs
  ctx.lineCap = "round";
  ctx.lineWidth = lw;
  ctx.strokeStyle = color;
  // Left leg
  ctx.beginPath();
  ctx.moveTo(sx, bodyBot);
  ctx.lineTo(sx - 4 + run, sy + 4 - bodyBob);
  ctx.lineTo(sx - 6 + run, sy + 10 - bodyBob);
  ctx.stroke();
  // Right leg
  ctx.beginPath();
  ctx.moveTo(sx, bodyBot);
  ctx.lineTo(sx + 4 - run, sy + 4 - bodyBob);
  ctx.lineTo(sx + 6 - run, sy + 10 - bodyBob);
  ctx.stroke();

  // Body torso
  ctx.lineWidth = lw + 0.5;
  ctx.beginPath();
  ctx.moveTo(sx, bodyTop + 4);
  ctx.lineTo(sx, bodyBot);
  ctx.stroke();

  // Arms
  ctx.lineWidth = lw - 0.5;
  const armY = bodyTop + 8;
  // Left arm
  ctx.beginPath();
  ctx.moveTo(sx, armY);
  ctx.lineTo(sx - 8 - run * 0.5, armY + 7 + run * 0.3);
  ctx.stroke();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(sx, armY);
  ctx.lineTo(sx + 8 + run * 0.5, armY + 7 - run * 0.3);
  ctx.stroke();

  // Head (3D sphere effect)
  const headR = 9;
  const headY = bodyTop - headR + 2;
  const headGrd = ctx.createRadialGradient(sx - 2, headY - 2, 1, sx, headY, headR);
  headGrd.addColorStop(0, lighten(color, 40));
  headGrd.addColorStop(0.6, color);
  headGrd.addColorStop(1, darken(color, 30));
  ctx.beginPath();
  ctx.arc(sx, headY, headR, 0, Math.PI * 2);
  ctx.fillStyle = headGrd;
  ctx.fill();
  ctx.strokeStyle = darken(color, 20);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Eyes (tiny dots)
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath(); ctx.arc(sx - 2.5, headY - 1, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx + 2.5, headY - 1, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.arc(sx - 2.5, headY - 1, 0.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx + 2.5, headY - 1, 0.8, 0, Math.PI * 2); ctx.fill();

  // Keeper: yellow gloves
  if (p.isKeeper) {
    ctx.beginPath(); ctx.arc(sx - 8 - run * 0.5, armY + 7 + run * 0.3, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD700"; ctx.fill();
    ctx.beginPath(); ctx.arc(sx + 8 + run * 0.5, armY + 7 - run * 0.3, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD700"; ctx.fill();
  }

  // Number badge on chest
  ctx.font = "bold 6px Arial";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 2;
  ctx.strokeText(String(p.number), sx, armY + 3);
  ctx.fillText(String(p.number), sx, armY + 3);

  ctx.restore();
}

function lighten(hex: string, amt: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amt);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amt);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amt);
  return `rgb(${r},${g},${b})`;
}
function darken(hex: string, amt: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amt);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amt);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amt);
  return `rgb(${r},${g},${b})`;
}

// ─── Pitch Renderer ───────────────────────────────────────────────────────────
function renderPitch(ctx: CanvasRenderingContext2D, theme: PitchTheme, score: [number,number], timeLeft: number, team0Name: string, team1Name: string, team0Color: string, team1Color: string) {
  const T = PITCH_THEMES[theme];

  // Background (stadium exterior)
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, W, H);

  // Stadium crowd area (top, 3D illusion)
  const crowdH = PITCH.top - 10;
  const crowdGrd = ctx.createLinearGradient(0, 0, 0, crowdH);
  crowdGrd.addColorStop(0, darken(T.crowd || "#8B7355", 20));
  crowdGrd.addColorStop(1, T.crowd || "#8B7355");
  ctx.fillStyle = crowdGrd;
  ctx.fillRect(0, 0, W, crowdH);

  // Draw crowd rows (tiny heads - like in the video)
  for (let row = 0; row < 4; row++) {
    const rowY = 28 + row * 22;
    const cols = Math.floor(W / 18);
    for (let col = 0; col < cols; col++) {
      const cx = 9 + col * 18 + (row % 2 === 0 ? 9 : 0);
      // Body
      const crowdColor = `hsl(${(col * 37 + row * 53) % 360}, 40%, ${35 + (row * 5)}%)`;
      ctx.fillStyle = crowdColor;
      ctx.beginPath(); ctx.ellipse(cx, rowY + 10, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
      // Head
      ctx.beginPath(); ctx.arc(cx, rowY, 5, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(col * 20 + 30) % 60 + 20}, 50%, 70%)`; ctx.fill();
    }
  }

  // Pitch wall / border (3D effect - the rounded rectangular wall like in video)
  ctx.fillStyle = T.wall;
  ctx.beginPath();
  roundRect(ctx, PITCH.left - 14, PITCH.top - 14, PITCH_W + 28, PITCH_H + 28, 22);
  ctx.fill();

  // Pitch floor stripes (alternating)
  const stripes = 7;
  const stripeW = PITCH_W / stripes;
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, PITCH.left, PITCH.top, PITCH_W, PITCH_H, 10);
  ctx.clip();
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? T.floor : T.floorAlt;
    ctx.fillRect(PITCH.left + i * stripeW, PITCH.top, stripeW, PITCH_H);
  }
  ctx.restore();

  // Pitch lines
  ctx.strokeStyle = T.line;
  ctx.lineWidth = 1.5;
  // Border
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, PITCH.left, PITCH.top, PITCH_W, PITCH_H, 10);
  ctx.stroke();

  // Centre line
  ctx.beginPath();
  ctx.moveTo(W / 2, PITCH.top);
  ctx.lineTo(W / 2, PITCH.bottom);
  ctx.stroke();

  // Centre circle
  ctx.beginPath();
  ctx.arc(W / 2, (PITCH.top + PITCH.bottom) / 2, 55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, (PITCH.top + PITCH.bottom) / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = T.line; ctx.fill();

  // Penalty boxes - proportional to long pitch
  const pBoxW = 120, pBoxH = 160;
  const midY = (PITCH.top + PITCH.bottom) / 2;
  ctx.strokeRect(PITCH.left, midY - pBoxH / 2, pBoxW, pBoxH);
  ctx.strokeRect(PITCH.right - pBoxW, midY - pBoxH / 2, pBoxW, pBoxH);
  ctx.restore();

  // ── Goals: proper 3D scaffold/cage structure ──────────────────────────────
  const goalTop = midY - GOAL_W / 2;
  const goalBot = midY + GOAL_W / 2;
  const postR = 4;       // post radius / half-width
  const goalColor = "#e8e8e8";
  const goalShadow = "rgba(0,0,0,0.55)";
  const netColor = "rgba(220,235,255,0.22)";
  const netLines = 6;

  function drawGoal(side: "left" | "right") {
    const isLeft = side === "left";
    // gx = the pitch edge where goal mouth is; gd = depth direction
    const gx = isLeft ? PITCH.left : PITCH.right;
    const gd = isLeft ? -1 : 1; // -1 = extends left, +1 = extends right
    const back = gx + gd * GOAL_DEPTH;

    // ── Net fill (back panel + sides) ─────────────────────────────────────
    // Back net
    ctx.fillStyle = "rgba(30,40,80,0.55)";
    ctx.fillRect(
      Math.min(gx, back), goalTop + postR,
      GOAL_DEPTH - postR, GOAL_W - postR * 2
    );

    // Net grid lines - horizontal
    ctx.strokeStyle = netColor;
    ctx.lineWidth = 0.7;
    for (let i = 1; i <= netLines; i++) {
      const ny = goalTop + (i / (netLines + 1)) * GOAL_W;
      ctx.beginPath();
      ctx.moveTo(gx, ny);
      ctx.lineTo(back, ny);
      ctx.stroke();
    }
    // Net grid lines - vertical (depth lines)
    const depthSegs = 4;
    for (let i = 1; i <= depthSegs; i++) {
      const nx = gx + gd * (i / (depthSegs + 1)) * GOAL_DEPTH;
      ctx.beginPath();
      ctx.moveTo(nx, goalTop);
      ctx.lineTo(nx, goalBot);
      ctx.stroke();
    }
    // Side net panels (triangular perspective)
    ctx.strokeStyle = "rgba(200,220,255,0.14)";
    for (let i = 1; i <= netLines; i++) {
      const ny = goalTop + (i / (netLines + 1)) * GOAL_W;
      // top side panel
      ctx.beginPath(); ctx.moveTo(gx, goalTop); ctx.lineTo(back, goalTop); ctx.stroke();
      // bottom side panel
      ctx.beginPath(); ctx.moveTo(gx, goalBot); ctx.lineTo(back, goalBot); ctx.stroke();
    }

    // ── Back post (far end bar) ────────────────────────────────────────────
    ctx.fillStyle = goalShadow;
    ctx.fillRect(back - (isLeft ? postR : 0), goalTop - postR, postR * 2, GOAL_W + postR * 2);
    ctx.fillStyle = goalColor;
    ctx.fillRect(back - (isLeft ? postR - 1 : 1), goalTop - postR + 1, postR * 2 - 2, GOAL_W + postR * 2 - 2);

    // ── Left/right side bars (depth bars connecting front posts to back) ──
    // Top depth bar shadow
    ctx.fillStyle = goalShadow;
    ctx.fillRect(Math.min(gx, back) - (isLeft ? 0 : postR), goalTop - postR, GOAL_DEPTH + postR, postR * 2);
    ctx.fillStyle = goalColor;
    ctx.fillRect(Math.min(gx, back) - (isLeft ? 0 : postR) + 1, goalTop - postR + 1, GOAL_DEPTH + postR - 2, postR * 2 - 2);
    // Bottom depth bar shadow
    ctx.fillStyle = goalShadow;
    ctx.fillRect(Math.min(gx, back) - (isLeft ? 0 : postR), goalBot - postR, GOAL_DEPTH + postR, postR * 2);
    ctx.fillStyle = goalColor;
    ctx.fillRect(Math.min(gx, back) - (isLeft ? 0 : postR) + 1, goalBot - postR + 1, GOAL_DEPTH + postR - 2, postR * 2 - 2);

    // ── Front posts (the two uprights at pitch edge) ───────────────────────
    // Top post (upright)
    const grad1 = ctx.createLinearGradient(gx - postR, 0, gx + postR, 0);
    grad1.addColorStop(0, "#aaa");
    grad1.addColorStop(0.4, "#fff");
    grad1.addColorStop(1, "#bbb");
    ctx.fillStyle = goalShadow;
    ctx.fillRect(gx - postR - 1, goalTop - postR - 1, postR * 2 + 2, postR + 3);
    ctx.fillStyle = grad1;
    ctx.fillRect(gx - postR, goalTop - postR, postR * 2, postR + 2);

    // Bottom post (upright)
    ctx.fillStyle = goalShadow;
    ctx.fillRect(gx - postR - 1, goalBot - 2, postR * 2 + 2, postR + 2);
    ctx.fillStyle = grad1;
    ctx.fillRect(gx - postR, goalBot - 1, postR * 2, postR + 1);

    // ── Crossbar (the vertical bar connecting top & bottom posts at front) ─
    const barGrad = ctx.createLinearGradient(gx - postR, 0, gx + postR, 0);
    barGrad.addColorStop(0, "#999");
    barGrad.addColorStop(0.35, "#ffffff");
    barGrad.addColorStop(1, "#ccc");
    ctx.fillStyle = goalShadow;
    ctx.fillRect(gx - postR - 1, goalTop - postR - 1, postR * 2 + 2, GOAL_W + postR * 2 + 2);
    ctx.fillStyle = barGrad;
    ctx.fillRect(gx - postR, goalTop - postR, postR * 2, GOAL_W + postR * 2);

    // ── Post highlight (bright strip on front face) ─────────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(gx - postR + 2, goalTop - postR + 2, 2, GOAL_W + postR * 2 - 4);

    // ── Outer scaffold support bars (the diagonal/horizontal frame like in screenshots) ─
    ctx.strokeStyle = "rgba(200,200,200,0.35)";
    ctx.lineWidth = 1.5;
    // Top scaffold
    ctx.beginPath(); ctx.moveTo(gx + gd * 4, goalTop - postR - 8);
    ctx.lineTo(back + gd * 4, goalTop - postR - 8); ctx.stroke();
    // Bottom scaffold
    ctx.beginPath(); ctx.moveTo(gx + gd * 4, goalBot + postR + 8);
    ctx.lineTo(back + gd * 4, goalBot + postR + 8); ctx.stroke();
    // Vertical scaffold corners
    ctx.beginPath(); ctx.moveTo(gx + gd * 4, goalTop - postR - 8);
    ctx.lineTo(gx + gd * 4, goalBot + postR + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(back + gd * 4, goalTop - postR - 8);
    ctx.lineTo(back + gd * 4, goalBot + postR + 8); ctx.stroke();
  }

  drawGoal("left");
  drawGoal("right");

  // Advertising boards (Playza branding) - top and bottom of pitch like in video
  const boardH = 14;
  ctx.fillStyle = "#0a0a1e";
  ctx.fillRect(PITCH.left, PITCH.top - boardH - 2, PITCH_W, boardH);
  ctx.fillRect(PITCH.left, PITCH.bottom + 2, PITCH_W, boardH);
  const ads = ["PLAYZA", "⚽ SCORE HERO", "PLAYZA.GG", "H2H ZONE", "WIN BIG", "⚡ PLAYZA", "PLAY NOW", "PLAYZA"];
  ctx.font = "bold 8px Arial";
  ctx.textAlign = "center";
  const segW = PITCH_W / ads.length;
  ads.forEach((ad, i) => {
    ctx.fillStyle = i % 2 === 0 ? "#FFD700" : "#ffffff";
    ctx.fillText(ad, PITCH.left + segW * i + segW / 2, PITCH.top - boardH + 9);
    ctx.fillText(ad, PITCH.left + segW * i + segW / 2, PITCH.bottom + 10);
  });

  // Scoreboard at very top - centered
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  roundRect(ctx, W / 2 - 130, 5, 260, 42, 10);
  ctx.fill();
  // Team 0
  ctx.fillStyle = team0Color;
  ctx.beginPath(); ctx.arc(W / 2 - 100, 26, 12, 0, Math.PI * 2); ctx.fill();
  ctx.font = "bold 9px Arial"; ctx.textAlign = "center"; ctx.fillStyle = "#fff";
  ctx.fillText(team0Name.slice(0, 8).toUpperCase(), W / 2 - 100, 46);
  // Team 1
  ctx.fillStyle = team1Color;
  ctx.beginPath(); ctx.arc(W / 2 + 100, 26, 12, 0, Math.PI * 2); ctx.fill();
  ctx.font = "bold 9px Arial"; ctx.textAlign = "center"; ctx.fillStyle = "#fff";
  ctx.fillText(team1Name.slice(0, 8).toUpperCase(), W / 2 + 100, 46);
  // Score
  ctx.font = "bold 22px Arial"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
  ctx.fillText(`${score[0]}`, W / 2 - 40, 31);
  ctx.fillText(`${score[1]}`, W / 2 + 40, 31);
  ctx.fillStyle = "#aaa"; ctx.font = "bold 14px Arial";
  ctx.fillText("–", W / 2, 31);
  // Timer
  const m = Math.floor(timeLeft / 60), sec = Math.floor(timeLeft % 60);
  ctx.fillStyle = timeLeft < 30 ? "#ff4444" : "#FFD700";
  ctx.font = "bold 10px Arial";
  ctx.fillText(`${m}:${sec.toString().padStart(2, "0")}`, W / 2, 47);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
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
  roomId?: string;
  userId?: string;
}

const SoccerGame: React.FC<SoccerGameProps> = ({
  myTeam, team0Name, team1Name, team0Color, team1Color,
  botDifficulty = "medium", gameMode = "timed",
  onGoal, onGameOver, pitchTheme = "classic",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(initState(myTeam, botDifficulty, gameMode));
  const inputRef = useRef<Vec2>({ x: 0, y: 0 });
  const passRef = useRef(false);
  const shootRef = useRef(false);
  const dashRef = useRef(false);
  const tackleRef = useRef(false);
  const switchRef = useRef(false);
  const defenseRef = useRef(false);
  const rafRef = useRef(0);
  const goalTimerRef = useRef(0);
  const kickoffTimerRef = useRef(0);
  const [overlayMsg, setOverlayMsg] = useState<string | null>("Kick Off!");
  const [theme, setTheme] = useState<PitchTheme>(pitchTheme);
  const [showPitchMenu, setShowPitchMenu] = useState(false);
  // Possession state: true = my team has ball, false = opponent has ball
  const [myPossession, setMyPossession] = useState(true);
  const possessionRef = useRef(true);

  // Joystick state
  const joystickRef = useRef({ active: false, startX: 0, startY: 0, dx: 0, dy: 0 });
  const [joystickVis, setJoystickVis] = useState({ active: false, sx: 0, sy: 0, dx: 0, dy: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let accTime = 0;
    let lastTs = performance.now();

    const loop = (ts: number) => {
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;
      const s = stateRef.current;

      if (s.phase === "kickoff") {
        kickoffTimerRef.current++;
        if (kickoffTimerRef.current > 90) {
          kickoffTimerRef.current = 0;
          stateRef.current = { ...s, phase: "playing" };
          setOverlayMsg(null);
        }
      } else if (s.phase === "playing") {
        accTime += dt;
        while (accTime >= 16) {
          accTime -= 16;
          const doPass = passRef.current; passRef.current = false;
          const doShoot = shootRef.current; shootRef.current = false;
          const doDash = dashRef.current; dashRef.current = false;
          const doTackle = tackleRef.current; tackleRef.current = false;
          const doSwitch = switchRef.current; switchRef.current = false;
          const doDefense = defenseRef.current; defenseRef.current = false;
          stateRef.current = tick(stateRef.current, inputRef.current, doPass, doShoot, doDash, doTackle, doSwitch, doDefense);

          // Track possession - update React state throttled
          const cur = stateRef.current;
          const ballHolder = cur.players.find(p => p.hasBall);
          const newPossession = !ballHolder || ballHolder.team === myTeam;
          if (newPossession !== possessionRef.current) {
            possessionRef.current = newPossession;
            setMyPossession(newPossession);
          }

          if (gameMode === "timed") {
            stateRef.current.timeLeft -= 16 / 1000;
            if (stateRef.current.timeLeft <= 0) {
              stateRef.current = { ...stateRef.current, timeLeft: 0, phase: "finished" };
              setOverlayMsg("Full Time!");
              const [s0, s1] = stateRef.current.score;
              onGameOver?.(stateRef.current.score, s0 > s1 ? 0 : s1 > s0 ? 1 : null);
            }
          }
        }
      } else if (s.phase === "goal") {
        goalTimerRef.current++;
        if (goalTimerRef.current === 1) {
          const scorer = s.lastGoalTeam === 0 ? team0Name : team1Name;
          setOverlayMsg(`⚽ GOAL!\n${scorer}`);
          onGoal?.(s.score);
        }
        if (goalTimerRef.current > 130) {
          goalTimerRef.current = 0;
          const nextKickoff: 0 | 1 = s.lastGoalTeam === 0 ? 1 : 0;
          stateRef.current = resetPositions(s, nextKickoff);
          stateRef.current = { ...stateRef.current, score: s.score };
          setOverlayMsg("Kick Off!");
        }
      } else if (s.phase === "finished") {
        setOverlayMsg("Full Time!");
      }

      // Render
      const cur = stateRef.current;
      renderPitch(ctx, theme, cur.score, cur.timeLeft, team0Name, team1Name, team0Color, team1Color);

      // Sort players by Y for correct draw order (lower Y = further back = draw first)
      const sorted = [...cur.players].sort((a, b) => a.y - b.y);
      sorted.forEach(p => {
        const color = p.team === 0 ? team0Color : team1Color;
        const isControlled = cur.players.indexOf(p) === cur.controlledIdx && p.team === cur.myTeam;
        drawPlayer(ctx, p, isControlled, color);
      });

      // Ball
      const ball = cur.ball;
      // Trail
      ball.trail.forEach((pt, i) => {
        const alpha = (i / ball.trail.length) * 0.5;
        const size = BALL_R * (i / ball.trail.length) * 0.8;
        ctx.beginPath();
        ctx.arc(toScreen(pt.x, pt.y).x, toScreen(pt.x, pt.y).y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${alpha})`;
        ctx.fill();
      });
      // Ball shadow
      const bs = toScreen(ball.x, ball.y);
      ctx.beginPath();
      ctx.ellipse(bs.x, bs.y + BALL_R - 2, BALL_R * 0.9, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fill();
      // Ball body (3D sphere)
      const bGrd = ctx.createRadialGradient(bs.x - 2, bs.y - 3, 1, bs.x, bs.y, BALL_R);
      bGrd.addColorStop(0, "#ffffff");
      bGrd.addColorStop(0.4, "#e8e8e8");
      bGrd.addColorStop(0.8, "#aaaaaa");
      bGrd.addColorStop(1, "#555555");
      ctx.beginPath(); ctx.arc(bs.x, bs.y, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = bGrd; ctx.fill();
      ctx.strokeStyle = "#222"; ctx.lineWidth = 0.8; ctx.stroke();
      // Ball pentagon marks
      ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 0.6;
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + ball.spin;
        const mx = bs.x + Math.cos(angle) * (BALL_R * 0.5);
        const my = bs.y + Math.sin(angle) * (BALL_R * 0.5);
        ctx.beginPath(); ctx.arc(mx, my, 2, 0, Math.PI * 2); ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [theme, team0Color, team1Color, team0Name, team1Name, gameMode, myTeam, onGoal, onGameOver]);

  // Keyboard
  useEffect(() => {
    const down = new Set<string>();
    const onKD = (e: KeyboardEvent) => {
      down.add(e.key);
      const dir = { x: 0, y: 0 };
      if (down.has("ArrowLeft") || down.has("a")) dir.x -= 1;
      if (down.has("ArrowRight") || down.has("d")) dir.x += 1;
      if (down.has("ArrowUp") || down.has("w")) dir.y -= 1;
      if (down.has("ArrowDown") || down.has("s")) dir.y += 1;
      const l = Math.hypot(dir.x, dir.y) || 1;
      inputRef.current = { x: dir.x / l, y: dir.y / l };
      if (e.key === " " || e.key === "x") { possessionRef.current ? (shootRef.current = true) : (defenseRef.current = true); }
      if (e.key === "z" || e.key === "c") { possessionRef.current ? (passRef.current = true) : (switchRef.current = true); }
      if (e.key === "q" || e.key === "Q") { possessionRef.current ? (dashRef.current = true) : (tackleRef.current = true); }
    };
    const onKU = (e: KeyboardEvent) => {
      down.delete(e.key);
      const dir = { x: 0, y: 0 };
      if (down.has("ArrowLeft") || down.has("a")) dir.x -= 1;
      if (down.has("ArrowRight") || down.has("d")) dir.x += 1;
      if (down.has("ArrowUp") || down.has("w")) dir.y -= 1;
      if (down.has("ArrowDown") || down.has("s")) dir.y += 1;
      inputRef.current = dir;
      if (e.key === "q" || e.key === "Q") { dashRef.current = false; tackleRef.current = false; }
    };
    window.addEventListener("keydown", onKD);
    window.addEventListener("keyup", onKU);
    return () => { window.removeEventListener("keydown", onKD); window.removeEventListener("keyup", onKU); };
  }, []);

  // Joystick handlers
  const onJoyStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const pt = "touches" in e ? e.touches[0] : e;
    joystickRef.current = { active: true, startX: pt.clientX, startY: pt.clientY, dx: 0, dy: 0 };
    setJoystickVis({ active: true, sx: pt.clientX, sy: pt.clientY, dx: 0, dy: 0 });
  }, []);

  const onJoyMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickRef.current.active) return;
    const pt = "touches" in e ? e.touches[0] : e;
    const dx = pt.clientX - joystickRef.current.startX;
    const dy = pt.clientY - joystickRef.current.startY;
    const maxR = 40;
    const l = Math.hypot(dx, dy);
    const nx = l > maxR ? (dx / l) * maxR : dx;
    const ny = l > maxR ? (dy / l) * maxR : dy;
    joystickRef.current.dx = nx; joystickRef.current.dy = ny;
    const il = Math.hypot(dx, dy) || 1;
    inputRef.current = { x: clamp(dx / il, -1, 1), y: clamp(dy / il, -1, 1) };
    setJoystickVis(v => ({ ...v, dx: nx, dy: ny }));
  }, []);

  const onJoyEnd = useCallback(() => {
    joystickRef.current.active = false;
    inputRef.current = { x: 0, y: 0 };
    setJoystickVis(v => ({ ...v, active: false, dx: 0, dy: 0 }));
  }, []);

  return (
    <div className="flex flex-col items-center w-full select-none bg-[#0a0a1e]" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Canvas */}
      <div className="relative w-full overflow-x-auto" style={{ maxWidth: W }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full touch-none"
          style={{ display: "block", imageRendering: "crisp-edges", minWidth: 480 }}
        />

        {/* Goal / Kickoff overlay */}
        {overlayMsg && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              {overlayMsg.split("\n").map((line, i) => (
                <div key={i} className={i === 0
                  ? "text-yellow-400 font-black drop-shadow-2xl animate-bounce"
                  : "text-white font-black mt-1"}
                  style={{ fontSize: i === 0 ? 42 : 22, textShadow: "0 0 20px rgba(255,200,0,0.8)" }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pitch picker */}
        <button
          onClick={() => setShowPitchMenu(v => !v)}
          className="absolute top-14 right-2 bg-black/60 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-white/20"
        >
          🏟 Pitch
        </button>
        {showPitchMenu && (
          <div className="absolute top-24 right-2 bg-gray-900/95 border border-white/20 rounded-xl p-2 z-50 space-y-1">
            {(Object.keys(PITCH_THEMES) as PitchTheme[]).map(t => (
              <button key={t} onClick={() => { setTheme(t); setShowPitchMenu(false); }}
                className={`block w-full text-left px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${theme === t ? "bg-yellow-500 text-black" : "text-white hover:bg-white/10"}`}>
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Controls bar ── */}
      <div
        className="w-full flex items-center justify-between px-5 py-3 bg-[#0d0d1f]"
        style={{ maxWidth: W, minHeight: 120 }}
      >
        {/* ── LEFT: Analogue Joystick (always visible) ── */}
        <div
          className="relative flex-shrink-0"
          style={{ width: 100, height: 100 }}
          onMouseDown={onJoyStart}
          onMouseMove={onJoyMove}
          onMouseUp={onJoyEnd}
          onMouseLeave={onJoyEnd}
          onTouchStart={e => { e.preventDefault(); onJoyStart(e); }}
          onTouchMove={e => { e.preventDefault(); onJoyMove(e); }}
          onTouchEnd={e => { e.preventDefault(); onJoyEnd(); }}
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              border: "2px solid rgba(255,255,255,0.18)",
              boxShadow: "0 0 18px rgba(100,180,255,0.12)",
            }}
          />
          {/* Subtle crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-px h-full" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>
          {/* Inner knob */}
          <div
            className="absolute rounded-full"
            style={{
              width: 40, height: 40,
              left: 50 - 20 + (joystickVis.active ? joystickVis.dx * 0.75 : 0),
              top: 50 - 20 + (joystickVis.active ? joystickVis.dy * 0.75 : 0),
              transition: joystickVis.active ? "none" : "all 0.12s ease-out",
              background: "radial-gradient(circle at 38% 35%, rgba(255,255,255,0.35) 0%, rgba(200,220,255,0.18) 55%, rgba(120,160,255,0.08) 100%)",
              border: "2px solid rgba(255,255,255,0.35)",
              boxShadow: "0 2px 12px rgba(100,160,255,0.25), inset 0 1px 4px rgba(255,255,255,0.2)",
            }}
          />
        </div>

        {/* ── RIGHT: Contextual Action Buttons ── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {myPossession ? (
            // ── ATTACK MODE: DASH + PASS + SHOOT ──
            <>
              {/* DASH */}
              <div className="flex flex-col items-center gap-1">
                <button
                  className="relative flex items-center justify-center rounded-full font-black uppercase tracking-widest text-xs transition-all active:scale-90"
                  style={{
                    width: 68, height: 68,
                    background: "radial-gradient(circle at 38% 32%, rgba(255,60,120,0.22) 0%, rgba(180,0,80,0.10) 100%)",
                    border: "2px solid rgba(255,80,140,0.75)",
                    color: "#ff4d8f",
                    boxShadow: "0 0 18px rgba(255,60,120,0.35), inset 0 0 14px rgba(255,60,120,0.12)",
                    textShadow: "0 0 10px rgba(255,80,140,0.9)",
                    letterSpacing: "0.08em",
                  }}
                  onMouseDown={() => { dashRef.current = true; }}
                  onMouseUp={() => { dashRef.current = false; }}
                  onTouchStart={e => { e.preventDefault(); dashRef.current = true; }}
                  onTouchEnd={e => { e.preventDefault(); dashRef.current = false; }}
                >
                  DASH
                </button>
                <span className="text-[8px] uppercase tracking-widest" style={{ color: "rgba(255,80,140,0.45)" }}>Q</span>
              </div>

              {/* PASS */}
              <div className="flex flex-col items-center gap-1">
                <button
                  className="relative flex items-center justify-center rounded-full font-black uppercase tracking-widest text-xs transition-all active:scale-90"
                  style={{
                    width: 76, height: 76,
                    background: "radial-gradient(circle at 38% 32%, rgba(0,210,255,0.22) 0%, rgba(0,120,200,0.10) 100%)",
                    border: "2px solid rgba(0,210,255,0.75)",
                    color: "#00d4ff",
                    boxShadow: "0 0 22px rgba(0,200,255,0.38), inset 0 0 16px rgba(0,200,255,0.12)",
                    textShadow: "0 0 10px rgba(0,210,255,0.95)",
                    letterSpacing: "0.08em",
                  }}
                  onMouseDown={() => { passRef.current = true; }}
                  onTouchStart={e => { e.preventDefault(); passRef.current = true; }}
                >
                  PASS
                </button>
                <span className="text-[8px] uppercase tracking-widest" style={{ color: "rgba(0,200,255,0.45)" }}>Z / C</span>
              </div>

              {/* SHOOT */}
              <div className="flex flex-col items-center gap-1">
                <button
                  className="relative flex items-center justify-center rounded-full font-black uppercase tracking-widest text-xs transition-all active:scale-90"
                  style={{
                    width: 86, height: 86,
                    background: "radial-gradient(circle at 38% 32%, rgba(255,140,0,0.25) 0%, rgba(180,60,0,0.12) 100%)",
                    border: "2.5px solid rgba(255,150,0,0.85)",
                    color: "#ffaa00",
                    boxShadow: "0 0 26px rgba(255,130,0,0.42), inset 0 0 18px rgba(255,120,0,0.14)",
                    textShadow: "0 0 12px rgba(255,150,0,1)",
                    letterSpacing: "0.08em",
                    fontSize: 13,
                  }}
                  onMouseDown={() => { shootRef.current = true; }}
                  onTouchStart={e => { e.preventDefault(); shootRef.current = true; }}
                >
                  SHOOT
                </button>
                <span className="text-[8px] uppercase tracking-widest" style={{ color: "rgba(255,140,0,0.45)" }}>Space</span>
              </div>
            </>
          ) : (
            // ── DEFEND MODE: TACKLE + SWITCH + DEFENSE ──
            <>
              {/* TACKLE */}
              <div className="flex flex-col items-center gap-1">
                <button
                  className="relative flex items-center justify-center rounded-full font-black uppercase tracking-widest text-xs transition-all active:scale-90"
                  style={{
                    width: 68, height: 68,
                    background: "radial-gradient(circle at 38% 32%, rgba(255,60,60,0.22) 0%, rgba(160,0,0,0.10) 100%)",
                    border: "2px solid rgba(255,80,80,0.75)",
                    color: "#ff5555",
                    boxShadow: "0 0 18px rgba(255,60,60,0.35), inset 0 0 14px rgba(255,60,60,0.12)",
                    textShadow: "0 0 10px rgba(255,80,80,0.9)",
                    letterSpacing: "0.08em",
                  }}
                  onMouseDown={() => { tackleRef.current = true; }}
                  onTouchStart={e => { e.preventDefault(); tackleRef.current = true; }}
                >
                  TACKLE
                </button>
                <span className="text-[8px] uppercase tracking-widest" style={{ color: "rgba(255,80,80,0.45)" }}>Q</span>
              </div>

              {/* SWITCH */}
              <div className="flex flex-col items-center gap-1">
                <button
                  className="relative flex items-center justify-center rounded-full font-black uppercase tracking-widest text-xs transition-all active:scale-90"
                  style={{
                    width: 76, height: 76,
                    background: "radial-gradient(circle at 38% 32%, rgba(0,210,255,0.22) 0%, rgba(0,120,200,0.10) 100%)",
                    border: "2px solid rgba(0,210,255,0.75)",
                    color: "#00d4ff",
                    boxShadow: "0 0 22px rgba(0,200,255,0.38), inset 0 0 16px rgba(0,200,255,0.12)",
                    textShadow: "0 0 10px rgba(0,210,255,0.95)",
                    letterSpacing: "0.08em",
                  }}
                  onMouseDown={() => { switchRef.current = true; }}
                  onTouchStart={e => { e.preventDefault(); switchRef.current = true; }}
                >
                  SWITCH
                </button>
                <span className="text-[8px] uppercase tracking-widest" style={{ color: "rgba(0,200,255,0.45)" }}>Z</span>
              </div>

              {/* DEFENSE */}
              <div className="flex flex-col items-center gap-1">
                <button
                  className="relative flex items-center justify-center rounded-full font-black uppercase tracking-widest text-xs transition-all active:scale-90"
                  style={{
                    width: 86, height: 86,
                    background: "radial-gradient(circle at 38% 32%, rgba(160,100,255,0.22) 0%, rgba(80,0,180,0.10) 100%)",
                    border: "2.5px solid rgba(170,110,255,0.85)",
                    color: "#c084fc",
                    boxShadow: "0 0 26px rgba(150,80,255,0.40), inset 0 0 18px rgba(140,60,255,0.14)",
                    textShadow: "0 0 12px rgba(180,110,255,1)",
                    letterSpacing: "0.08em",
                    fontSize: 12,
                  }}
                  onMouseDown={() => { defenseRef.current = true; }}
                  onTouchStart={e => { e.preventDefault(); defenseRef.current = true; }}
                >
                  DEFENSE
                </button>
                <span className="text-[8px] uppercase tracking-widest" style={{ color: "rgba(160,100,255,0.45)" }}>Space</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoccerGame;
