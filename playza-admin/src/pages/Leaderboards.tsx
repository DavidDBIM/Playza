import React, { useState} from 'react';
import {
  MdLeaderboard,
  MdRefresh,
  MdGamepad,
  MdGroupAdd,
  MdMilitaryTech,
} from "react-icons/md";
import ReferralLeaderboardTable from "../components/leaderboards/ReferralLeaderboardTable";
import LoyaltyLeaderboardTable from "../components/leaderboards/LoyaltyLeaderboardTable";
import { useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import { 
  useAdminLoyaltyLeaderboard, 
  useAdminReferralLeaderboard,
} from "../hooks/use-leaderboard";
import { useGames, useGameSessions, useSessionDetails } from "../hooks/use-games";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { ZASymbol } from "../components/currency/ZASymbol";
import { Loader2 } from "lucide-react";


interface ReferralEntry {
  rank: number;
  username: string;
  avatar_url: string | null;
  total_referrals: number;
}

interface LoyaltyEntry {
  rank: number;
  username: string;
  avatar_url: string | null;
  pza_points: number;
}

interface GameBase {
  id: string;
  title: string;
  slug: string;
  mode: string;
}

interface SessionBase {
  id: string;
  title: string;
  status: string;
}

interface RosterItem {
  id: string;
  user_id: string;
  best_score: number;
  attempts: number;
  payout_amount?: number;
  users: {
    username: string;
    avatar_url: string | null;
  };
}

const Leaderboards: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [dateFilter, setDateFilter] = useState("all");

  // Logic to determine active tab based on path
  let activeTab: "Games" | "Referrals" | "Loyalty" = "Games";
  if (pathname.includes("/leaderboards/loyalty")) activeTab = "Loyalty";
  else if (pathname.includes("/leaderboards/reward")) activeTab = "Referrals";


  const { data: gamesData, isLoading: isLoadingGames } = useGames();
  const { data: loyaltyData, isLoading: isLoadingLoyalty, refetch: refetchLoyalty } = useAdminLoyaltyLeaderboard(dateFilter);
  const { data: referralData, isLoading: isLoadingReferral, refetch: refetchReferral } = useAdminReferralLeaderboard(dateFilter);

  const arenaGames = React.useMemo(() => {
    return (gamesData?.games || []).filter((g: GameBase) => g.mode === "Arena");
  }, [gamesData]);

  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Adjust state during render to auto-select first game
  const [prevArenaGames, setPrevArenaGames] = useState<GameBase[]>([]);
  if (arenaGames !== prevArenaGames) {
    setPrevArenaGames(arenaGames);
    if (arenaGames.length > 0 && !selectedGameId) {
      setSelectedGameId(arenaGames[0].id);
    }
  }


  const { data: sessionsData, isLoading: isLoadingSessions } = useGameSessions(selectedGameId || "");
  const arenaSessions = (sessionsData?.sessions || []) as SessionBase[];

  // Adjust state during render to auto-select first session when game changes
  const [prevArenaSessions, setPrevArenaSessions] = useState<SessionBase[]>([]);
  if (arenaSessions !== prevArenaSessions) {
    setPrevArenaSessions(arenaSessions);
    if (arenaSessions.length > 0) {
      setSelectedSessionId(arenaSessions[0].id);
    } else {
      setSelectedSessionId(null);
    }
  }


  const { data: sessionDetails, isLoading: isLoadingRoster } = useSessionDetails(selectedSessionId || "");
  const roster = (sessionDetails?.roster || []) as RosterItem[];

  // Auto-redirect to /leaderboards/game if on /leaderboards
  useEffect(() => {
    if (pathname === "/leaderboards" || pathname === "/leaderboards/") {
      navigate("/leaderboards/game", { replace: true });
    }
  }, [pathname, navigate]);

  const handleTabClick = (tabId: "Games" | "Referrals" | "Loyalty") => {
    if (tabId === "Games") navigate("/leaderboards/game");
    else if (tabId === "Loyalty") navigate("/leaderboards/loyalty");
    else if (tabId === "Referrals") navigate("/leaderboards/reward");
  };

  const handleRefresh = () => {
    if (activeTab === "Loyalty") refetchLoyalty();
    else if (activeTab === "Referrals") refetchReferral();
  };

  return (
    <main className="p-4 space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary to-orange-500 flex items-center justify-center shadow-md shadow-primary/30">
            <MdLeaderboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">
              Leaderboards
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Monitor rankings across games and referral systems
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-xl shadow-sm">
          {[
            { label: "Today", value: "today" },
            { label: "7 Days", value: "7d" },
            { label: "30 Days", value: "30d" },
            { label: "All Time", value: "all" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setDateFilter(filter.value)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                dateFilter === filter.value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-transparent text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-1 hidden md:block"></div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all"
          >
            <MdRefresh
              className={`text-lg transition-transform hover:rotate-180 duration-500 ${(isLoadingLoyalty || isLoadingReferral) ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border px-2 overflow-x-auto no-scrollbar">
        {[
          { id: "Games" as const, icon: MdGamepad, label: "Game" },
          { id: "Referrals" as const, icon: MdGroupAdd, label: "Reward" },
          { id: "Loyalty" as const, icon: MdMilitaryTech, label: "Loyalty" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex items-center gap-2 py-4 px-4 relative transition-all duration-300 group border-b-2 border-transparent ${
              activeTab === tab.id
                ? "text-primary border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon
              className={`text-lg transition-transform ${activeTab === tab.id ? "scale-110" : "group-hover:scale-110"}`}
            />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "Games" && (
          <div className="space-y-6">
            {/* Game Tabs (Arena Only) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
              {isLoadingGames ? (
                <div className="flex items-center gap-2 px-4 py-2 opacity-50">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Loading Games...</span>
                </div>
              ) : arenaGames.map((game: GameBase) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGameId(game.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                    selectedGameId === game.id
                      ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  }`}
                >
                  {game.title}
                </button>
              ))}
            </div>

            {selectedGameId && (
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                {/* Session Sub-Tabs */}
                <div className="p-4 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {isLoadingSessions ? (
                      <div className="flex items-center gap-2 px-2 py-1 opacity-50">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Scanning Arena History...</span>
                      </div>
                    ) : arenaSessions.length > 0 ? (
                      arenaSessions.map((session) => (
                        <button
                          key={session.id}
                          onClick={() => setSelectedSessionId(session.id)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                            selectedSessionId === session.id
                              ? "bg-foreground text-background border-foreground shadow-md"
                              : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {session.title}
                          <span className={`ml-2 text-[8px] opacity-60 ${session.status === 'completed' ? 'text-emerald-500' : 'text-primary'}`}>
                            [{session.status}]
                          </span>
                        </button>
                      ))
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">No Sessions Found for this Game</span>
                    )}
                  </div>
                </div>

                {/* Session Leaderboard (Roster) */}
                <div className="min-h-75">
                  {isLoadingRoster ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Syncing Session Roster...</span>
                    </div>
                  ) : selectedSessionId ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-muted/50 border-b border-border">
                          <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="px-6 py-4 text-[10px] uppercase tracking-widest h-auto font-black text-muted-foreground">Rank</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] uppercase tracking-widest h-auto font-black text-muted-foreground">Player</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] uppercase tracking-widest text-center h-auto font-black text-muted-foreground">Best Score</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] uppercase tracking-widest text-center h-auto font-black text-muted-foreground">Attempts</TableHead>
                            <TableHead className="px-6 py-4 text-[10px] uppercase tracking-widest text-right h-auto font-black text-muted-foreground">Rewards</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-border">
                          {roster.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="h-48 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest opacity-30">
                                No participants in this session
                              </TableCell>
                            </TableRow>
                          ) : (
                            roster.map((entry, i) => {
                              const rank = i + 1;
                              return (
                                <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors border-none group">
                                  <TableCell className="px-6 py-4">
                                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                      rank === 1 ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30' :
                                      rank === 2 ? 'bg-slate-300 text-slate-700' :
                                      rank === 3 ? 'bg-orange-400 text-white' :
                                      'bg-muted text-muted-foreground'
                                    }`}>
                                      {rank}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-xl overflow-hidden border border-border bg-muted">
                                        <img src={entry.users?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"} alt="" className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                        <p className="font-black text-xs text-foreground uppercase tracking-tight">@{entry.users?.username}</p>
                                        <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">ID: {entry.user_id.substring(0, 8)}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-6 py-4 text-center font-black text-foreground text-sm font-number">
                                    {entry.best_score.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="px-6 py-4 text-center font-bold text-muted-foreground text-xs">
                                    {entry.attempts}
                                  </TableCell>
                                  <TableCell className="px-6 py-4 text-right">
                                    {entry.payout_amount ? (
                                      <span className="flex items-center justify-end gap-1 font-black text-emerald-500 font-number">
                                        <ZASymbol />{entry.payout_amount.toLocaleString()}
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-bold text-muted-foreground/30">—</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center p-8">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Select a Session to View Roster</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "Referrals" && (
          isLoadingReferral ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Decrypting Referral Network...</span>
            </div>
          ) : (
            <ReferralLeaderboardTable data={(
              (referralData && (referralData as ReferralEntry[]).length > 0) 
                ? (referralData as ReferralEntry[]) 
                : [] // Show empty if no real data, or MOCK_REFERRAL_DATA if you still want fallback
            ).map((r) => ({
              rank: r.rank,
              username: r.username,
              avatar: r.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
              referrals: r.total_referrals,
              earnings: 0, 
              status: "ACTIVE"
            })) || []} />
          )
        )}

        {activeTab === "Loyalty" && (
          isLoadingLoyalty ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Scanning Loyalty Protocols...</span>
            </div>
          ) : (
            <LoyaltyLeaderboardTable data={(
              (loyaltyData && (loyaltyData as LoyaltyEntry[]).length > 0) 
                ? (loyaltyData as LoyaltyEntry[]) 
                : [] // Show empty if no real data
            ).map((l) => ({
              rank: l.rank,
              username: l.username,
              avatar: l.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
              pzaPoints: l.pza_points,
              level: Math.floor(l.pza_points / 1000) + 1,
              status: "ACTIVE"
            })) || []} />
          )
        )}
      </div>
    </main>
  );
};

export default Leaderboards;
