import React, { useState } from 'react';
import { ShieldAlert, Swords, Zap, Trophy, Timer, AlertCircle, CheckCircle2, type LucideIcon } from 'lucide-react';

interface Rule {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

interface H2HGamePrepProps {
  gameType: 'chess' | 'speed-battle' | 'word-scramble' | 'pool';
  stake: number;
  onComplete: () => void;
}

const gameRules: Record<string, Rule[]> = {
  chess: [
    {
      id: '01',
      icon: Trophy,
      title: 'Staked Match',
      description: 'Your stake is locked in escrow. Winner takes the total prize pool minus 10% platform fee.',
      color: 'text-primary'
    },
    {
      id: '02',
      icon: AlertCircle,
      title: 'Fair Play Warning',
      description: 'DO NOT navigate away. Leaving or closing the tab during an active match will forfeit your balance.',
      color: 'text-orange-500'
    },
    {
      id: '03',
      icon: CheckCircle2,
      title: 'Victory Condition',
      description: 'Checkmate your opponent or win on time to claim the prize pool.',
      color: 'text-emerald-500'
    }
  ],
  'speed-battle': [
    {
      id: '01',
      icon: Timer,
      title: 'Speed is King',
      description: 'You must type the entire paragraph exactly as shown. The faster you finish with high accuracy, the better.',
      color: 'text-blue-500'
    },
    {
      id: '02',
      icon: Zap,
      title: 'Accuracy Matters',
      description: 'Mistakes will slow you down. Correct errors immediately to maintain your flow.',
      color: 'text-amber-500'
    },
    {
      id: '03',
      icon: AlertCircle,
      title: 'Stability',
      description: 'Ensure a stable connection. Disconnecting during the sprint counts as an automatic forfeit.',
      color: 'text-red-500'
    }
  ],
  'word-scramble': [
    {
      id: '01',
      icon: Zap,
      title: 'Quick Thinking',
      description: 'Unscramble the letters to find the hidden word before the timer runs out for each round.',
      color: 'text-purple-500'
    },
    {
      id: '02',
      icon: Trophy,
      title: 'Scoring System',
      description: 'Faster answers earn more points. The player with the highest total score after all rounds wins.',
      color: 'text-pink-500'
    },
    {
      id: '03',
      icon: AlertCircle,
      title: 'No Cheating',
      description: 'Using external aids or refreshing the page will lead to an immediate disqualification.',
      color: 'text-red-500'
    }
  ],
  pool: [
    {
      id: '01',
      icon: Zap,
      title: 'Aim & Power',
      description: 'Drag from the cue ball to aim. The farther you drag, the more power you apply to the shot.',
      color: 'text-indigo-500'
    },
    {
      id: '02',
      icon: Trophy,
      title: 'Ball Assignment',
      description: 'The first player to pocket a ball (other than the 8-ball) is assigned that group (Solids or Stripes).',
      color: 'text-amber-500'
    },
    {
      id: '03',
      icon: AlertCircle,
      title: 'The 8-Ball',
      description: 'Pocketing the 8-ball before clearing your group results in an immediate loss. Pocket it last to win!',
      color: 'text-red-500'
    }
  ]
};

const H2HGamePrep = ({ gameType, stake, onComplete }: H2HGamePrepProps) => {
  const [step, setStep] = useState<'deduction' | 'rules'>('deduction');

  if (step === 'deduction') {
    return (
      <div className="fixed inset-0 z-200 flex items-center justify-center p-2 bg-slate-950/80">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-primary/30 rounded-xl p-4 md:p-8 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="text-primary w-10 h-10 md:w-12 md:h-12" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Stake Committed</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Transaction Authorized</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-4 md:p-6 space-y-4">
          <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest text-center leading-relaxed italic">
            A stake of <span className="text-primary">{stake} ZA</span> has been successfully deducted from your wallet to secure this battle.
          </p>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <div className="text-left text-[10px]">
              <p className="text-[8px] font-black text-slate-500 uppercase">Your Entry</p>
              <p className="font-black text-primary italic">-{stake} ZA</p>
            </div>
            <div className="h-8 w-px bg-black/10 dark:bg-white/10"></div>
            <div className="text-right text-[10px]">
              <p className="text-[8px] font-black text-slate-500 uppercase">Prize Pool</p>
              <p className="font-black text-secondary italic">+{stake * 2} ZA</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setStep('rules')}
          className="w-full py-4 bg-primary text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 active:translate-y-1"
        >
          Continue to Battle
        </button>
      </div>
    </div>
  );
}

const currentRules = gameRules[gameType] || gameRules.chess;

return (
  <div className="fixed inset-0 z-200 flex items-center justify-center p-2 md:p-8 bg-slate-950/60">
    <div className="w-full max-w-xl bg-white dark:bg-slate-950 border-4 border-primary rounded-xl p-4 md:p-10 relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <Swords className="text-primary w-10 h-10 md:w-16 md:h-16" />
            <h2 className="font-headline text-xl md:text-3xl lg:text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
              Battle Conditions
            </h2>
            <div className="h-1 w-20 bg-primary/30 rounded-full"></div>
          </div>

          <div className="grid gap-4 md:gap-6">
            {currentRules.map((rule) => (
              <div key={rule.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 font-black ${rule.color} italic text-[10px]`}>
                  <rule.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[10px] md:text-sm uppercase tracking-widest text-slate-900 dark:text-white mb-1">{rule.title}</h3>
                  <p className="text-[10px] md:text-xs text-slate-500 uppercase font-bold leading-relaxed italic">{rule.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onComplete}
            className="w-full bg-primary text-slate-950 font-headline font-black py-4 md:py-6 rounded-2xl text-sm md:text-xl lg:text-2xl tracking-[0.2em] uppercase italic active:translate-y-1"
          >
            READY TO FIGHT
          </button>
        </div>
      </div>
    </div>
  );
};

export default H2HGamePrep;
