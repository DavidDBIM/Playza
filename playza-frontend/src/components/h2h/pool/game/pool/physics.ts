import type { Ball, Vector2 } from './types'

// ─── Table & Physics Configuration ───────────────────────────────────────────
export const TABLE_CONFIG = {
  width:         2540,
  height:        1270,
  cushionHeight: 54,
  pocketRadius:  74,
  ballRadius:    31,
}

export const PHYSICS_CONFIG = {
  /** Rolling friction — applied each frame while ball rolls */
  rollingFriction:    0.9885,
  /** Sliding friction — higher deceleration during slide phase */
  slidingFriction:    0.975,
  /** Speed below which sliding → rolling transition completes */
  slideThreshold:     2.2,
  /** Velocity magnitude below which ball is considered stopped */
  minVelocity:        0.38,
  /** Restitution coefficient for cushion (wall) impacts (0–1) */
  cushionRestitution: 0.78,
  /** Energy retained on cushion hit (simulates energy loss) */
  cushionEnergyLoss:  0.96,
  /** Restitution for ball–ball collisions */
  ballRestitution:    0.97,
  /** Gravity (px/frame² downward into table — used for pocket fall) */
  pocketGravity:      2.4,
}

export const SHOT_POWER_SCALE = 0.0054

// ─── Derived geometry ─────────────────────────────────────────────────────────
const W  = TABLE_CONFIG.width
const H  = TABLE_CONFIG.height
const MW = W / 2

const CORNER_POCKET_OFFSET = TABLE_CONFIG.pocketRadius * 0.82
const SIDE_POCKET_OFFSET   = TABLE_CONFIG.pocketRadius * 0.72
const CORNER_RAIL_CUTOFF   = TABLE_CONFIG.pocketRadius * 1.18
const SIDE_RAIL_HALF_SPAN  = TABLE_CONFIG.pocketRadius * 1.34

const INNER_LEFT   = TABLE_CONFIG.cushionHeight + TABLE_CONFIG.ballRadius
const INNER_RIGHT  = W - INNER_LEFT
const INNER_TOP    = TABLE_CONFIG.cushionHeight + TABLE_CONFIG.ballRadius
const INNER_BOTTOM = H - INNER_TOP

const CORNER_JAW_LIMIT = INNER_LEFT + CORNER_POCKET_OFFSET + TABLE_CONFIG.ballRadius * 0.42
const SIDE_JAW_LIMIT   = INNER_TOP  + SIDE_POCKET_OFFSET   + TABLE_CONFIG.ballRadius * 0.42

// Capture radius: slightly tighter than pocket so balls don't vanish too early
export const POCKET_CAPTURE_RADIUS = TABLE_CONFIG.pocketRadius - TABLE_CONFIG.ballRadius * 0.18

