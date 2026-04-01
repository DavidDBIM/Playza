import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuth } from '@/context/auth'
import { useToast } from '@/context/toast'
import { speedBattleApi } from '@/api/speedbattle.api'
// import { ZASymbol } from '@/components/currency/ZASymbol'
import { Share2, Zap, Bot, Users } from "lucide-react";

type Phase = 'lobby' | 'waiting' | 'countdown' | 'playing' | 'submitted' | 'finished'

interface RoomData {
  room_id?: string
  id?: string
  code: string
  stake: number
  paragraph: string
  status: string
  winner_id: string | null
  is_bot: boolean
  host: { id: string; username: string; avatar_url: string | null }
  guest: { id: string; username: string; avatar_url: string | null } | null
  results: { user_id: string; wpm: number; accuracy: number }[]
}

export default function SpeedBattle() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const [phase, setPhase] = useState<Phase>(roomId ? 'waiting' : 'lobby')
  const [room, setRoom] = useState<RoomData | null>(null)
  const [stake, setStake] = useState(0)
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [typed, setTyped] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const inputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const roomIdResolved = roomId || room?.room_id || room?.id

  const fetchRoom = useCallback(async (id: string, isPoll = false) => {
    try {
      const data = await speedBattleApi.getRoom(id)
      setRoom(data)
      if (data.status === 'active' && phase === 'waiting') setPhase('countdown')
      if (data.status === 'finished' && phase !== 'finished') setPhase('finished')
    } catch {
      if (!isPoll) { toast.error('Failed to load room'); navigate('/speed-battle') }
    }
  }, [phase, navigate, toast])

  useEffect(() => {
    if (roomIdResolved) fetchRoom(roomIdResolved)
  }, [roomIdResolved])

  useEffect(() => {
    if (!roomIdResolved || phase === 'finished' || phase === 'lobby') return
    pollRef.current = setInterval(() => fetchRoom(roomIdResolved, true), 2000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [roomIdResolved, phase, fetchRoom])

  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) { setPhase('playing'); setStartTime(Date.now()); setTimeout(() => inputRef.current?.focus(), 100); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  useEffect(() => {
    if (phase !== 'playing' || !startTime || !room) return
    const paragraph = room.paragraph
    const words = paragraph.trim().split(' ')
    const typedWords = typed.trim().split(' ')
    const elapsed = (Date.now() - startTime) / 1000 / 60
    const correctWords = typedWords.filter((w, i) => w === words[i]).length
    setWpm(elapsed > 0 ? Math.round(correctWords / elapsed) : 0)
    const correctChars = typed.split('').filter((c, i) => c === paragraph[i]).length
    setAccuracy(typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100)
    if (typed === paragraph) handleFinish()
  }, [typed, phase, startTime, room])

  async function handleFinish() {
    if (!roomIdResolved) return
    setPhase('submitted')
    try {
      await speedBattleApi.submitResult(roomIdResolved, wpm, accuracy / 100)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  async function handleCreate(isBot = false) {
    setLoading(true)
    try {
      const data = await speedBattleApi.createRoom(stake, isBot, botDifficulty)
      setRoom(data)
      navigate(`/speed-battle/${data.room_id}`, { replace: true })
      setPhase(isBot ? 'countdown' : 'waiting')
      setCountdown(3)
    } catch (err) { toast.error(err instanceof Error ? err.message : 'An error occurred') } finally { setLoading(false) }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return
    setLoading(true)
    try {
      const data = await speedBattleApi.joinRoom(joinCode.trim())
      setRoom(data)
      navigate(`/speed-battle/${data.room_id}`, { replace: true })
      setPhase('countdown')
      setCountdown(3)
    } catch (err) { toast.error(err instanceof Error ? err.message : 'An error occurred') } finally { setLoading(false) }
  }

  async function handleQuickMatch() {
    setLoading(true)
    try {
      const data = await speedBattleApi.findQuickMatch(stake)
      setRoom(data)
      navigate(`/speed-battle/${data.room_id}`, { replace: true })
      setPhase(data.status === 'active' ? 'countdown' : 'waiting')
      setCountdown(3)
    } catch (err) { toast.error(err instanceof Error ? err.message : 'An error occurred') } finally { setLoading(false) }
  }

  function handleShare() {
    if (!room) return
    const text = `Race me in Speed Battle on Playza! Room: ${room.code} — playza.games/speed-battle`
    if (navigator.share) navigator.share({ title: 'Playza Speed Battle', text })
    else { navigator.clipboard.writeText(text); toast.success('Link copied!') }
  }

  const paragraph = room?.paragraph || ''
  const progress = paragraph ? (typed.length / paragraph.length) * 100 : 0
  const myResult = room?.results?.find(r => r.user_id === user?.id)
  const opponentResult = room?.results?.find(r => r.user_id !== user?.id)
  const iWon = room?.winner_id === user?.id

  if (phase === 'lobby') return (
    <div className="w-full max-w-2xl mx-auto space-y-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="text-center space-y-2">
        <img src="/logoImage.png" alt="Playza" className="h-8 mx-auto mb-2 opacity-80" />
        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-foreground">
          Speed <span className="text-primary">Battle</span>
        </h1>
        <p className="text-muted-foreground text-sm font-bold">Type faster than your opponent. First to finish wins.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button onClick={handleQuickMatch} disabled={loading} className="group glass-card p-5 rounded-xl border border-white/10 hover:border-indigo-500/40 transition-all space-y-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all"><Zap className="w-5 h-5" /></div>
          <div><p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Quick Play</p><h3 className="font-black uppercase italic text-sm">Find Rival</h3></div>
        </button>
        <button onClick={() => handleCreate(false)} disabled={loading} className="group glass-card p-5 rounded-xl border border-white/10 hover:border-emerald-500/40 transition-all space-y-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Users className="w-5 h-5" /></div>
          <div><p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Private</p><h3 className="font-black uppercase italic text-sm">Invite Friend</h3></div>
        </button>
        <button onClick={() => handleCreate(true)} disabled={loading} className="group glass-card p-5 rounded-xl border border-white/10 hover:border-amber-500/40 transition-all space-y-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all"><Bot className="w-5 h-5" /></div>
          <div><p className="text-[10px] text-amber-400 font-black uppercase tracking-widest">Solo</p><h3 className="font-black uppercase italic text-sm">vs Computer</h3></div>
        </button>
      </div>

      <div className="glass-card rounded-xl p-5 border border-white/10 space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Stake (₦)</label>
          <div className="grid grid-cols-4 gap-2">
            {[0, 100, 500, 1000].map(v => (
              <button key={v} onClick={() => setStake(v)} className={`py-2 rounded-xl font-black text-sm transition-all border ${stake === v ? 'bg-primary text-black border-transparent' : 'bg-white/5 border-white/10 hover:border-primary/30'}`}>
                {v === 0 ? 'Free' : `₦${v}`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Bot Difficulty (vs Computer)</label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button key={d} onClick={() => setBotDifficulty(d)} className={`py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${botDifficulty === d ? 'bg-primary text-black border-transparent' : 'bg-white/5 border-white/10'}`}>{d}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={7} placeholder="SPD-XXXXXX" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono font-bold tracking-widest text-sm focus:border-primary outline-none" />
          <button onClick={handleJoin} disabled={joinCode.length < 7 || loading} className="px-5 bg-primary text-black font-black rounded-xl text-sm uppercase tracking-widest disabled:opacity-50">Join</button>
        </div>
      </div>
    </div>
  )

  if (phase === 'waiting') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center animate-in fade-in duration-500">
      <img src="/logoImage.png" alt="Playza" className="h-8 opacity-60" />
      <div>
        <h2 className="text-3xl font-black uppercase italic text-foreground">Waiting for opponent</h2>
        <p className="text-muted-foreground text-sm mt-1">Share this code with your friend</p>
      </div>
      <div className="glass-card p-8 rounded-xl border border-primary/30 space-y-4">
        <p className="text-5xl font-black tracking-[0.3em] text-primary">{room?.code}</p>
        {(room?.stake ?? 0) > 0 && <p className="text-muted-foreground text-sm">Stake: <span className="text-white font-bold">₦{room?.stake?.toLocaleString()}</span></p>}
        <button onClick={handleShare} className="flex items-center gap-2 mx-auto bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl hover:bg-emerald-600 transition-all"><Share2 className="w-4 h-4" /> Share</button>
      </div>
      <div className="flex gap-1 items-center">
        {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
      </div>
    </div>
  )

  if (phase === 'countdown') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in duration-300">
      <img src="/logoImage.png" alt="Playza" className="h-8 opacity-60" />
      <p className="text-muted-foreground font-black uppercase tracking-widest text-sm">Get ready to type!</p>
      <div className="text-[120px] font-black text-primary leading-none animate-pulse">{countdown === 0 ? 'GO!' : countdown}</div>
    </div>
  )

  if (phase === 'playing' || phase === 'submitted') return (
    <div className="w-full max-w-2xl mx-auto space-y-6 py-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <img src="/logoImage.png" alt="Playza" className="h-6 opacity-60" />
        <div className="flex items-center gap-4 text-sm font-bold">
          <span className="text-primary">{wpm} WPM</span>
          <span className="text-muted-foreground">{accuracy}% accuracy</span>
        </div>
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-100 rounded-full" style={{ width: `${progress}%` }} />
      </div>

      <div className="glass-card p-6 rounded-xl border border-white/10">
        <div className="font-mono text-base leading-relaxed select-none">
          {paragraph.split('').map((char, i) => {
            let color = 'text-muted-foreground'
            if (i < typed.length) color = typed[i] === char ? 'text-primary' : 'text-red-500 bg-red-500/20'
            if (i === typed.length) color = 'text-white bg-white/20'
            return <span key={i} className={color}>{char}</span>
          })}
        </div>
      </div>

      <input
        ref={inputRef}
        value={typed}
        onChange={e => { if (phase === 'playing') setTyped(e.target.value) }}
        disabled={phase === 'submitted'}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm focus:border-primary outline-none disabled:opacity-50"
        placeholder="Start typing here..."
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {phase === 'submitted' && (
        <div className="text-center text-muted-foreground text-sm animate-pulse font-bold uppercase tracking-widest">
          Waiting for opponent to finish...
        </div>
      )}
    </div>
  )

  if (phase === 'finished') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-in fade-in zoom-in-95 duration-500">
      <img src="/logoImage.png" alt="Playza" className="h-8" />
      <div className="text-6xl">{iWon ? '🏆' : room?.winner_id === 'bot' ? '🤖' : '💀'}</div>
      <h1 className="text-4xl font-black uppercase italic text-foreground">{iWon ? 'You Won!' : room?.winner_id === 'bot' ? 'Bot Wins' : 'You Lost'}</h1>
      <div className="glass-card p-6 rounded-xl border border-white/10 space-y-3 w-full max-w-sm">
        {myResult && <div className="flex justify-between text-sm"><span className="text-muted-foreground font-bold">Your WPM</span><span className="text-primary font-black">{myResult.wpm}</span></div>}
        {opponentResult && <div className="flex justify-between text-sm"><span className="text-muted-foreground font-bold">{room?.is_bot ? 'Bot WPM' : 'Opponent WPM'}</span><span className="font-black">{opponentResult.wpm}</span></div>}
        {iWon && (room?.stake ?? 0) > 0 && <div className="text-primary font-bold text-sm pt-2 border-t border-white/10">+₦{(room!.stake * 2 * 0.9).toFixed(0)} credited to wallet</div>}
      </div>
      <div className="flex gap-3">
        <button onClick={() => { setPhase('lobby'); setRoom(null); setTyped(''); navigate('/speed-battle') }} className="bg-primary text-black font-black uppercase tracking-widest px-8 py-3 rounded-xl hover:-translate-y-0.5 transition-all">Play Again</button>
        <button onClick={() => navigate('/h2h')} className="bg-white/10 text-foreground font-black uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-white/20 transition-all">H2H Zone</button>
      </div>
    </div>
  )

  return null
}
