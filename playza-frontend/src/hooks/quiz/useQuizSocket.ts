import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/context/auth'

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export type QuizPhase =
  | 'idle'
  | 'lobby'
  | 'starting'
  | 'question'
  | 'revealing'
  | 'round_summary'
  | 'eliminated'
  | 'game_over'
  | 'cancelled'

export interface LiveQuestion {
  question_id: string
  round: number
  round_name: string
  question_index: number
  total_questions: number
  question_text: string
  image_url: string | null
  options: { A: string; B: string; C: string; D: string }
  time_limit_ms: number
  alive_count: number
  difficulty: string
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url: string | null
  correct_answers: number
  avg_time_ms: number
  status: 'alive' | 'eliminated' | 'winner'
}

export interface GameOverData {
  leaderboard: LeaderboardEntry[]
  winners: { rank: number; username: string; prize: number }[]
  prize_pool: number
}

export interface RoundSummary {
  round_completed: number
  round_name: string
  survivors: number
  eliminated_this_round: number
  next_round: number
  next_round_name: string
}

export function useQuizSocket(tournamentId: string | null) {
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)

  const [phase, setPhase] = useState<QuizPhase>('idle')
  const [playerCount, setPlayerCount] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<LiveQuestion | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [answerLocked, setAnswerLocked] = useState(false)
  const [revealData, setRevealData] = useState<{ correct_option: string; alive_count: number; eliminated_count: number } | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [roundSummary, setRoundSummary] = useState<RoundSummary | null>(null)
  const [gameOver, setGameOver] = useState<GameOverData | null>(null)
  const [elimMessage, setElimMessage] = useState('')
  const [connected, setConnected] = useState(false)
  const [timeLeftMs, setTimeLeftMs] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const startTimer = useCallback((ms: number) => {
    clearTimer()
    const end = Date.now() + ms
    setTimeLeftMs(ms)
    timerRef.current = setInterval(() => {
      const left = Math.max(0, end - Date.now())
      setTimeLeftMs(left)
      if (left <= 0) clearTimer()
    }, 100)
  }, [clearTimer])

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

    socket.on('quiz:lobby_update', ({ player_count, status }) => {
      setPlayerCount(player_count)
      if (status === 'lobby') setPhase('lobby')
      // If joining mid-game, show "starting" briefly while we wait for the
      // server to push the current/next question (handles backend restarts).
      if (status === 'active') setPhase(prev => prev === 'idle' ? 'starting' : prev)
    })

    socket.on('quiz:game_start', ({ alive_count }) => {
      setPlayerCount(alive_count)
      setPhase('starting')
      setTimeout(() => setPhase('question'), 3000)
    })

    socket.on('quiz:question_start', (q: LiveQuestion) => {
      setCurrentQuestion(q)
      setSelectedOption(null)
      setAnswerLocked(false)
      setRevealData(null)
      setPhase('question')
      startTimer(q.time_limit_ms)
    })

    socket.on('quiz:answer_ack', () => {
      setAnswerLocked(true)
    })

    socket.on('quiz:reveal', (data) => {
      clearTimer()
      setRevealData(data)
      setPhase('revealing')
    })

    socket.on('quiz:leaderboard_update', ({ leaderboard: lb }) => {
      setLeaderboard(lb)
    })

    socket.on('quiz:round_summary', (summary: RoundSummary) => {
      setRoundSummary(summary)
      setPhase('round_summary')
    })

    socket.on('quiz:eliminated', ({ message }) => {
      clearTimer()
      setElimMessage(message)
      setPhase('eliminated')
    })

    socket.on('quiz:cancelled', ({ message }) => {
      clearTimer()
      setElimMessage(message)
      setPhase('cancelled')
    })

    socket.on('quiz:game_over', (data: GameOverData) => {
      clearTimer()
      setGameOver(data)
      setPhase('game_over')
    })

    return () => {
      clearTimer()
      socket.disconnect()
    }
  }, [tournamentId, user, startTimer, clearTimer])

  const submitAnswer = useCallback((option: string) => {
    if (!socketRef.current || answerLocked || !currentQuestion) return
    setSelectedOption(option)
    socketRef.current.emit('quiz:answer', {
      tournament_id: tournamentId,
      question_id: currentQuestion.question_id,
      selected_option: option,
    })
  }, [answerLocked, currentQuestion, tournamentId])

  return {
    connected,
    phase,
    playerCount,
    currentQuestion,
    selectedOption,
    answerLocked,
    revealData,
    leaderboard,
    roundSummary,
    gameOver,
    elimMessage,
    timeLeftMs,
    submitAnswer,
  }
}