export const POCKET_POSITIONS: Vector2[] = [
  { x: CORNER_POCKET_OFFSET,     y: CORNER_POCKET_OFFSET },
  { x: MW,                       y: SIDE_POCKET_OFFSET },
  { x: W - CORNER_POCKET_OFFSET, y: CORNER_POCKET_OFFSET },
  { x: CORNER_POCKET_OFFSET,     y: H - CORNER_POCKET_OFFSET },
  { x: MW,                       y: H - SIDE_POCKET_OFFSET },
  { x: W - CORNER_POCKET_OFFSET, y: H - CORNER_POCKET_OFFSET },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function speed(v: Vector2): number {
  return Math.hypot(v.x, v.y)
}

/**
 * Reflect velocity off a surface described by normal (nx, ny).
 * Only reflects if the ball is moving INTO the surface.
 * Applies cushion restitution and energy loss.
 */
function reflect(ball: Ball, nx: number, ny: number) {
  const len = Math.hypot(nx, ny) || 1
  const ux  = nx / len
  const uy  = ny / len
  const dot = ball.velocity.x * ux + ball.velocity.y * uy

  if (dot < 0) {
    const factor = (1 + PHYSICS_CONFIG.cushionRestitution) * dot
    ball.velocity.x = (ball.velocity.x - factor * ux) * PHYSICS_CONFIG.cushionEnergyLoss
    ball.velocity.y = (ball.velocity.y - factor * uy) * PHYSICS_CONFIG.cushionEnergyLoss
  }
}

function resolveDiagonalJaw(
  ball:    Ball,
  metric:  number,
  limit:   number,
  signX:   number,
  signY:   number,
) {
  if (metric >= limit) return
  const correction = (limit - metric) * 0.5
  ball.position.x += signX * correction
  ball.position.y += signY * correction
  reflect(ball, signX, signY)
}

/**
 * Resolves all table-boundary and pocket-jaw interactions for a single ball.
 * Uses realistic angle-dependent reflection for cushion edges.
 */
function resolveTableBoundaries(ball: Ball) {
  const { x, y } = ball.position

  // Left cushion
  if (x < INNER_LEFT && y > CORNER_RAIL_CUTOFF && y < H - CORNER_RAIL_CUTOFF) {
    ball.position.x = INNER_LEFT
    reflect(ball, 1, 0)
  }

  // Right cushion
  if (x > INNER_RIGHT && y > CORNER_RAIL_CUTOFF && y < H - CORNER_RAIL_CUTOFF) {
    ball.position.x = INNER_RIGHT
    reflect(ball, -1, 0)
  }

  const awayFromSidePocket   = Math.abs(x - MW) > SIDE_RAIL_HALF_SPAN
  const awayFromCornerPocket = x > CORNER_RAIL_CUTOFF && x < W - CORNER_RAIL_CUTOFF

  // Top cushion
  if (y < INNER_TOP && awayFromSidePocket && awayFromCornerPocket) {
    ball.position.y = INNER_TOP
    reflect(ball, 0, 1)
  }

  // Bottom cushion
  if (y > INNER_BOTTOM && awayFromSidePocket && awayFromCornerPocket) {
    ball.position.y = INNER_BOTTOM
    reflect(ball, 0, -1)
  }

  // Corner jaw guides — diagonal deflection so balls slide toward pocket naturally
  resolveDiagonalJaw(ball, ball.position.x + ball.position.y,                           CORNER_JAW_LIMIT,  1,  1)
  resolveDiagonalJaw(ball, W - ball.position.x + ball.position.y,                       CORNER_JAW_LIMIT, -1,  1)
  resolveDiagonalJaw(ball, ball.position.x + (H - ball.position.y),                     CORNER_JAW_LIMIT,  1, -1)
  resolveDiagonalJaw(ball, (W - ball.position.x) + (H - ball.position.y),               CORNER_JAW_LIMIT, -1, -1)

  // Side pocket jaw guides
  resolveDiagonalJaw(ball, (MW - ball.position.x) + ball.position.y,                   SIDE_JAW_LIMIT, -1,  1)
  resolveDiagonalJaw(ball, (ball.position.x - MW) + ball.position.y,                   SIDE_JAW_LIMIT,  1,  1)
  resolveDiagonalJaw(ball, (MW - ball.position.x) + (H - ball.position.y),             SIDE_JAW_LIMIT, -1, -1)
  resolveDiagonalJaw(ball, (ball.position.x - MW) + (H - ball.position.y),             SIDE_JAW_LIMIT,  1, -1)
}

// ─── Physics Engine ───────────────────────────────────────────────────────────
export class PoolPhysics {
  private balls: Ball[]
  /** Track which balls are in sliding vs rolling phase */
  private slidingSet: Set<string>

  constructor(initialBalls: Ball[]) {
    this.balls = initialBalls.map((b) => ({
      ...b,
      velocity: { x: b.velocity?.x ?? 0, y: b.velocity?.y ?? 0 },
      rotation: { x: b.rotation?.x ?? 0, y: b.rotation?.y ?? 0 },
    }))
    this.slidingSet = new Set()
  }

  // ── Apply a shot to the cue ball ───────────────────────────────────────────
  applyShot(angle: number, power: number) {
    const vel = {
      x: Math.cos(angle) * power * SHOT_POWER_SCALE,
      y: Math.sin(angle) * power * SHOT_POWER_SCALE,
    }
    this.balls = this.balls.map((ball) =>
      ball.id === 'cue'
        ? { ...ball, velocity: { ...vel }, pocketed: false }
        : { ...ball, velocity: { x: 0, y: 0 } },
    )
    // Cue ball starts in sliding phase
    this.slidingSet.add('cue')
  }

  // ── Fast-forward for server-side prediction ────────────────────────────────
  simulateShot(cueBallPos: Vector2, angle: number, power: number): Ball[] {
    const vel = {
      x: Math.cos(angle) * power * SHOT_POWER_SCALE,
      y: Math.sin(angle) * power * SHOT_POWER_SCALE,
    }
    this.balls = this.balls.map((ball) =>
      ball.id === 'cue'
        ? { ...ball, position: { ...cueBallPos }, velocity: { ...vel }, pocketed: false }
        : { ...ball, velocity: { x: 0, y: 0 } },
    )
    this.slidingSet.add('cue')
    let steps = 0
    while (this.step(1) && steps++ < 6000) { /* fast-forward */ }
    return this.balls
  }

  // ── Single physics step ────────────────────────────────────────────────────
  public step(dt = 1): boolean {
    let anyMoving = false
    const R = TABLE_CONFIG.ballRadius

    for (const ball of this.balls) {
      if (ball.pocketed) continue

      const spd = speed(ball.velocity)
      if (spd > PHYSICS_CONFIG.minVelocity) {
        anyMoving = true

        // Rolling vs sliding friction
        const isSliding = this.slidingSet.has(ball.id)
        const friction  = isSliding
          ? PHYSICS_CONFIG.slidingFriction
          : PHYSICS_CONFIG.rollingFriction

        const frictionFactor = Math.pow(friction, dt)

        ball.position.x += ball.velocity.x * dt
        ball.position.y += ball.velocity.y * dt

        // Spin accumulation (rotation proportional to velocity)
        const invR = 1 / Math.max(0.001, R)
        ball.rotation.x = (ball.rotation.x + ball.velocity.x * dt * invR * 0.9) % (Math.PI * 2)
        ball.rotation.y = (ball.rotation.y + ball.velocity.y * dt * invR * 0.9) % (Math.PI * 2)

        ball.velocity.x *= frictionFactor
        ball.velocity.y *= frictionFactor

        // Transition sliding → rolling when velocity drops
        if (isSliding && spd < PHYSICS_CONFIG.slideThreshold) {
          this.slidingSet.delete(ball.id)
        }

        resolveTableBoundaries(ball)
        this.checkPockets(ball)
      } else {
        ball.velocity.x = 0
        ball.velocity.y = 0
        this.slidingSet.delete(ball.id)
      }
    }

    // Ball–ball collisions (O(n²) — fine for 16 balls)
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const b1 = this.balls[i]
        const b2 = this.balls[j]
        if (!b1.pocketed && !b2.pocketed) {
          if (this.handleBallCollision(b1, b2)) {
            // After a collision both balls enter sliding phase briefly
            this.slidingSet.add(b1.id)
            this.slidingSet.add(b2.id)
          }
        }
      }
    }

    return anyMoving
  }

  // ── Pocket capture ─────────────────────────────────────────────────────────
  private checkPockets(ball: Ball) {
    for (const pocket of POCKET_POSITIONS) {
      const dx   = ball.position.x - pocket.x
      const dy   = ball.position.y - pocket.y
      const dist = Math.hypot(dx, dy)

      if (dist < POCKET_CAPTURE_RADIUS) {
        // Pull the ball toward the pocket centre (funnel effect)
        const pullStrength = 1 - dist / POCKET_CAPTURE_RADIUS
        ball.velocity.x += (pocket.x - ball.position.x) * pullStrength * 0.18
        ball.velocity.y += (pocket.y - ball.position.y) * pullStrength * 0.18

        // Once very close, mark as pocketed
        if (dist < TABLE_CONFIG.pocketRadius * 0.44) {
          ball.pocketed    = true
          ball.velocity.x  = 0
          ball.velocity.y  = 0
          this.slidingSet.delete(ball.id)
          return
        }
      }
    }
  }

  // ── Ball–ball collision (impulse-based, conserves momentum) ───────────────
  private handleBallCollision(b1: Ball, b2: Ball): boolean {
    const dx   = b2.position.x - b1.position.x
    const dy   = b2.position.y - b1.position.y
    const dist = Math.hypot(dx, dy)
    const minD = TABLE_CONFIG.ballRadius * 2

    if (dist >= minD || dist === 0) return false

    const nx = dx / dist
    const ny = dy / dist

    // Separate overlapping balls
    const overlap = (minD - dist) * 0.5
    b1.position.x -= overlap * nx
    b1.position.y -= overlap * ny
    b2.position.x += overlap * nx
    b2.position.y += overlap * ny

    // Relative velocity along normal
    const rvX  = b1.velocity.x - b2.velocity.x
    const rvY  = b1.velocity.y - b2.velocity.y
    const rvDN = rvX * nx + rvY * ny

    if (rvDN > 0) return false // Already separating

    // Impulse magnitude (equal mass, 1D elastic with restitution)
    const impulse = -(1 + PHYSICS_CONFIG.ballRestitution) * rvDN / 2

    b1.velocity.x += impulse * nx
    b1.velocity.y += impulse * ny
    b2.velocity.x -= impulse * nx
    b2.velocity.y -= impulse * ny

    return true
  }

  getBalls(): Ball[] {
    return this.balls
  }
}

