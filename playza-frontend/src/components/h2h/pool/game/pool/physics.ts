import type { Ball, Vector2 } from './types'

export const TABLE_CONFIG = {
  width: 2540,
  height: 1270,
  cushionHeight: 45,
  // Match backend units so table state stays consistent across clients/server.
  pocketRadius: 60,
  ballRadius: 28.5,
}

export const PHYSICS_CONFIG = {
  // Mirror backend simulation values.
  friction: 0.985,
  cushionRestitution: 0.75,
  ballRestitution: 0.95,
  minVelocity: 0.5,
}

// UI power comes from drag distance; backend expects power already scaled to table
// units, so we apply a shared factor on the client before sending + simulating.
export const SHOT_POWER_SCALE = 0.0054

const W = TABLE_CONFIG.width
const H = TABLE_CONFIG.height

export const POCKET_POSITIONS: Vector2[] = [
  { x: 0, y: 0 },
  { x: W / 2, y: 0 },
  { x: W, y: 0 },
  { x: 0, y: H },
  { x: W / 2, y: H },
  { x: W, y: H },
]

function speed(v: Vector2) {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

export class PoolPhysics {
  private balls: Ball[]

  constructor(initialBalls: Ball[]) {
    // Keep object identity local; do not mutate incoming state references.
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

    // 1) Integrate + friction + cushions + pockets
    for (const ball of this.balls) {
      if (ball.pocketed) continue

      const s = speed(ball.velocity)
      if (s > PHYSICS_CONFIG.minVelocity) {
        anyMoving = true

        ball.position.x += ball.velocity.x * dt
        ball.position.y += ball.velocity.y * dt

        // Approx rolling: radians ~= distance / radius
        const invR = 1 / Math.max(0.001, TABLE_CONFIG.ballRadius)
        ball.rotation.x = (ball.rotation.x + ball.velocity.x * dt * invR) % (Math.PI * 2)
        ball.rotation.y = (ball.rotation.y + ball.velocity.y * dt * invR) % (Math.PI * 2)

        ball.velocity.x *= frictionFactor
        ball.velocity.y *= frictionFactor

        this.handleCushionCollisions(ball)
        this.checkPockets(ball)
      } else {
        ball.velocity.x = 0
        ball.velocity.y = 0
      }
    }

    // 2) Ball-to-ball collisions
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const b1 = this.balls[i]
        const b2 = this.balls[j]
        if (!b1.pocketed && !b2.pocketed) this.handleBallCollision(b1, b2)
      }
    }

    return anyMoving
  }

  private handleAngledCollision(ball: Ball, normal: Vector2) {
    // Keep un-normalized normals to mirror backend behaviour (important for sync).
    const dvn = ball.velocity.x * normal.x + ball.velocity.y * normal.y
    if (dvn < 0) {
      ball.velocity.x -= (1 + PHYSICS_CONFIG.cushionRestitution) * dvn * normal.x
      ball.velocity.y -= (1 + PHYSICS_CONFIG.cushionRestitution) * dvn * normal.y
    }
  }

  private handleCushionCollisions(ball: Ball) {
    const r = TABLE_CONFIG.ballRadius
    const cushion = TABLE_CONFIG.cushionHeight
    const w = TABLE_CONFIG.width
    const h = TABLE_CONFIG.height
    // pr is the width of the angled cushion near pockets
    const pr = TABLE_CONFIG.pocketRadius * 0.8

    // Left cushions (segmented)
    if (ball.position.x < cushion + r) {
      if (ball.position.y > pr && ball.position.y < h - pr) {
        ball.position.x = cushion + r
        ball.velocity.x = -ball.velocity.x * PHYSICS_CONFIG.cushionRestitution
      } else if (ball.position.y <= pr) {
        this.handleAngledCollision(ball, { x: 1, y: 1 })
      } else if (ball.position.y >= h - pr) {
        this.handleAngledCollision(ball, { x: 1, y: -1 })
      }
    }

    // Right cushions
    if (ball.position.x > w - cushion - r) {
      if (ball.position.y > pr && ball.position.y < h - pr) {
        ball.position.x = w - cushion - r
        ball.velocity.x = -ball.velocity.x * PHYSICS_CONFIG.cushionRestitution
      } else if (ball.position.y <= pr) {
        this.handleAngledCollision(ball, { x: -1, y: 1 })
      } else if (ball.position.y >= h - pr) {
        this.handleAngledCollision(ball, { x: -1, y: -1 })
      }
    }

    // Top cushions (segmented around middle pocket)
    if (ball.position.y < cushion + r) {
      const mw = w / 2
      const isNearMiddle = Math.abs(ball.position.x - mw) < pr
      const isNearLeft = ball.position.x < pr
      const isNearRight = ball.position.x > w - pr

      if (!isNearMiddle && !isNearLeft && !isNearRight) {
        ball.position.y = cushion + r
        ball.velocity.y = -ball.velocity.y * PHYSICS_CONFIG.cushionRestitution
      } else if (isNearMiddle) {
        const side = ball.position.x < mw ? -1 : 1
        this.handleAngledCollision(ball, { x: side, y: 1 })
      }
    }

    // Bottom cushions
    if (ball.position.y > h - cushion - r) {
      const mw = w / 2
      const isNearMiddle = Math.abs(ball.position.x - mw) < pr
      const isNearLeft = ball.position.x < pr
      const isNearRight = ball.position.x > w - pr

      if (!isNearMiddle && !isNearLeft && !isNearRight) {
        ball.position.y = h - cushion - r
        ball.velocity.y = -ball.velocity.y * PHYSICS_CONFIG.cushionRestitution
      } else if (isNearMiddle) {
        const side = ball.position.x < mw ? -1 : 1
        this.handleAngledCollision(ball, { x: side, y: -1 })
      }
    }
  }

  private checkPockets(ball: Ball) {
    const r = TABLE_CONFIG.pocketRadius
    for (const pocket of POCKET_POSITIONS) {
      const dx = ball.position.x - pocket.x
      const dy = ball.position.y - pocket.y
      if (Math.sqrt(dx * dx + dy * dy) < r) {
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
    const distance = Math.sqrt(dx * dx + dy * dy)
    const minDist = TABLE_CONFIG.ballRadius * 2

    if (distance < minDist && distance > 0) {
      const nx = dx / distance
      const ny = dy / distance

      const dvx = ball1.velocity.x - ball2.velocity.x
      const dvy = ball1.velocity.y - ball2.velocity.y
      const dvn = dvx * nx + dvy * ny

      if (dvn > 0) {
        const restitution = PHYSICS_CONFIG.ballRestitution
        const impulse = (-(1 + restitution) * dvn) / 2

        ball1.velocity.x += impulse * nx
        ball1.velocity.y += impulse * ny
        ball2.velocity.x -= impulse * nx
        ball2.velocity.y -= impulse * ny

        const overlap = minDist - distance
        ball1.position.x -= (overlap / 2) * nx
        ball1.position.y -= (overlap / 2) * ny
        ball2.position.x += (overlap / 2) * nx
        ball2.position.y += (overlap / 2) * ny
      }
    }
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

  const cushion = TABLE_CONFIG.cushionHeight + TABLE_CONFIG.ballRadius
  let hitBall: Ball | undefined
  let hitPoint: Vector2 | undefined

  for (let i = 0; i < 220; i++) {
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

    const nearPocket = POCKET_POSITIONS.some(
      (p) => Math.sqrt((pos.x - p.x) ** 2 + (pos.y - p.y) ** 2) < TABLE_CONFIG.pocketRadius,
    )
    if (nearPocket) break

    if (pos.x < cushion) {
      pos.x = cushion
      vel.x = -vel.x * PHYSICS_CONFIG.cushionRestitution
    }
    if (pos.x > TABLE_CONFIG.width - cushion) {
      pos.x = TABLE_CONFIG.width - cushion
      vel.x = -vel.x * PHYSICS_CONFIG.cushionRestitution
    }
    if (pos.y < cushion) {
      pos.y = cushion
      vel.y = -vel.y * PHYSICS_CONFIG.cushionRestitution
    }
    if (pos.y > TABLE_CONFIG.height - cushion) {
      pos.y = TABLE_CONFIG.height - cushion
      vel.y = -vel.y * PHYSICS_CONFIG.cushionRestitution
    }

    vel.x *= PHYSICS_CONFIG.friction
    vel.y *= PHYSICS_CONFIG.friction

    if (speed(vel) < PHYSICS_CONFIG.minVelocity) break
  }

  let targetPath: Vector2[] | undefined
  if (hitBall && hitPoint) {
    const dx = hitBall.position.x - hitPoint.x
    const dy = hitBall.position.y - hitPoint.y
    const ha = Math.atan2(dy, dx)
    targetPath = [
      { ...hitBall.position },
      {
        x: hitBall.position.x + Math.cos(ha) * 220,
        y: hitBall.position.y + Math.sin(ha) * 220,
      },
    ]
  }

  return { points, hitBall, hitPoint, targetPath }
}

