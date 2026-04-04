import { io, Socket } from 'socket.io-client'

type EventCallback = (...args: any[]) => void

export class SocketManager {
  private socket: Socket | null = null
  private roomId: string | null = null
  private listeners: Map<string, Set<EventCallback>> = new Map()

  connect(serverUrl: string) {
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.setupDefaultListeners()
  }

  private setupDefaultListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Connected to game server')
      this.emit('connected')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason)
      this.emit('disconnected', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      this.emit('error', error)
    })
  }

  joinRoom(roomId: string) {
    this.roomId = roomId
    if (this.socket) {
      this.socket.emit('join_room', { roomId })
    }
  }

  leaveRoom() {
    if (this.socket && this.roomId) {
      this.socket.emit('leave_room', { roomId: this.roomId })
      this.roomId = null
    }
  }

  sendShot(shot: { angle: number; power: number; spin: { x: number; y: number } }) {
    if (this.socket && this.roomId) {
      this.socket.emit('shot', { roomId: this.roomId, shot })
    }
  }

  sendBallInHand(position: { x: number; y: number }) {
    if (this.socket && this.roomId) {
      this.socket.emit('ball_in_hand', { roomId: this.roomId, position })
    }
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event: string, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback)

    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  private emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach((callback) => callback(...args))
  }

  getRoomId(): string | null {
    return this.roomId
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.listeners.clear()
    }
  }
}

let socketInstance: SocketManager | null = null

export function getSocketManager(): SocketManager {
  if (!socketInstance) {
    socketInstance = new SocketManager()
  }
  return socketInstance
}