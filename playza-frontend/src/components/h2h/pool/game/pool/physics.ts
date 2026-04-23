import type { Ball, Vector2 } from './types'

export const TABLE_CONFIG = {
  width: 2540,
  height: 1270,
  cushionHeight: 54,
  pocketRadius: 74,
  ballRadius: 31,
}

export const PHYSICS_CONFIG = {
  friction: 0.985,
  cushionRestitution: 0.78,
  ballRestitution: 0.96,
  minVelocity: 0.5,
}

export const SHOT_POWER_SCALE = 0.0054

const W = TABLE_CONFIG.width
const H = TABLE_CONFIG.height
const MW = W / 2
const CORNER_POCKET_OFFSET = TABLE_CONFIG.pocketRadius * 0.82
const SIDE_POCKET_OFFSET = TABLE_CONFIG.pocketRadius * 0.72
const CORNER_RAIL_CUTOFF = TABLE_CONFIG.pocketRadius * 1.18
const SIDE_RAIL_HALF_SPAN = TABLE_CONFIG.pocketRadius * 1.34
const INNER_LEFT = TABLE_CONFIG.cushionHeight + TABLE_CONFIG.ballRadius
const INNER_RIGHT = W - INNER_LEFT
const INNER_TOP = TABLE_CONFIG.cushionHeight + TABLE_CONFIG.ballRadius
const INNER_BOTTOM = H - INNER_TOP
const CORNER_JAW_LIMIT = INNER_LEFT + CORNER_POCKET_OFFSET + TABLE_CONFIG.ballRadius * 0.42
const SIDE_JAW_LIMIT = INNER_TOP + SIDE_POCKET_OFFSET + TABLE_CONFIG.ballRadius * 0.42
const POCKET_CAPTURE_RADIUS = TABLE_CONFIG.pocketRadius - TABLE_CONFIG.ballRadius * 0.14

export const POCKET_POSITIONS: Vector2[] = [
  { x: CORNER_POCKET_OFFSET, y: CORNER_POCKET_OFFSET },
  { x: MW, y: SIDE_POCKET_OFFSET },
  { x: W - CORNER_POCKET_OFFSET, y: CORNER_POCKET_OFFSET },
  { x: CORNER_POCKET_OFFSET, y: H - CORNER_POCKET_OFFSET },
  { x: MW, y: H - SIDE_POCKET_OFFSET },
  { x: W - CORNER_POCKET_OFFSET, y: H - CORNER_POCKET_OFFSET },
]

function speed(v: Vector2) {
  return Math.hypot(v.x, v.y)
}

function reflect(ball: Ball, nx: number, ny: number) {
  const length = Math.hypot(nx, ny) || 1
  const ux = nx / length
  const uy = ny / length
  const dot = ball.velocity.x * ux + ball.velocity.y * uy

  if (dot < 0) {
    ball.velocity.x -= (1 + PHYSICS_CONFIG.cushionRestitution) * dot * ux
    ball.velocity.y -= (1 + PHYSICS_CONFIG.cushionRestitution) * dot * uy
  }
}

function resolveDiagonalJaw(ball: Ball, metric: number, limit: number, signX: number, signY: number) {
  if (metric >= limit) return
  const correction = (limit - metric) / 2
  ball.position.x += signX * correction
  ball.position.y += signY * correction
  reflect(ball, signX, signY)
}

