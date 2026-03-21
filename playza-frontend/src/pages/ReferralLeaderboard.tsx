import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router";
import { MdArrowBack, MdTimer, MdTrendingUp, MdInfo } from "react-icons/md";
import { Loader2 } from "lucide-react";
import { leaderboardData } from "@/data/referrals";
import Search from "@/components/Search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ITEMS_PER_PAGE = 8;

const ReferralLeaderboard = () => {
  const [range, setRange] = useState({ start: 0, end: ITEMS_PER_PAGE });
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const observerBottom = useRef<HTMLDivElement>(null);
  const observerTop = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<{ [key: number]: HTMLTableRowElement | null }>({});

  const currentItems = useMemo(() => {
    return leaderboardData.slice(range.start, range.end);
  }, [range]);

  const hasMoreBelow = range.end < leaderboardData.length;
  const hasMoreAbove = range.start > 0;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMoreBelow) return;
    setIsLoading(true);
    setTimeout(() => {
      setRange((prev) => ({
        ...prev,
        end: Math.min(leaderboardData.length, prev.end + ITEMS_PER_PAGE),
      }));
      setIsLoading(false);
    }, 500);
  }, [hasMoreBelow, isLoading]);

  const loadPrevious = useCallback(() => {
    if (isLoading || !hasMoreAbove) return;
    setIsLoading(true);
    setTimeout(() => {
      setRange((prev) => ({
        ...prev,
        start: Math.max(0, prev.start - ITEMS_PER_PAGE),
      }));
      setIsLoading(false);
    }, 500);
  }, [hasMoreAbove, isLoading]);

  // Search Scroll Effect (Separate from state adjustment to avoid cascading renders)
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const matchIndex = leaderboardData.findIndex((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      if (matchIndex !== -1) {
        // Scroll to the specific row after render
        const timeoutId = setTimeout(() => {
          rowRefs.current[leaderboardData[matchIndex].rank]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [searchQuery]);

  const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
    if (!query.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              className="bg-primary/20 text-primary font-black rounded-sm px-0.5 underline decoration-primary/30"
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

  // Top Observer (Load Previous)
  useEffect(() => {
    const target = observerTop.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreAbove && !isLoading) {
          loadPrevious();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreAbove, isLoading, loadPrevious]);

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full pb-10 mt-4 md:mt-8 relative animate-in fade-in duration-500">
      {/* Top Observer Target */}
      <div
        ref={observerTop}
        className="h-1 w-full absolute top-0 left-0 -z-10"
      />

      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <Link
          to="/referral"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-all group self-start sm:self-auto"
        >
          <MdArrowBack className="text-lg group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </Link>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
          <MdTimer className="text-amber-500 text-sm animate-pulse" />
          <span className="text-[10px] md:text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
            Cycle ends in:{" "}
            <span className="text-amber-500 font-mono">2d 14h</span>
          </span>
        </div>
      </div>

      <section className="text-center mb-10 px-2 relative">
        <div className="inline-block mb-4">
          <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black tracking-widest uppercase italic shadow-sm shadow-primary/10">
            Season 1: Genesis Alpha
          </span>
        </div>
        <h1 className="text-4xl md:text-7xl font-display font-black text-slate-900 dark:text-slate-100 uppercase italic tracking-tighter leading-tight mb-6">
          Elite <span className="text-primary">Leaderboard</span>
        </h1>

        <div className="max-w-2xl mx-auto mb-8 bg-linear-to-b from-white to-slate-50/50 dark:from-slate-900/50 dark:to-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 md:p-6 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <MdTrendingUp size={80} className="text-primary rotate-12" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Weekly Prize Pool
              </p>
              <h3 className="text-2xl md:text-3xl font-display font-black text-primary italic leading-none animate-in slide-in-from-left duration-700">
                ₦500k Unlocked
              </h3>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
            <div className="text-center md:text-right">
              <p className="text-[10px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest mb-1">
                Next Payout
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                Monday @ 00:00 GMT
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <Search
            placeholder="Search by operative name..."
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              if (val.trim().length > 1) {
                const matchIndex = leaderboardData.findIndex((u) =>
                  u.name.toLowerCase().includes(val.toLowerCase()),
                );
                if (matchIndex !== -1) {
                  const newStart = Math.max(0, matchIndex - 4);
                  const newEnd = Math.min(
                    leaderboardData.length,
                    matchIndex + 10,
                  );
                  setRange({ start: newStart, end: newEnd });
                }
              }
            }}
          />
        </div>
      </section>

      <div className="flex flex-col gap-10">
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>

          <div className="p-4 md:p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 relative">
            <div className="flex items-center gap-3">
              <MdTrendingUp className="text-primary text-2xl shrink-0" />
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-xl font-display font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight italic leading-none">
                  Global Rankings
                </h2>
                <div className="relative">
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="p-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-primary transition-colors focus:outline-none"
                  >
                    <MdInfo className="text-sm md:text-base" />
                  </button>

                  {showInfo && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/5 dark:bg-transparent"
                        onClick={() => setShowInfo(false)}
                      ></div>
                      <div className="absolute top-8 -right-32.5 sm:left-0 z-50 w-75 md:w-80 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">
                          * Results finalized every Sunday @ 23:59 GMT. Payouts
                          processed automatically within 24 hours. Participants
                          must have at least 5 active recruits to qualify for
                          rewards.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right hidden xs:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Status
              </p>
              <p className="text-xs md:text-sm font-display font-black text-primary italic leading-none mt-0.5">
                {searchQuery ? "Agent Located" : "Live Ranking"}
              </p>
            </div>
          </div>

          <div className="w-full">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-3 md:px-6 py-4 md:py-6 w-12 md:w-28 font-black uppercase text-[10px] tracking-widest text-slate-500">
                    Rank
                  </TableHead>
                  <TableHead className="px-3 md:px-6 py-4 md:py-6 font-black uppercase text-[10px] tracking-widest text-slate-500">
                    Operative
                  </TableHead>
                  <TableHead className="px-3 md:px-6 py-4 md:py-6 font-black uppercase text-[10px] tracking-widest text-slate-500 hidden sm:table-cell">
                    Recruits
                  </TableHead>
                  <TableHead className="px-3 md:px-6 py-4 md:py-6 text-right font-black uppercase text-[10px] tracking-widest text-slate-500 pr-4 md:pr-6">
                    Reward
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-50 dark:divide-slate-800/10">
                {currentItems.length > 0 ? (
                  currentItems.map((user, idx) => {
                    const isMatch =
                      searchQuery &&
                      user.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());
                    return (
                      <TableRow
                        key={user.rank}
                        ref={(el) => {
                          rowRefs.current[user.rank] = el;
                        }}
                        className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all border-slate-50 dark:border-slate-800/50 ${isMatch ? "bg-primary/10 dark:bg-primary/10 ring-1 ring-inset ring-primary/30" : range.start + idx < 3 && !searchQuery ? "bg-primary/5 dark:bg-primary/5" : ""}`}
                      >
                        <TableCell className="px-3 md:px-6 py-4 md:py-6 font-display font-black italic tracking-tighter text-base md:text-lg">
                          <span
                            className={`${range.start + idx === 0 && !searchQuery ? "text-primary" : range.start + idx === 1 && !searchQuery ? "text-slate-400" : range.start + idx === 2 && !searchQuery ? "text-amber-600" : "text-slate-300 dark:text-slate-700"}`}
                          >
                            #{user.rank < 10 ? `0${user.rank}` : user.rank}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 md:px-6 py-4 md:py-6">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div
                              className={`w-6 h-6 md:w-10 md:h-10 rounded-lg overflow-hidden border shrink-0 ${range.start + idx === 0 && !searchQuery ? "border-primary" : "border-slate-200 dark:border-slate-800"}`}
                            >
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-display font-black text-slate-900 dark:text-slate-100 text-[11px] md:text-sm tracking-tight uppercase italic group-hover:text-primary transition-colors truncate max-w-17.5 xs:max-w-25 sm:max-w-none">
                                <HighlightMatch
                                  text={user.name}
                                  query={searchQuery}
                                />
                              </p>
                              <p className="text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest sm:hidden leading-none">
                                {user.referrals} Recruits
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 md:px-6 py-4 md:py-6 hidden sm:table-cell font-display font-black text-slate-900 dark:text-slate-100 italic">
                          {user.referrals}
                        </TableCell>
                        <TableCell className="px-3 md:px-6 py-4 md:py-6 text-right font-display font-black italic tracking-tighter text-xs md:text-base pr-4 md:pr-6 whitespace-nowrap">
                          <span
                            className={
                              range.start + idx < 3 && !searchQuery
                                ? "text-primary"
                                : "text-slate-900 dark:text-slate-100"
                            }
                          >
                            {user.earnings}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
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

            {!hasMoreBelow && currentItems.length > 0 && (
              <div className="p-8 text-center border-t border-slate-50 dark:border-slate-800/50 bg-slate-50/20 dark:bg-slate-800/10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {searchQuery ? "End of Results" : "End of Global Rankings"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ReferralLeaderboard;
