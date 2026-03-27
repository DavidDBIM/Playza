import { Trophy, Users, Search as SearchIcon, Medal, Star, ArrowRight } from "lucide-react";
import { BsPerson } from "react-icons/bs";
import Search from "../Search";
import { useMemo, useState } from "react";
import { LEADERBOARD_DATA, type LeaderboardItem } from "@/data/sessionLeaderBoard";
import { Link } from "react-router";
import { ZASymbol } from "../currency/ZASymbol";

const SessionLeaderboard = () => {
  const [query, setQuery] = useState("");

  const displayData = useMemo(() => {
    if (!query) return LEADERBOARD_DATA.slice(0, 15);
    
    const searchTerm = query.toLowerCase();
    const index = LEADERBOARD_DATA.findIndex(item => 
      item.name.toLowerCase().includes(searchTerm)
    );

    if (index === -1) return [];

    // Search logic: show 5 before and 5 after (total 11 items)
    const start = Math.max(0, index - 5);
    const end = Math.min(LEADERBOARD_DATA.length, index + 6);
    return LEADERBOARD_DATA.slice(start, end);
  }, [query]);

  const LeaderCard = ({ item, isTop3, isMatch }: { item: LeaderboardItem; isTop3?: boolean; isMatch?: boolean }) => {
    const isMe = item.highlight === "me";
    
    return (
      <div
        className={`relative group transition-all duration-300 ${
          isTop3 
            ? "mb-3 md:mb-4 p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-white/5 dark:bg-linear-to-br dark:from-white/10 dark:to-transparent border border-slate-200 dark:border-white/20 shadow-xl overflow-hidden" 
            : "mb-1.5 md:mb-2 p-2 md:p-3 rounded-lg md:rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary/30 shadow-sm"
        } ${isMe ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900 border-primary shadow-[0_0_20px_rgba(244,192,37,0.2)]" : ""} 
          ${isMatch ? "bg-primary/10 dark:bg-primary/20 border-primary ring-1 ring-primary/40 -translate-x-1" : ""}`}
      >
        {isTop3 && (
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            {item.rank === 1 && <Trophy size={80} className="text-slate-900 dark:text-white" />}
            {item.rank === 2 && <Medal size={80} className="text-slate-900 dark:text-white" />}
            {item.rank === 3 && <Star size={80} className="text-slate-900 dark:text-white" />}
          </div>
        )}

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-sm ${
              item.rank === 1 ? "bg-yellow-400 text-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.5)]" :
              item.rank === 2 ? "bg-slate-300 text-slate-900" :
              item.rank === 3 ? "bg-orange-400 text-slate-900" :
              "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400"
            }`}>
              {item.rank}
            </div>
            
            <div className="relative">
              {item.avatar ? (
                <img
                  src={item.avatar}
                  className={`w-12 h-12 rounded-xl object-cover border-2 ${isMe || isMatch ? 'border-primary' : 'border-slate-200 dark:border-white/10'}`}
                  alt={item.name}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-white/10">
                  <BsPerson className="text-slate-400 text-xl" />
                </div>
              )}
              {isTop3 && (
                <div className="absolute -top-2 -right-2">
                   {item.rank === 1 && <Trophy className="text-yellow-400 size-5 fill-yellow-400 drop-shadow-lg" />}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className={`font-black tracking-tight ${isMe || isMatch ? "text-primary text-sm md:text-lg" : "text-xs md:text-base text-slate-900 dark:text-white"}`}>
                   {item.name}
                   {isMe && <span className="ml-1.5 text-[8px] md:text-[10px] bg-primary text-black px-1 md:px-1.5 py-0.5 rounded font-black uppercase">You</span>}
                   {isMatch && !isMe && <span className="ml-1.5 text-[8px] md:text-[10px] border border-primary text-primary px-1 md:px-1.5 py-0.5 rounded font-black uppercase">Match</span>}
                </p>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                {item.points.toLocaleString()} <span className="text-[10px] opacity-50">PTS</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className={`flex items-center gap-1.5 justify-end font-black text-lg md:text-2xl ${isTop3 || isMatch ? "text-playza-green" : "text-slate-900 dark:text-white/80"}`}>
              {item.prize > 0 ? (
                <>
                  <ZASymbol className="text-sm scale-90" />
                  <span>{(item.prize * 1000).toLocaleString()}</span>
                </>
              ) : "-"}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">Current Prize</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-1 md:p-6 space-y-3 md:space-y-6">
      <div className="relative">
        <Search
          placeholder="Search global rankings..."
          value={query}
          onChange={setQuery}
        />
        <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/20 pointer-events-none" size={18} />
      </div>

      <div className="space-y-2 md:space-y-4">
        {displayData.length > 0 ? (
          <>
            {!query ? (
              <div className="flex items-center justify-between px-2 mb-2">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
                   <Users size={12} className="text-primary" />
                   Active Tournament
                 </h3>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Showing Top 15</span>
              </div>
            ) : (
              <div className="px-2 mb-2 flex flex-col gap-1">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary underline underline-offset-4 decoration-primary/40">
                   Search Results
                 </h3>
                 <p className="text-[10px] text-slate-400 font-bold italic">Contextual: 5 positions before/after match</p>
              </div>
            )}

            <div className="space-y-1 md:space-y-2">
              {displayData.map((item, i) => {
                 const isWinnerZone = item.rank <= 3;
                 
                 const showWinnerDivider = i === 0 && !query && item.rank === 1;
                 const showRunnerDivider = !query && item.rank === 4 && displayData.some(d => d.rank <= 3);
                 const showCutoffDivider = !query && item.rank === 11;

                 const isExactMatch = !!(query && item.name.toLowerCase().includes(query.toLowerCase()));

                 return (
                   <div key={item.rank}>
                      {showWinnerDivider && (
                         <div className="flex items-center gap-1.5 md:gap-4 my-2 md:my-6 opacity-60">
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500 whitespace-nowrap">Winner Zone</span>
                            <div className="h-px w-full bg-linear-to-r from-yellow-500/50 to-transparent" />
                         </div>
                      )}
                      
                      {showRunnerDivider && (
                         <div className="flex items-center gap-1.5 md:gap-4 my-2 md:my-6 opacity-60">
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 whitespace-nowrap">Runner Up Zone</span>
                            <div className="h-px w-full bg-linear-to-r from-slate-400/50 to-transparent" />
                         </div>
                      )}
 
                      {showCutoffDivider && (
                         <div className="flex items-center gap-1.5 md:gap-4 my-2 md:my-6 opacity-60">
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-red-500/70 whitespace-nowrap">Prize Cutoff</span>
                            <div className="h-px border-t border-dashed w-full border-red-500/30" />
                         </div>
                      )}

                      <LeaderCard 
                        item={item} 
                        isTop3={!query && isWinnerZone} 
                        isMatch={isExactMatch}
                      />
                   </div>
                 );
              })}
            </div>
          </>
        ) : (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="p-6 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
               <Users size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No matching players found in this session</p>
          </div>
        )}
      </div>

      <div className="pt-6 mt-8 border-t border-slate-200 dark:border-white/5">
        {!query && (
          <div className="mb-8 p-6 rounded-3xl bg-primary/5 dark:bg-primary/10 border border-primary/20 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
            <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-tight mb-1">Want to see your name here?</h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">You are only 1,240 pts away from breaking into the Prize Zone!</p>
            <button className="bg-primary text-black text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg hover:scale-105 hover:shadow-primary/20 active:scale-95 transition-all">
              Launch Match Arena
            </button>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 pb-4">
           <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-center leading-relaxed">
             Didn't see your name? <br/>
             <span className="opacity-60">Search in the box above or view the complete list below.</span>
           </p>
           <Link to="/leaderboard">
             <button className="group px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition-all rounded-2xl flex items-center gap-3 active:scale-95 shadow-xl hover:shadow-slate-400/20">
               <span className="text-xs font-black uppercase tracking-[0.2em]">View Global Rankings</span>
               <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </button>
           </Link>
        </div>
      </div>
    </div>
  );
};

export default SessionLeaderboard;
