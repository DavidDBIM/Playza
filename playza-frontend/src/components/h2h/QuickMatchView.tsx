import { Swords, Trophy } from 'lucide-react';
import { ZASymbol } from '@/components/currency/ZASymbol';
import { timeAgo } from '@/utils/time-ago';
import type { ChessRoom } from '@/types/chess';

interface QuickMatchViewProps {
  publicRooms: ChessRoom[];
  quickViewMode: 'list' | 'create';
  setQuickViewMode: (mode: 'list' | 'create') => void;
  stakeValue: number;
  setStakeValue: (val: number) => void;
  customStake: string;
  setCustomStake: (val: string) => void;
  handleQuickMatch: () => void;
  setConfirmingAction: (action: { type: 'create' | 'join' | 'quick' | 'bot', stake: number, code?: string } | null) => void;
  isBtnLoading: boolean;
  setView: (view: 'hub' | 'quick' | 'invite' | 'bot') => void;
}

const QuickMatchView = ({
  publicRooms,
  quickViewMode,
  setQuickViewMode,
  stakeValue,
  setStakeValue,
  customStake,
  setCustomStake,
  handleQuickMatch,
  setConfirmingAction,
  isBtnLoading,
  setView,
}: QuickMatchViewProps) => {
  return (
    <div className="w-full max-w-xl mx-auto px-2 md:px-0">
      <button
        onClick={() => setView("hub")}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 md:mb-8"
      >
        ← Back to Hub
      </button>

      <div className="w-full relative p-0 md:p-1 rounded-none md:rounded-xl border border-indigo-500/10">
        <section className="w-full bg-white dark:bg-slate-900 rounded-none md:rounded-xl p-4 md:p-12 border-y md:border border-black/5 dark:border-white/10 space-y-8 md:space-y-12 text-center">
          {quickViewMode === 'list' && publicRooms.length > 0 ? (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 dark:text-indigo-400 mb-2 whitespace-nowrap">Battle Zone Active</p>
                <h3 className="text-lg md:text-2xl font-black uppercase italic text-slate-900 dark:text-white leading-none">Challengers Waiting</h3>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar pr-1">
                {publicRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setConfirmingAction({ type: 'join', stake: room.stake, code: room.code })}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-black/5 dark:border-white/10">
                        <img src={room.host?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${room.host?.username}`} alt={room.host?.username} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left text-[10px]">
                        <span className="block font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-32">{room.host?.username || "Player"}</span>
                        <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest">{timeAgo(room.created_at)} · CHESS</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                         <div className="flex items-center gap-1 text-[10px] md:text-sm font-black text-indigo-500 dark:text-indigo-400">
                           {room.stake} <ZASymbol className="w-2.5 h-2.5" />
                         </div>
                         <span className="text-[7px] text-slate-600 font-bold uppercase tracking-tighter block">ENTRY FEE</span>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-slate-950">
                         <Swords size={16} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-black/5 dark:border-white/5"></span></div>
                <div className="relative flex justify-center"><span className="px-4 bg-white dark:bg-slate-900 text-[10px] font-black text-slate-500 uppercase tracking-widest">Or Entry Global Pool</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => setQuickViewMode('create')}
                   className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-slate-500 dark:text-slate-400 font-black py-4 rounded-xl text-[10px] tracking-widest uppercase italic"
                 >
                   Create Your Own
                 </button>
                 <button 
                   onClick={handleQuickMatch}
                   className="bg-indigo-500 text-white font-black py-4 rounded-xl text-[10px] tracking-widest uppercase italic"
                 >
                   Auto Match
                 </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {publicRooms.length > 0 && quickViewMode === 'create' && (
                <button 
                  onClick={() => setQuickViewMode('list')}
                  className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 hover:text-slate-900 dark:hover:text-white mb-2 uppercase tracking-widest flex items-center gap-2"
                >
                  ← Back to Challengers
                </button>
              )}
              <div className="space-y-6 md:space-y-8">
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold pl-1 italic block text-center">Arena Entry Stake</label>
                  
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {[100, 200, 500].map((val) => (
                      <button
                        key={val}
                        onClick={() => { setStakeValue(val); setCustomStake(''); }}
                        className={`py-4 md:py-6 rounded-xl font-headline font-black text-lg md:text-2xl border-2 ${stakeValue === val && !customStake ? "bg-indigo-600 border-indigo-400 text-white" : "bg-black/5 dark:bg-white/5 border-transparent text-slate-700 dark:text-white/70"}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  <div className="relative mt-4">
                    <input
                      value={customStake}
                      onChange={(e) => setCustomStake(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 lg:px-6 lg:py-4 font-black text-lg lg:text-xl text-slate-900 dark:text-white focus:border-indigo-500 outline-none tracking-tighter italic text-center"
                      placeholder="CUSTOM PRICE"
                      type="number"
                    />
                    <span className="-translate-y-1/2 absolute right-4 top-1/2 text-indigo-500">
                      <ZASymbol />
                    </span>
                  </div>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 md:p-6 flex items-center justify-between">
                  <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-black/5 dark:bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center">
                      <Trophy className="text-indigo-500 dark:text-indigo-400 w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block">
                         Potential Prize
                      </span>
                      <span className="text-lg md:text-xl font-black text-indigo-500 dark:text-indigo-400 flex items-center gap-1 leading-none mt-1">
                        {(parseInt(customStake) || stakeValue) * 2} <ZASymbol className="scale-75" />
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-slate-600 font-black uppercase tracking-tighter block">
                      ESTIMATED WAIT
                    </span>
                    <span className="text-[10px] md:text-xs font-black text-slate-400">
                      {"< 10 SEC"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleQuickMatch}
                disabled={isBtnLoading}
                className="w-full bg-indigo-500 disabled:opacity-50 text-white font-black py-5 md:py-7 rounded-xl text-lg md:text-xl tracking-[0.1em] uppercase italic flex items-center justify-center gap-3 border-b-4 border-indigo-700 active:translate-y-1 active:border-b-0"
              >
                MATCH NEAREST RIVAL
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default QuickMatchView;