function resolveTableBoundaries(ball: Ball) {
  const { x, y } = ball.position

  if (x < INNER_LEFT && y > CORNER_RAIL_CUTOFF && y < H - CORNER_RAIL_CUTOFF) {
    ball.position.x = INNER_LEFT
    ball.velocity.x = Math.abs(ball.velocity.x) * PHYSICS_CONFIG.cushionRestitution
  }

  if (x > INNER_RIGHT && y > CORNER_RAIL_CUTOFF && y < H - CORNER_RAIL_CUTOFF) {
    ball.position.x = INNER_RIGHT
    ball.velocity.x = -Math.abs(ball.velocity.x) * PHYSICS_CONFIG.cushionRestitution
  }

  const awayFromSidePocket = Math.abs(x - MW) > SIDE_RAIL_HALF_SPAN
  const awayFromCornerPocket = x > CORNER_RAIL_CUTOFF && x < W - CORNER_RAIL_CUTOFF

  if (y < INNER_TOP && awayFromSidePocket && awayFromCornerPocket) {
    ball.position.y = INNER_TOP
    ball.velocity.y = Math.abs(ball.velocity.y) * PHYSICS_CONFIG.cushionRestitution
  }

  if (y > INNER_BOTTOM && awayFromSidePocket && awayFromCornerPocket) {
    ball.position.y = INNER_BOTTOM
    ball.velocity.y = -Math.abs(ball.velocity.y) * PHYSICS_CONFIG.cushionRestitution
  }

  resolveDiagonalJaw(ball, ball.position.x + ball.position.y, CORNER_JAW_LIMIT, 1, 1)
  resolveDiagonalJaw(ball, W - ball.position.x + ball.position.y, CORNER_JAW_LIMIT, -1, 1)
  resolveDiagonalJaw(ball, ball.position.x + (H - ball.position.y), CORNER_JAW_LIMIT, 1, -1)
  resolveDiagonalJaw(ball, (W - ball.position.x) + (H - ball.position.y), CORNER_JAW_LIMIT, -1, -1)

  resolveDiagonalJaw(ball, (MW - ball.position.x) + ball.position.y, SIDE_JAW_LIMIT, -1, 1)
  resolveDiagonalJaw(ball, (ball.position.x - MW) + ball.position.y, SIDE_JAW_LIMIT, 1, 1)
  resolveDiagonalJaw(ball, (MW - ball.position.x) + (H - ball.position.y), SIDE_JAW_LIMIT, -1, -1)
  resolveDiagonalJaw(ball, (ball.position.x - MW) + (H - ball.position.y), SIDE_JAW_LIMIT, 1, -1)
}

export class PoolPhysics {
  private balls: Ball[]

  constructor(initialBalls: Ball[]) {
    this.balls = initialBalls.map((b) => ({
      ...b,
      velocity: { x: b.velocity?.x ?? 0, y: b.velocity?.y ?? 0 },
      rotation: { x: b.rotation?.x ?? 0, y: b.rotation?.y ?? 0 },
    }))
  }

  simulateShot(cueBallPos: Vector2, angle: number, power: number): Ball[] {
    const velocity = {
      x: Math.cos(angle) * power * SHOT_POWER_SCALE,
      y: Math.sin(angle) * power * SHOT_POWER_SCALE,
    }

    this.balls = this.balls.map((ball) =>
      ball.id === 'cue'
        ? {
            ...ball,
            position: { ...cueBallPos },
            velocity: { ...velocity },
            pocketed: false,
          }
        : { ...ball, velocity: { x: 0, y: 0 } },
    )

    let steps = 0
    while (this.step(1) && steps++ < 6000) {
      /* fast-forward */
    }
    return this.balls
  }

  applyShot(angle: number, power: number) {
    const velocity = {
      x: Math.cos(angle) * power * SHOT_POWER_SCALE,
      y: Math.sin(angle) * power * SHOT_POWER_SCALE,
    }

    this.balls = this.balls.map((ball) =>
      ball.id === 'cue'
        ? { ...ball, velocity: { ...velocity }, pocketed: false }
        : { ...ball, velocity: { x: 0, y: 0 } },
    )
  }

