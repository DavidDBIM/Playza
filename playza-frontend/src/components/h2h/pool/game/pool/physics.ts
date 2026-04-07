import type { Ball, Vector2 } from './types'

export const TABLE_CONFIG = {
  width: 2540,
  height: 1270,
  cushionHeight: 45,
  pocketRadius: 90,
  ballRadius: 40,
}

export const PHYSICS_CONFIG = {
  // Per-step friction — calibrated for 60fps * 3 substeps
  // 0.978^3 per frame ≈ 0.935/frame ≈ natural rolling deceleration (~1.5s full stop)
  friction: 0.978,
  cushionRestitution: 0.72,
  ballRestitution: 0.94,
  // Tiny threshold — lets balls coast to a natural stop rather than snapping to zero
  minVelocity: 0.08,
}

// Pocket detection positions — match visual centres
const PR = TABLE_CONFIG.pocketRadius
const W  = TABLE_CONFIG.width
const H  = TABLE_CONFIG.height

const POCKET_POSITIONS: Vector2[] = [
  { x: PR * 0.7,     y: PR * 0.7 },       // top-left
  { x: W / 2,        y: 0 },               // top-middle
  { x: W - PR * 0.7, y: PR * 0.7 },       // top-right
  { x: PR * 0.7,     y: H - PR * 0.7 },   // bottom-left
  { x: W / 2,        y: H },               // bottom-middle
  { x: W - PR * 0.7, y: H - PR * 0.7 },   // bottom-right
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

  // ── Used by server / AI for instant result  ──────────────────────────────
  simulateShot(cueBallPos: Vector2, angle: number, power: number): Ball[] {
    const velocity = {
      x: Math.cos(angle) * power,
      y: Math.sin(angle) * power,
    }
    this.balls = this.balls.map(ball =>
      ball.id === 'cue'
        ? { ...ball, position: { ...cueBallPos }, velocity: { ...velocity }, pocketed: false }
        : { ...ball, velocity: { x: 0, y: 0 } }
    )
    let steps = 0
    while (this.step() && steps++ < 3000) { /* fast-forward */ }
    return this.balls
  }

  // ── Applies initial velocity for frame-by-frame client animation ─────────
  applyShot(angle: number, power: number) {
    // Power range 0–3000 → velocity 0–60 per step
    // At 60fps × 3 substeps, a max shot travels ~1800 units in 0.5s then decelerates → 3.5s total
    // This feels like a real billiard shot: fast launch, gradual roll, smooth stop
    const scale = 0.020
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

  // ── Single physics step (call multiple times per frame for sub-stepping) ──
  public step(): boolean {
    let anyMoving = false

    // 1. Move balls + friction
    for (const ball of this.balls) {
      if (ball.pocketed) continue

      const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2)
      if (speed > PHYSICS_CONFIG.minVelocity) {
        anyMoving = true

        ball.position.x += ball.velocity.x
        ball.position.y += ball.velocity.y

        // Spin rotation accumulates with movement (used for rendering)
        ball.rotation.x = (ball.rotation.x + ball.velocity.x * 0.08) % (Math.PI * 2)
        ball.rotation.y = (ball.rotation.y + ball.velocity.y * 0.08) % (Math.PI * 2)

        // Apply felt friction — linear deceleration feels more natural than
        // pure multiplicative on slow balls, so we blend:
        const frictionForce = PHYSICS_CONFIG.friction
        ball.velocity.x *= frictionForce
        ball.velocity.y *= frictionForce

        // Extra drag at very low speed for a clean, natural stop (no sudden snap)
        if (speed < 2.0) {
          ball.velocity.x *= 0.92
          ball.velocity.y *= 0.92
        }

        this.handleCushionCollisions(ball)
        this.checkPockets(ball)
      } else {
        // Gradual bleed-out instead of hard snap to 0
        ball.velocity.x *= 0.6
        ball.velocity.y *= 0.6
        if (Math.abs(ball.velocity.x) < 0.01) ball.velocity.x = 0
        if (Math.abs(ball.velocity.y) < 0.01) ball.velocity.y = 0
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
    const r = TABLE_CONFIG.ballRadius
    const cushion = TABLE_CONFIG.cushionHeight
    const w = TABLE_CONFIG.width
    const h = TABLE_CONFIG.height
    const pr = TABLE_CONFIG.pocketRadius

    // Left wall
    if (ball.position.x < cushion + r) {
      const inPocketZone = ball.position.y < pr || ball.position.y > h - pr
      if (!inPocketZone) {
        ball.position.x = cushion + r
        ball.velocity.x = Math.abs(ball.velocity.x) * PHYSICS_CONFIG.cushionRestitution
      }
    }
    // Right wall
    if (ball.position.x > w - cushion - r) {
      const inPocketZone = ball.position.y < pr || ball.position.y > h - pr
      if (!inPocketZone) {
        ball.position.x = w - cushion - r
        ball.velocity.x = -Math.abs(ball.velocity.x) * PHYSICS_CONFIG.cushionRestitution
      }
    }
    // Top wall
    if (ball.position.y < cushion + r) {
      const inPocketZone = ball.position.x < pr || ball.position.x > w - pr ||
                           Math.abs(ball.position.x - w / 2) < pr
      if (!inPocketZone) {
        ball.position.y = cushion + r
        ball.velocity.y = Math.abs(ball.velocity.y) * PHYSICS_CONFIG.cushionRestitution
      }
    }
    // Bottom wall
    if (ball.position.y > h - cushion - r) {
      const inPocketZone = ball.position.x < pr || ball.position.x > w - pr ||
                           Math.abs(ball.position.x - w / 2) < pr
      if (!inPocketZone) {
        ball.position.y = h - cushion - r
        ball.velocity.y = -Math.abs(ball.velocity.y) * PHYSICS_CONFIG.cushionRestitution
      }
    }
  }

  private checkPockets(ball: Ball) {
    for (const pocket of POCKET_POSITIONS) {
      const dx = ball.position.x - pocket.x
      const dy = ball.position.y - pocket.y
      if (Math.sqrt(dx * dx + dy * dy) < TABLE_CONFIG.pocketRadius) {
        ball.pocketed = true
        ball.velocity.x = 0
        ball.velocity.y = 0
        return
      }
    }
  }

  private handleBallCollision(ball1: Ball, ball2: Ball) {
    const dx = ball2.position.x - ball1.position.x
    const dy = ball2.position.y - ball1.position.y
    const distSq = dx * dx + dy * dy
    const minDist = TABLE_CONFIG.ballRadius * 2
    const minDistSq = minDist * minDist

    if (distSq >= minDistSq || distSq === 0) return

    const distance = Math.sqrt(distSq)
    const nx = dx / distance
    const ny = dy / distance

    // Relative velocity along collision normal
    const dvx = ball1.velocity.x - ball2.velocity.x
    const dvy = ball1.velocity.y - ball2.velocity.y
    const dvn = dvx * nx + dvy * ny

    // Only resolve if balls are approaching each other
    if (dvn <= 0) return

    const restitution = PHYSICS_CONFIG.ballRestitution
    const impulse = -(1 + restitution) * dvn / 2

    ball1.velocity.x += impulse * nx
    ball1.velocity.y += impulse * ny
    ball2.velocity.x -= impulse * nx
    ball2.velocity.y -= impulse * ny

    // Positional correction — push balls apart to prevent overlap
    // Use only 60% correction per step to avoid jarring jumps
    const overlap = (minDist - distance) * 0.6
    ball1.position.x -= overlap * nx
    ball1.position.y -= overlap * ny
    ball2.position.x += overlap * nx
    ball2.position.y += overlap * ny
  }

  getBalls(): Ball[] {
    return this.balls
  }
}

// ── Trajectory preview ─────────────────────────────────────────────────────
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
  power: number
): TrajectoryResult {
  const points: Vector2[] = []
  const pos = { ...cueBall.position }
  const vel = {
    x: Math.cos(angle) * Math.max(power, 200) * 0.06,
    y: Math.sin(angle) * Math.max(power, 200) * 0.06,
  }

  const cushion = TABLE_CONFIG.cushionHeight + TABLE_CONFIG.ballRadius
  let hitBall: Ball | undefined
  let hitPoint: Vector2 | undefined

  for (let i = 0; i < 120; i++) {
    points.push({ ...pos })
    pos.x += vel.x
    pos.y += vel.y

    for (const ball of balls) {
      if (ball.id === cueBall.id || ball.pocketed) continue
      const dx = ball.position.x - pos.x
      const dy = ball.position.y - pos.y
      if (Math.sqrt(dx * dx + dy * dy) < TABLE_CONFIG.ballRadius * 2) {
        hitBall = ball
        hitPoint = { ...pos }
        break
      }
    }
    if (hitBall) break

    const closestPocket = Math.min(
      ...POCKET_POSITIONS.map(p => Math.sqrt((pos.x - p.x) ** 2 + (pos.y - p.y) ** 2))
    )
    if (closestPocket < TABLE_CONFIG.pocketRadius) break

    if (pos.x < cushion) { pos.x = cushion; vel.x = Math.abs(vel.x) * 0.75; break }
    if (pos.x > TABLE_CONFIG.width - cushion) { pos.x = TABLE_CONFIG.width - cushion; vel.x = -Math.abs(vel.x) * 0.75; break }
    if (pos.y < cushion) { pos.y = cushion; vel.y = Math.abs(vel.y) * 0.75; break }
    if (pos.y > TABLE_CONFIG.height - cushion) { pos.y = TABLE_CONFIG.height - cushion; vel.y = -Math.abs(vel.y) * 0.75; break }

    vel.x *= PHYSICS_CONFIG.friction
    vel.y *= PHYSICS_CONFIG.friction
    if (Math.sqrt(vel.x ** 2 + vel.y ** 2) < 0.5) break
  }

  let targetPath: Vector2[] | undefined
  if (hitBall && hitPoint) {
    const dx = hitBall.position.x - hitPoint.x
    const dy = hitBall.position.y - hitPoint.y
    const hitAngle = Math.atan2(dy, dx)
    const targetDist = 180
    targetPath = [
      { ...hitBall.position },
      {
        x: hitBall.position.x + Math.cos(hitAngle) * targetDist,
        y: hitBall.position.y + Math.sin(hitAngle) * targetDist,
      },
    ]
  }

  return { points, hitBall, hitPoint, targetPath }
}
