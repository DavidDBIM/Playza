import { useState, useMemo } from "react";
import { Loader2, Users, Trophy, Award, Medal, UserPlus } from "lucide-react";
import Search from "@/components/Search";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/auth";
import { useReferralLeaderboard } from "@/hooks/useLeaderboard";

const podiumConfig = [
  { bg: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30", icon: <Trophy className="text-emerald-500 w-3 h-3" /> },
  { bg: "from-slate-400/20 to-slate-400/5", border: "border-slate-400/30", icon: <Award className="text-slate-400 w-3 h-3" /> },
  { bg: "from-amber-700/20 to-amber-700/5", border: "border-amber-700/30", icon: <Medal className="text-amber-700 w-3 h-3" /> },
];

const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black rounded-sm px-0.5">{part}</mark>
        ) : part
      )}
    </span>
  );
};

const ReferralLeaderboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: referralData, isLoading } = useReferralLeaderboard("all", 100);

  const filteredItems = useMemo(() => {
    if (!referralData) return [];
    if (!searchQuery) return referralData;
    return referralData.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [referralData, searchQuery]);

  const topThree = useMemo(() => referralData?.slice(0, 3) ?? [], [referralData]);
  const restOfPlayers = useMemo(() => searchQuery ? filteredItems : filteredItems.slice(3), [filteredItems, searchQuery]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      {/* Header */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Global Recruitment Hub</h2>
          </div>
          <p className="text-[11px] text-slate-500 font-bold">Invite friends to climb the ranks and earn passive rewards.</p>
        </div>
        <div className="w-full md:w-64">
          <Search placeholder="Search referrers..." value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Top 3 */}
      {!searchQuery && topThree.length > 0 && !isLoading && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {topThree.map((player, idx) => {
            const cfg = podiumConfig[idx];
            return (
              <div key={player.user_id} className={`relative overflow-hidden bg-linear-to-br ${cfg.bg} border ${cfg.border} rounded-xl p-2 flex flex-col gap-1`}>
                <div className="flex items-center gap-1.5">
                  <div className="relative shrink-0">
                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10">
                      <img src={player.avatar_url || "/default-avatar.png"} alt={player.username} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-sm bg-white dark:bg-slate-900 border flex items-center justify-center shadow-sm">
                      {cfg.icon}
                    </div>
                  </div>
                  <p className="text-[9px] font-black text-slate-500">#{player.rank}</p>
                </div>
                <p className="font-black text-[10px] md:text-[11px] text-slate-900 dark:text-white uppercase italic leading-tight break-all">
                  {player.username}
                </p>
                <div className="flex items-center gap-1 flex-wrap">
                  <UserPlus className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">{player.total_referrals.toLocaleString()}</span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase">recruits</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto custom-scrollbar flex-1 glass-card rounded-2xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-950/50">
        <Table className={`w-full ${!user ? "opacity-30 grayscale select-none pointer-events-none" : ""}`}>
          <TableHeader className="bg-slate-100/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 sticky top-0 z-20 backdrop-blur-md">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="px-3 py-2 w-10 font-black uppercase text-[9px] tracking-widest text-slate-500 text-center">#</TableHead>
              <TableHead className="px-3 py-2 font-black uppercase text-[9px] tracking-widest text-slate-500">Operative</TableHead>
              <TableHead className="px-3 py-2 text-right font-black uppercase text-[9px] tracking-widest text-slate-500">Recruits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 dark:divide-white/5">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="p-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">Syncing Hub...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : restOfPlayers.length > 0 ? (
              restOfPlayers.map((entry) => {
                const isMe = entry.username === user?.username;
                return (
                  <TableRow key={entry.user_id} className={`border-none transition-all ${isMe ? "bg-emerald-500/10 border-l-2 border-l-emerald-500" : ""}`}>
                    <TableCell className="px-3 py-2 text-center">
                      <div className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-black text-[11px] ${isMe ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>
                        {entry.rank}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 max-w-0 w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg overflow-hidden border shrink-0 border-slate-200 dark:border-white/10">
                          <img src={entry.avatar_url || "/default-avatar.png"} alt={entry.username} className="w-full h-full object-cover" />
                        </div>
                        <p className={`font-black text-[11px] md:text-xs uppercase italic truncate flex-1 min-w-0 ${isMe ? "text-emerald-500" : "text-slate-900 dark:text-slate-100"}`}>
                          <HighlightMatch text={entry.username} query={searchQuery} />
                          {isMe && <span className="ml-1 opacity-40 text-[9px] normal-case not-italic font-bold"> (you)</span>}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <UserPlus className="w-2.5 h-2.5 shrink-0" />
                          <span className="font-black text-xs md:text-sm tabular-nums">{entry.total_referrals.toLocaleString()}</span>
                        </div>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">net recruits</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">No results for "{searchQuery}"</p>
                    <button onClick={() => setSearchQuery("")} className="text-[10px] font-black text-emerald-500 uppercase border-b border-emerald-500/30 hover:border-emerald-500 transition-all">Clear Filter</button>
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
