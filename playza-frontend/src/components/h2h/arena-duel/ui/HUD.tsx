import React from 'react';
import type { GameState } from '../engine/types';

const HUD: React.FC<{ state: GameState }> = ({ state }) => {
  const p1 = state.players['player1'];
  const p2 = state.players['player2'];

  return (
    <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between select-none">
      {/* Top Bar: Timer and HP */}
      <div className="flex justify-between items-start">
        {/* Player 1 Stats */}
        <div className="w-1/3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              P1
            </div>
            <div className="flex-1">
              <div className="text-white text-xs font-bold mb-1 tracking-wider uppercase">Health</div>
              <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                  style={{ width: `${p1.health}%` }}
                />
              </div>
            </div>
          </div>
          <div className="pl-13 flex gap-2">
             <div className="h-1.5 w-1/2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-cyan-400 transition-all"
                  style={{ width: `${p1.energy}%` }}
                />
             </div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center">
          <div className="text-white text-4xl font-black tracking-tighter font-mono italic">
            {Math.ceil(state.timeRemaining)}
          </div>
          <div className="text-indigo-400 text-[10px] font-bold tracking-[0.2em] uppercase">Seconds Left</div>
        </div>

        {/* Player 2 Stats */}
        <div className="w-1/3 text-right">
          <div className="flex items-center gap-3 mb-2 flex-row-reverse">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-500/20">
              P2
            </div>
            <div className="flex-1">
              <div className="text-white text-xs font-bold mb-1 tracking-wider uppercase">Health</div>
              <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div 
                  className="h-full bg-gradient-to-l from-red-500 to-orange-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  style={{ width: `${p2.health}%` }}
                />
              </div>
            </div>
          </div>
          <div className="pr-13 flex justify-end gap-2">
             <div className="h-1.5 w-1/2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-orange-400 transition-all"
                  style={{ width: `${p2.energy}%` }}
                />
             </div>
          </div>
        </div>
      </div>

      {/* Middle: Game Messages (Countdown etc) */}
      {!state.isGameOver && state.timeRemaining > 57 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-8xl font-black italic tracking-tighter animate-pulse drop-shadow-2xl">
            {Math.ceil(state.timeRemaining - 57)}
          </div>
        </div>
      )}

      {/* Bottom: Cooldowns */}
      <div className="flex justify-center gap-4">
        <div className="p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 flex gap-6">
          <AbilityIcon 
            key="dash" 
            label="SHIFT" 
            name="DASH" 
            cooldown={p1.cooldowns!['ability1']} 
            max={2.0} 
            color="#ec4899"
          />
          <AbilityIcon 
            key="attack" 
            label="SPACE" 
            name="ATTACK" 
            cooldown={p1.cooldowns!['attack']} 
            max={0.4} 
            color="#0ea5e9"
          />
        </div>
      </div>
    </div>
  );
};

const AbilityIcon: React.FC<{ label: string; name: string; cooldown: number; max: number; color: string }> = ({ label, name, cooldown, max, color }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden shadow-inner">
      <div 
        className="absolute bottom-0 w-full bg-white/10 transition-all duration-75"
        style={{ height: `${(cooldown / max) * 100}%`, backgroundColor: `${color}33` }}
      />
      <div className="relative z-10 text-white font-black text-xs">{label}</div>
    </div>
    <div className="text-[9px] font-bold tracking-widest text-white/40 uppercase">{name}</div>
  </div>
)

export default HUD;
