import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/context/toast';
import { speedBattleApi } from '@/api/speedbattle.api';

type Phase = "prep" | "playing" | "submitted";

interface SpeedBattleArenaProps {
  room: {
    id: string;
    paragraph: string;
    stake: number;
  };
}

import H2HGamePrep from '../H2HGamePrep';

export default function SpeedBattleArena({ room }: SpeedBattleArenaProps) {
  const toast = useToast();

  const [phase, setPhase] = useState<Phase>('prep');
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const startBattle = () => {
    setPhase('playing');
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleFinish = useCallback(async () => {
    setPhase('submitted');
    try {
      await speedBattleApi.submitResult(room.id, wpm, accuracy / 100);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [room.id, wpm, accuracy, toast]);

  useEffect(() => {
    if (phase !== 'playing' || !startTime || !room) return;
    const paragraph = room.paragraph;
    const words = paragraph.trim().split(' ');
    const typedWords = typed.trim().split(' ');
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    
    const correctWords = typedWords.filter((w: string, i: number) => w === words[i]).length;
    const newWpm = elapsed > 0 ? Math.round(correctWords / elapsed) : 0;
    
    const correctChars = typed.split('').filter((c: string, i: number) => c === paragraph[i]).length;
    const newAccuracy = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100;
    
    const t = setTimeout(() => {
      setWpm(newWpm);
      setAccuracy(newAccuracy);
      if (typed === paragraph) handleFinish();
    }, 0);
    
    return () => clearTimeout(t);
  }, [typed, phase, startTime, room, handleFinish]);

  const paragraph = room?.paragraph || '';
  const progress = paragraph ? (typed.length / paragraph.length) * 100 : 0;

  if (phase === 'prep') return (
    <H2HGamePrep 
      gameType="speed-battle" 
      stake={room.stake} 
      onComplete={startBattle} 
    />
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 py-4 px-2 md:px-0">
      <div className="flex items-center justify-between">
        <img src="/logoImage.png" alt="Playza" className="h-6 opacity-60" loading="lazy" />
        <div className="flex items-center gap-4 text-[10px] md:text-sm font-bold">
          <span className="text-primary">{wpm} WPM</span>
          <span className="text-slate-500">{accuracy}% accuracy</span>
        </div>
      </div>

      <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-xl overflow-hidden">
        <div 
          className="h-full bg-primary rounded-xl" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <div className="bg-white/80 dark:bg-slate-900/40 p-6 rounded-xl border border-black/5 dark:border-white/10">
        <div className="font-mono text-sm md:text-base leading-relaxed select-none">
          {paragraph.split('').map((char: string, i: number) => {
            let color = 'text-slate-500';
            if (i < typed.length) color = typed[i] === char ? 'text-primary' : 'text-red-500 bg-red-500/20';
            if (i === typed.length) color = 'text-slate-900 dark:text-white bg-black/5 dark:bg-white/20';
            return <span key={i} className={color}>{char}</span>;
          })}
        </div>
      </div>

      <input
        ref={inputRef}
        value={typed}
        onChange={e => { if (phase === 'playing') setTyped(e.target.value) }}
        disabled={phase === 'submitted'}
        className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 font-mono text-[10px] md:text-sm focus:border-primary outline-none disabled:opacity-50 text-slate-900 dark:text-white"
        placeholder="Start typing here..."
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {phase === 'submitted' && (
        <div className="text-center text-slate-500 text-[10px] md:text-sm font-bold uppercase tracking-widest">
          Waiting for opponent to finish...
        </div>
      )}
    </div>
  );
}
