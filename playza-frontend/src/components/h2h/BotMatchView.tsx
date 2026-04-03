import { Trophy, Swords } from 'lucide-react';
import { ZASymbol } from '@/components/currency/ZASymbol';

interface BotMatchViewProps {
  stakeValue: number;
  setStakeValue: (val: number) => void;
  customStake: string;
  setCustomStake: (val: string) => void;
  handleBotMatch: () => void;
  loading: boolean;
  setView: (view: 'hub' | 'quick' | 'invite' | 'bot') => void;
}

const BotMatchView = ({
  stakeValue,
  setStakeValue,
  customStake,
  setCustomStake,
  handleBotMatch,
  loading,
  setView,
}: BotMatchViewProps) => {
  return (
    <div className="w-full max-w-xl mx-auto animate-in slide-in-from-right-8 duration-500">
      <button
        onClick={() => setView("hub")}
        className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white mb-6 md:mb-8 transition-colors px-4 md:px-0"
      >
        ← Back to Hub
      </button>

      <div className="w-full relative p-0 md:p-1 rounded-none md:rounded-[2.5rem] bg-linear-to-b from-amber-500/20 to-transparent">
        <section className="w-full bg-slate-900/90 backdrop-blur-3xl rounded-none md:rounded-[2.4rem] p-6 md:p-12 border-y md:border border-white/10 shadow-lg space-y-8 md:space-y-12 text-center">
          <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Trophy className="text-amber-400 w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">
                Training Match
              </h2>
              <span className="text-[8px] md:text-[10px] font-black text-amber-400/60 uppercase tracking-widest leading-none block md:inline mt-1">
                Solo vs AI · Instant Entry
              </span>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
              <label className="text-[9px] md:text-[11px] uppercase tracking-[0.3em] text-slate-500 font-bold pl-1 italic block text-center">
                Practice Stake (<ZASymbol className="scale-75" />)
              </label>
              
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {[0, 50, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => { setStakeValue(val); setCustomStake(''); }}
                    className={`py-4 md:py-6 rounded-xl md:rounded-2xl font-headline font-black text-xl md:text-2xl transition-all active:scale-95 border-2 ${stakeValue === val && !customStake ? "bg-amber-600 border-amber-400 text-white shadow-[0_0_30px_rgba(245,158,11,0.3)]" : "bg-white/5 border-white/5 hover:border-amber-500/30"}`}
                  >
                    {val}
                  </button>
                ))}
              </div>

              <div className="relative group/input mt-4">
                <input
                  value={customStake}
                  onChange={(e) => setCustomStake(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 lg:px-6 lg:py-4 font-black text-xl lg:text-2xl text-slate-900 dark:text-white focus:border-amber-500 outline-none transition-all tracking-tighter italic text-center"
                  placeholder="CUSTOM STAKE"
                  type="number"
                />
                <span className="-translate-y-1/2 absolute right-4 top-1/2 text-amber-500 scale-110 lg:scale-125">
                  <ZASymbol />
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleBotMatch}
            disabled={loading}
            className="w-full bg-amber-500 text-slate-950 font-black py-5 md:py-7 rounded-xl text-xl md:text-2xl tracking-[0.1em] uppercase italic transition-all flex items-center justify-center gap-3 shadow-md"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-slate-950"></div>
            ) : (
              <>
                <Swords className="text-3xl" />
                BATTLE COMPUTER
              </>
            )}
          </button>
        </section>
      </div>
    </div>
  );
};

export default BotMatchView;
