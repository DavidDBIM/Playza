import React, { useState} from 'react';
import {
  MdLeaderboard,
  MdRefresh,
  MdGamepad,
  MdGroupAdd,
  MdMilitaryTech,
} from "react-icons/md";
import GameLeaderboardCard from "../components/leaderboards/GameLeaderboardCard";
import ReferralLeaderboardTable from "../components/leaderboards/ReferralLeaderboardTable";
import LoyaltyLeaderboardTable from "../components/leaderboards/LoyaltyLeaderboardTable";
import { useNavigate, useLocation, useMatch } from "react-router";
import { useEffect } from "react";
import { 
  useAdminGamesLeaderboard, 
  useAdminLoyaltyLeaderboard, 
  useAdminReferralLeaderboard 
} from "../hooks/use-leaderboard";

interface GameEntry {
  rank: number;
  username: string;
  avatar_url: string | null;
  wins?: number;
  total_winnings?: number;
}

interface GameData {
  slug: string;
  name: string;
  leaderboard: GameEntry[];
}

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

const Leaderboards: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [dateFilter, setDateFilter] = useState("all");

  // Logic to determine active tab based on path
  let activeTab: "Games" | "Referrals" | "Loyalty" = "Games";
  if (pathname.includes("/leaderboards/loyalty")) activeTab = "Loyalty";
  else if (pathname.includes("/leaderboards/reward")) activeTab = "Referrals";

  // Extract session if present (e.g. /leaderboards/game/S101)
  const sessionMatch = useMatch("/leaderboards/game/:sessionId");
  const activeSessionId = sessionMatch?.params.sessionId;

  const { data: gamesData, isLoading: isLoadingGames, refetch: refetchGames } = useAdminGamesLeaderboard(dateFilter);
  const { data: loyaltyData, isLoading: isLoadingLoyalty, refetch: refetchLoyalty } = useAdminLoyaltyLeaderboard(dateFilter);
  const { data: referralData, isLoading: isLoadingReferral, refetch: refetchReferral } = useAdminReferralLeaderboard(dateFilter);

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
    if (activeTab === "Games") refetchGames();
    else if (activeTab === "Loyalty") refetchLoyalty();
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
              className={`text-lg transition-transform hover:rotate-180 duration-500 ${(isLoadingGames || isLoadingLoyalty || isLoadingReferral) ? 'animate-spin' : ''}`}
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
          <div className="grid grid-cols-1 gap-8">
            {isLoadingGames ? (
               <div className="py-20 text-center opacity-30">Syncing Battle Data...</div>
            ) : (gamesData as GameData[] | undefined)?.map((game) => (
              <GameLeaderboardCard
                key={game.slug}
                game={{
                  id: game.slug,
                  name: game.name,
                  entries: game.leaderboard.map((entry) => ({
                    rank: entry.rank,
                    username: entry.username,
                    avatar: entry.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
                    score: entry.wins || 0,
                    reward: entry.total_winnings || 0,
                    status: "ONLINE"
                  }))
                }}
                activeSessionId={activeSessionId}
              />
            ))}
          </div>
        )}

        {activeTab === "Referrals" && (
          isLoadingReferral ? (
            <div className="py-20 text-center opacity-30">Decrypting Referral Network...</div>
          ) : (
            <ReferralLeaderboardTable data={(referralData as ReferralEntry[] | undefined)?.map((r) => ({
              rank: r.rank,
              username: r.username,
              avatar: r.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
              referrals: r.total_referrals,
              earnings: 0, // Not tracked in backend yet
              status: "ACTIVE"
            })) || []} />
          )
        )}

        {activeTab === "Loyalty" && (
          isLoadingLoyalty ? (
            <div className="py-20 text-center opacity-30">Scanning Loyalty Protocols...</div>
          ) : (
            <LoyaltyLeaderboardTable data={(loyaltyData as LoyaltyEntry[] | undefined)?.map((l) => ({
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
