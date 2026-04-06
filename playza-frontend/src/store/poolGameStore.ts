import { create } from 'zustand'
import type { GameState, PoolRoom, PlayerType } from '@/components/h2h/pool/game/pool/types'

interface PoolGameState {
  room: PoolRoom | null
  gameState: GameState | null
  isMyTurn: boolean
  myPlayer: PlayerType | null
  isLoading: boolean
  error: string | null

  setRoom: (room: PoolRoom | null) => void
  setGameState: (state: GameState) => void
  setIsMyTurn: (turn: boolean) => void
  setMyPlayer: (player: PlayerType) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const usePoolGameStore = create<PoolGameState>((set) => ({
  room: null,
  gameState: null,
  isMyTurn: false,
  myPlayer: null,
  isLoading: false,
  error: null,

  setRoom: (room) => set({ room }),
  setGameState: (gameState) => set({ gameState }),
  setIsMyTurn: (isMyTurn) => set({ isMyTurn }),
  setMyPlayer: (myPlayer) => set({ myPlayer }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({
    room: null,
    gameState: null,
    isMyTurn: false,
    myPlayer: null,
    isLoading: false,
    error: null,
  }),
}))