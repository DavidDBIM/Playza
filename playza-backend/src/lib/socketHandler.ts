import { Server as SocketServer } from 'socket.io'
import { Server as HttpServer } from 'http'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'playza-secret-key'

interface GameRoom {
  id: string
  players: Map<string, string>
  state: any
}

const activeGames: Map<string, GameRoom> = new Map()

export function setupSocketIO(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication required'))
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      socket.data.user = decoded
      next()
    } catch (err) {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user?.id}`)

    socket.on('join_room', async ({ roomId }) => {
      const gameRoom = activeGames.get(roomId)
      if (!gameRoom) {
        socket.emit('error', { message: 'Game not found' })
        return
      }

      const userId = socket.data.user.id
      gameRoom.players.set(socket.id, userId)
      socket.join(roomId)

      socket.emit('joined', { roomId, playerId: userId })
      io.to(roomId).emit('player_joined', { playerId: userId })
    })

    socket.on('leave_room', ({ roomId }) => {
      const gameRoom = activeGames.get(roomId)
      if (gameRoom) {
        gameRoom.players.delete(socket.id)
        socket.leave(roomId)
      }
    })

    socket.on('shot', async ({ roomId, shot }) => {
      const gameRoom = activeGames.get(roomId)
      if (!gameRoom) {
        socket.emit('error', { message: 'Game not found' })
        return
      }

      const userId = socket.data.user.id
      const playerId = gameRoom.players.get(socket.id)

      if (playerId !== userId) {
        socket.emit('error', { message: 'Not authorized' })
        return
      }

      io.to(roomId).emit('shot_executed', { playerId: userId, shot })

      setTimeout(() => {
        const updatedBalls = simulateShot(gameRoom.state, shot)
        gameRoom.state.balls = updatedBalls

        const pocketedBalls = getPocketedBalls(updatedBalls)
        io.to(roomId).emit('ball_pocketed', { balls: pocketedBalls })

        const nextTurn = determineNextTurn(gameRoom.state, pocketedBalls)
        io.to(roomId).emit('turn_change', { player: nextTurn })

        io.to(roomId).emit('game_update', { gameState: gameRoom.state })
      }, 500)
    })

    socket.on('ball_in_hand', ({ roomId, position }) => {
      const gameRoom = activeGames.get(roomId)
      if (!gameRoom) return

      gameRoom.state.ballInHand = false
      const cueBall = gameRoom.state.balls.find((b: any) => b.id === 'cue')
      if (cueBall) {
        cueBall.position = position
        cueBall.pocketed = false
      }

      io.to(roomId).emit('game_update', { gameState: gameRoom.state })
    })

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user?.id}`)

      activeGames.forEach((room, roomId) => {
        if (room.players.has(socket.id)) {
          room.players.delete(socket.id)
          io.to(roomId).emit('player_left', { playerId: socket.data.user.id })
        }
      })
    })
  })

  return io
}

export function addGameRoom(roomId: string, initialState: any) {
  activeGames.set(roomId, {
    id: roomId,
    players: new Map(),
    state: initialState,
  })
}

export function removeGameRoom(roomId: string) {
  activeGames.delete(roomId)
}

function simulateShot(state: any, shot: any): any[] {
  return state.balls.map((ball: any) => {
    if (ball.id === 'cue') {
      const newVel = {
        x: Math.cos(shot.angle) * shot.power,
        y: Math.sin(shot.angle) * shot.power,
      }
      return { ...ball, velocity: newVel }
    }
    return { ...ball }
  })
}

function getPocketedBalls(balls: any[]): string[] {
  return balls
    .filter((b: any) => b.pocketed)
    .map((b: any) => b.id)
}

function determineNextTurn(state: any, pocketedBalls: string[]): string {
  const currentPlayer = state.currentPlayer
  const assigned = currentPlayer === 'host' ? state.hostAssigned : state.guestAssigned

  const pocketedOwn = pocketedBalls.filter((id: string) => {
    if (id === 'cue' || id === 'ball_8') return false
    const ball = state.balls.find((b: any) => b.id === id)
    if (!ball) return false

    if (assigned === 'solid') return ball.type === 'solid'
    if (assigned === 'stripe') return ball.type === 'stripe'
    return true
  })

  return pocketedOwn.length > 0 ? currentPlayer : (currentPlayer === 'host' ? 'guest' : 'host')
}