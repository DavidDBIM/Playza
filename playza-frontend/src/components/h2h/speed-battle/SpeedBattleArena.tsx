import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth';
import { useToast } from '@/context/toast';
import { speedBattleApi } from '@/api/speedbattle.api';

type Phase = 'countdown' | 'playing' | 'submitted';

interface SpeedBattleArenaProps {
  room: any;
}

export default function SpeedBattleArena({ room }: SpeedBattleArenaProps) {
  const { user } = useAuth();
  const toast = useToast();

  const [phase, setPhase] = useState<Phase>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown === 0) { 
      setPhase('playing'); 
      setStartTime(Date.now()); 
      setTimeout(() => inputRef.current?.focus(), 100); 
      return; 
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'playing' || !startTime || !room) return;
    const paragraph = room.paragraph;
    const words = paragraph.trim().split(' ');
    const typedWords = typed.trim().split(' ');
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    const correctWords = typedWords.filter((w: string, i: number) => w === words[i]).length;
    setWpm(elapsed > 0 ? Math.round(correctWords / elapsed) : 0);
    const correctChars = typed.split('').filter((c: string, i: number) => c === paragraph[i]).length;
    setAccuracy(typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100);
    if (typed === paragraph) handleFinish();
  }, [typed, phase, startTime, room]);

  async function handleFinish() {
    setPhase('submitted');
    try {
      await speedBattleApi.submitResult(room.id, wpm, accuracy / 100);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  const paragraph = room?.paragraph || '';
  const progress = paragraph ? (typed.length / paragraph.length) * 100 : 0;

  if (phase === 'countdown') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in duration-300">
      <img src="/logoImage.png" alt="Playza" className="h-8 opacity-60" />
      <p className="text-muted-foreground font-black uppercase tracking-widest text-sm">Get ready to type!</p>
      <div className="text-[120px] font-black text-primary leading-none animate-pulse">{countdown === 0 ? 'GO!' : countdown}</div>
    </div>
  );

  return (
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
          {paragraph.split('').map((char: string, i: number) => {
            let color = 'text-muted-foreground';
            if (i < typed.length) color = typed[i] === char ? 'text-primary' : 'text-red-500 bg-red-500/20';
            if (i === typed.length) color = 'text-white bg-white/20';
            return <span key={i} className={color}>{char}</span>;
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
  );
}
