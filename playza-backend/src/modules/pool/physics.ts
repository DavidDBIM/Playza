import { Ball, Vector2, TableBounds } from './types'

export const TABLE_CONFIG = {
  width: 2540,
  height: 1270,
  cushionHeight: 45,
  pocketRadius: 60,
  ballRadius: 28.5,
}

export const PHYSICS_CONFIG = {
  friction: 0.985,
  cushionRestitution: 0.75,
  ballRestitution: 0.95,
  minVelocity: 0.5,
  maxVelocity: 4000,
}

const POCKET_POSITIONS: Vector2[] = [
  { x: 0, y: 0 },
  { x: TABLE_CONFIG.width / 2, y: 0 },
  { x: TABLE_CONFIG.width, y: 0 },
  { x: 0, y: TABLE_CONFIG.height },
  { x: TABLE_CONFIG.width / 2, y: TABLE_CONFIG.height },
  { x: TABLE_CONFIG.width, y: TABLE_CONFIG.height },
]

export class PoolPhysics {
  private balls: Ball[]
  private cushionBounces: number = 0
  private maxCushionBounces: number = 3

  constructor(initialBalls: Ball[]) {
    this.balls = JSON.parse(JSON.stringify(initialBalls))
  }

  simulateShot(
    cueBallPos: Vector2,
    angle: number,
    power: number,
    spin: { x: number; y: number }
  ): Ball[] {
    const velocity = {
      x: Math.cos(angle) * power,
      y: Math.sin(angle) * power,
    }

    this.balls = this.balls.map((ball) => {
      if (ball.id === 'cue') {
        return { ...ball, position: { ...cueBallPos }, velocity: { ...velocity } }
      }
      return { ...ball, velocity: { x: 0, y: 0 } }
    })

    this.cushionBounces = 0

    let steps = 0
    const maxSteps = 2000
    let moving = true

    while (moving && steps < maxSteps) {
      moving = this.step()
      steps++
    }

    return this.balls
  }

  private step(): boolean {
    let anyMoving = false

    for (let i = 0; i < this.balls.length; i++) {
      const ball = this.balls[i]
      if (!ball.pocketed) {
        const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2)

        if (speed > PHYSICS_CONFIG.minVelocity) {
          anyMoving = true

          ball.position.x += ball.velocity.x
          ball.position.y += ball.velocity.y

          ball.velocity.x *= PHYSICS_CONFIG.friction
          ball.velocity.y *= PHYSICS_CONFIG.friction

          this.handleCushionCollisions(ball)
          this.checkPockets(ball)
        } else {
          ball.velocity.x = 0
          ball.velocity.y = 0
        }
      }
    }

    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        if (!this.balls[i].pocketed && !this.balls[j].pocketed) {
          this.handleBallCollision(this.balls[i], this.balls[j])
        }
      }
    }

    return anyMoving
  }

  private handleAngledCollision(ball: Ball, normal: Vector2) {
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

    // Left cushions (Segmented)
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

    // Top cushions (Segmented around middle pocket)
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
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < r) {
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

  getPocketedBalls(): Ball[] {
    return this.balls.filter((b) => b.pocketed)
  }

  wasScratch(): boolean {
    return this.balls.find((b) => b.id === 'cue' && b.pocketed) !== undefined
  }
}

export function predictTrajectory(
  cueBallPos: Vector2,
  angle: number,
  power: number
): Vector2[] {
  const points: Vector2[] = []
  let pos = { ...cueBallPos }
  let vel = {
    x: Math.cos(angle) * power * 0.1,
    y: Math.sin(angle) * power * 0.1,
  }

  const cushion = TABLE_CONFIG.cushionHeight + TABLE_CONFIG.ballRadius

  for (let i = 0; i < 100; i++) {
    points.push({ ...pos })

    pos.x += vel.x
    pos.y += vel.y

    vel.x *= PHYSICS_CONFIG.friction
    vel.y *= PHYSICS_CONFIG.friction

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

    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y)
    if (speed < 0.5) break
  }

  return points
}