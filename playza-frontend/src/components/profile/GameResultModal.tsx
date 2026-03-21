import { MdClose, MdEmojiEvents, MdPeople, MdShowChart, MdFormatListNumbered, MdOpenInNew } from "react-icons/md";
import type { MatchHistory } from "@/data/matchHistory";

type GameResultModalProps = {
  match: MatchHistory;
  onClose: () => void;
};

export const GameResultModal = ({ match, onClose }: GameResultModalProps) => {
  const isWin = match.result === "WIN";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-md px-4 animate-in fade-in duration-300">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#0a0f1e]/80 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 relative rounded-[2.5rem] backdrop-blur-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Section */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={match.banner} 
            alt={match.game} 
            className="w-full h-full object-cover scale-110 blur-[2px] opacity-40 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-linear-to-t from-white dark:from-[#0a0f1e] via-white/80 dark:via-[#0a0f1e]/80 to-transparent" />
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 size-10 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all z-10 shadow-sm"
          >
            <MdClose className="text-xl" />
          </button>

          {/* Result Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <div className={`mb-3 p-3 rounded-2xl ${isWin ? 'bg-playza-green/20 text-playza-green' : 'bg-playza-red/20 text-playza-red'} animate-in slide-in-from-bottom-4 duration-700`}>
              <MdEmojiEvents className="text-4xl" />
            </div>
            <h2 className={`text-4xl font-black italic uppercase tracking-tighter ${isWin ? 'text-playza-green' : 'text-playza-red'}`}>
              {isWin ? "Victory!" : "Defeated"}
            </h2>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mt-2">
              Match Result #{match.id.padStart(4, '0')}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-10 space-y-8">
          <div className="flex items-center gap-6">
            <img 
              src={match.banner} 
              className="size-20 rounded-3xl object-cover border-2 border-slate-100 dark:border-white/10 shadow-xl"
            />
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white italic leading-tight">{match.game}</h3>
              <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mt-1">{match.date}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 space-y-2 shadow-inner">
              <div className="flex items-center gap-2 text-slate-500">
                <MdShowChart className="text-lg" />
                <span className="text-[10px] font-black uppercase tracking-widest">Score</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                {match.score.toLocaleString()} <span className="text-[10px] text-slate-500 not-italic">PTS</span>
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 space-y-2 shadow-inner">
              <div className="flex items-center gap-2 text-slate-500">
                <MdFormatListNumbered className="text-lg" />
                <span className="text-[10px] font-black uppercase tracking-widest">Final Rank</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                #{match.leaderboardRank}
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 space-y-2 shadow-inner">
              <div className="flex items-center gap-2 text-slate-500">
                <MdPeople className="text-lg" />
                <span className="text-[10px] font-black uppercase tracking-widest">Participants</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                {match.participants || 12}
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 space-y-2 shadow-inner">
              <div className="flex items-center gap-2 text-slate-500">
                <MdEmojiEvents className="text-lg" />
                <span className="text-[10px] font-black uppercase tracking-widest">Entry Fee</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                ₦{match.entryFee.toLocaleString()}
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 space-y-2 col-span-2 shadow-inner">
              <div className="flex items-center gap-2 text-slate-500">
                <MdEmojiEvents className="text-lg" />
                <span className="text-[10px] font-black uppercase tracking-widest">Earnings</span>
              </div>
              <p className={`text-2xl font-black italic tracking-tighter ${isWin ? 'text-primary' : 'text-slate-400 dark:text-slate-600'}`}>
                {isWin ? "₦2,500" : "₦0"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              className="flex-1 h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:scale-[1.02] hover:brightness-110 transition-all shadow-lg glow-accent flex items-center justify-center gap-2 group"
              onClick={() => {
                // Future orientation to leaderboard
                onClose();
              }}
            >
              View Leaderboard <MdOpenInNew className="text-lg group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button 
              onClick={onClose}
              className="flex-1 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
            >
              Back to History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