  public step(dt = 1): boolean {
    let anyMoving = false
    const frictionFactor = Math.pow(PHYSICS_CONFIG.friction, dt)

    for (const ball of this.balls) {
      if (ball.pocketed) continue

      const s = speed(ball.velocity)
      if (s > PHYSICS_CONFIG.minVelocity) {
        anyMoving = true

        ball.position.x += ball.velocity.x * dt
        ball.position.y += ball.velocity.y * dt

        const invR = 1 / Math.max(0.001, TABLE_CONFIG.ballRadius)
        ball.rotation.x = (ball.rotation.x + ball.velocity.x * dt * invR) % (Math.PI * 2)
        ball.rotation.y = (ball.rotation.y + ball.velocity.y * dt * invR) % (Math.PI * 2)

        ball.velocity.x *= frictionFactor
        ball.velocity.y *= frictionFactor

        resolveTableBoundaries(ball)
        this.checkPockets(ball)
      } else {
        ball.velocity.x = 0
        ball.velocity.y = 0
      }
    }

    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const b1 = this.balls[i]
        const b2 = this.balls[j]
        if (!b1.pocketed && !b2.pocketed) this.handleBallCollision(b1, b2)
      }
    }

    return anyMoving
  }

  private checkPockets(ball: Ball) {
    for (const pocket of POCKET_POSITIONS) {
      const dx = ball.position.x - pocket.x
      const dy = ball.position.y - pocket.y
      if (Math.hypot(dx, dy) < POCKET_CAPTURE_RADIUS) {
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
    const distance = Math.hypot(dx, dy)
    const minDist = TABLE_CONFIG.ballRadius * 2

    if (distance >= minDist || distance === 0) return

    const nx = dx / distance
    const ny = dy / distance
    const relVelX = ball1.velocity.x - ball2.velocity.x
    const relVelY = ball1.velocity.y - ball2.velocity.y
    const relAlongNormal = relVelX * nx + relVelY * ny

    const overlap = minDist - distance
    ball1.position.x -= (overlap / 2) * nx
    ball1.position.y -= (overlap / 2) * ny
    ball2.position.x += (overlap / 2) * nx
    ball2.position.y += (overlap / 2) * ny

    if (relAlongNormal > 0) return

    const impulse = (-(1 + PHYSICS_CONFIG.ballRestitution) * relAlongNormal) / 2
    ball1.velocity.x += impulse * nx
    ball1.velocity.y += impulse * ny
    ball2.velocity.x -= impulse * nx
    ball2.velocity.y -= impulse * ny
  }

  getBalls(): Ball[] {
    return this.balls
  }
}

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
  power = 1600,
): TrajectoryResult {
  const points: Vector2[] = []
  const pos = { ...cueBall.position }
  const vel = {
    x: Math.cos(angle) * power * SHOT_POWER_SCALE,
    y: Math.sin(angle) * power * SHOT_POWER_SCALE,
  }

  let hitBall: Ball | undefined
  let hitPoint: Vector2 | undefined

  for (let i = 0; i < 220; i++) {
    points.push({ ...pos })
    pos.x += vel.x
    pos.y += vel.y

    for (const ball of balls) {
      if (ball.id === cueBall.id || ball.pocketed) continue
      if (Math.hypot(ball.position.x - pos.x, ball.position.y - pos.y) < TABLE_CONFIG.ballRadius * 2) {
        hitBall = ball
        hitPoint = { ...pos }
        break
      }
    }
    if (hitBall) break

    const previewBall: Ball = {
      id: 'preview',
      number: 0,
      position: pos,
      velocity: vel,
      pocketed: false,
      rotation: { x: 0, y: 0 },
      type: 'cue',
    }

    resolveTableBoundaries(previewBall)
    pos.x = previewBall.position.x
    pos.y = previewBall.position.y
    vel.x = previewBall.velocity.x * PHYSICS_CONFIG.friction
    vel.y = previewBall.velocity.y * PHYSICS_CONFIG.friction

    if (POCKET_POSITIONS.some((p) => Math.hypot(pos.x - p.x, pos.y - p.y) < POCKET_CAPTURE_RADIUS)) {
      break
    }

    if (speed(vel) < PHYSICS_CONFIG.minVelocity) break
  }

  let targetPath: Vector2[] | undefined
  if (hitBall && hitPoint) {
    const dx = hitBall.position.x - hitPoint.x
    const dy = hitBall.position.y - hitPoint.y
    const hitAngle = Math.atan2(dy, dx)
    targetPath = [
      { ...hitBall.position },
      {
        x: hitBall.position.x + Math.cos(hitAngle) * 240,
        y: hitBall.position.y + Math.sin(hitAngle) * 240,
      },
    ]
  }

  return { points, hitBall, hitPoint, targetPath }
}
