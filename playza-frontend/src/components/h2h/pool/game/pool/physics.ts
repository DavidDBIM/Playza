import type { Ball, Vector2 } from './types'

export const TABLE_CONFIG = {
  width: 2540,
  height: 1270,
  cushionHeight: 45,
  pocketRadius: 95,
  ballRadius: 52,          // bigger balls → more satisfying to hit
}

export const PHYSICS_CONFIG = {
  // LINEAR friction — constant speed reduction per substep (like real billiard felt).
  // Real felt decelerates balls nearly uniformly (sliding/rolling friction),
  // not exponentially. This is why the old multiplicative approach felt "sluggish".
  linearFriction: 0.024,   // units /substep subtracted from speed
  minVelocity: 0.12,
  cushionRestitution: 0.78,
  ballRestitution: 0.96,
}

// Calibration:
//   applyShot scale = 0.0054  →  max power(3000) → ~16.2 units/substep
//   At 60fps × 3 substeps:  stops in 16.2/0.024 = 675 substeps = 225 frames ≈ 3.75 s
//   50% power: v0=8.1  →  stops in 337 substeps ≈ 1.9 s, travels ~1 700 units (67% of table)
//   10% power: v0=1.62 →  stops in  67 substeps ≈ 0.4 s, travels ~  68 units

const PR = TABLE_CONFIG.pocketRadius
const W  = TABLE_CONFIG.width
const H  = TABLE_CONFIG.height

export const POCKET_POSITIONS: Vector2[] = [
  { x: PR * 0.7,      y: PR * 0.7 },       // top-left
  { x: W / 2,         y: 0 },               // top-middle
  { x: W - PR * 0.7,  y: PR * 0.7 },       // top-right
  { x: PR * 0.7,      y: H - PR * 0.7 },   // bottom-left
  { x: W / 2,         y: H },               // bottom-middle
  { x: W - PR * 0.7,  y: H - PR * 0.7 },   // bottom-right
]

export class PoolPhysics {
  private balls: Ball[]

  constructor(initialBalls: Ball[]) {
    this.balls = initialBalls.map(b => ({
      ...b,
      velocity: { x: b.velocity?.x ?? 0, y: b.velocity?.y ?? 0 },
      rotation: { x: b.rotation?.x ?? 0, y: b.rotation?.y ?? 0 },
    }))
  }

  simulateShot(cueBallPos: Vector2, angle: number, power: number): Ball[] {
    const scale = 0.0054
    const velocity = {
      x: Math.cos(angle) * power * scale,
      y: Math.sin(angle) * power * scale,
    }
    this.balls = this.balls.map(ball =>
      ball.id === 'cue'
        ? { ...ball, position: { ...cueBallPos }, velocity: { ...velocity }, pocketed: false }
        : { ...ball, velocity: { x: 0, y: 0 } }
    )
    let steps = 0
    while (this.step() && steps++ < 5000) { /* fast-forward */ }
    return this.balls
  }

  applyShot(angle: number, power: number) {
    const scale = 0.0054
    const velocity = {
      x: Math.cos(angle) * power * scale,
      y: Math.sin(angle) * power * scale,
    }
    this.balls = this.balls.map(ball =>
      ball.id === 'cue'
        ? { ...ball, velocity: { ...velocity }, pocketed: false }
        : { ...ball, velocity: { x: 0, y: 0 } }
    )
  }

  public step(): boolean {
    let anyMoving = false

    // 1. Move balls + linear friction
    for (const ball of this.balls) {
      if (ball.pocketed) continue

      const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2)
      if (speed > PHYSICS_CONFIG.minVelocity) {
        anyMoving = true

        // Move first
        ball.position.x += ball.velocity.x
        ball.position.y += ball.velocity.y

        // Spin accumulates for visual rotation
        ball.rotation.x = (ball.rotation.x + ball.velocity.x * 0.06) % (Math.PI * 2)
        ball.rotation.y = (ball.rotation.y + ball.velocity.y * 0.06) % (Math.PI * 2)

        // Linear deceleration — subtract constant from speed, preserve direction
        const newSpeed = speed - PHYSICS_CONFIG.linearFriction
        if (newSpeed <= PHYSICS_CONFIG.minVelocity) {
          ball.velocity.x = 0
          ball.velocity.y = 0
        } else {
          const ratio = newSpeed / speed
          ball.velocity.x *= ratio
          ball.velocity.y *= ratio
        }

        this.handleCushionCollisions(ball)
        this.checkPockets(ball)
      } else {
        ball.velocity.x = 0
        ball.velocity.y = 0
      }
    }

