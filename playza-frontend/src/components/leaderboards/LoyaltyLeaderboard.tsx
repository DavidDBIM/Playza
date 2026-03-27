import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import Search from "@/components/Search";
import { leaderboardData } from "@/data/referrals";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/auth";

const ITEMS_PER_PAGE = 15;

// Mock data generator for Loyalty points based on referral data
const loyaltyData = leaderboardData.map((u, index) => ({
  rank: u.rank,
  name: u.name,
  avatar: u.avatar,
  questPoints: 1000 - (index * 40),
  referralPoints: u.referrals * 50,
  get totalPoints() { return this.questPoints + this.referralPoints; }
})).sort((a, b) => b.totalPoints - a.totalPoints).map((u, i) => ({ ...u, rank: i + 1 }));

const LoyaltyLeaderboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [range, setRange] = useState({ start: 0, end: ITEMS_PER_PAGE });
  const [isLoading, setIsLoading] = useState(false);

  const observerBottom = useRef<HTMLDivElement>(null);
  const observerTop = useRef<HTMLDivElement>(null);

  const currentItems = useMemo(() => {
    if (!searchQuery) return loyaltyData.slice(range.start, range.end);
    
    const query = searchQuery.toLowerCase();
    const index = loyaltyData.findIndex(u => u.name.toLowerCase().includes(query));
    if (index === -1) return [];

    const start = Math.max(0, index - 5);
    const end = Math.min(loyaltyData.length, index + 6);
    return loyaltyData.slice(start, end);
  }, [range, searchQuery]);

  const hasMoreBelow = range.end < loyaltyData.length;
  const hasMoreAbove = range.start > 0;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMoreBelow) return;
    setIsLoading(true);
    setTimeout(() => {
      setRange((prev) => ({
        ...prev,
        end: Math.min(loyaltyData.length, prev.end + ITEMS_PER_PAGE),
      }));
      setIsLoading(false);
    }, 500);
  }, [hasMoreBelow, isLoading]);

  // Bottom Observer (Load More)
  useEffect(() => {
    const target = observerBottom.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreBelow && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreBelow, isLoading, loadMore]);

  // Top Observer (Reset View)
  useEffect(() => {
    const target = observerTop.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreAbove && !isLoading) {
          setRange({ start: 0, end: ITEMS_PER_PAGE });
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreAbove, isLoading]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      <div className="mb-4 space-y-3">
        <div>
          <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary">Season 1: Alpha Genesis</h2>
          <p className="text-xs text-slate-500 font-bold mt-1">Consistently engage with quests and referrals to accumulate PZA.</p>
        </div>
        <div className="max-w-md">
          <Search placeholder="Search operatives..." value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Top Observer Target */}
      <div ref={observerTop} className="h-1 w-full absolute top-0 left-0 -z-10 bg-transparent" />

      <div className="overflow-auto custom-scrollbar flex-1 relative">
        <Table className={`w-full text-left transition-all duration-700 ${!user ? "blur-sm grayscale select-none pointer-events-none" : ""}`}>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-3 md:px-6 py-4 md:py-6 w-12 md:w-28 font-black uppercase text-[10px] tracking-widest text-slate-500">
                Rank
              </TableHead>
              <TableHead className="px-3 md:px-6 py-4 md:py-6 font-black uppercase text-[10px] tracking-widest text-slate-500">
                Operative
              </TableHead>
              <TableHead className="px-3 md:px-6 py-4 md:py-6 font-black uppercase text-[10px] tracking-widest text-slate-500 hidden md:table-cell">
                Quests
              </TableHead>
              <TableHead className="px-3 md:px-6 py-4 md:py-6 font-black uppercase text-[10px] tracking-widest text-slate-500 hidden sm:table-cell">
                Referral
              </TableHead>
              <TableHead className="px-3 md:px-6 py-4 md:py-6 text-right font-black uppercase text-[10px] tracking-widest text-slate-500 pr-4 md:pr-6">
                Total PZA
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-50 dark:divide-slate-800/10">
            {currentItems.length > 0 ? (
              currentItems.map((entry, idx) => {
                const isMatch = searchQuery && entry.name.toLowerCase().includes(searchQuery.toLowerCase());
                return (
                <TableRow
                  key={entry.name}
                  className={`group transition-all border-slate-50 dark:border-slate-800/50 ${
                    isMatch
                      ? "bg-primary/20 dark:bg-primary/20 border-y border-y-primary border-l-[3px] border-l-primary shadow-[inset_0_0_20px_rgba(168,85,247,0.2)]"
                      : range.start + idx < 3 && !searchQuery
                      ? "bg-primary/5 dark:bg-primary/5 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                      : "hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <TableCell className="px-3 md:px-6 py-4 md:py-6 font-display font-black italic tracking-tighter text-base md:text-lg">
                    <span
                      className={`${range.start + idx === 0 && !searchQuery ? "text-primary" : range.start + idx === 1 && !searchQuery ? "text-slate-400" : range.start + idx === 2 && !searchQuery ? "text-amber-600" : "text-slate-300 dark:text-slate-700"}`}
                    >
                      #{entry.rank < 10 ? `0${entry.rank}` : entry.rank}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 md:px-6 py-4 md:py-6">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div
                        className={`w-6 h-6 md:w-10 md:h-10 rounded-lg overflow-hidden border shrink-0 ${range.start + idx === 0 && !searchQuery ? "border-primary" : "border-slate-200 dark:border-slate-800"}`}
                      >
                        <img
                          src={entry.avatar}
                          alt={entry.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-black text-slate-900 dark:text-slate-100 text-[11px] md:text-sm tracking-tight uppercase italic group-hover:text-primary transition-colors truncate">
                          {entry.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 md:px-6 py-4 md:py-6 hidden md:table-cell font-display font-black text-slate-500 italic">
                    {entry.questPoints.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-3 md:px-6 py-4 md:py-6 hidden sm:table-cell font-display font-black text-slate-500 italic">
                    {entry.referralPoints.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-3 md:px-6 py-4 md:py-6 text-right font-display font-black italic tracking-tighter text-xs md:text-base pr-4 md:pr-6 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-primary font-black">{entry.totalPoints.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">PZA</span>
                    </div>
                  </TableCell>
                </TableRow>
              )})
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="p-10 text-center text-slate-400 text-xs font-bold uppercase tracking-[0.2em]"
                >
                  No Rankings Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Bottom Observer Target */}
        <div ref={observerBottom} className="h-10 w-full" />

        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8 text-slate-500 gap-3">
            <Loader2 className="animate-spin text-primary" size={24} />
            <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">
              Syncing Rankings...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyLeaderboard;
