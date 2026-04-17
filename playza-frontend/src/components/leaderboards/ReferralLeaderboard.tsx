import { useState, useMemo } from "react";
import { Loader2, Users, Trophy, Award, Medal, UserPlus } from "lucide-react";
import Search from "@/components/Search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/auth";
import { useReferralLeaderboard } from "@/hooks/useLeaderboard";

const ReferralLeaderboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: referralData, isLoading } = useReferralLeaderboard("all", 100);

  const filteredItems = useMemo(() => {
    if (!referralData) return [];
    if (!searchQuery) return referralData;

    const query = searchQuery.toLowerCase();
    return referralData.filter((u) => u.username.toLowerCase().includes(query));
  }, [referralData, searchQuery]);

  const topThree = useMemo(() => {
    if (!referralData) return [];
    return referralData.slice(0, 3);
  }, [referralData]);

  const restOfPlayers = useMemo(() => {
    if (!filteredItems) return [];
    return searchQuery ? filteredItems : filteredItems.slice(3);
  }, [filteredItems, searchQuery]);

  const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
    if (!query.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black rounded-sm px-0.5"
            >
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      {/* Header Info */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-emerald-500" />
            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-emerald-500">
              Global Recruitment Hub
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-bold">
            Invite friends to climb the ranks and earn passive rewards.
          </p>
        </div>
        <div className="max-w-md w-full md:w-72">
          <Search
            placeholder="Search referrers..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Podium for Top 3 (Only when not searching) */}
      {!searchQuery && topThree.length > 0 && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {topThree.map((player, idx) => {
            const isFirst = idx === 0;

            const config = isFirst
              ? {
                  bg: "from-emerald-500/20 to-emerald-500/5",
                  border: "border-emerald-500/30",
                  icon: <Trophy className="text-emerald-500" />,
                  shadow: "shadow-emerald-500/10",
                }
              : idx === 1
                ? {
                    bg: "from-slate-400/20 to-slate-400/5",
                    border: "border-slate-400/30",
                    icon: <Award className="text-slate-400" />,
                    shadow: "shadow-slate-400/10",
                  }
                : {
                    bg: "from-amber-700/20 to-amber-700/5",
                    border: "border-amber-700/30",
                    icon: <Medal className="text-amber-700" />,
                    shadow: "shadow-amber-700/10",
                  };

            return (
              <div
                key={player.user_id}
                className={`relative overflow-hidden bg-linear-to-br ${config.bg} border ${config.border} ${config.shadow} rounded-2xl p-3 flex items-center justify-between gap-3 cursor-default shadow-xl`}
              >
                <div className="flex flex-col min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">
                    #Rank {player.rank}
                  </p>
                  <h3 className="font-display font-black text-slate-900 dark:text-white text-base truncate uppercase italic leading-tight">
                    {player.username}
                  </h3>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <UserPlus className="w-3 h-3 text-emerald-500" />
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {player.total_referrals.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                      Recruits
                    </span>
                  </div>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg group-hover:border-emerald-500/50 transition-colors">
                      <img
                        src={player.avatar_url || "/default-avatar.png"}
                        alt={player.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border flex items-center justify-center shadow-md">
                      {config.icon}
                    </div>
                  </div>
                </div>
                {isFirst && (
                  <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 text-emerald-500">
                    <Users size={80} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-auto custom-scrollbar flex-1 relative glass-card rounded-2xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-950/50">
        <Table
          className={`w-full text-left ${!user ? "opacity-30 grayscale select-none pointer-events-none" : ""}`}
        >
          <TableHeader className="bg-slate-100/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 sticky top-0 z-20 backdrop-blur-md">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="px-6 py-5 w-24 font-black uppercase text-[10px] tracking-widest text-slate-500 text-center">
                Rank
              </TableHead>
              <TableHead className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-slate-500">
                Operative
              </TableHead>
              <TableHead className="px-6 py-5 text-right font-black uppercase text-[10px] tracking-widest text-slate-500 pr-8">
                Recruits
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 dark:divide-white/5">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Loader2
                        className="animate-spin text-emerald-500 relative z-10"
                        size={32}
                      />
                      <div className="absolute inset-0 blur-xl bg-emerald-500/20 animate-pulse" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">
                      Syncing Hub...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : restOfPlayers.length > 0 ? (
              restOfPlayers.map((entry) => {
                const isMe = entry.username === user?.username;

                return (
                  <TableRow
                    key={entry.user_id}
                    className={`transition-all border-none ${
                      isMe
                        ? "bg-emerald-500/10 dark:bg-emerald-500/10 border-l-[4px] border-l-emerald-500"
                        : ""
                    }`}
                  >
                    <TableCell className="px-6 py-5 text-center">
                      <div
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-display font-black italic text-sm ${isMe ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"}`}
                      >
                        {entry.rank}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <div
                            className={`w-11 h-11 rounded-xl overflow-hidden border-2 ${isMe ? "border-emerald-500" : "border-slate-200 dark:border-white/10"} group-hover:scale-110 transition-transform shadow-md shadow-black/5`}
                          >
                            <img
                              src={entry.avatar_url || "/default-avatar.png"}
                              alt={entry.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`font-display font-black text-[13px] md:text-sm tracking-tight uppercase italic truncate transition-colors ${isMe ? "text-emerald-500" : "text-slate-900 dark:text-slate-100 group-hover:text-emerald-500"}`}
                          >
                            <HighlightMatch
                              text={entry.username}
                              query={searchQuery}
                            />{" "}
                            {isMe && (
                              <span className="ml-1 opacity-50 text-[10px]">
                                (YOU)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-right pr-8">
                      <div className="inline-flex flex-col items-end">
                        <div className="flex items-center gap-1.5 font-display font-black italic tracking-tighter text-sm md:text-lg text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform origin-right">
                          <UserPlus className="w-3.5 h-3.5" />
                          {entry.total_referrals.toLocaleString()}
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none">
                          Net Recruits
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700">
                      <Users size={32} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                      No operatives found for "{searchQuery}"
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-[10px] font-black text-emerald-500 uppercase border-b border-emerald-500/30 hover:border-emerald-500 transition-all"
                    >
                      Clear Filter
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReferralLeaderboard;
