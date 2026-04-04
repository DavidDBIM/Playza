import { useEffect, useRef, useState, useCallback } from 'react'
import Phaser from 'phaser'
import { poolApi } from '@/api/poolApi'
import { GAME_CONFIG } from '@/game/pool/config'
import { useToast } from '@/context/toast'
import type { UserProfile } from '@/context/auth'
import H2HWinner from '../H2HWinner'
import H2HGamePrep from '../H2HGamePrep'
import { Trophy, Zap, Maximize, Minimize } from 'lucide-react'
import { ZASymbol } from '@/components/currency/ZASymbol'
import type { PoolRoom } from '@/game/pool/types'
import { PoolScene } from '@/game/pool/PoolScene'

interface PoolArenaProps {
  room: PoolRoom
  user: UserProfile | null
}

const PoolArena = ({ room: initialRoom, user }: PoolArenaProps) => {
  const toast = useToast()
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [room, setRoom] = useState(initialRoom)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [phase, setPhase] = useState<'prep' | 'playing'>('prep')
  const [showWinnerDelayed, setShowWinnerDelayed] = useState(false)

  // Track turn locally for UI responsivity
  const myPlayer = user?.id === room.host_id ? 'host' : 'guest'
  const isMyTurn = room.game_state?.currentPlayer === myPlayer
  const oppUsername = myPlayer === 'host' ? (room.guest?.username || (room.guest_id === null ? 'PLAYZA BOT' : 'GUEST')) : (room.host?.username || 'HOST')

  useEffect(() => {
    setRoom(initialRoom)
  }, [initialRoom])

  // Prevent Accidental Leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Leaving will forfeit your stake to the opponent. Are you sure?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (containerRef.current && !gameRef.current && phase === 'playing') {
      const config: Phaser.Types.Core.GameConfig = {
        ...GAME_CONFIG,
        parent: containerRef.current,
      }
      
      const game = new Phaser.Game(config)
      gameRef.current = game
      
      game.events.once('postboot', () => {
        const scene = game.scene.getScene('PoolScene') as PoolScene
        if (scene) {
          scene.setMyPlayer(myPlayer)
          if (room.game_state) {
            scene.updateGameState(room.game_state)
          }
          scene.setCallbacks({
            onShot: async (angle: number, power: number, spin: { x: number; y: number }) => {
              try {
                await poolApi.executeShot(room.id, { angle, power, spin })
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to sync shot'
                toast.error(message)
              }
            },
            onBallInHand: () => {
               // Handle ball in hand (requires backend support)
            }
          })
        }
      })
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [phase, room.id, myPlayer, toast])

  // Sync game state to Phaser scene when room updates
  useEffect(() => {
    if (gameRef.current && room.game_state) {
      const scene = gameRef.current.scene.getScene('PoolScene') as PoolScene
      if (scene) {
        scene.updateGameState(room.game_state)
        scene.setMyPlayer(myPlayer)
      }
    }

    if (room.status === 'finished' && !showWinnerDelayed) {
        // Option to delay winner screen like Chess
        setShowWinnerDelayed(true)
    }
  }, [room, myPlayer, showWinnerDelayed])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleResign = async () => {
    if (window.confirm("Are you sure you want to resign? You will lose your stake.")) {
        try {
            await poolApi.resign(room.id)
            toast.success("You resigned.")
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to resign"
            toast.error(message)
        }
    }
  }

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-full mx-auto p-2 box-border md:grid md:grid-cols-[1fr_360px] md:grid-rows-[auto_auto_1fr] md:gap-4 md:p-4 lg:p-6 min-h-screen bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      {/* Fullscreen Toggle */}
      <div className="flex justify-end w-full md:col-span-2">
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 md:hover:bg-slate-200 dark:md:hover:bg-white/10 text-slate-600 dark:text-slate-400"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-2 py-2 md:col-span-2 md:px-5 md:py-3 box-border">
        {/* Host chip */}
        <div className="flex items-center gap-2 relative flex-1 min-w-0">
          <div className={`shrink-0 w-8.5 h-8.5 rounded-xl flex items-center justify-center font-black text-[10px] md:text-sm text-white border-2 bg-slate-700 md:w-10.5 md:h-10.5 lg:w-11.5 lg:h-11.5 overflow-hidden ${room.game_state?.currentPlayer === 'host' ? "border-indigo-500" : "border-black/10 dark:border-white/10"}`}>
            {room.host?.avatar_url ? <img src={room.host.avatar_url} alt={room.host?.username || "Host"} className="w-full h-full object-cover" /> : room.host?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 overflow-hidden text-left">
            <span className={`font-black text-[10px] md:text-xs truncate uppercase tracking-wide leading-tight md:text-[15px] ${room.game_state?.currentPlayer === 'host' ? "text-indigo-600 dark:text-indigo-500" : "text-slate-900 dark:text-slate-100"}`}>
              {room.host?.username || "Host"}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
              {room.host_id === user?.id ? "YOU" : "RIVAL"}
            </span>
          </div>
        </div>

        {/* VS Center */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2 py-0.5 text-indigo-500 font-black text-[10px] tracking-widest uppercase">
            <Zap size={10} />
            <span>POOL</span>
            <Zap size={10} />
          </div>
          <div className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md px-1.5 py-0.5 text-amber-500 font-black text-[10px]">
            <Trophy size={9} />
            <span>{room.stake * 2}</span>
            <ZASymbol className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Guest chip */}
        <div className="flex items-center justify-end gap-2 relative flex-1 min-w-0 text-right">
          <div className="flex flex-col items-end min-w-0 overflow-hidden text-right">
            <span className={`font-black text-[10px] md:text-xs truncate uppercase tracking-wide leading-tight md:text-[15px] ${room.game_state?.currentPlayer === 'guest' ? "text-indigo-600 dark:text-indigo-500" : "text-slate-900 dark:text-slate-100"}`}>
              {room.guest?.username || (room.guest_id === null ? "PLAYZA BOT" : "Guest")}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
              {room.guest_id === user?.id ? "YOU" : "RIVAL"}
            </span>
          </div>
          <div className={`shrink-0 w-8.5 h-8.5 rounded-lg flex items-center justify-center font-black text-[10px] md:text-sm text-white border bg-slate-900 md:w-10.5 md:h-10.5 lg:w-11.5 lg:h-11.5 overflow-hidden ${room.game_state?.currentPlayer === 'guest' ? "border-indigo-500" : "border-slate-200 dark:border-white/10"}`}>
            {room.guest?.avatar_url ? <img src={room.guest.avatar_url} alt={room.guest?.username || "Guest"} className="w-full h-full object-cover" /> : room.guest?.username?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Turn Banner */}
      <div className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold tracking-widest uppercase md:col-start-1 md:text-xs ${isMyTurn ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-slate-500"}`}>
        {isMyTurn ? (
          <>
            <Zap size={12} className="shrink-0 animate-bounce" />
            <span>Your turn — Take the shot</span>
          </>
        ) : (
          <>
            <span className="flex gap-0.5 shrink-0">
               <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:0ms]" />
               <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:200ms]" />
               <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:400ms]" />
            </span>
            <span className="truncate">Waiting for {oppUsername}…</span>
          </>
        )}
      </div>

      {/* Game View */}
      <div className="relative w-full mx-auto rounded-xl overflow-hidden bg-[#1a1a2e] border-4 border-slate-800 dark:border-slate-700 md:col-start-1 md:row-start-3 min-h-100">
        <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
      </div>

      {/* Side Panel / Stats */}
      <div className="flex flex-col gap-2 md:col-start-2 md:row-start-2 md:row-end-4 md:h-full">
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-4 space-y-4">
             <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Game Pool</span>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{room.stake * 2}</span>
                    <ZASymbol className="w-5 h-5 text-indigo-500" />
                </div>
             </div>

             <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="text-slate-500">Target Type</span>
                    <span className={room.game_state?.hostAssigned === 'none' ? 'text-slate-400' : 'text-indigo-500'}>
                        {room.game_state?.hostAssigned === 'none' ? 'UNASSIGNED' : `${room.game_state?.hostAssigned}s`.toUpperCase()}
                    </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    {room.game_state?.hostAssigned === 'none' 
                        ? "Pocket any object ball to claim your group (Solids or Stripes)." 
                        : `You are playing ${room.game_state?.hostAssigned}s. Clear them all and pocket the 8-ball to win!`}
                </div>
             </div>

             <button 
                onClick={handleResign}
                className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest md:hover:bg-red-500/20 transition-colors"
             >
                FORFEIT MATCH
             </button>
        </div>
      </div>

      {/* Prep Phase Overlay */}
      {phase === 'prep' && room.status === 'active' && (
        <H2HGamePrep
           gameType="pool"
           stake={room.stake}
           onComplete={() => setPhase('playing')}
        />
      )}

      {/* Winner Modal */}
      {showWinnerDelayed && (
        <div className="fixed inset-0 z-200 bg-slate-950/90 flex items-center justify-center p-2">
           <div className="w-full max-w-2xl">
              <H2HWinner
                 room={room}
                 user={user}
                 isSyncing={room.status !== 'finished'}
              />
           </div>
        </div>
      )}
    </div>
  )
}

export default PoolArena
