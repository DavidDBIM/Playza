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
  rotation: Vector2
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

export interface PoolRoom {
  id: string
  code: string
  host_id: string
  guest_id: string | null
  stake: number
  status: 'waiting' | 'active' | 'finished'
  game_state: GameState
  winner_id?: string
  created_at: string
  host: {
    id: string
    username: string
    avatar_url: string | null
  }
  guest?: {
    id: string
    username: string
    avatar_url: string | null
  }
}
