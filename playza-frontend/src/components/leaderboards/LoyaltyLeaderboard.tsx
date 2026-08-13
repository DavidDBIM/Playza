import { useState, useMemo } from "react";
import { Loader2, Trophy, Award, Medal, Star, Search as SearchIcon, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Search from "@/components/Search";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/auth";
import { useLoyaltyLeaderboard } from "@/hooks/useLeaderboard";

const podiumConfig = [
  { bg: "from-yellow-500/20 to-yellow-500/5", border: "border-yellow-500/30", icon: <Trophy className="text-yellow-500 w-3 h-3" /> },
  { bg: "from-slate-400/20 to-slate-400/5", border: "border-slate-400/30", icon: <Award className="text-slate-400 w-3 h-3" /> },
  { bg: "from-amber-700/20 to-amber-700/5", border: "border-amber-700/30", icon: <Medal className="text-amber-700 w-3 h-3" /> },
];

// Ranks per page — was previously one unbounded list that kept fetching up
// to 100 entries and rendering all of them in one ever-growing scroll.
const PAGE_SIZE = 30;
// While actively searching, we widen the fetch instead of paging, since a
// search needs to look across more than just the current 30-rank window —
// there's no dedicated search-by-name endpoint on the backend, so this is
// the practical compromise: search reaches the top 100, paging goes as
// deep as the person wants via the jump control below.
const SEARCH_LIMIT = 100;

const LoyaltyLeaderboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0); // 0-indexed
  const [jumpValue, setJumpValue] = useState("");

  const isSearching = searchQuery.trim().length > 0;
  const { data: loyaltyData, isLoading, isFetching } = useLoyaltyLeaderboard(
    "all",
    isSearching ? SEARCH_LIMIT : PAGE_SIZE,
    isSearching ? 0 : page * PAGE_SIZE,
  );

  const filteredItems = useMemo(() => {
    if (!loyaltyData) return [];
    if (!isSearching) return loyaltyData;
    return loyaltyData.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [loyaltyData, searchQuery, isSearching]);

  // Podium only makes sense for the true top 3 — only fetched/shown on the
  // first page (and hidden entirely while searching, since search results
  // aren't rank-ordered around a "top 3" concept).
  const topThree = useMemo(() => (!isSearching && page === 0) ? (loyaltyData?.slice(0, 3) ?? []) : [], [loyaltyData, isSearching, page]);
  const restOfPlayers = useMemo(() => {
    if (isSearching) return filteredItems;
    return page === 0 ? filteredItems.slice(3) : filteredItems;
  }, [filteredItems, isSearching, page]);

  const rangeLabel = `#${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + PAGE_SIZE}`;

  const handleJump = () => {
    const rank = parseInt(jumpValue, 10);
    if (isNaN(rank) || rank < 1) return;
    setPage(Math.floor((rank - 1) / PAGE_SIZE));
    setJumpValue("");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      {/* Header */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary">Season 1: Alpha Genesis</h2>
          </div>
          <p className="text-[11px] text-slate-500 font-bold">Consistently engage with quests and referrals to accumulate PZA.</p>
        </div>
        <div className="w-full md:w-64">
          <Search placeholder="Search operatives (top 100)..." value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Top 3 — always 3 columns, names wrap not truncate */}
      {topThree.length > 0 && !isLoading && (
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
                {/* break-all ensures very long names never overflow */}
                <p className="font-black text-[10px] md:text-[11px] text-slate-900 dark:text-white uppercase italic leading-tight break-all">
                  {player.username}
                </p>
                <div className="flex items-center gap-1 flex-wrap">
                  <Star className="w-2.5 h-2.5 text-primary fill-primary shrink-0" />
                  <span className="text-[11px] font-black text-primary">{player.pza_points.toLocaleString()}</span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase">PZA</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Which ranks are currently on screen — the whole point of this bar
          existing is so the list never again feels like an endless scroll
          with no sense of where you are in it. */}
      {!isSearching && (
        <div className="flex items-center justify-between gap-2 mb-2 px-0.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Showing {rangeLabel}</span>
          {isFetching && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto custom-scrollbar flex-1 glass-card rounded-2xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-950/50">
        <Table className={`w-full ${!user ? "opacity-30 grayscale select-none pointer-events-none" : ""}`}>
          <TableHeader className="bg-slate-100/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 sticky top-0 z-20 backdrop-blur-md">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="px-3 py-2 w-10 font-black uppercase text-[9px] tracking-widest text-slate-500 text-center">#</TableHead>
              <TableHead className="px-3 py-2 font-black uppercase text-[9px] tracking-widest text-slate-500">Operative</TableHead>
              <TableHead className="px-3 py-2 text-right font-black uppercase text-[9px] tracking-widest text-slate-500">PZA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 dark:divide-white/5">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="p-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">Syncing Rankings...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : restOfPlayers.length > 0 ? (
              restOfPlayers.map((entry) => {
                const isMe = entry.username === user?.username;
                return (
                  <TableRow key={entry.user_id} className={`border-none transition-all ${isMe ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}>
                    <TableCell className="px-3 py-2 text-center">
                      <div className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-black text-[11px] ${isMe ? "bg-primary text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>
                        {entry.rank}
                      </div>
                    </TableCell>
                    {/* max-w-0 + w-full forces the cell to shrink and truncate properly */}
                    <TableCell className="px-3 py-2 max-w-0 w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg overflow-hidden border shrink-0 border-slate-200 dark:border-white/10">
                          <img src={entry.avatar_url || "/default-avatar.png"} alt={entry.username} className="w-full h-full object-cover" />
                        </div>
                        <p className={`font-black text-[11px] md:text-xs uppercase italic truncate flex-1 min-w-0 ${isMe ? "text-primary" : "text-slate-900 dark:text-slate-100"}`}>
                          {entry.username}{isMe && <span className="ml-1 opacity-40 text-[9px] normal-case not-italic font-bold"> (you)</span>}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          <Star className={`w-2.5 h-2.5 shrink-0 ${isMe ? "text-primary fill-primary" : "text-slate-400 fill-slate-400"}`} />
                          <span className="font-black text-xs md:text-sm text-slate-900 dark:text-slate-100 tabular-nums">
                            {entry.pza_points.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">PZA</span>
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
                      <SearchIcon className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                      {isSearching ? `No results for "${searchQuery}" in the top 100` : "No one here yet"}
                    </p>
                    {isSearching && <button onClick={() => setSearchQuery("")} className="text-[10px] font-black text-primary uppercase border-b border-primary/30 hover:border-primary transition-all">Clear Search</button>}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paging controls — Prev/Next through 30-rank pages, plus a jump
          straight to any rank (e.g. type 150 to land on the 121–150 page)
          instead of scrolling through everything in between. */}
      {!isSearching && (
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 min-w-[70px] text-center">{rangeLabel}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!loyaltyData || loyaltyData.length < PAGE_SIZE}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jump to rank</span>
            <input
              type="number"
              min={1}
              value={jumpValue}
              onChange={e => setJumpValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleJump()}
              placeholder="e.g. 150"
              className="w-20 px-2 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-primary"
            />
            <button
              onClick={handleJump}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyLeaderboard;