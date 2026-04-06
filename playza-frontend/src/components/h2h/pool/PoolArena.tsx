import { useState, useEffect, useCallback } from 'react'
import {
  Trophy,
  Zap,
  Target,
  History,
  Maximize,
  Minimize,
} from 'lucide-react'
import { usePoolGameStore } from '@/store/poolGameStore'
import { poolApi } from '@/api/poolApi'
import { type UserProfile } from '@/context/auth'
import { useToast } from '@/context/toast'
import H2HGamePrep from '../H2HGamePrep'
import H2HWinner from '../H2HWinner'
import PoolBoard from './PoolBoard'
import type { PoolRoom, ShotInput, Vector2 } from './game/pool/types'
import { ZASymbol } from '@/components/currency/ZASymbol'

interface PoolArenaProps {
  room: PoolRoom
  user: UserProfile | null
}

const PoolArena = ({ room: initialRoom, user }: PoolArenaProps) => {
  const toast = useToast()
  const { setRoom, setGameState, setIsMyTurn, setMyPlayer } = usePoolGameStore()
  const { room, gameState, isMyTurn } = usePoolGameStore()
  
  const [phase, setPhase] = useState<'prep' | 'playing'>('playing')
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  

  useEffect(() => {
    setRoom(initialRoom)
    setGameState(initialRoom.game_state)
    const myType = user?.id === initialRoom.host_id ? 'host' : 'guest'
    setMyPlayer(myType)
    setIsMyTurn(initialRoom.game_state.currentPlayer === myType)
  }, [initialRoom, setRoom, setGameState, setIsMyTurn, setMyPlayer, user?.id])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }, [])

  const handleShotComplete = async (shot: ShotInput) => {
      if (!room || !isMyTurn) return
      
      try {
          const { data } = await poolApi.executeShot(room.id, shot)
          if (data) {
              setGameState(data.game_state)
              const myType = user?.id === data.host_id ? 'host' : 'guest'
              setIsMyTurn(data.game_state.currentPlayer === myType)
          }
      } catch (err: unknown) {
          const error = err as { message?: string }
          toast.error(error.message || "Failed to execute shot")
      }
  }

  const handleBallPlace = async (pos: Vector2) => {
      if (!room || !isMyTurn) return
      
      try {
          const { data } = await poolApi.placeBall(room.id, pos)
          if (data) {
              setGameState(data.game_state)
          }
      } catch (err: unknown) {
          const error = err as { message?: string }
          toast.error(error.message || "Failed to place ball")
      }
  }

  if (!room || !gameState || !user) return null

  const isGameOver = gameState.status === 'finished'
  
  const oppUsername = user?.id === room.host_id 
    ? (room.guest?.username || "GUEST")
    : (room.host?.username || "HOST")

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-full mx-auto p-2 box-border md:grid md:grid-cols-[1fr_360px] md:grid-rows-[auto_auto_1fr] md:gap-4 md:p-4 lg:p-6 min-h-screen bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      
      <div className="flex justify-end w-full md:col-span-2">
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 md:hover:bg-slate-200 dark:md:hover:bg-white/10 text-slate-600 dark:text-slate-400"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>

      {/* Header Stat Bar */}
      <div className="flex items-center justify-between gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-2 py-2 md:col-span-2 md:px-5 md:py-3 box-border">
        {/* Host User */}
        <div className="flex items-center gap-2 relative flex-1 min-w-0">
          <div className={`shrink-0 w-10.5 h-10.5 rounded-xl border-2 overflow-hidden flex items-center justify-center bg-slate-700 text-white font-black
            ${gameState.currentPlayer === 'host' ? "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "border-black/10 dark:border-white/10"}`}>
            {room.host.avatar_url ? (
              <img src={room.host.avatar_url} className="w-full h-full object-cover" alt="" />
            ) : room.host.username[0].toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 overflow-hidden">
             <span className="font-black text-xs md:text-sm truncate uppercase tracking-widest leading-tight dark:text-white">
               {room.host.username}
             </span>
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
               {gameState.hostAssigned === 'none' ? 'UNASSIGNED' : gameState.hostAssigned.toUpperCase()} · HOST
             </span>
          </div>
        </div>

        {/* Vs/Stake Badge */}
        <div className="flex flex-col items-center gap-1 shrink-0">
           <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2 py-0.5 text-indigo-500 font-black text-[10px] tracking-widest uppercase">
             <Zap size={10} />
             <span>VS</span>
             <Zap size={10} />
           </div>
           <div className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md px-1.5 py-0.5 text-amber-500 font-black text-[10px]">
             <Trophy size={9} />
             <span>{room.stake * 2}</span>
             <ZASymbol className="w-2.5 h-2.5" />
           </div>
        </div>

        {/* Guest User */}
        <div className="flex items-center justify-end gap-2 relative flex-1 min-w-0 text-right">
           <div className="flex flex-col items-end min-w-0 overflow-hidden">
             <span className="font-black text-xs md:text-sm truncate uppercase tracking-widest leading-tight dark:text-white">
               {room.guest?.username || "GUEST"}
             </span>
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                GUEST · {gameState.guestAssigned === 'none' ? 'UNASSIGNED' : gameState.guestAssigned.toUpperCase()}
             </span>
           </div>
           <div className={`shrink-0 w-10.5 h-10.5 rounded-xl border-2 overflow-hidden flex items-center justify-center bg-slate-900 text-white font-black
            ${gameState.currentPlayer === 'guest' ? "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "border-black/10 dark:border-white/10"}`}>
             {room.guest?.avatar_url ? (
               <img src={room.guest.avatar_url} className="w-full h-full object-cover" alt="" />
             ) : (room.guest?.username?.[0]?.toUpperCase() || "?")}
           </div>
        </div>
      </div>

      {/* Turn Indicator Banner */}
      <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-extrabold tracking-widest uppercase md:col-start-1 md:text-xs
        ${isMyTurn ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)]" : "bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-slate-500"}`}>
        {isMyTurn ? (
          <>
            <Target size={14} className="shrink-0 animate-pulse" />
            <span>It's Your Turn! Aim and Strike</span>
          </>
        ) : (
          <>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:200ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:400ms]" />
            </span>
            <span>Waiting for {oppUsername}...</span>
          </>
        )}
      </div>

      {/* Game Board Container */}
      <div className="relative w-full max-w-250 mx-auto md:col-start-1 md:row-start-3 self-center">
        <PoolBoard 
          gameState={gameState}
          isMyTurn={isMyTurn && !isGameOver}
          onShot={handleShotComplete}
          onBallPlace={handleBallPlace}
        />
        
        {gameState.foul && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-red-600/90 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl backdrop-blur-md animate-bounce border border-white/20">
            ⚠️ FOUL: {gameState.foulType?.replace('_', ' ').toUpperCase()} · BALL IN HAND
          </div>
        )}
      </div>

      {/* Battle Log / Side Panel */}
      <div className="hidden md:flex flex-col gap-4 md:row-span-2">
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-2xl p-4 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-4">
             <History size={18} className="text-indigo-500" />
             <h3 className="font-black text-xs uppercase tracking-widest dark:text-white">Battle Log</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
             <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">SYSTEM</span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">The game has started. Good luck!</p>
             </div>
             {gameState.pocketedThisTurn.length > 0 && (
                <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                   <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">BOUT</span>
                   <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                     {gameState.pocketedThisTurn.length} ball(s) pocketed this turn!
                   </p>
                </div>
             )}
          </div>
        </div>
        
        <button 
          onClick={async () => {
             if (window.confirm("Resigning will forfeit your stake. Are you sure?")) {
                await poolApi.resign(room.id)
                toast.info("You resigned the match.")
             }
          }}
          className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 group"
        >
          <Zap size={14} className="group-hover:animate-pulse" />
          <span>Surrender (Resign)</span>
        </button>
      </div>

      {isGameOver && (
        <div className="fixed inset-0 z-200 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="w-full max-w-2xl">
             <H2HWinner 
               room={room}
               user={user}
               localWinnerId={gameState.winner === 'host' ? room.host_id : (room.guest_id || "BOT")}
               isSyncing={false}
             />
           </div>
        </div>
      )}

      {/* Game Prep Phase */}
      {phase === 'prep' && !isGameOver && (
         <H2HGamePrep 
            gameType="pool"
            stake={room.stake}
            onComplete={() => setPhase('playing')}
         />
      )}

    </div>
  )
}

export default PoolArena
