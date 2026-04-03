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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const roomIdResolved = roomId || room?.room_id || room?.id

  const fetchRoom = useCallback(async (id: string, isPoll = false) => {
    try {
      const data = await wordScrambleApi.getRoom(id)
      setRoom(data)
      if (data.status === 'active' && phase === 'waiting') { setPhase('playing'); setTimeLeft(15); setTimeout(() => inputRef.current?.focus(), 100) }
      if (data.status === 'finished' && phase !== 'finished') setPhase('finished')
    } catch {
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
    } catch (err) { toast.error(err instanceof Error ? err.message : 'An error occurred') }
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
    } catch (err) { toast.error(err instanceof Error ? err.message : 'An error occurred') } finally { setLoading(false) }
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
    } catch (err) { toast.error(err instanceof Error ? err.message : 'An error occurred') } finally { setLoading(false) }
  }

  async function handleQuickMatch() {
    setLoading(true)
    try {
      const data = await wordScrambleApi.findQuickMatch(stake)
      setRoom(data)
      navigate(`/word-scramble/${data.room_id}`, { replace: true })
      setPhase(data.status === 'active' ? 'playing' : 'waiting')
      if (data.status === 'active') setTimeout(() => inputRef.current?.focus(), 300)
    } catch (err) { toast.error(err instanceof Error ? err.message : 'An error occurred') } finally { setLoading(false) }
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
    <div className="w-full max-w-2xl mx-auto space-y-6 py-6 px-4">
      <header className="text-center space-y-2">
        <img src="/logoImage.png" alt="Playza" className="h-8 mx-auto mb-2 opacity-80" loading="lazy" />
        <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
          Word <span className="text-primary">Scramble</span>
        </h1>
        <p className="text-slate-500 text-[10px] md:text-sm font-bold">Unscramble words faster than your opponent. 5 rounds. Best score wins.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button onClick={handleQuickMatch} disabled={loading} className="group bg-white/80 dark:bg-slate-900/40 p-5 rounded-xl border border-black/5 dark:border-white/10 space-y-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500"><Zap className="w-5 h-5" /></div>
          <div><p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Quick Play</p><h3 className="font-black uppercase italic text-[10px] md:text-sm text-slate-900 dark:text-white">Find Rival</h3></div>
        </button>
        <button onClick={() => handleCreate(false)} disabled={loading} className="group bg-white/80 dark:bg-slate-900/40 p-5 rounded-xl border border-black/5 dark:border-white/10 space-y-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500"><Users className="w-5 h-5" /></div>
          <div><p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Private</p><h3 className="font-black uppercase italic text-[10px] md:text-sm text-slate-900 dark:text-white">Invite Friend</h3></div>
        </button>
        <button onClick={() => handleCreate(true)} disabled={loading} className="group bg-white/80 dark:bg-slate-900/40 p-5 rounded-xl border border-black/5 dark:border-white/10 space-y-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500"><Bot className="w-5 h-5" /></div>
          <div><p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Solo</p><h3 className="font-black uppercase italic text-[10px] md:text-sm text-slate-900 dark:text-white">vs Computer</h3></div>
        </button>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/40 rounded-xl p-5 border border-black/5 dark:border-white/10 space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Stake (₦)</label>
          <div className="grid grid-cols-4 gap-2">
            {[0, 100, 500, 1000].map(v => (
              <button key={v} onClick={() => setStake(v)} className={`py-2 rounded-xl font-black text-[10px] md:text-sm border ${stake === v ? 'bg-primary text-slate-950 border-transparent' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10'}`}>
                {v === 0 ? 'Free' : `₦${v}`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Bot Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button key={d} onClick={() => setBotDifficulty(d)} className={`py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border ${botDifficulty === d ? 'bg-primary text-slate-950 border-transparent' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10'}`}>{d}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={10} placeholder="WSC-XXXXXX" className="flex-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 font-mono font-bold tracking-widest text-[10px] md:text-sm focus:border-primary outline-none" />
          <button onClick={handleJoin} disabled={joinCode.length < 7 || loading} className="px-5 bg-primary text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest disabled:opacity-50">Join</button>
        </div>
      </div>
    </div>
  )

  if (phase === 'waiting') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center bg-transparent">
      <img src="/logoImage.png" alt="Playza" className="h-8 opacity-60" loading="lazy" />
      <h2 className="text-2xl md:text-3xl font-black uppercase italic text-slate-900 dark:text-white">Waiting for opponent...</h2>
      <div className="bg-white/80 dark:bg-slate-900/40 p-8 rounded-xl border border-primary/30 space-y-4">
        <p className="text-3xl md:text-5xl font-black tracking-[0.3em] text-primary">{room?.code}</p>
        <button onClick={handleShare} className="flex items-center gap-2 mx-auto bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl text-[10px] md:text-sm"><Share2 className="w-4 h-4" /> Share</button>
      </div>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-primary rounded-full opacity-30" />
        <div className="w-2 h-2 bg-primary rounded-full opacity-60" />
        <div className="w-2 h-2 bg-primary rounded-full" />
      </div>
    </div>
  )

  if (phase === 'playing' && currentWord) return (
    <div className="w-full max-w-lg mx-auto space-y-6 py-6 px-4">
      <div className="flex items-center justify-between">
        <img src="/logoImage.png" alt="Playza" className="h-6 opacity-60" loading="lazy" />
        <div className="flex items-center gap-3">
          <span className="text-[10px] md:text-xs text-slate-500 font-bold">Round {currentRound + 1}/{rounds.length}</span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${timeLeft <= 5 ? 'bg-red-500/20 text-red-500' : 'bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white'}`}>{timeLeft}</div>
        </div>
      </div>

      <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${((currentRound) / rounds.length) * 100}%` }} /></div>

      <div className={`bg-white/80 dark:bg-slate-900/40 p-8 rounded-xl border text-center space-y-4 ${feedback === 'correct' ? 'border-green-500/50 bg-green-500/5' : feedback === 'wrong' ? 'border-red-500/50 bg-red-500/5' : 'border-black/5 dark:border-white/10'}`}>
        <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          <Shuffle className="w-4 h-4" /> Unscramble this word
        </div>
        <p className="text-3xl md:text-5xl font-black tracking-[0.3em] text-primary font-mono">{currentWord.scrambled}</p>
        <p className="text-slate-500 text-[10px] md:text-sm"><span className="font-bold">Hint:</span> {currentWord.hint}</p>
        {feedback && <p className={`font-black uppercase text-[10px] md:text-sm ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>{feedback === 'correct' ? `✓ Correct! (+${timeLeft * 100} pts)` : `✗ Wrong! It was: ${currentWord.word}`}</p>}
      </div>

      <form onSubmit={handleAnswer} className="flex gap-3">
        <input ref={inputRef} value={answer} onChange={e => setAnswer(e.target.value.toUpperCase())} disabled={!!feedback} className="flex-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 font-mono font-black text-lg tracking-widest text-center focus:border-primary outline-none disabled:opacity-50 uppercase text-slate-900 dark:text-white" placeholder="ENTER WORD" autoComplete="off" autoCorrect="off" />
        <button type="submit" disabled={!answer.trim() || !!feedback} className="px-6 bg-primary text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest disabled:opacity-50">Go</button>
      </form>

      <div className="flex justify-between text-[10px] md:text-sm">
        <span className="text-slate-500 font-bold">Score: <span className="text-primary">{score}</span></span>
        <span className="text-slate-500 font-bold">Won: <span className="text-primary">{roundsWon}/{currentRound}</span></span>
      </div>
    </div>
  )

  if (phase === 'submitted') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <img src="/logoImage.png" alt="Playza" className="h-8 opacity-60" loading="lazy" />
      <p className="text-xl font-black uppercase italic text-slate-900 dark:text-white">Waiting for opponent...</p>
      <p className="text-slate-500 text-[10px] md:text-sm">You scored <span className="text-primary font-bold">{score} pts</span> · Won {roundsWon}/{rounds.length} rounds</p>
      <div className="flex gap-1 mt-4">
        <div className="w-2 h-2 bg-primary rounded-full opacity-30" />
        <div className="w-2 h-2 bg-primary rounded-full opacity-60" />
        <div className="w-2 h-2 bg-primary rounded-full" />
      </div>
    </div>
  )

  if (phase === 'finished') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <img src="/logoImage.png" alt="Playza" className="h-8" loading="lazy" />
      <div className="text-6xl">{iWon ? '🏆' : room?.winner_id === 'bot' ? '🤖' : !room?.winner_id ? '🤝' : '💀'}</div>
      <h1 className="text-2xl md:text-4xl font-black uppercase italic text-slate-900 dark:text-white">{iWon ? 'You Won!' : room?.winner_id === 'bot' ? 'Bot Wins' : !room?.winner_id ? "It's a Draw!" : 'You Lost'}</h1>
      <div className="bg-white/80 dark:bg-slate-900/40 p-6 rounded-xl border border-black/5 dark:border-white/10 space-y-3 w-full max-w-sm">
        {myScore && <div className="flex justify-between text-[10px] md:text-sm"><span className="text-slate-500">Your rounds won</span><span className="text-primary font-black">{myScore.rounds_won}</span></div>}
        {opponentScore && <div className="flex justify-between text-[10px] md:text-sm"><span className="text-slate-500">{room?.is_bot ? 'Bot rounds won' : 'Opponent rounds won'}</span><span className="font-black text-slate-900 dark:text-white">{opponentScore.rounds_won}</span></div>}
        {iWon && (room?.stake ?? 0) > 0 && <div className="text-primary font-bold text-[10px] md:text-sm pt-2 border-t border-black/5 dark:border-white/10">+₦{((room?.stake ?? 0) * 2 * 0.9).toFixed(0)} credited to wallet</div>}
      </div>
      <div className="flex gap-3">
        <button onClick={() => { setPhase('lobby'); setRoom(null); setCurrentRound(0); setRoundsWon(0); setScore(0); navigate('/word-scramble') }} className="bg-primary text-slate-950 font-black uppercase tracking-widest px-8 py-3 rounded-xl text-[10px] md:text-sm">Play Again</button>
        <button onClick={() => navigate('/h2h')} className="bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white font-black uppercase tracking-widest px-8 py-3 rounded-xl text-[10px] md:text-sm">H2H Zone</button>
      </div>
    </div>
  )

  return null
}
