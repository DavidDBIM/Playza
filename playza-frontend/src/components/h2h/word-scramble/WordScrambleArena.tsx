import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/context/toast';
import { wordScrambleApi } from '@/api/wordscramble.api';
import { Shuffle } from 'lucide-react';

type Phase = 'prep' | 'playing' | 'submitted';

interface WordScrambleArenaProps {
  room: {
    id: string;
    rounds: {
      word: string;
      scrambled: string;
      hint: string;
    }[];
    stake: number;
  };
}

import H2HGamePrep from '../H2HGamePrep';

export default function WordScrambleArena({ room }: WordScrambleArenaProps) {
  const toast = useToast();

  const [phase, setPhase] = useState<Phase>('prep');
  const [currentRound, setCurrentRound] = useState(0);
  const [answer, setAnswer] = useState('');
  const [roundsWon, setRoundsWon] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startBattle = () => {
    setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = useCallback(async (finalScore: number, finalRoundsWon: number) => {
    if (!room?.id) return;
    setPhase('submitted');
    try {
      await wordScrambleApi.submitScore(room.id, finalScore, finalRoundsWon);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [room, toast]);

  const handleNextRound = useCallback((correct: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFeedback(correct ? 'correct' : 'wrong');
    const newRoundsWon = correct ? roundsWon + 1 : roundsWon;
    const newScore = correct ? score + Math.round(timeLeft * 100) : score;
    if (correct) { setRoundsWon(newRoundsWon); setScore(newScore); }

    setTimeout(() => {
      setFeedback(null);
      setAnswer('');
      const rounds = room?.rounds || [];
      if (currentRound + 1 >= rounds.length) {
        handleSubmit(newScore, newRoundsWon);
      } else {
        setCurrentRound(r => r + 1);
        setTimeLeft(15);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }, 1000);
  }, [roundsWon, score, timeLeft, room?.rounds, currentRound, handleSubmit]);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleNextRound(false); return 15; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, currentRound, handleNextRound]);

  function handleAnswer(e: React.FormEvent) {
    e.preventDefault();
    const rounds = room?.rounds || [];
    const correct = answer.trim().toUpperCase() === rounds[currentRound]?.word.toUpperCase();
    handleNextRound(correct);
  }

  const rounds = room?.rounds || [];
  const currentWord = rounds[currentRound];

  if (phase === 'prep') return (
    <H2HGamePrep 
      gameType="word-scramble" 
      stake={room.stake} 
      onComplete={startBattle} 
    />
  );

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
  );

  if (phase === 'submitted') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <img src="/logoImage.png" alt="Playza" className="h-8 opacity-60" />
      <p className="text-xl font-black uppercase italic text-foreground">Waiting for opponent...</p>
      <p className="text-muted-foreground text-sm">You scored <span className="text-primary font-bold">{score} pts</span> · Won {roundsWon}/{rounds.length} rounds</p>
      <div className="flex gap-1 mt-4">{[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}</div>
    </div>
  );

  return null;
}
