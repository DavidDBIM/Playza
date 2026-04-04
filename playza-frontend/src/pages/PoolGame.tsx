import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import Phaser from 'phaser'
import { poolApi } from '@/api/poolApi'
import { usePoolGameStore } from '@/store/poolGameStore'
import { GAME_CONFIG } from '@/game/pool/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Trophy, Users, AlertCircle } from 'lucide-react'

export default function PoolGamePage() {
  const navigate = useNavigate()
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { room, isMyTurn, myPlayer, isLoading, error, setRoom, setIsMyTurn, setMyPlayer, setLoading, setError, reset } = usePoolGameStore()

  const [stake, setStake] = useState(2000)
  const [joinCode, setJoinCode] = useState('')
  const [gameMode, setGameMode] = useState<'menu' | 'lobby' | 'playing' | 'finished'>('menu')
  const [winner, setWinner] = useState<string | null>(null)

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      const config = {
        ...GAME_CONFIG,
        parent: containerRef.current,
      }
      gameRef.current = new Phaser.Game(config)
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  const handleCreateRoom = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await poolApi.createRoom(stake)
      setRoom(result.data)
      setMyPlayer('host')
      setGameMode('lobby')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create room'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!joinCode) return
    setLoading(true)
    setError(null)

    try {
      const result = await poolApi.joinRoom(joinCode)
      setRoom(result.data)
      setMyPlayer('guest')
      setGameMode('lobby')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to join room'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickMatch = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await poolApi.quickMatch(stake)
      setRoom(result.data)
      setMyPlayer(result.data.status === 'waiting' ? 'host' : 'guest')
      
      if (result.data.status === 'active') {
        setGameMode('playing')
        setIsMyTurn(result.data.game_state?.currentPlayer === 'host')
      } else {
        setGameMode('lobby')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to find match'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleResign = async () => {
    if (!room) return

    try {
      await poolApi.resign(room.id)
      setGameMode('finished')
      setWinner(myPlayer === 'host' ? 'guest' : 'host')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resign'
      setError(message)
    }
  }

  const handleBackToMenu = () => {
    reset()
    setGameMode('menu')
    setWinner(null)
    navigate('/games')
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">{error}</p>
            <Button onClick={handleBackToMenu} className="w-full">
              Back to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-slate-300">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      {gameMode === 'menu' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">8 Ball Pool</h1>
            <p className="text-slate-400">Real-time 1v1 multiplayer billiards</p>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Create Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm mb-2 block">Stake Amount (₦)</label>
                <Input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button onClick={handleCreateRoom} className="w-full">
                Create Room
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Join Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm mb-2 block">Room Code</label>
                <Input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button onClick={handleJoinRoom} className="w-full" variant="outline">
                Join Room
              </Button>
            </CardContent>
          </Card>

          <Button onClick={handleQuickMatch} className="w-full" size="lg">
            <Users className="mr-2 h-4 w-4" />
            Quick Match - ₦{stake.toLocaleString()}
          </Button>

          <Button variant="ghost" onClick={handleBackToMenu} className="w-full text-slate-400">
            Back to Games
          </Button>
        </div>
      )}

      {gameMode === 'lobby' && room && (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Waiting for Opponent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                <span className="text-slate-300">Room Code:</span>
                <span className="text-white font-mono text-xl">{room.code}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                <span className="text-slate-300">Stake:</span>
                <span className="text-green-400 font-bold">₦{room.stake.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                <span className="text-slate-300">Status:</span>
                <span className="text-yellow-400">Waiting...</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="destructive" onClick={handleBackToMenu} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {gameMode === 'playing' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <Card className="bg-slate-800 border-slate-700 flex-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">You</p>
                    <p className="text-white font-bold">{myPlayer === 'host' ? 'Host' : 'Guest'}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full ${isMyTurn ? 'bg-green-600' : 'bg-red-600'}`}>
                    {isMyTurn ? 'Your Turn' : 'Opponent'}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700 flex-1 ml-4">
              <CardContent className="p-4">
                <p className="text-slate-400 text-sm">Stake</p>
                <p className="text-green-400 font-bold text-xl">₦{room?.stake.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          <div ref={containerRef} id="pool-game-container" className="rounded-lg overflow-hidden border border-slate-700" />

          <Button variant="destructive" onClick={handleResign} className="w-full">
            Resign Game
          </Button>
        </div>
      )}

      {gameMode === 'finished' && (
        <div className="max-w-md mx-auto">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {winner === myPlayer ? (
                  <span className="text-green-400">You Won!</span>
                ) : (
                  <span className="text-red-400">You Lost</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4">
                <Trophy className={`h-16 w-16 mx-auto mb-4 ${winner === myPlayer ? 'text-yellow-400' : 'text-slate-500'}`} />
                <p className="text-slate-300">
                  {winner === myPlayer 
                    ? `You won ₦${((room?.stake || 0) * 2 * 0.9).toLocaleString()}`
                    : `You lost ₦${room?.stake.toLocaleString()}`
                  }
                </p>
              </div>
              <Button onClick={handleBackToMenu} className="w-full">
                Back to Games
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}