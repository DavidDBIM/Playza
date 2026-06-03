import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/context/auth'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_BACKEND_URL

export interface LobbyPlayer {
  user_id: string
  username: string
  avatar_url: string | null
}

export interface ChatMessage {
  user_id: string
  username: string
  avatar_url: string | null
  message: string
  ts: number
}

export interface Reaction {
  user_id: string
  username: string
  emoji: string
  ts: number
  id: number // for key
}

export function useLobbySocket(tournamentId: string | null) {
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected]     = useState(false)
  const [playerCount, setPlayerCount] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [messages, setMessages]       = useState<ChatMessage[]>([])
  const [reactions, setReactions]     = useState<Reaction[]>([])
  const reactionIdRef = useRef(0)

  useEffect(() => {
    if (!tournamentId || !user) return

    const socket = io(`${SOCKET_URL}/quiz`, {
      auth: { userId: user.id },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('quiz:join', { tournament_id: tournamentId })
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('quiz:lobby_update', ({ player_count }: { player_count: number }) => {
      setPlayerCount(player_count)
    })

    socket.on('quiz:game_start', () => {
      setGameStarted(true)
    })

    socket.on('quiz:chat_message', (msg: ChatMessage) => {
      setMessages(prev => [...prev.slice(-99), msg]) // keep last 100
    })

    socket.on('quiz:reaction', (r: Omit<Reaction, 'id'>) => {
      const id = ++reactionIdRef.current
      setReactions(prev => [...prev, { ...r, id }])
      // Auto-remove after 2.5s
      setTimeout(() => {
        setReactions(prev => prev.filter(x => x.id !== id))
      }, 2500)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [tournamentId, user])

  const sendMessage = useCallback((message: string) => {
    if (!socketRef.current || !tournamentId || !user) return
    socketRef.current.emit('quiz:chat', {
      tournament_id: tournamentId,
      message,
      username: user.username,
      avatar_url: user.avatarUrl ?? null,
    })
  }, [tournamentId, user])

  const sendReaction = useCallback((emoji: string) => {
    if (!socketRef.current || !tournamentId || !user) return
    socketRef.current.emit('quiz:react', {
      tournament_id: tournamentId,
      emoji,
      username: user.username,
    })
  }, [tournamentId, user])

  return { connected, playerCount, gameStarted, messages, reactions, sendMessage, sendReaction }
}
