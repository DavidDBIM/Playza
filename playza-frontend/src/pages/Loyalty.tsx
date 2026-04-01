import { useState, type ReactNode } from "react";
import {
  MdDiamond,
  MdCheckCircle,
  MdToken,
  MdLock,
  MdMilitaryTech,
  MdAccountCircle,
  MdSportsEsports,
  MdAccountBalanceWallet,
  MdConfirmationNumber,
  MdLocalMall,
  MdInfo,
  MdClose,
  MdStars,
  MdEmojiEvents,
  MdGroups,
  MdVerified,
  MdPhonelinkRing,
  MdShoppingBag,
  MdOutlineForum,
  MdThumbUp,
  MdEvent,
  MdReportProblem,
  MdVideoLibrary,
} from "react-icons/md";
import { useLoyaltyMe } from "@/hooks/loyalty/useLoyaltyMe";
import { useAuth } from "@/context/auth";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { LoyaltySkeleton } from "@/components/skeletons/LoyaltySkeleton";

const Loyalty = () => {
  const { user } = useAuth();
  const { data: loyaltyData, isLoading, error } = useLoyaltyMe();
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Season 1");

  console.log("[LoyaltyPage] State:", { loyaltyData, isLoading, error });

  if (user && isLoading) {
    return <LoyaltySkeleton />;
  }

  const totalPoints = loyaltyData?.total_points ?? 0;
  // Thresholds: Bronze (0-999), Silver (1000-4999), Gold (5000-9999), Platinum (10000+)
  const currentTier = totalPoints < 1000 ? "BRONZE" : totalPoints < 5000 ? "SILVER" : totalPoints < 10000 ? "GOLD" : "PLATINUM";
  const nextTier = currentTier === "BRONZE" ? "SILVER" : currentTier === "SILVER" ? "GOLD" : currentTier === "GOLD" ? "PLATINUM" : "EXALTED";
  const nextTarget = currentTier === "BRONZE" ? 1000 : currentTier === "SILVER" ? 5000 : currentTier === "GOLD" ? 10000 : totalPoints;
  const progressPercent = nextTarget === totalPoints ? 100 : Math.min(100, (totalPoints / nextTarget) * 100);

  const getQuestStatus = (id: string, isTaskLocked: boolean = false) => {
    if (isTaskLocked) return "locked";
    const hasEvent = loyaltyData?.recent_events.some(e => e.event_type === id);
    if (hasEvent) return "completed";
    return "active";
  };

  interface Quest {
    id: string;
    name: string;
    info: string;
    points: number;
    icon: ReactNode;
    status: "completed" | "active" | "locked";
  }

  const quests: Record<string, Quest[]> = {
    "Season 1": [
      { id: "signup", name: "Genesis Join", info: "Join the Playza ecosystem", points: 5, icon: <MdStars />, status: "completed" },
      { id: "email_verified", name: "Safe Guard", info: "Verify your email address", points: 10, icon: <MdVerified />, status: user?.isEmailVerified ? "completed" : "active" },
      { id: "phone_verified", name: "Direct Link", info: "Verify your phone number", points: 10, icon: <MdPhonelinkRing />, status: getQuestStatus("phone_verified") },
      { id: "profile_completed", name: "Identity Set", info: "Complete your profile bio", points: 30, icon: <MdAccountCircle />, status: getQuestStatus("profile_completed") },
      { id: "avatar_uploaded", name: "Face of War", info: "Upload a profile avatar", points: 20, icon: <MdToken />, status: getQuestStatus("avatar_uploaded") },
      { id: "first_game_played", name: "Initiation", info: "Play your first match", points: 200, icon: <MdSportsEsports />, status: getQuestStatus("first_game_played") },
      { id: "first_ticket_bought", name: "Investor", info: "Buy your first arena ticket", points: 50, icon: <MdShoppingBag />, status: getQuestStatus("first_ticket_bought") },
      { id: "referral_signed_up", name: "Recruiter", info: "Refer your first friend", points: 10, icon: <MdGroups />, status: getQuestStatus("referral_signed_up") },
      { id: "comment_on_match", name: "Vocal Critic", info: "Comment on any match results", points: 10, icon: <MdOutlineForum />, status: getQuestStatus("comment_on_match") },
      { id: "like_share_content", name: "Influencer", info: "Like or share a platform event", points: 5, icon: <MdThumbUp />, status: getQuestStatus("like_share_content") },
    ],
    "Season 2": [
      { id: "five_games_played", name: "Novice Warrior", info: "Complete 5 total matches", points: 1000, icon: <MdSportsEsports />, status: getQuestStatus("five_games_played") },
      { id: "match_completed", name: "Duelist", info: "Complete a competitive duel", points: 1000, icon: <MdSportsEsports />, status: getQuestStatus("match_completed") },
      { id: "match_won", name: "Victor", info: "Win your first match", points: 1000, icon: <MdEmojiEvents />, status: getQuestStatus("match_won") },
      { id: "win_streak_3", name: "Hot Streak", info: "Win 3 matches in a row", points: 200, icon: <MdStars />, status: getQuestStatus("win_streak_3") },
      { id: "tournament_joined", name: "Competitor", info: "Join a scheduled tournament", points: 100, icon: <MdEvent />, status: getQuestStatus("tournament_joined") },
      { id: "streak_3_games", name: "Active User", info: "Play for 3 days straight", points: 30, icon: <MdToken />, status: getQuestStatus("streak_3_games") },
      { id: "referral_email_verified", name: "Mentor", info: "Referral verifies their email", points: 10, icon: <MdVerified />, status: getQuestStatus("referral_email_verified") },
      { id: "referral_first_game", name: "Command", info: "Referral plays their first game", points: 200, icon: <MdSportsEsports />, status: getQuestStatus("referral_first_game") },
      { id: "referral_milestone_1", name: "Unity", info: "Reach first referral milestone", points: 5, icon: <MdGroups />, status: getQuestStatus("referral_milestone_1") },
      { id: "join_community_event", name: "Citizen", info: "Join a community live event", points: 50, icon: <MdOutlineForum />, status: getQuestStatus("join_community_event") },
    ],
    "Season 3": [
      { id: "ten_games_played", name: "Veteran", info: "Complete 10 total matches", points: 2000, icon: <MdSportsEsports />, status: getQuestStatus("ten_games_played") },
      { id: "tournament_finished", name: "Finalist", info: "Finish a complete tournament", points: 1000, icon: <MdEmojiEvents />, status: getQuestStatus("tournament_finished") },
      { id: "streak_7_games", name: "Committed", info: "Play for 7 days straight", points: 80, icon: <MdToken />, status: getQuestStatus("streak_7_games") },
      { id: "streak_14_games", name: "Relentless", info: "Play for 14 days straight", points: 150, icon: <MdToken />, status: getQuestStatus("streak_14_games") },
      { id: "referral_first_deposit", name: "Broker", info: "Referral makes first deposit", points: 200, icon: <MdAccountBalanceWallet />, status: getQuestStatus("referral_first_deposit") },
      { id: "referral_deposit_1k", name: "High Roller", info: "Referral deposits over 1k", points: 500, icon: <MdAccountBalanceWallet />, status: getQuestStatus("referral_deposit_1k") },
      { id: "referral_five_games", name: "Squadron", info: "Referral plays 5 games", points: 500, icon: <MdSportsEsports />, status: getQuestStatus("referral_five_games") },
      { id: "referral_milestone_10", name: "Legion", info: "Refer 10 active members", points: 50, icon: <MdGroups />, status: getQuestStatus("referral_milestone_10") },
      { id: "weekly_referral_campaign", name: "Warlord", info: "Win a weekly referral race", points: 100, icon: <MdStars />, status: getQuestStatus("weekly_referral_campaign") },
      { id: "weekend_challenge", name: "Gladiator", info: "Complete a weekend challenge", points: 200, icon: <MdEmojiEvents />, status: getQuestStatus("weekend_challenge") },
    ],
    "Season 4": [
      { id: "tournament_won", name: "Champion", info: "Win a full tournament", points: 2000, icon: <MdEmojiEvents />, status: getQuestStatus("tournament_won") },
      { id: "streak_21_games", name: "Legendary", info: "Play for 21 days straight", points: 250, icon: <MdToken />, status: getQuestStatus("streak_21_games") },
      { id: "referral_ten_games", name: "Captain", info: "Referral plays 10 games", points: 1000, icon: <MdSportsEsports />, status: getQuestStatus("referral_ten_games") },
      { id: "referral_deposit_10k", name: "Whale Recruiter", info: "Referral deposits over 10k", points: 5000, icon: <MdAccountBalanceWallet />, status: getQuestStatus("referral_deposit_10k") },
      { id: "referral_milestone_50", name: "General", info: "Refer 50 active members", points: 200, icon: <MdGroups />, status: getQuestStatus("referral_milestone_50") },
      { id: "referral_milestone_100", name: "Conqueror", info: "Refer 100 active members", points: 500, icon: <MdGroups />, status: getQuestStatus("referral_milestone_100") },
      { id: "rank_bronze", name: "Iron Rank", info: "Reach the Bronze Tier", points: 500, icon: <MdMilitaryTech />, status: getQuestStatus("rank_bronze") },
      { id: "rank_silver", name: "Steel Rank", info: "Reach the Silver Tier", points: 3000, icon: <MdMilitaryTech />, status: getQuestStatus("rank_silver") },
      { id: "valid_cheat_report", name: "Guardian", info: "Submit a valid cheat report", points: 200, icon: <MdReportProblem />, status: getQuestStatus("valid_cheat_report") },
      { id: "content_created", name: "Creator", info: "Create recognized content", points: 500, icon: <MdVideoLibrary />, status: getQuestStatus("content_created") },
    ],
    "Season 5": [
      { id: "streak_30_games", name: "Immortal", info: "Play for 30 days straight", points: 500, icon: <MdToken />, status: getQuestStatus("streak_30_games") },
      { id: "referral_milestone_500", name: "Empire", info: "Refer 500 active members", points: 1000, icon: <MdGroups />, status: getQuestStatus("referral_milestone_500") },
      { id: "referral_milestone_1000", name: "Deity", info: "Refer 1,000 active members", points: 5000, icon: <MdGroups />, status: getQuestStatus("referral_milestone_1000") },
      { id: "referral_milestone_5000", name: "Architect", info: "Refer 5,000 active members", points: 10000, icon: <MdGroups />, status: getQuestStatus("referral_milestone_5000") },
      { id: "rank_gold", name: "Gold Rank", info: "Reach the Gold Tier", points: 20000, icon: <MdMilitaryTech />, status: getQuestStatus("rank_gold") },
      { id: "rank_platinum", name: "Platinum Rank", info: "Reach the Platinum Tier", points: 100000, icon: <MdMilitaryTech />, status: getQuestStatus("rank_platinum") },
      { id: "weekly_leaderboard_top", name: "God King", info: "Top the Weekly Leaderboard", points: 1000, icon: <MdEmojiEvents />, status: getQuestStatus("weekly_leaderboard_top") },
      { id: "holiday_tournament", name: "Event Master", info: "Win a Holiday Tournament", points: 500, icon: <MdEvent />, status: getQuestStatus("holiday_tournament") },
      { id: "first_100_ticket_buyers", name: "Swift", info: "Be top 100 ticket buyers", points: 1000, icon: <MdShoppingBag />, status: getQuestStatus("first_100_ticket_buyers") },
      { id: "first_100_event_players", name: "First Responder", info: "Be top 100 event players", points: 200, icon: <MdSportsEsports />, status: getQuestStatus("first_100_event_players") },
    ]
  };

  return (
    <div className="flex-1 space-y-12 pb-2 md:pb-20">
      {!user ? (
        <div className="mt-6 mb-12 glass-card p-2 md:p-10 rounded-xl border-primary/20 relative overflow-hidden flex flex-col items-center text-center gap-2 md:gap-8 shadow-2xl">
          <div className="absolute -top-24 -left-24 size-96 bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 size-96 bg-secondary/20 blur-[120px] rounded-full" />

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="size-24 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-8 border border-primary/30 shadow-inner group">
              <MdStars className="text-3xl md:text-5xl text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
              PZA <span className="text-primary">Rewards</span> Center
            </h1>
            <p className="text-xs md:text-base text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">
              Earn PZA for every move you make. Unlock exclusive
              tournaments, redeem wallet credits, and rank up your legacy.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-2 md:gap-4 w-full max-w-md">
            <Link to="/registration?view=signup" className="flex-1">
              <Button className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm md:text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 glow-accent">
                Join Rewards
              </Button>
            </Link>
            <Link to="/registration?view=login" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-16 border-primary/30 text-primary rounded-2xl font-black uppercase tracking-widest text-sm md:text-lg hover:bg-primary/10 transition-all"
              >
                Member Login
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 md:gap-6">
          <div className="flex justify-end pt-2 md:pt-4">
            <Link
              to="/leaderboard?tab=Loyalty"
              className="px-2 md:px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold uppercase text-xs hover:bg-primary/20 transition-colors"
            >
              Reward Leaderboard
            </Link>
          </div>
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-6">
            <div className="lg:col-span-2 glass-card rounded-xl p-2 md:p-8 relative overflow-hidden border border-white/5 neon-glow">
              <div className="absolute top-0 right-0 p-2 md:p-8 opacity-10">
                <MdDiamond className="text-9xl" />
              </div>
              <div className="relative z-10">
                <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter mb-2 text-slate-900 dark:text-white uppercase italic">
                  Loyalty <span className="text-primary italic">Status</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md font-bold uppercase tracking-widest opacity-60 text-xs">
                  Earn PZA. Complete tasks. Unlock rewards.
                </p>
                <div className="flex flex-wrap items-end gap-2 md:gap-8">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-primary mb-1 font-bold opacity-70">
                      Total Balance
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-4xl md:text-5xl font-black font-headline text-slate-900 dark:text-white">
                        {totalPoints.toLocaleString()}
                      </span>
                      <span className="text-xl md:text-2xl font-bold text-primary">
                        PZA
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-60">
                    <div className="flex justify-between text-xs mb-2 text-slate-500">
                      <span className="flex items-center gap-1.5 font-bold uppercase tracking-widest">
                        Progress to{" "}
                        <span className="text-primary font-black">{nextTier}</span>
                        <button
                          onClick={() => setIsTierModalOpen(true)}
                          className="text-primary hover:text-primary/80 transition-colors p-0.5"
                          title="View Tiers"
                        >
                          <MdInfo className="text-xs" />
                        </button>
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {totalPoints.toLocaleString()} / {nextTarget.toLocaleString()} PZA
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div 
                        className="h-full bg-linear-to-r from-primary to-secondary relative transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-2 md:p-8 flex flex-col justify-between border border-white/5">
              <div className="flex justify-between items-start">
                <div className="text-sm uppercase tracking-widest text-slate-500 font-bold">
                  Current Streak
                </div>
                <div className="bg-red-500/10 text-red-500 px-2 md:px-3 py-1 rounded-full text-xs font-bold border border-red-500/20">
                   {loyaltyData?.streak_days || 1} Days 🔥
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {loyaltyData?.recent_events.slice(0, 4).map((ev, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2">
                    <span className="text-slate-400 font-bold uppercase truncate max-w-30">{ev.event_type.replace(/_/g, " ")}</span>
                    <span className="text-primary font-black">+{ev.points_awarded.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {user && (
        <>
          {/* Daily Status */}
          <section className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900/5 dark:bg-white/5 p-4 rounded-2xl border border-white/5">
              <h2 className="font-headline text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase italic leading-none">
                Daily Rewards Status
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                Streak Multiplier active
              </span>
            </div>
            {/* Streak UI logic */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
               {[1, 2, 3, 4, 5, 6, 7].map(day => (
                 <div key={day} className={`glass-card p-4 rounded-xl border flex flex-col items-center gap-2 ${day <= (loyaltyData?.streak_days ?? 1) ? 'border-primary bg-primary/5 shadow-inner shadow-primary/10' : 'opacity-40 border-white/5'}`}>
                    <span className="text-[10px] font-black uppercase text-slate-500">Day {day}</span>
                    <MdToken className={day <= (loyaltyData?.streak_days ?? 1) ? 'text-primary' : 'text-slate-500'} size={20} />
                 </div>
               ))}
            </div>
          </section>

          {/* ── Legacy Missions (Seasons) ── */}
          <section className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="space-y-2">
                <h2 className="font-headline text-lg md:text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                   Legacy <span className="text-primary italic">Missions</span>
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                    <MdEvent size={14} className="text-primary" />
                    <span className="text-[10px] text-primary font-black uppercase tracking-widest leading-none">50+ Challenges</span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-70">
                    Browse future seasons to plan your journey
                  </p>
                </div>
              </div>

              {/* Season Tabs */}
              <div className="flex bg-slate-900/5 dark:bg-white/5 p-1.5 rounded-2xl border border-white/5 gap-1 shrink-0 overflow-x-auto max-w-full hide-scrollbar">
                {Object.keys(quests).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab ? "bg-primary text-white shadow-xl scale-105" : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab}
                    {tab !== "Season 1" && <MdLock size={12} className={activeTab === tab ? "text-white/40" : "text-slate-600"} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 md:gap-4">
              {quests[activeTab]?.map((quest, idx) => (
                <div
                  key={idx}
                  className={`glass-card p-2 md:p-4 rounded-xl md:rounded-xl border transition-all duration-500 flex flex-col justify-between h-26 md:h-32 relative group ${
                    quest.status === "completed"
                      ? "border-green-500/30 bg-green-500/5 shadow-inner opacity-80"
                      : quest.status === "active"
                         ? "border-primary/40 bg-primary/10 shadow-2xl shadow-primary/10 hover:scale-[1.02] hover:border-primary"
                        : "border-white/5 opacity-40 bg-slate-200/10 grayscale pointer-events-none"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div
                      className={`w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-inner ${
                        quest.status === "completed"
                          ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                          : quest.status === "active"
                             ? "bg-primary text-white animate-pulse shadow-glow"
                            : "bg-slate-500/20 text-slate-500"
                      }`}
                    >
                      {quest.status === "completed" ? <MdCheckCircle size={16} className="md:size-24" /> : quest.icon}
                    </div>
                    <div className="text-right">
                      <div className={`text-xs md:text-base font-black italic tracking-tighter ${quest.status === "completed" ? "text-green-500" : "text-primary"}`}>
                        +{quest.points.toLocaleString()}
                      </div>
                      <div className="text-[7px] md:text-[10px] font-black uppercase opacity-60 tracking-widest leading-none">PZA</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 md:mt-4">
                    <h3 className="font-headline font-black text-[9px] md:text-sm uppercase tracking-tighter text-slate-900 opacity-70 dark:text-white italic leading-none mb-0.5 md:mb-1 group-hover:text-primary transition-colors truncate">
                      {quest.name}
                    </h3>
                    <p className="text-[7px] md:text-[10px] text-primary font-bold uppercase tracking-widest leading-none md:leading-tight line-clamp-2">
                       {quest.info}
                    </p>
                  </div>
                  
                  <div className="mt-2 md:mt-4 flex items-center justify-between">
                    <span className="text-[6px] md:text-[8px] font-black uppercase bg-slate-900/10 dark:bg-white/5 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg text-slate-400">
                       {activeTab} • #{idx + 1}
                    </span>
                    {quest.status === "locked" && <MdLock className="text-slate-500" size={10} />}
                  </div>

                  {activeTab !== "Season 1" && quest.status === "active" && (
                    <div className="absolute top-1 md:top-2 right-1 md:right-2 flex items-center gap-1 text-[6px] md:text-[8px] font-black uppercase text-amber-500/60">
                       <MdLock size={8} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Redemption Store */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-headline text-lg md:text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
            Redemption <span className="text-primary italic">Store</span>
          </h2>
          <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
          <div className="glass-card rounded-xl overflow-hidden border border-white/5 group bg-slate-100/50 dark:bg-white/5 transition-all hover:scale-[1.01]">
            <div className="h-32 bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
              <MdAccountBalanceWallet className="text-3xl md:text-5xl text-slate-500 opacity-20" />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-white">
                WALLET BONUS
              </div>
            </div>
            <div className="p-2 md:p-6 space-y-4">
              <div>
                <div className="font-headline font-black text-sm md:text-lg text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 italic leading-none">
                  <span className="text-primary">PZA</span>
                  <span>10 Wallet Credit</span>
                </div>
                <div className="text-xs text-slate-500 font-bold leading-relaxed">
                  Instant credit to your Playza wallet
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-1">
                  <span className="text-primary font-black">1,500</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    PZA
                  </span>
                </div>
                <button
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${user ? "bg-primary text-white hover:scale-105 shadow-glow" : "bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed"}`}
                >
                  {user ? "Redeem" : "Locked"}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl overflow-hidden border border-white/5 group bg-slate-100/50 dark:bg-white/5 transition-all hover:scale-[1.01]">
            <div className="h-32 bg-linear-to-br from-secondary/20 to-primary/20 flex items-center justify-center relative">
              <MdConfirmationNumber className="text-3xl md:text-5xl text-slate-500 opacity-20" />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-white">
                ENTRY TICKET
              </div>
            </div>
            <div className="p-2 md:p-6 space-y-4">
              <div>
                <div className="font-headline font-black text-sm md:text-lg text-slate-900 dark:text-white uppercase tracking-tight italic leading-none">
                  Free Arena Entry
                </div>
                <div className="text-xs text-slate-500 font-bold leading-relaxed">
                  One-time pass for any Pro Arena
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-1">
                  <span className="text-primary font-black">800</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    PZA
                  </span>
                </div>
                <button
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${user ? "bg-primary text-white hover:scale-105 shadow-glow" : "bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed"}`}
                >
                  {user ? "Redeem" : "Locked"}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl overflow-hidden border border-white/5 group bg-slate-100/50 dark:bg-white/5 transition-all hover:scale-[1.01]">
            <div className="h-32 bg-linear-to-br from-secondary/20 to-red-500/20 flex items-center justify-center relative">
              <MdLocalMall className="text-3xl md:text-5xl text-slate-500 opacity-20" />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-white">
                MERCH SHOP
              </div>
            </div>
            <div className="p-2 md:p-6 space-y-4">
              <div>
                <div className="font-headline font-black text-sm md:text-lg text-slate-900 dark:text-white uppercase tracking-tight italic leading-none">
                  25% Store Discount
                </div>
                <div className="text-xs text-slate-500 font-bold leading-relaxed">
                  Apply to any physical merchandise
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-1 text-slate-900 dark:text-white">
                  <span className="text-primary font-black">2,500</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    PZA
                  </span>
                </div>
                <button className="bg-slate-200 dark:bg-white/10 text-slate-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                  Insufficient
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Modal */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg glass-card rounded-xl overflow-hidden border border-white/10 shadow-2xl p-6 md:p-10 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setIsTierModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <MdClose className="text-base md:text-xl" />
            </button>

            <div className="mb-8">
              <h2 className="font-headline text-xl md:text-3xl font-black mb-2 flex items-center gap-2 md:gap-3 text-slate-900 dark:text-white uppercase italic tracking-tight">
                <MdMilitaryTech className="text-primary text-2xl md:text-4xl" />
                Tier System
              </h2>
              <p className="text-slate-500 font-bold text-xs md:text-sm leading-relaxed">
                Unlock higher multipliers and exclusive rewards as you earn more
                PZA.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {[
                {
                  name: "Bronze",
                  range: "0-999 PZA",
                  active: currentTier === "BRONZE",
                },
                {
                  name: "Silver",
                  range: "1k-5k PZA",
                  active: currentTier === "SILVER",
                },
                {
                  name: "Gold",
                  range: "5k-10k PZA",
                  active: currentTier === "GOLD",
                },
                {
                  name: "Platinum",
                  range: "10k+ PZA",
                  active: currentTier === "PLATINUM",
                },
              ].map((tier) => (
                <div
                  key={tier.name}
                  className={`glass-card p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${
                    tier.active
                      ? "border-primary bg-primary/10 shadow-lg scale-105"
                      : "border-white/5 opacity-60 bg-white/5"
                  }`}
                >
                  <MdMilitaryTech
                    className={`text-2xl ${
                      tier.name === "Bronze"
                        ? "text-amber-700"
                        : tier.name === "Silver"
                          ? "text-slate-300"
                          : tier.name === "Gold"
                            ? "text-yellow-400"
                            : "text-blue-300"
                    }`}
                  />
                  <div>
                    <div className="font-headline font-black text-sm uppercase text-slate-900 dark:text-white italic">
                      {tier.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      {tier.range}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsTierModalOpen(false)}
              className="w-full mt-10 bg-primary hover:bg-primary/90 text-white py-3 md:py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loyalty;
