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

  let bestShot: ShotInput | null = null
  let minDistance = Infinity

  for (const ball of targetBalls) {
    for (const pocket of pockets) {
      // Vector from pocket to ball center
      const dx = ball.position.x - pocket.x
      const dy = ball.position.y - pocket.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      const unitX = dx / dist
      const unitY = dy / dist
      
      // The point on the ball we need to hit is directly opposite the pocket
      // Impact point is ball.position + unitVector * (2 * ballRadius)
      // Actually, we want the center of the cue ball to be at:
      // impactPos = ball.position + unitVector * (2 * ballRadius)
      const impactPos = {
        x: ball.position.x + unitX * (TABLE_CONFIG.ballRadius * 2),
        y: ball.position.y + unitY * (TABLE_CONFIG.ballRadius * 2)
      }
      
      // Vector from cue ball to impactPos
      const shotDx = impactPos.x - cueBall.position.x
      const shotDy = impactPos.y - cueBall.position.y
      const shotDist = Math.sqrt(shotDx * shotDx + shotDy * shotDy)
      
      const angle = Math.atan2(shotDy, shotDx)
      
      // Simple heuristic: choose the shot where the target ball is closest to the pocket
      // And the cue ball has a relatively short path to the impact point
      const totalDist = dist + shotDist
      
      if (totalDist < minDistance) {
        minDistance = totalDist
        
        // Power based on distance, but capped
        let power = 1500 + (totalDist / 2)
        
        // Add some noise based on difficulty
        let variance = 0
        if (difficulty === 'easy') variance = 0.15
        else if (difficulty === 'medium') variance = 0.05
        else variance = 0.01

        const adjustedAngle = angle + (Math.random() - 0.5) * variance
        const adjustedPower = Math.max(800, Math.min(3000, power * (1 + (Math.random() - 0.5) * variance)))

        bestShot = {
          angle: adjustedAngle,
          power: adjustedPower,
          spin: { x: 0, y: 0 }
        }
      }
    }
  }

  return bestShot
}
