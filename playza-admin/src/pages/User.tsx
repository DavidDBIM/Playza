import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { 
  MdHistory, 
  MdReceiptLong, 
  MdAccountTree,
  MdSearch,
  MdFilterList,
  MdOutlineClear,
  MdRefresh,
  MdMilitaryTech
} from 'react-icons/md';
import { UserIdentityHero } from '../components/user/UserIdentityHero';
import { UserAdvancedMetrics } from '../components/user/UserAdvancedMetrics';
import {
  CombatLog,
  FinancialFlow,
  DownlineNetwork,
  LoyaltyLog,
} from "../components/user/UserActivityTables";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { useAdminUserDetails, useUpdateUserStatus } from "../hooks/use-admin";
import type {
  UserRecord,
  MatchRecord,
  TransactionRecord,
  ReferralRecord,
} from "../data/usersData";

const User: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<
    "matches" | "transactions" | "referrals" | "loyalty"
  >("matches");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const {
    data: userDetails,
    isLoading,
    isError,
    refetch,
  } = useAdminUserDetails(id || "");
  const updateStatus = useUpdateUserStatus();

  // Map backend details to our UI format
  const mappedUser = useMemo((): UserRecord | null => {
    if (!userDetails) return null;
    return {
      id: userDetails.id,
      username: userDetails.username,
      email: userDetails.email,
      phoneNumber: userDetails.phone,
      fullName:
        `${userDetails.first_name || ""} ${userDetails.last_name || ""}`.trim() ||
        userDetails.username,
      walletBalance: userDetails.wallets?.balance || 0,
      status: userDetails.is_active ? "Active" : "Suspended",
      joinedDate: new Date(userDetails.created_at).toLocaleDateString(),
      joinedTimestamp: new Date(userDetails.created_at).getTime(),
      lastActive: "Just now",
      avatar:
        userDetails.avatar_url ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      kycStatus: userDetails.is_email_verified ? "Verified" : "Pending",
      level: 1, // Default or computed
      referralCode: userDetails.referral_code,
      referrals: userDetails.total_referrals,
      pzaPoints: userDetails.pza_points?.total_points || 0,
      totalGames: userDetails.game_history?.length || 0,
      totalWinnings:
        userDetails.game_history?.reduce(
          (acc, match) => acc + (match.winnings || 0),
          0,
        ) || 0,
    };
  }, [userDetails]);

  const tabs = [
    { id: "matches", icon: MdHistory, label: "Game History" },
    { id: "loyalty", icon: MdMilitaryTech, label: "Loyalty Events" },
    { id: "transactions", icon: MdReceiptLong, label: "Transactions" },
    { id: "referrals", icon: MdAccountTree, label: "Referrals" },
  ] as const;

  // Filtered Data Logic
  const filteredMatches = useMemo((): MatchRecord[] => {
    const history = userDetails?.game_history || [];
    return history
      .filter((match) =>
        match.game_name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .map((match) => ({
        id: match.id,
        game: match.game_name,
        score: match.status.toUpperCase(),
        position: match.id.slice(0, 8),
        winnings: match.winnings || 0,
        date: new Date(match.played_at).toLocaleDateString(),
        status: "COMPLETED",
      }));
  }, [userDetails, searchQuery]);

  const PZA_EVENT_LABELS: Record<string, string> = {
    // Basic Onboarding
    SIGNUP: 'Identity Created',
    EMAIL_VERIFIED: 'Secure Link Verified',
    PROFILE_COMPLETED: 'Bio-Data Synced',
    AVATAR_UPLOADED: 'Visual ID Uplink',
    
    // Gameplay Milestones
    FIRST_GAME_PLAYED: 'First Combat Deployment',
    FIVE_GAMES_PLAYED: 'Combat Veteran (5 Sessions)',
    TEN_GAMES_PLAYED: 'Elite Operator (10 Sessions)',
    FIRST_TICKET_BOUGHT: 'Arena Access Purchased',
    MATCH_COMPLETED: 'Mission Concluded',
    MATCH_WON: 'Tactical Victory',
    WIN_STREAK_3: 'Triple Threat Streak',
    
    // Tournaments
    TOURNAMENT_JOINED: 'Championship Entry',
    TOURNAMENT_FINISHED: 'Championship Finalized',
    TOURNAMENT_WON: 'Championship Winner',
    
    // Game Streaks
    STREAK_3_GAMES: 'Rapid Fire (3 Games)',
    STREAK_7_GAMES: 'Week-Long Warrior',
    STREAK_14_GAMES: 'Fortnight Fighter',
    STREAK_21_GAMES: 'Relentless Competitor',
    STREAK_30_GAMES: 'Monthly Legend',
    
    // Referrals
    REFERRAL_SIGNED_UP: 'Recruit Onboarded',
    REFERRAL_EMAIL_VERIFIED: 'Recruit Verified',
    REFERRAL_FIRST_DEPOSIT: 'Recruit Initial Funding',
    REFERRAL_DEPOSIT_1K: 'Recruit High-Value Funding',
    REFERRAL_DEPOSIT_10K: 'Whale Recruit Funding',
    REFERRAL_FIRST_GAME: 'Recruit Combat Deployment',
    REFERRAL_FIVE_GAMES: 'Active Squad Performance',
    REFERRAL_TEN_GAMES: 'Elite Squad Performance',
    REFERRAL_CAMPAIGN_JOINED: 'Affiliate Program Entry',
    
    // Ranks
    RANK_BRONZE: 'Bronze Tier Achievement',
    RANK_SILVER: 'Silver Tier Achievement',
    RANK_GOLD: 'Gold Tier Achievement',
    RANK_PLATINUM: 'Platinum Tier Achievement',
    
    // Community & Engagement
    WEEKLY_LEADERBOARD_TOP: 'Global Top Ranking',
    MATCH_COMMENT: 'Intel Shared',
    CONTENT_LIKED_SHARED: 'Social Amplification',
    COMMUNITY_EVENT_JOINED: 'Faction Gathering',
    CHEATER_REPORTED: 'Justice Protocol Initiated',
    CONTENT_CREATED: 'Asset Created',
    WEEKEND_CHALLENGE: 'Special Op Victory',
    HOLIDAY_TOURNAMENT: 'Season Event Winner',
    DAILY_STREAK_CLAIM: 'Daily Loyalty Check-in',
    FIRST_100_TICKET: 'Early Adopter Purchase',
    FIRST_100_EVENT: 'Genesis Event Participation',
  };

  const filteredLoyalty = useMemo(() => {
    const history = userDetails?.pza_history || [];
    return history
      .filter((event) => {
        const label = PZA_EVENT_LABELS[event.event_type] || event.event_type;
        return label.toLowerCase().includes(searchQuery.toLowerCase()) || 
               event.event_type.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .map(event => ({
        ...event,
        event_type: PZA_EVENT_LABELS[event.event_type] || event.event_type.replace(/_/g, ' ')
      }));
  }, [userDetails, searchQuery]);

  const filteredTransactions = useMemo((): TransactionRecord[] => {
    if (!userDetails?.transactions) return [];
    return userDetails.transactions
      .filter((tx) => {
        const matchesSearch =
          tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "All" || tx.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
      })
      .map((tx) => ({
        id: tx.id,
        username: userDetails.username,
        type: tx.type.charAt(0).toUpperCase() + tx.type.slice(1).replace("_", " "),
        amount: tx.amount,
        method: tx.reference || "System",
        date: new Date(tx.created_at).toLocaleDateString(),
        status:
          tx.status.toLowerCase() === "success" || tx.status.toLowerCase() === "successful"
            ? "Successful"
            : tx.status.toLowerCase() === "pending"
              ? "Pending"
              : "Failed",
      }));
  }, [userDetails, searchQuery, statusFilter]);

  const filteredReferrals = useMemo((): ReferralRecord[] => {
    if (!userDetails?.referrals) return [];
    return userDetails.referrals
      .filter((ref) => {
        const matchesSearch = ref.users?.username
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "All" || ref.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .map((ref) => ({
        id: ref.id,
        username: ref.users?.username || "unknown",
        date: new Date(ref.created_at).toLocaleDateString(),
        reward: 0,
        status: ref.status === "email_verified" ? "Qualified" : "Pending",
      }));
  }, [userDetails, searchQuery, statusFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
  };

  const handleUpdateStatus = (action: "activate" | "deactivate" | "ban") => {
    if (!id) return;
    updateStatus.mutate({ userId: id, action });
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
          Interrogating Registry...
        </span>
      </div>
    );

  if (isError || !mappedUser)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center">
        <div className="p-8 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/20 max-w-md">
          <h2 className="text-rose-500 font-headline font-black text-2xl uppercase tracking-widest">
            Citizen Not Found
          </h2>
          <p className="text-muted-foreground/60 text-xs mt-4">
            The requested identity does not exist in our regional database or
            the connection was severed.
          </p>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="mt-8 border-rose-500/30 text-rose-500 h-14 rounded-2xl w-full"
          >
            Return to Registry
          </Button>
        </div>
      </div>
    );

  return (
    <main className="p-4 space-y-4">
      {/* Identity Hero */}
      <UserIdentityHero
        user={mappedUser}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={updateStatus.isPending}
      />

      {/* Stats */}
      <UserAdvancedMetrics user={mappedUser} />

      {/* Activity Console */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Navigation Tabs */}
        <div className="border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex px-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  resetFilters();
                }}
                className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 relative border-b-2 border-transparent ${
                  activeTab === tab.id
                    ? "text-primary border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="text-lg" />
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 mr-4 rounded-lg hover:bg-muted transition-all text-primary"
          >
            <MdRefresh
              className={`text-xl transition-transform hover:rotate-180 duration-500 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="p-4 bg-muted/10 border-b border-border">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground" />
              <input
                placeholder={`Search ${tabs.find((t) => t.id === activeTab)?.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-muted border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all uppercase tracking-tight"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <MdOutlineClear className="text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-44 h-10 bg-muted border border-border rounded-xl font-black text-[10px] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <MdFilterList className="text-base text-primary" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-border bg-card">
                  <SelectItem
                    value="All"
                    className="font-black text-[10px] uppercase tracking-widest p-2"
                  >
                    All Records
                  </SelectItem>
                  {activeTab === "transactions" && (
                    <>
                      <SelectItem
                        value="success"
                        className="font-black text-[10px] uppercase tracking-widest p-2"
                      >
                        Successful
                      </SelectItem>
                      <SelectItem
                        value="pending"
                        className="font-black text-[10px] uppercase tracking-widest p-2"
                      >
                        Pending
                      </SelectItem>
                      <SelectItem
                        value="failed"
                        className="font-black text-[10px] uppercase tracking-widest p-2"
                      >
                        Failed
                      </SelectItem>
                    </>
                  )}
                  {activeTab === "referrals" && (
                    <>
                      <SelectItem
                        value="email_verified"
                        className="font-black text-[10px] uppercase tracking-widest p-2"
                      >
                        Qualified
                      </SelectItem>
                      <SelectItem
                        value="pending"
                        className="font-black text-[10px] uppercase tracking-widest p-2"
                      >
                        Pending
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="min-h-100">
          {activeTab === "matches" && <CombatLog data={filteredMatches} />}
          {activeTab === "loyalty" && <LoyaltyLog data={filteredLoyalty} />}
          {activeTab === "transactions" && (
            <FinancialFlow data={filteredTransactions} />
          )}
          {activeTab === "referrals" && (
            <DownlineNetwork data={filteredReferrals} />
          )}

          {((activeTab === "matches" && filteredMatches.length === 0) ||
            (activeTab === "loyalty" && filteredLoyalty.length === 0) ||
            (activeTab === "transactions" &&
              filteredTransactions.length === 0) ||
            (activeTab === "referrals" && filteredReferrals.length === 0)) && (
            <div className="flex flex-col items-center justify-center p-20 opacity-30 grayscale pointer-events-none">
              <MdSearch className="text-6xl mb-4" />
              <h3 className="text-lg font-heading font-black uppercase tracking-tight">
                No Intelligence Found
              </h3>
              <p className="text-xs font-bold mt-1">
                Adjust your filters to locate the data.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default User;
