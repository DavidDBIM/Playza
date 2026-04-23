export interface Vector2 {
  x: number
  y: number
}

export interface Ball {
  id: string
  number: number
  position: Vector2
  velocity: Vector2
  pocketed: boolean
  type: 'solid' | 'stripe' | 'cue' | 'eight'
}

export interface TableBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export type PlayerType = 'host' | 'guest'
export type BallType = 'solid' | 'stripe' | 'none'

export interface GameState {
  status: 'waiting' | 'active' | 'finished'
  currentPlayer: PlayerType
  balls: Ball[]
  hostAssigned: BallType
  guestAssigned: BallType
  firstContactBall: string | null
  pocketedThisTurn: string[]
  foul: boolean
  foulType: string | null
  ballInHand: boolean
  winner: PlayerType | null
  shotCount: number
}

export interface ShotInput {
  angle: number
  power: number
  spin: { x: number; y: number }
}

export function createInitialBalls(): Ball[] {
  const balls: Ball[] = []

  balls.push({
    id: 'cue',
    number: 0,
    position: { x: TABLE_WIDTH * 0.25, y: TABLE_HEIGHT / 2 },
    velocity: { x: 0, y: 0 },
    pocketed: false,
    type: 'cue',
  })

  const rackPositions = calculateRackPositions(
    TABLE_WIDTH * 0.75,
    TABLE_HEIGHT / 2
  )
  const ballNumbers = [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15]

  for (let i = 0; i < 15; i++) {
    const num = ballNumbers[i]
    let type: 'solid' | 'stripe' | 'eight' = 'solid'
    if (num === 8) type = 'eight'
    else if (num >= 9) type = 'stripe'

    balls.push({
      id: `ball_${num}`,
      number: num,
      position: rackPositions[i],
      velocity: { x: 0, y: 0 },
      pocketed: false,
      type,
    })
  }

  return balls
}

function calculateRackPositions(cx: number, cy: number): Vector2[] {
  const positions: Vector2[] = []
  const spacing = TABLE_BALL_RADIUS * 2 + 2

  const rows = [
    [1],
    [2, 3],
    [4, 5, 6],
    [7, 8, 9, 10],
    [11, 12, 13, 14, 15],
  ]

  let rowIdx = 0
  for (const row of rows) {
    const y = cy - (row.length - 1) * (spacing / 2)
    for (let i = 0; i < row.length; i++) {
      const x = cx + rowIdx * spacing * 0.866
      positions.push({ x, y: y + i * spacing })
    }
    rowIdx++
  }

  return positions
}

const TABLE_WIDTH = 2540
const TABLE_HEIGHT = 1270
const TABLE_BALL_RADIUS = 31

export function createInitialState(): GameState {
  return {
    status: 'active',
    currentPlayer: 'host',
    balls: createInitialBalls(),
    hostAssigned: 'none',
    guestAssigned: 'none',
    firstContactBall: null,
    pocketedThisTurn: [],
    foul: false,
    foulType: null,
    ballInHand: false,
    winner: null,
    shotCount: 0,
  }
}

export function validateShot(state: GameState, shot: ShotInput): {
  valid: boolean
  error?: string
} {
  if (state.foul && !state.ballInHand) {
    return { valid: false, error: 'Foul - ball in hand' }
  }

  if (state.ballInHand && shot.power > 1000) {
    return { valid: false, error: 'Ball in hand - use low power' }
  }

  return { valid: true }
}
