import { Trophy, Users, Search as SearchIcon, Medal, Star, ArrowRight, Loader2 } from "lucide-react";
import { BsPerson } from "react-icons/bs";
import Search from "../Search";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useSessionLeaderboard } from "@/hooks/gamesession/useGameSession";
import { useAuth } from "@/context/auth";
import { ZASymbol } from "../currency/ZASymbol";


interface LeaderboardEntry {
  id: string;
  user_id: string;
  best_score: number;
  attempts: number;
  users: {
    username: string;
    avatar_url: string;
  };
}

interface SessionLeaderboardProps {
  sessionId: string;
  prizePool?: number;
  distributionCurve?: number[];
}



interface DisplayEntry extends LeaderboardEntry {
  searchRank?: number;
}

const SessionLeaderboard = ({ sessionId, prizePool = 0, distributionCurve }: SessionLeaderboardProps) => {
  const [query, setQuery] = useState("");
  const { user } = useAuth();
  
  const { data, isLoading } = useSessionLeaderboard(sessionId);
  const leaderboardData: LeaderboardEntry[] = data?.leaderboard || [];

  const displayData = useMemo<DisplayEntry[]>(() => {
    if (!query) return leaderboardData.slice(0, 15);
    
    const searchTerm = query.toLowerCase();
    const index = leaderboardData.findIndex(item => 
      item.users?.username.toLowerCase().includes(searchTerm)
    );

    if (index === -1) return [];

    // Search logic: show 5 before and 5 after (total 11 items)
    const start = Math.max(0, index - 5);
    const end = Math.min(leaderboardData.length, index + 6);
    return leaderboardData.slice(start, end).map((item, i) => ({ ...item, searchRank: start + i + 1 }));
  }, [query, leaderboardData]);

  const LeaderCard = ({ item, rank, isTop3, isMatch }: { item: DisplayEntry; rank: number; isTop3?: boolean; isMatch?: boolean }) => {
    const isMe = item.user_id === user?.id;

    // Prize calculation logic using dynamic curve
    const getPrize = (r: number) => {
      if (distributionCurve && r <= distributionCurve.length) {
        return prizePool * distributionCurve[r - 1];
      }
      return 0;
    };

    const prize = getPrize(rank);
    
    return (
      <div
        className={`relative ${
          isTop3 
            ? "mb-3 md:mb-4 p-2.5 md:p-4 rounded-xl bg-white/5 dark:bg-slate-900/40 border border-slate-200 dark:border-white/20 overflow-hidden" 
            : "mb-1.5 md:mb-2 p-2 md:p-3 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10"
        } ${isMe ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900 border-primary" : ""} 
          ${isMatch ? "bg-primary/10 dark:bg-primary/20 border-primary ring-1 ring-primary/40" : ""}`}
      >
        {isTop3 && (
          <div className="absolute top-0 right-0 p-2 md:p-8 opacity-5">
            {rank === 1 && <Trophy size={80} className="text-slate-900 dark:text-white" />}
            {rank === 2 && <Medal size={80} className="text-slate-900 dark:text-white" />}
            {rank === 3 && <Star size={80} className="text-slate-900 dark:text-white" />}
          </div>
        )}

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 md:gap-4">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-sm ${
              rank === 1 ? "bg-yellow-400 text-slate-900" :
              rank === 2 ? "bg-slate-300 text-slate-900" :
              rank === 3 ? "bg-orange-400 text-slate-900" :
              "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400"
            }`}>
              {rank}
            </div>
            
            <div className="relative">
              {item.users?.avatar_url ? (
                <img
                  src={item.users.avatar_url}
                  className={`w-12 h-12 rounded-xl object-cover border-2 ${isMe || isMatch ? 'border-primary' : 'border-slate-200 dark:border-white/10'}`}
                  alt={item.users.username}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-white/10">
                  <BsPerson className="text-slate-400 text-base md:text-xl" />
                </div>
              )}
              {isTop3 && rank === 1 && (
                <div className="absolute -top-2 -right-2">
                   <Trophy className="text-yellow-400 size-5 fill-yellow-400 drop-shadow-lg" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className={`font-black tracking-tight ${isMe || isMatch ? "text-primary text-sm md:text-lg" : "text-xs md:text-base text-slate-900 dark:text-white"}`}>
                   {item.users?.username || "Unknown Player"}
                   {isMe && <span className="ml-1.5 text-[8px] md:text-[10px] bg-primary text-black px-1 md:px-1.5 py-0.5 rounded font-black uppercase">You</span>}
                   {isMatch && !isMe && <span className="ml-1.5 text-[8px] md:text-[10px] border border-primary text-primary px-1 md:px-1.5 py-0.5 rounded font-black uppercase">Match</span>}
                </p>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                {item.best_score?.toLocaleString()} <span className="text-[10px] opacity-50">PTS</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            {prize > 0 ? (
              <div className="flex flex-col items-end">
                <p className="text-[10px] text-primary font-black uppercase tracking-tighter">Est. Prize</p>
                <div className="flex items-center gap-1">
                  <ZASymbol className="text-[10px] scale-75" />
                  <p className="text-sm font-black text-slate-900 dark:text-white">{prize.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">Attempts</p>
                <p className="text-xs font-black text-slate-900 dark:text-white/80">{item.attempts}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Retrieving Rankings...</p>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 space-y-3 md:space-y-6">
      <div className="relative">
        <Search
          placeholder="Search global rankings..."
          value={query}
          onChange={setQuery}
        />
        <SearchIcon
          className="-translate-y-1/2 absolute right-4 top-1/2 text-slate-300 dark:text-white/20 pointer-events-none"
          size={18}
        />
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
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Showing Top 15
                </span>
              </div>
            ) : (
              <div className="px-2 mb-2 flex flex-col gap-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary underline underline-offset-4 decoration-primary/40">
                  Search Results
                </h3>
                <p className="text-[10px] text-slate-400 font-bold italic">
                  Contextual: 5 positions before/after match
                </p>
              </div>
            )}

            <div className="space-y-1 md:space-y-2">
              {displayData.map((item, i) => {
                const currentRank = query ? item.searchRank || 0 : i + 1;

                const isWinnerZone = currentRank <= 3;

                const showWinnerDivider =
                  i === 0 && !query && currentRank === 1;
                const showRunnerDivider = !query && currentRank === 4;
                const showCutoffDivider = !query && currentRank === 6; // Top 5 are winners

                const isExactMatch = !!(
                  query &&
                  item.users?.username
                    .toLowerCase()
                    .includes(query.toLowerCase())
                );

                return (
                  <div key={item.id}>
                    {showWinnerDivider && (
                      <div className="flex items-center gap-1.5 md:gap-4 my-2 md:my-6 opacity-60">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500 whitespace-nowrap">
                          Winner Zone
                        </span>
                        <div className="h-px w-full bg-linear-to-r from-yellow-500/50 to-transparent" />
                      </div>
                    )}

                    {showRunnerDivider && (
                      <div className="flex items-center gap-1.5 md:gap-4 my-2 md:my-6 opacity-60">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 whitespace-nowrap">
                          Prize Pool Contenders
                        </span>
                        <div className="h-px w-full bg-linear-to-r from-slate-400/50 to-transparent" />
                      </div>
                    )}

                    {showCutoffDivider && (
                      <div className="flex items-center gap-1.5 md:gap-4 my-2 md:my-6 opacity-60">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-red-500/70 whitespace-nowrap">
                          Prize Cutoff
                        </span>
                        <div className="h-px border-t border-dashed w-full border-red-500/30" />
                      </div>
                    )}

                    <LeaderCard
                      item={item}
                      rank={currentRank}
                      isTop3={!query && isWinnerZone}
                      isMatch={isExactMatch}
                    />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-2 md:py-20 text-center flex flex-col items-center gap-2 md:gap-4">
            <div className="p-2 md:p-6 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <Users size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              No matching players found in this session
            </p>
          </div>
        )}
      </div>

      <div className="pt-2 md:pt-6 mt-8 border-t border-slate-200 dark:border-white/5">
        <div className="flex flex-col items-center gap-2 md:gap-4 pb-2 md:pb-4">
          <p className="text-xs md:text-base text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-center leading-relaxed">
            Didn't see your name? <br />
            <span className="opacity-60">
              Search in the box above or keep playing to climb higher!
            </span>
          </p>
          <Link to="/leaderboard?tab=Games">
            <button className="group px-2 md:px-8 py-2 md:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition-all rounded-2xl flex items-center gap-2 md:gap-3 active:scale-95 shadow-xl hover:shadow-slate-400/20">
              <span className="text-xs font-black uppercase tracking-[0.2em]">
                View Global Rankings
              </span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SessionLeaderboard;
