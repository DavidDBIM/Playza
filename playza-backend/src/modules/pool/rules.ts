import { Ball, Vector2, GameState, PlayerType, ShotInput, createInitialBalls } from './types'
import { PoolPhysics, PHYSICS_CONFIG } from './physics'

export { PoolRules }

const TABLE_WIDTH = 2540
const TABLE_HEIGHT = 1270
const BALL_RADIUS = 28.5

class PoolRules {
  static createInitialState(): GameState {
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

  static processShot(
    state: GameState,
    shot: ShotInput,
    player: PlayerType
  ): {
    newState: GameState
    pocketedBalls: string[]
    foul: boolean
    foulType: string | null
  } {
    const balls = JSON.parse(JSON.stringify(state.balls)) as Ball[]
    const pocketedBalls: string[] = []

    let cueBallPos: Vector2
    if (state.ballInHand && state.foul) {
      cueBallPos = { x: 200, y: TABLE_HEIGHT / 2 }
    } else {
      const cueBall = balls.find((b) => b.id === 'cue')
      cueBallPos = cueBall ? { ...cueBall.position } : { x: TABLE_WIDTH * 0.25, y: TABLE_HEIGHT / 2 }
    }

    const physics = new PoolPhysics(balls)
    const result = physics.simulateShot(cueBallPos, shot.angle, shot.power, shot.spin)
    const finalBalls = result

    let firstContact: string | null = null

    for (const ball of finalBalls) {
      if (ball.pocketed && state.balls.find((b) => b.id === ball.id && !b.pocketed)) {
        pocketedBalls.push(ball.id)
      }
    }

    const scratch = pocketedBalls.includes('cue')
    const eightPocketed = pocketedBalls.includes('ball_8')

    let foul = false
    let foulType: string | null = null
    let newBallInHand = false

    if (scratch) {
      foul = true
      foulType = 'scratch'
      newBallInHand = true
    }

    if (!firstContact && !scratch) {
      const cueBall = finalBalls.find((b) => b.id === 'cue')
      const movingBalls = finalBalls.filter((b) => {
        const orig = state.balls.find((ob) => ob.id === b.id)
        return orig && (Math.abs(b.velocity.x) > 1 || Math.abs(b.velocity.y) > 1)
      })

      if (movingBalls.length > 0) {
        const targetBalls = movingBalls.filter((b) => b.id !== 'cue')
        if (targetBalls.length > 0) {
          firstContact = targetBalls[0].id
        }
      }
    }

    if (!firstContact && !scratch && state.shotCount > 0) {
      foul = true
      foulType = 'no_ball_hit'
      newBallInHand = true
    }

    const playerType = player === 'host' ? state.hostAssigned : state.guestAssigned

    if (!foul && playerType !== 'none') {
      const pocketedPlayerBalls = pocketedBalls.filter((id) => {
        if (id === 'cue' || id === 'ball_8') return false
        const ball = finalBalls.find((b) => b.id === id)
        return ball && ((playerType === 'solid' && ball.type === 'solid') ||
          (playerType === 'stripe' && ball.type === 'stripe'))
      })

      if (pocketedPlayerBalls.length === 0 && !eightPocketed && state.shotCount > 0) {
        const hitWrong = firstContact && !pocketedBalls.includes(firstContact)
        if (!hitWrong) {
        }
      }
    }

    if (eightPocketed) {
      const playerBalls = finalBalls.filter((b) => {
        if (player === 'host') {
          return state.hostAssigned === 'solid' ? b.type === 'solid' :
            state.hostAssigned === 'stripe' ? b.type === 'stripe' : false
        } else {
          return state.guestAssigned === 'solid' ? b.type === 'solid' :
            state.guestAssigned === 'stripe' ? b.type === 'stripe' : false
        }
      })

      const allPocketed = playerBalls.every((b) => b.pocketed)

      if (!allPocketed || foul) {
        return {
          newState: {
            ...state,
            status: 'finished',
            winner: player === 'host' ? 'guest' : 'host',
            balls: finalBalls,
            pocketedThisTurn: pocketedBalls,
            foul: true,
            foulType,
            ballInHand: false,
            shotCount: state.shotCount + 1,
          },
          pocketedBalls,
          foul: true,
          foulType: 'eight_early',
        }
      }

      return {
        newState: {
          ...state,
          status: 'finished',
          winner: player,
          balls: finalBalls,
          pocketedThisTurn: pocketedBalls,
          foul: false,
          foulType: null,
          ballInHand: false,
          shotCount: state.shotCount + 1,
        },
        pocketedBalls,
        foul: false,
        foulType: null,
      }
    }

    if (state.hostAssigned === 'none' && state.guestAssigned === 'none') {
      const solids = pocketedBalls.filter((id) => {
        const ball = finalBalls.find((b) => b.id === id)
        return ball && ball.type === 'solid' && id !== 'cue'
      })
      const stripes = pocketedBalls.filter((id) => {
        const ball = finalBalls.find((b) => b.id === id)
        return ball && ball.type === 'stripe' && id !== 'cue'
      })

      if (solids.length > 0 && stripes.length === 0) {
        state.hostAssigned = 'solid'
        state.guestAssigned = 'stripe'
      } else if (stripes.length > 0 && solids.length === 0) {
        state.hostAssigned = 'stripe'
        state.guestAssigned = 'solid'
      }
    }

    let switchTurn = true

    if (!foul) {
      const pocketedOwnBall = pocketedBalls.some((id) => {
        const ball = finalBalls.find((b) => b.id === id)
        if (!ball || id === 'cue' || id === 'ball_8') return false

        if (player === 'host') {
          return state.hostAssigned === 'solid' ? ball.type === 'solid' :
            state.hostAssigned === 'stripe' ? ball.type === 'stripe' : true
        } else {
          return state.guestAssigned === 'solid' ? ball.type === 'solid' :
            state.guestAssigned === 'stripe' ? ball.type === 'stripe' : true
        }
      })

      if (pocketedOwnBall) {
        switchTurn = false
      }
    }

    const nextPlayer: PlayerType = switchTurn
      ? (player === 'host' ? 'guest' : 'host')
      : player

    return {
      newState: {
        ...state,
        balls: finalBalls,
        currentPlayer: nextPlayer,
        pocketedThisTurn: pocketedBalls,
        firstContactBall: firstContact,
        foul,
        foulType,
        ballInHand: newBallInHand,
        shotCount: state.shotCount + 1,
      },
      pocketedBalls,
      foul,
      foulType,
    }
  }

  static validateShot(state: GameState, shot: ShotInput): {
    valid: boolean
    error?: string
  } {
    if (state.status !== 'active') {
      return { valid: false, error: 'Game is not active' }
    }

    if (shot.power < 100 || shot.power > 4000) {
      return { valid: false, error: 'Power must be between 100 and 4000' }
    }

    if (shot.angle < 0 || shot.angle >= Math.PI * 2) {
      return { valid: false, error: 'Invalid angle' }
    }

    return { valid: true }
  }

  static placeBallInHand(
    state: GameState,
    position: Vector2
  ): GameState {
    const balls = JSON.parse(JSON.stringify(state.balls)) as Ball[]
    const cueBall = balls.find((b) => b.id === 'cue')

    if (cueBall) {
      cueBall.position = position
      cueBall.pocketed = false
    }

    return {
      ...state,
      balls,
      ballInHand: false,
    }
  }
}