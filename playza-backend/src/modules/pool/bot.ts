import { Ball, Vector2, GameState, PlayerType, ShotInput } from './types'
import { TABLE_CONFIG } from './physics'

export function getPoolBotMove(
  state: GameState,
  player: PlayerType,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): ShotInput | null {
  const cueBall = state.balls.find((b) => b.id === 'cue' && !b.pocketed)
  if (!cueBall) return null

  const playerType = player === 'host' ? state.hostAssigned : state.guestAssigned
  
  // Determine target balls
  let targetBalls = state.balls.filter(b => {
    if (b.pocketed || b.id === 'cue') return false
    
    if (playerType === 'none') {
      return b.id !== 'ball_8' // Can hit any ball except 8 on break/open table
    }
    
    if (playerType === 'solid') return b.type === 'solid'
    if (playerType === 'stripe') return b.type === 'stripe'
    
    return false
  })

  // If no normal targets, must hit the 8 ball
  if (targetBalls.length === 0) {
    const eightBall = state.balls.find(b => b.id === 'ball_8' && !b.pocketed)
    if (eightBall) targetBalls = [eightBall]
  }

  if (targetBalls.length === 0) return null

  const pockets = [
    { x: 0, y: 0 },
    { x: TABLE_CONFIG.width / 2, y: 0 },
    { x: TABLE_CONFIG.width, y: 0 },
    { x: 0, y: TABLE_CONFIG.height },
    { x: TABLE_CONFIG.width / 2, y: TABLE_CONFIG.height },
    { x: TABLE_CONFIG.width, y: TABLE_CONFIG.height },
  ]

  const isPathClear = (start: Vector2, end: Vector2, ignoredBallIds: string[] = []) => {
    const dx = end.x - start.x
    const dy = end.y - start.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 1) return true

    const steps = Math.ceil(dist / 10)
    for (let i = 1; i < steps; i++) {
        const checkPos = {
            x: start.x + (dx / steps) * i,
            y: start.y + (dy / steps) * i
        }
        
        for (const b of state.balls) {
            if (b.pocketed || ignoredBallIds.includes(b.id)) continue
            const bDist = Math.sqrt((checkPos.x - b.position.x)**2 + (checkPos.y - b.position.y)**2)
            if (bDist < TABLE_CONFIG.ballRadius * 2) return false
        }
    }
    return true
  }

  let bestShot: ShotInput | null = null
  let maxScore = -Infinity

  for (const ball of targetBalls) {
    for (const pocket of pockets) {
      // Vector from pocket to ball center
      const dx = ball.position.x - pocket.x
      const dy = ball.position.y - pocket.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      const unitX = dx / dist
      const unitY = dy / dist
      
      // Point for cue ball to hit (center to center distance is 2*ballRadius)
      const impactPos = {
        x: ball.position.x + unitX * (TABLE_CONFIG.ballRadius * 2),
        y: ball.position.y + unitY * (TABLE_CONFIG.ballRadius * 2)
      }
      
      // Check if cue ball can reach impactPos and target ball can reach pocket
      if (!isPathClear(cueBall.position, impactPos, ['cue', ball.id])) continue
      if (!isPathClear(ball.position, pocket, [ball.id])) continue

      const shotDx = impactPos.x - cueBall.position.x
      const shotDy = impactPos.y - cueBall.position.y
      const shotDist = Math.sqrt(shotDx * shotDx + shotDy * shotDy)
      
      const angle = Math.atan2(shotDy, shotDx)
      
      // Heuristic: Prefer shots where target is near pocket and cue ball path is clear
      const score = 10000 / (dist + 1) - shotDist * 0.1
      
      if (score > maxScore) {
        maxScore = score
        
        // Power based on distance
        let power = 800 + (dist * 0.5) + (shotDist * 0.5)
        
        let variance = 0
        if (difficulty === 'easy') variance = 0.1
        else if (difficulty === 'medium') variance = 0.03
        else variance = 0

        const adjustedAngle = angle + (Math.random() - 0.5) * variance
        const adjustedPower = Math.max(800, Math.min(3500, power * (1 + (Math.random() - 0.5) * variance)))

        bestShot = {
          angle: adjustedAngle,
          power: adjustedPower,
          spin: { x: 0, y: 0 }
        }
      }
    }
  }

  // Fallback: If no "clear" shot, just aim directly at the first target ball
  if (!bestShot && targetBalls.length > 0) {
      const ball = targetBalls[0]
      const angle = Math.atan2(ball.position.y - cueBall.position.y, ball.position.x - cueBall.position.x)
      bestShot = { angle, power: 1500, spin: { x: 0, y: 0 } }
  }

  return bestShot
}
