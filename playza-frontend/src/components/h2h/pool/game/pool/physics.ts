import type { Ball, Vector2 } from './types'

export const TABLE_CONFIG = {
  width: 2540,
  height: 1270,
  cushionHeight: 45,
  pocketRadius: 60,
  ballRadius: 28.5,
}

export const PHYSICS_CONFIG = {
  friction: 0.9962, // Compensate for 4x sub-stepping (0.9962^4 ≈ 0.985)
  cushionRestitution: 0.65,
  ballRestitution: 0.95,
  minVelocity: 0.15, // Lower threshold for sub-stepping
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
  constructor(initialBalls: Ball[]) {
    this.balls = JSON.parse(JSON.stringify(initialBalls))
  }

  simulateShot(
    cueBallPos: Vector2,
    angle: number,
    power: number,
    // spin: { x: number; y: number }
  ): Ball[] {
    const velocity = {
      x: Math.cos(angle) * power,
      y: Math.sin(angle) * power,
    }

    this.balls = this.balls.map((ball) => {
      const rotation = ball.rotation || { x: 0, y: 0 }
      if (ball.id === 'cue') {
        return { ...ball, position: { ...cueBallPos }, velocity: { ...velocity }, rotation: { ...rotation }, pocketed: false }
      }
      return { ...ball, velocity: { x: 0, y: 0 }, rotation: { ...rotation } }
    })


    let steps = 0
    const maxSteps = 2000
    let moving = true

    while (moving && steps < maxSteps) {
      moving = this.step()
      steps++
    }

    return this.balls
  }

  applyShot(
    angle: number,
    power: number,
  ) {
    const velocity = {
      x: Math.cos(angle) * power * 0.1, // Reduced power scale for step-by-step
      y: Math.sin(angle) * power * 0.1,
    }

    this.balls = this.balls.map((ball) => {
      if (ball.id === 'cue') {
        return { ...ball, velocity: { ...velocity }, pocketed: false }
      }
      return { ...ball, velocity: { x: 0, y: 0 } }
    })
    
  }

  public step(): boolean {
    let anyMoving = false

    for (let i = 0; i < this.balls.length; i++) {
      const ball = this.balls[i]
      if (!ball.pocketed) {
        const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2)

        if (speed > PHYSICS_CONFIG.minVelocity) {
          anyMoving = true

          ball.position.x += ball.velocity.x
          ball.position.y += ball.velocity.y

          // Update rotation for 3D effect
          ball.rotation.x = (ball.rotation.x + ball.velocity.x * 0.1) % (Math.PI * 2)
          ball.rotation.y = (ball.rotation.y + ball.velocity.y * 0.1) % (Math.PI * 2)

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

    // Handle ball-to-ball collisions
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
    const pr = TABLE_CONFIG.pocketRadius * 0.8 // Smaller threshold for corner geometry

    // 1. Left side cushions (top and bottom segments)
    if (ball.position.x < cushion + r) {
        if (ball.position.y < pr) {
            // Angle into top-left pocket
            this.handleAngledCollision(ball, { x: -1, y: 1 })
        } else if (ball.position.y > h - pr) {
            // Angle into bottom-left pocket
            this.handleAngledCollision(ball, { x: -1, y: -1 })
        } else {
            ball.position.x = cushion + r
            ball.velocity.x = -ball.velocity.x * PHYSICS_CONFIG.cushionRestitution
        }
    }
    // 2. Right side cushions
    if (ball.position.x > w - cushion - r) {
        if (ball.position.y < pr) {
            this.handleAngledCollision(ball, { x: 1, y: 1 })
        } else if (ball.position.y > h - pr) {
            this.handleAngledCollision(ball, { x: 1, y: -1 })
        } else {
            ball.position.x = w - cushion - r
            ball.velocity.x = -ball.velocity.x * PHYSICS_CONFIG.cushionRestitution
        }
    }
    // 3. Top cushions (split by middle pocket)
    if (ball.position.y < cushion + r) {
        const atSidePocket = ball.position.x < pr || ball.position.x > w - pr
        const nearMiddlePocket = Math.abs(ball.position.x - w / 2) < pr
        if (nearMiddlePocket) {
            // Angle into middle pocket
            const side = ball.position.x < w / 2 ? -1 : 1
            this.handleAngledCollision(ball, { x: -side, y: 1 })
        } else if (!atSidePocket) {
            ball.position.y = cushion + r
            ball.velocity.y = -ball.velocity.y * PHYSICS_CONFIG.cushionRestitution
        }
    }
    // 4. Bottom cushions
    if (ball.position.y > h - cushion - r) {
        const atSidePocket = ball.position.x < pr || ball.position.x > w - pr
        const nearMiddlePocket = Math.abs(ball.position.x - w / 2) < pr
        if (nearMiddlePocket) {
            const side = ball.position.x < w / 2 ? -1 : 1
            this.handleAngledCollision(ball, { x: -side, y: -1 })
        } else if (!atSidePocket) {
            ball.position.y = h - cushion - r
            ball.velocity.y = -ball.velocity.y * PHYSICS_CONFIG.cushionRestitution
        }
    }
  }

  private handleAngledCollision(ball: Ball, normal: Vector2) {
      // Simple angled bounce
      const dot = ball.velocity.x * normal.x + ball.velocity.y * normal.y
      if (dot < 0) {
          ball.velocity.x -= (1 + PHYSICS_CONFIG.cushionRestitution) * dot * normal.x
          ball.velocity.y -= (1 + PHYSICS_CONFIG.cushionRestitution) * dot * normal.y
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
  power: number
): TrajectoryResult {
  const points: Vector2[] = []
  const pos = { ...cueBall.position }
  const vel = {
    x: Math.cos(angle) * power * 0.1,
    y: Math.sin(angle) * power * 0.1,
  }

  const cushion = TABLE_CONFIG.cushionHeight + TABLE_CONFIG.ballRadius
  let hitBall: Ball | undefined
  let hitPoint: Vector2 | undefined

  for (let i = 0; i < 100; i++) {
    points.push({ ...pos })

    pos.x += vel.x
    pos.y += vel.y

    // Check for collisions with other balls
    for (const ball of balls) {
        if (ball.id === cueBall.id || ball.pocketed) continue
        const dx = ball.position.x - pos.x
        const dy = ball.position.y - pos.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < TABLE_CONFIG.ballRadius * 2) {
            hitBall = ball
            hitPoint = { ...pos }
            break
        }
    }
    if (hitBall) break

    // Improved cushion handling for prediction
    // We stop prediction at first cushion hit or pocket
    const distToPocket = Math.min(...POCKET_POSITIONS.map(p => Math.sqrt((pos.x - p.x) ** 2 + (pos.y - p.y) ** 2)))
    if (distToPocket < TABLE_CONFIG.pocketRadius) break

    if (pos.x < cushion || pos.x > TABLE_CONFIG.width - cushion ||
        pos.y < cushion || pos.y > TABLE_CONFIG.height - cushion) {
        // Simple prediction bounce
        if (pos.x < cushion || pos.x > TABLE_CONFIG.width - cushion) vel.x *= -1
        if (pos.y < cushion || pos.y > TABLE_CONFIG.height - cushion) vel.y *= -1
        // We'll just stop at first cushion to keep the radar clear
        break 
    }

    vel.x *= PHYSICS_CONFIG.friction
    vel.y *= PHYSICS_CONFIG.friction
    
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y)
    if (speed < 0.5) break
  }

  let targetPath: Vector2[] | undefined
  if (hitBall && hitPoint) {
      // Predict target ball path Briefly
      const dx = hitBall.position.x - hitPoint.x
      const dy = hitBall.position.y - hitPoint.y
      const angle = Math.atan2(dy, dx)
      targetPath = [
          { ...hitBall.position },
          { 
              x: hitBall.position.x + Math.cos(angle) * 100,
              y: hitBall.position.y + Math.sin(angle) * 100
          }
      ]
  }

  return { points, hitBall, hitPoint, targetPath }
}