// ─── Trajectory Prediction ────────────────────────────────────────────────────
export interface TrajectoryResult {
  points:      Vector2[]
  hitBall?:    Ball
  hitPoint?:   Vector2
  targetPath?: Vector2[]
}

/**
 * Simulates the cue-ball path at a given angle/power and returns:
 *  - trajectory points up to first contact
 *  - the ball hit (if any) and where it was hit
 *  - the predicted path of the hit ball after contact
 */
export function predictTrajectory(
  cueBall: Ball,
  balls:   Ball[],
  angle:   number,
  power  = 1600,
): TrajectoryResult {
  const points: Vector2[] = []
  const pos = { ...cueBall.position }
  const vel = {
    x: Math.cos(angle) * power * SHOT_POWER_SCALE,
    y: Math.sin(angle) * power * SHOT_POWER_SCALE,
  }

  let hitBall:  Ball | undefined
  let hitPoint: Vector2 | undefined

  const maxSteps = 280
  for (let i = 0; i < maxSteps; i++) {
    points.push({ ...pos })
    pos.x += vel.x
    pos.y += vel.y

    // Check ball contacts
    for (const ball of balls) {
      if (ball.id === cueBall.id || ball.pocketed) continue
      if (Math.hypot(ball.position.x - pos.x, ball.position.y - pos.y) < TABLE_CONFIG.ballRadius * 2) {
        hitBall  = ball
        hitPoint = { ...pos }
        break
      }
    }
    if (hitBall) break

    // Apply boundary physics on a dummy ball
    const dummy: Ball = {
      id: 'preview', number: 0, position: pos, velocity: vel,
      pocketed: false, rotation: { x: 0, y: 0 }, type: 'cue',
    }
    resolveTableBoundaries(dummy)
    pos.x = dummy.position.x
    pos.y = dummy.position.y
    vel.x = dummy.velocity.x * PHYSICS_CONFIG.rollingFriction
    vel.y = dummy.velocity.y * PHYSICS_CONFIG.rollingFriction

    // Stop if heading into a pocket
    if (POCKET_POSITIONS.some((p) => Math.hypot(pos.x - p.x, pos.y - p.y) < POCKET_CAPTURE_RADIUS)) break

    if (speed(vel) < PHYSICS_CONFIG.minVelocity) break
  }

  // Compute post-collision path for the hit ball
  let targetPath: Vector2[] | undefined
  if (hitBall && hitPoint) {
    // Collision normal = direction from cue-ball impact to hit-ball centre
    const dx = hitBall.position.x - hitPoint.x
    const dy = hitBall.position.y - hitPoint.y
    const hitAngle = Math.atan2(dy, dx)
    // Incoming speed at time of contact
    const incidentSpeed = Math.hypot(vel.x, vel.y)
    const pathLen = Math.min(380, incidentSpeed * 24)
    targetPath = [
      { ...hitBall.position },
      {
        x: hitBall.position.x + Math.cos(hitAngle) * pathLen,
        y: hitBall.position.y + Math.sin(hitAngle) * pathLen,
      },
    ]
  }

  return { points, hitBall, hitPoint, targetPath }
}