    // 2. Ball-to-ball collisions
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        if (!this.balls[i].pocketed && !this.balls[j].pocketed) {
          this.handleBallCollision(this.balls[i], this.balls[j])
        }
      }
    }

    return anyMoving
  }

  private handleCushionCollisions(ball: Ball) {
    const r  = TABLE_CONFIG.ballRadius
    const c  = TABLE_CONFIG.cushionHeight
    const w  = TABLE_CONFIG.width
    const h  = TABLE_CONFIG.height
    const pr = TABLE_CONFIG.pocketRadius
    const res = PHYSICS_CONFIG.cushionRestitution

    // Left
    if (ball.position.x < c + r) {
      if (ball.position.y > pr && ball.position.y < h - pr) {
        ball.position.x = c + r
        ball.velocity.x =  Math.abs(ball.velocity.x) * res
      }
    }
    // Right
    if (ball.position.x > w - c - r) {
      if (ball.position.y > pr && ball.position.y < h - pr) {
        ball.position.x = w - c - r
        ball.velocity.x = -Math.abs(ball.velocity.x) * res
      }
    }
    // Top
    if (ball.position.y < c + r) {
      const midZone = Math.abs(ball.position.x - w / 2) < pr
      if (ball.position.x > pr && ball.position.x < w - pr && !midZone) {
        ball.position.y = c + r
        ball.velocity.y =  Math.abs(ball.velocity.y) * res
      }
    }
    // Bottom
    if (ball.position.y > h - c - r) {
      const midZone = Math.abs(ball.position.x - w / 2) < pr
      if (ball.position.x > pr && ball.position.x < w - pr && !midZone) {
        ball.position.y = h - c - r
        ball.velocity.y = -Math.abs(ball.velocity.y) * res
      }
    }
  }

  private checkPockets(ball: Ball) {
    for (const pocket of POCKET_POSITIONS) {
      const dx = ball.position.x - pocket.x
      const dy = ball.position.y - pocket.y
      if (Math.sqrt(dx * dx + dy * dy) < TABLE_CONFIG.pocketRadius * 0.85) {
        ball.pocketed  = true
        ball.velocity.x = 0
        ball.velocity.y = 0
        return
      }
    }
  }

  private handleBallCollision(b1: Ball, b2: Ball) {
    const dx = b2.position.x - b1.position.x
    const dy = b2.position.y - b1.position.y
    const distSq = dx * dx + dy * dy
    const minDist = TABLE_CONFIG.ballRadius * 2
    if (distSq >= minDist * minDist || distSq === 0) return

    const dist = Math.sqrt(distSq)
    const nx = dx / dist
    const ny = dy / dist

    const dvx = b1.velocity.x - b2.velocity.x
    const dvy = b1.velocity.y - b2.velocity.y
    const dvn = dvx * nx + dvy * ny
    if (dvn <= 0) return

    const res = PHYSICS_CONFIG.ballRestitution
    const impulse = -(1 + res) * dvn / 2

    b1.velocity.x += impulse * nx
    b1.velocity.y += impulse * ny
    b2.velocity.x -= impulse * nx
    b2.velocity.y -= impulse * ny

    // Positional correction (remove overlap)
    const overlap = (minDist - dist) * 0.55
    b1.position.x -= overlap * nx
    b1.position.y -= overlap * ny
    b2.position.x += overlap * nx
    b2.position.y += overlap * ny
  }

  getBalls(): Ball[] { return this.balls }
}

// ── Trajectory preview ────────────────────────────────────────────────────────
export interface TrajectoryResult {
  points: Vector2[]
  hitBall?: Ball
  hitPoint?: Vector2
  targetPath?: Vector2[]
}

export function predictTrajectory(
  cueBall: Ball,
  balls: Ball[],
  angle: number,
  _power?: number         // kept for signature compat; direction is what matters
): TrajectoryResult {
  void _power  // intentionally unused — preview uses fixed speed, not shot power
  const PREVIEW_SPEED = 12  // fixed preview speed (direction only)
  const points: Vector2[] = []
  const pos = { ...cueBall.position }
  const vel = {
    x: Math.cos(angle) * PREVIEW_SPEED,
    y: Math.sin(angle) * PREVIEW_SPEED,
  }

  const cushion = TABLE_CONFIG.cushionHeight + TABLE_CONFIG.ballRadius
  let hitBall: Ball | undefined
  let hitPoint: Vector2 | undefined

  for (let i = 0; i < 180; i++) {
    points.push({ ...pos })
    pos.x += vel.x
    pos.y += vel.y

    for (const ball of balls) {
      if (ball.id === cueBall.id || ball.pocketed) continue
      const dx = ball.position.x - pos.x
      const dy = ball.position.y - pos.y
      if (Math.sqrt(dx * dx + dy * dy) < TABLE_CONFIG.ballRadius * 2) {
        hitBall  = ball
        hitPoint = { ...pos }
        break
      }
    }
    if (hitBall) break

    const nearPocket = POCKET_POSITIONS.some(
      p => Math.sqrt((pos.x - p.x) ** 2 + (pos.y - p.y) ** 2) < TABLE_CONFIG.pocketRadius
    )
    if (nearPocket) break

    // Wall reflections
    if (pos.x < cushion)                          { pos.x = cushion;                          vel.x =  Math.abs(vel.x) * 0.80; break }
    if (pos.x > TABLE_CONFIG.width  - cushion)    { pos.x = TABLE_CONFIG.width  - cushion;    vel.x = -Math.abs(vel.x) * 0.80; break }
    if (pos.y < cushion)                          { pos.y = cushion;                          vel.y =  Math.abs(vel.y) * 0.80; break }
    if (pos.y > TABLE_CONFIG.height - cushion)    { pos.y = TABLE_CONFIG.height - cushion;    vel.y = -Math.abs(vel.y) * 0.80; break }

    // Linear friction on preview
    const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2)
    if (speed < 0.5) break
    const newSpeed = speed - PHYSICS_CONFIG.linearFriction * 0.5
    if (newSpeed <= 0) break
    vel.x *= newSpeed / speed
    vel.y *= newSpeed / speed
  }

  let targetPath: Vector2[] | undefined
  if (hitBall && hitPoint) {
    const dx = hitBall.position.x - hitPoint.x
    const dy = hitBall.position.y - hitPoint.y
    const ha = Math.atan2(dy, dx)
    targetPath = [
      { ...hitBall.position },
      { x: hitBall.position.x + Math.cos(ha) * 200, y: hitBall.position.y + Math.sin(ha) * 200 },
    ]
  }

  return { points, hitBall, hitPoint, targetPath }
}
