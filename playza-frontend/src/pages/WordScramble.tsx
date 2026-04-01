import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAuth } from '@/context/auth'
import { useToast } from '@/context/toast'
import { wordScrambleApi } from '@/api/wordscramble.api'
import { Share2, Shuffle, Bot, Zap, Users } from 'lucide-react'

type Phase = 'lobby' | 'waiting' | 'playing' | 'submitted' | 'finished'

interface Round { word: string; scrambled: string; hint: string }
interface RoomData {
  room_id?: string; id?: string; code: string; stake: number
  rounds: Round[]; status: string; winner_id: string | null
  is_bot: boolean; host: { id: string; username: string }
  guest: { id: string; username: string } | null
  scores: { user_id: string; score: number; rounds_won: number }[]
}

export default function WordScramble() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const [phase, setPhase] = useState<Phase>(roomId ? 'waiting' : 'lobby')
  const [room, setRoom] = useState<RoomData | null>(null)
  const [stake, setStake] = useState(0)
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentRound, setCurrentRound] = useState(0)
  const [answer, setAnswer] = useState('')
  const [roundsWon, setRoundsWon] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [timeLeft, setTimeLeft] = useState(15)
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const roomIdResolved = roomId || room?.room_id || room?.id

  const fetchRoom = useCallback(async (id: string, isPoll = false) => {
    try {
      const data = await wordScrambleApi.getRoom(id)
      setRoom(data)
      if (data.status === 'active' && phase === 'waiting') { setPhase('playing'); setTimeLeft(15); setTimeout(() => inputRef.current?.focus(), 100) }
      if (data.status === 'finished' && phase !== 'finished') setPhase('finished')
    } catch (err) {
      if (!isPoll) { toast.error('Failed to load room'); navigate('/word-scramble') }
    }
  }, [phase, navigate, toast])

  useEffect(() => { if (roomIdResolved) fetchRoom(roomIdResolved) }, [roomIdResolved])

  useEffect(() => {
    if (!roomIdResolved || phase === 'finished' || phase === 'lobby') return
    const interval = setInterval(() => fetchRoom(roomIdResolved, true), 2000)
    return () => clearInterval(interval)
  }, [roomIdResolved, phase, fetchRoom])

  useEffect(() => {
    if (phase !== 'playing') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleNextRound(false); return 15 }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, currentRound])

  function handleNextRound(correct: boolean) {
    if (timerRef.current) clearInterval(timerRef.current)
    setFeedback(correct ? 'correct' : 'wrong')
    const newRoundsWon = correct ? roundsWon + 1 : roundsWon
    const newScore = correct ? score + Math.round(timeLeft * 100) : score
    if (correct) { setRoundsWon(newRoundsWon); setScore(newScore) }

    setTimeout(() => {
      setFeedback(null)
      setAnswer('')
      const rounds = room?.rounds || []
      if (currentRound + 1 >= rounds.length) {
        handleSubmit(newScore, newRoundsWon)
      } else {
        setCurrentRound(r => r + 1)
        setTimeLeft(15)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }, 1000)
  }

  async function handleSubmit(finalScore: number, finalRoundsWon: number) {
    if (!roomIdResolved) return
    setPhase('submitted')
    try {
      await wordScrambleApi.submitScore(roomIdResolved, finalScore, finalRoundsWon)
    } catch (err: any) { toast.error(err.message) }
  }

  function handleAnswer(e: React.FormEvent) {
    e.preventDefault()
    const rounds = room?.rounds || []
    const correct = answer.trim().toUpperCase() === rounds[currentRound]?.word.toUpperCase()
    handleNextRound(correct)
  }

  async function handleCreate(isBot = false) {
    setLoading(true)
    try {
      const data = await wordScrambleApi.createRoom(stake, isBot, botDifficulty)
      setRoom(data)
      navigate(`/word-scramble/${data.room_id}`, { replace: true })
      setPhase(isBot ? 'playing' : 'waiting')
      if (isBot) setTimeout(() => inputRef.current?.focus(), 300)
    } catch (err: any) { toast.error(err.message) } finally { setLoading(false) }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return
    setLoading(true)
    try {
      const data = await wordScrambleApi.joinRoom(joinCode.trim())
      setRoom(data)
      navigate(`/word-scramble/${data.room_id}`, { replace: true })
      setPhase('playing')
      setTimeout(() => inputRef.current?.focus(), 300)
    } catch (err: any) { toast.error(err.message) } finally { setLoading(false) }
  }

  async function handleQuickMatch() {
    setLoading(true)
    try {
      const data = await wordScrambleApi.findQuickMatch(stake)
      setRoom(data)
      navigate(`/word-scramble/${data.room_id}`, { replace: true })
      setPhase(data.status === 'active' ? 'playing' : 'waiting')
      if (data.status === 'active') setTimeout(() => inputRef.current?.focus(), 300)
    } catch (err: any) { toast.error(err.message) } finally { setLoading(false) }
  }

  function handleShare() {
    if (!room) return
    const text = `Unscramble words faster than me on Playza! Room: ${room.code} — playza.games/word-scramble`
    if (navigator.share) navigator.share({ title: 'Playza Word Scramble', text })
    else { navigator.clipboard.writeText(text); toast.success('Link copied!') }
  }

  const rounds = room?.rounds || []
  const currentWord = rounds[currentRound]
  const myScore = room?.scores?.find(s => s.user_id === user?.id)
  const opponentScore = room?.scores?.find(s => s.user_id !== user?.id)
  const iWon = room?.winner_id === user?.id

  if (phase === 'lobby') return (
    <div className="w-full max-w-2xl mx-auto space-y-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="text-center space-y-2">
        <img src="/logoImage.png" alt="Playza" className="h-8 mx-auto mb-2 opacity-80" />
        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-foreground">
          Word <span className="text-primary">Scramble</span>
        </h1>
        <p className="text-muted-foreground text-sm font-bold">Unscramble words faster than your opponent. 5 rounds. Best score wins.</p>
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
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Bot Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button key={d} onClick={() => setBotDifficulty(d)} className={`py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${botDifficulty === d ? 'bg-primary text-black border-transparent' : 'bg-white/5 border-white/10'}`}>{d}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={10} placeholder="WSC-XXXXXX" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono font-bold tracking-widest text-sm focus:border-primary outline-none" />
          <button onClick={handleJoin} disabled={joinCode.length < 7 || loading} className="px-5 bg-primary text-black font-black rounded-xl text-sm uppercase tracking-widest disabled:opacity-50">Join</button>
        </div>
      </div>
    </div>
  )

  if (phase === 'waiting') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center animate-in fade-in duration-500">
      <img src="/logoImage.png" alt="Playza" className="h-8 opacity-60" />
      <h2 className="text-3xl font-black uppercase italic">Waiting for opponent...</h2>
      <div className="glass-card p-8 rounded-xl border border-primary/30 space-y-4">
        <p className="text-5xl font-black tracking-[0.3em] text-primary">{room?.code}</p>
        <button onClick={handleShare} className="flex items-center gap-2 mx-auto bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl"><Share2 className="w-4 h-4" /> Share</button>
      </div>
      <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}</div>
    </div>
  )

  if (phase === 'playing' && currentWord) return (
    <div className="w-full max-w-lg mx-auto space-y-6 py-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <img src="/logoImage.png" alt="Playza" className="h-6 opacity-60" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-bold">Round {currentRound + 1}/{rounds.length}</span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${timeLeft <= 5 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-foreground'}`}>{timeLeft}</div>
        </div>
      </div>

      <div className="w-full h-1.5 bg-white/10 rounded-full"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentRound) / rounds.length) * 100}%` }} /></div>

      <div className={`glass-card p-8 rounded-xl border text-center space-y-4 transition-all ${feedback === 'correct' ? 'border-green-500/50 bg-green-500/5' : feedback === 'wrong' ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}>
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest">
          <Shuffle className="w-4 h-4" /> Unscramble this word
        </div>
        <p className="text-5xl font-black tracking-[0.3em] text-primary font-mono">{currentWord.scrambled}</p>
        <p className="text-muted-foreground text-sm"><span className="font-bold">Hint:</span> {currentWord.hint}</p>
        {feedback && <p className={`font-black uppercase text-sm ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{feedback === 'correct' ? `✓ Correct! (+${timeLeft * 100} pts)` : `✗ Wrong! It was: ${currentWord.word}`}</p>}
      </div>

      <form onSubmit={handleAnswer} className="flex gap-3">
        <input ref={inputRef} value={answer} onChange={e => setAnswer(e.target.value.toUpperCase())} disabled={!!feedback} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono font-black text-lg tracking-widest text-center focus:border-primary outline-none disabled:opacity-50 uppercase" placeholder="TYPE YOUR ANSWER" autoComplete="off" autoCorrect="off" />
        <button type="submit" disabled={!answer.trim() || !!feedback} className="px-6 bg-primary text-black font-black rounded-xl uppercase tracking-widest disabled:opacity-50">Go</button>
      </form>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground font-bold">Score: <span className="text-primary">{score}</span></span>
        <span className="text-muted-foreground font-bold">Won: <span className="text-primary">{roundsWon}/{currentRound}</span></span>
      </div>
    </div>
  )

  if (phase === 'submitted') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <img src="/logoImage.png" alt="Playza" className="h-8 opacity-60" />
      <p className="text-xl font-black uppercase italic text-foreground">Waiting for opponent...</p>
      <p className="text-muted-foreground text-sm">You scored <span className="text-primary font-bold">{score} pts</span> · Won {roundsWon}/{rounds.length} rounds</p>
      <div className="flex gap-1 mt-4">{[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}</div>
    </div>
  )

  if (phase === 'finished') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-in fade-in zoom-in-95 duration-500">
      <img src="/logoImage.png" alt="Playza" className="h-8" />
      <div className="text-6xl">{iWon ? '🏆' : room?.winner_id === 'bot' ? '🤖' : !room?.winner_id ? '🤝' : '💀'}</div>
      <h1 className="text-4xl font-black uppercase italic">{iWon ? 'You Won!' : room?.winner_id === 'bot' ? 'Bot Wins' : !room?.winner_id ? "It's a Draw!" : 'You Lost'}</h1>
      <div className="glass-card p-6 rounded-xl border border-white/10 space-y-3 w-full max-w-sm">
        {myScore && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Your rounds won</span><span className="text-primary font-black">{myScore.rounds_won}</span></div>}
        {opponentScore && <div className="flex justify-between text-sm"><span className="text-muted-foreground">{room?.is_bot ? 'Bot rounds won' : 'Opponent rounds won'}</span><span className="font-black">{opponentScore.rounds_won}</span></div>}
        {iWon && room?.stake! > 0 && <div className="text-primary font-bold text-sm pt-2 border-t border-white/10">+₦{(room?.stake! * 2 * 0.9).toFixed(0)} credited to wallet</div>}
      </div>
      <div className="flex gap-3">
        <button onClick={() => { setPhase('lobby'); setRoom(null); setCurrentRound(0); setRoundsWon(0); setScore(0); navigate('/word-scramble') }} className="bg-primary text-black font-black uppercase tracking-widest px-8 py-3 rounded-xl hover:-translate-y-0.5 transition-all">Play Again</button>
        <button onClick={() => navigate('/h2h')} className="bg-white/10 text-foreground font-black uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-white/20 transition-all">H2H Zone</button>
      </div>
    </div>
  )

  return null
}
