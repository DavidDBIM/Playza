import { useState, type ReactElement } from "react";
import { useLoyaltyMe } from "@/hooks/loyalty/useLoyaltyMe";
import { useAuth } from "@/context/auth";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { LoyaltySkeleton } from "@/components/skeletons/LoyaltySkeleton";
import { useQueryClient } from "@tanstack/react-query";
import {
  MdCheckCircle, MdLock, MdMilitaryTech, MdAccountCircle,
  MdSportsEsports, MdAccountBalanceWallet, MdConfirmationNumber,
  MdLocalMall, MdClose, MdStars, MdEmojiEvents, MdGroups,
  MdVerified, MdPhonelinkRing, MdShoppingBag, MdOutlineForum,
  MdThumbUp, MdEvent, MdReportProblem, MdVideoLibrary, MdToken,
  MdLocalFireDepartment, MdArrowForward, MdOpenInNew,
} from "react-icons/md";
import { Zap, Trophy, Target, Flame, Star, Users, Shield, Gift } from "lucide-react";
import type { PzaEvent, ClaimedTask } from "@/api/loyalty.api";
import { claimStreakApi, claimTaskApi } from "@/api/loyalty.api";

interface Task {
  id: string;
  name: string;
  desc: string;
  points: number;
  icon: ReactElement;
  auto?: boolean;
  link?: string;
}

interface TaskCategory {
  id: string;
  label: string;
  icon: ReactElement;
  color: string;
  tasks: Task[];
}

const TASK_CATEGORIES: TaskCategory[] = [
  {
    id: "onboarding",
    label: "Getting Started",
    icon: <Target className="w-4 h-4" />,
    color: "blue",
    tasks: [
      { id: "signup", name: "Genesis Join", desc: "Join the Playza ecosystem", points: 5, icon: <MdStars />, auto: true },
      { id: "email_verified", name: "Verify Email", desc: "Confirm your email address", points: 10, icon: <MdVerified />, auto: true },
      { id: "phone_verified", name: "Verify Phone", desc: "Add and verify your phone number", points: 10, icon: <MdPhonelinkRing />, auto: true },
      { id: "profile_completed", name: "Complete Profile", desc: "Fill in your bio and details", points: 30, icon: <MdAccountCircle />, link: "/profile/settings" },
      { id: "avatar_uploaded", name: "Upload Avatar", desc: "Set your profile picture", points: 20, icon: <MdToken />, link: "/profile/settings" },
    ],
  },
  {
    id: "gameplay",
    label: "Play & Win",
    icon: <Zap className="w-4 h-4" />,
    color: "purple",
    tasks: [
      { id: "first_game_played", name: "First Match", desc: "Play your very first game", points: 200, icon: <MdSportsEsports />, link: "/games" },
      { id: "first_ticket_bought", name: "Buy First Ticket", desc: "Purchase a game entry ticket", points: 50, icon: <MdShoppingBag />, link: "/games" },
      { id: "match_completed", name: "Complete a Duel", desc: "Finish a competitive duel", points: 1000, icon: <MdSportsEsports />, link: "/h2h" },
      { id: "match_won", name: "Win a Match", desc: "Claim your first victory", points: 1000, icon: <MdEmojiEvents />, link: "/games" },
      { id: "win_streak_3", name: "Hot Streak", desc: "Win 3 matches in a row", points: 200, icon: <MdStars />, link: "/games" },
      { id: "five_games_played", name: "5 Games Played", desc: "Complete 5 total matches", points: 1000, icon: <MdSportsEsports />, link: "/games" },
      { id: "ten_games_played", name: "10 Games Played", desc: "Complete 10 total matches", points: 2000, icon: <MdSportsEsports />, link: "/games" },
    ],
  },
  {
    id: "tournaments",
    label: "Tournaments",
    icon: <Trophy className="w-4 h-4" />,
    color: "amber",
    tasks: [
      { id: "tournament_joined", name: "Join Tournament", desc: "Enter a scheduled tournament", points: 100, icon: <MdEvent />, link: "/tournaments" },
      { id: "tournament_finished", name: "Finish Tournament", desc: "Complete a full tournament", points: 1000, icon: <MdEmojiEvents />, link: "/tournaments" },
      { id: "tournament_won", name: "Win Tournament", desc: "Claim a tournament champion title", points: 2000, icon: <MdEmojiEvents />, link: "/tournaments" },
      { id: "weekend_challenge", name: "Weekend Challenge", desc: "Complete a weekend challenge event", points: 200, icon: <MdEvent />, link: "/tournaments" },
      { id: "holiday_tournament", name: "Holiday Event", desc: "Win a special holiday tournament", points: 500, icon: <MdEvent />, link: "/tournaments" },
      { id: "weekly_leaderboard_top", name: "Top Leaderboard", desc: "Reach top of weekly leaderboard", points: 1000, icon: <MdEmojiEvents />, link: "/leaderboard" },
    ],
  },
  {
    id: "referrals",
    label: "Refer Friends",
    icon: <Users className="w-4 h-4" />,
    color: "green",
    tasks: [
      { id: "referral_signed_up", name: "First Referral", desc: "Refer your first friend to Playza", points: 10, icon: <MdGroups />, link: "/referral" },
      { id: "referral_email_verified", name: "Referral Verified", desc: "Your referral verifies their email", points: 10, icon: <MdVerified />, link: "/referral" },
      { id: "referral_first_game", name: "Referral Plays", desc: "Your referral plays their first game", points: 200, icon: <MdSportsEsports />, link: "/referral" },
      { id: "referral_five_games", name: "Referral x5 Games", desc: "Your referral plays 5 games", points: 500, icon: <MdSportsEsports />, link: "/referral" },
      { id: "referral_ten_games", name: "Referral x10 Games", desc: "Your referral plays 10 games", points: 1000, icon: <MdSportsEsports />, link: "/referral" },
      { id: "referral_first_deposit", name: "Referral Deposits", desc: "Your referral makes first deposit", points: 200, icon: <MdAccountBalanceWallet />, link: "/referral" },
      { id: "referral_deposit_1k", name: "Referral ₦1k Deposit", desc: "Referral deposits over ₦1,000", points: 500, icon: <MdAccountBalanceWallet />, link: "/referral" },
      { id: "referral_deposit_10k", name: "Referral ₦10k Deposit", desc: "Referral deposits over ₦10,000", points: 5000, icon: <MdAccountBalanceWallet />, link: "/referral" },
      { id: "referral_milestone_1", name: "1 Referral", desc: "Reach first referral milestone", points: 5, icon: <MdGroups />, link: "/referral" },
      { id: "referral_milestone_10", name: "10 Referrals", desc: "Refer 10 active members", points: 50, icon: <MdGroups />, link: "/referral" },
      { id: "referral_milestone_50", name: "50 Referrals", desc: "Refer 50 active members", points: 200, icon: <MdGroups />, link: "/referral" },
      { id: "referral_milestone_100", name: "100 Referrals", desc: "Refer 100 active members", points: 500, icon: <MdGroups />, link: "/referral" },
      { id: "referral_milestone_500", name: "500 Referrals", desc: "Refer 500 active members", points: 1000, icon: <MdGroups />, link: "/referral" },
      { id: "referral_milestone_1000", name: "1,000 Referrals", desc: "Refer 1,000 active members", points: 5000, icon: <MdGroups />, link: "/referral" },
      { id: "referral_milestone_5000", name: "5,000 Referrals", desc: "Refer 5,000 active members", points: 10000, icon: <MdGroups />, link: "/referral" },
    ],
  },
  {
    id: "community",
    label: "Community",
    icon: <Shield className="w-4 h-4" />,
    color: "rose",
    tasks: [
      { id: "comment_on_match", name: "Comment on Match", desc: "Leave a comment on any match", points: 10, icon: <MdOutlineForum /> },
      { id: "like_share_content", name: "Like & Share", desc: "Like or share a platform event", points: 5, icon: <MdThumbUp /> },
      { id: "join_community_event", name: "Community Event", desc: "Join a community live event", points: 50, icon: <MdOutlineForum /> },
      { id: "valid_cheat_report", name: "Report Cheater", desc: "Submit a valid cheat report", points: 200, icon: <MdReportProblem /> },
      { id: "content_created", name: "Create Content", desc: "Create recognized content or art", points: 500, icon: <MdVideoLibrary /> },
      { id: "weekly_referral_campaign", name: "Referral Campaign", desc: "Win a weekly referral race", points: 100, icon: <MdStars /> },
    ],
  },
  {
    id: "ranks",
    label: "Rank Up",
    icon: <Star className="w-4 h-4" />,
    color: "cyan",
    tasks: [
      { id: "rank_bronze", name: "Bronze Rank", desc: "Reach the Bronze tier (0-999 PZA)", points: 500, icon: <MdMilitaryTech />, auto: true },
      { id: "rank_silver", name: "Silver Rank", desc: "Reach the Silver tier (1k-5k PZA)", points: 3000, icon: <MdMilitaryTech />, auto: true },
      { id: "rank_gold", name: "Gold Rank", desc: "Reach the Gold tier (5k-10k PZA)", points: 20000, icon: <MdMilitaryTech />, auto: true },
      { id: "rank_platinum", name: "Platinum Rank", desc: "Reach the Platinum tier (10k+ PZA)", points: 100000, icon: <MdMilitaryTech />, auto: true },
      { id: "streak_3_games", name: "3-Day Streak", desc: "Play 3 consecutive days", points: 30, icon: <Flame className="w-4 h-4" />, auto: true },
      { id: "streak_7_games", name: "7-Day Streak", desc: "Play 7 consecutive days", points: 80, icon: <Flame className="w-4 h-4" />, auto: true },
      { id: "streak_14_games", name: "14-Day Streak", desc: "Play 14 consecutive days", points: 150, icon: <Flame className="w-4 h-4" />, auto: true },
      { id: "streak_21_games", name: "21-Day Streak", desc: "Play 21 consecutive days", points: 250, icon: <Flame className="w-4 h-4" />, auto: true },
      { id: "streak_30_games", name: "30-Day Streak", desc: "Play 30 consecutive days", points: 500, icon: <Flame className="w-4 h-4" />, auto: true },
    ],
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-950/30",   text: "text-blue-600 dark:text-blue-400",   border: "border-blue-200 dark:border-blue-800",   badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" },
  purple: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800", badge: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300" },
  amber:  { bg: "bg-amber-50 dark:bg-amber-950/30",  text: "text-amber-600 dark:text-amber-400",  border: "border-amber-200 dark:border-amber-800",  badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300" },
  green:  { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300" },
  rose:   { bg: "bg-rose-50 dark:bg-rose-950/30",   text: "text-rose-600 dark:text-rose-400",   border: "border-rose-200 dark:border-rose-800",   badge: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300" },
  cyan:   { bg: "bg-cyan-50 dark:bg-cyan-950/30",   text: "text-cyan-600 dark:text-cyan-400",   border: "border-cyan-200 dark:border-cyan-800",   badge: "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300" },
};

const TIER_CONFIG = [
  { name: "Bronze",   min: 0,      max: 999,   color: "text-amber-700 dark:text-amber-600",  bg: "from-amber-100 to-amber-50 dark:from-amber-950/40 dark:to-amber-900/20",   border: "border-amber-200 dark:border-amber-800" },
  { name: "Silver",   min: 1000,   max: 4999,  color: "text-slate-500 dark:text-slate-400",  bg: "from-slate-100 to-slate-50 dark:from-slate-800/40 dark:to-slate-700/20",   border: "border-slate-300 dark:border-slate-600" },
  { name: "Gold",     min: 5000,   max: 9999,  color: "text-yellow-500 dark:text-yellow-400", bg: "from-yellow-100 to-yellow-50 dark:from-yellow-950/40 dark:to-yellow-900/20", border: "border-yellow-300 dark:border-yellow-700" },
  { name: "Platinum", min: 10000,  max: Infinity, color: "text-blue-500 dark:text-blue-400",  bg: "from-blue-100 to-blue-50 dark:from-blue-950/40 dark:to-blue-900/20",     border: "border-blue-300 dark:border-blue-700" },
];

const STORE_ITEMS = [
  { name: "Wallet Credit ₦500",     desc: "Instant credit to your Playza wallet",   cost: 1500, icon: <MdAccountBalanceWallet className="w-6 h-6" />, color: "blue" },
  { name: "Free Arena Entry",        desc: "One-time pass for any Pro Arena game",    cost: 800,  icon: <MdConfirmationNumber className="w-6 h-6" />, color: "purple" },
  { name: "25% Merch Discount",      desc: "Apply to any physical merchandise",       cost: 2500, icon: <MdLocalMall className="w-6 h-6" />, color: "green" },
  { name: "Double PZA (24h)",        desc: "2x PZA points for 24 hours",             cost: 3000, icon: <MdStars className="w-6 h-6" />, color: "amber" },
];

const STREAK_REWARDS = [
  { day: 1, pts: 10 }, { day: 2, pts: 10 }, { day: 3, pts: 30 },
  { day: 4, pts: 10 }, { day: 5, pts: 10 }, { day: 6, pts: 10 }, { day: 7, pts: 80 },
];

export default function Loyalty() {
  const { user } = useAuth();
  const { data: loyaltyData, isLoading, refetch } = useLoyaltyMe();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState("onboarding");
  const [claimingStreak, setClaimingStreak] = useState(false);
  const [claimingTask, setClaimingTask] = useState<string | null>(null);
  const [tierModal, setTierModal] = useState(false);

  if (user && isLoading) return <LoyaltySkeleton />;

  const totalPoints = loyaltyData?.total_points ?? 0;
  const streakDays = loyaltyData?.streak_days ?? 0;
  const canClaimStreak = loyaltyData?.can_claim_streak_today ?? false;
  const claimedTaskIds = new Set((loyaltyData?.claimed_tasks ?? []).map((t: ClaimedTask) => t.task_id));
  const completedEventTypes = new Set((loyaltyData?.recent_events ?? []).map((e: PzaEvent) => e.event_type));

  const currentTier = TIER_CONFIG.find(t => totalPoints >= t.min && totalPoints <= t.max) || TIER_CONFIG[0];
  const nextTier = TIER_CONFIG.find(t => t.min > totalPoints);
  const progressPct = nextTier ? Math.min(100, Math.round((totalPoints / nextTier.min) * 100)) : 100;

  const activeCategory_ = TASK_CATEGORIES.find(c => c.id === activeCategory)!;
  const colorStyles = COLOR_MAP[activeCategory_.color];

  const completedCount = activeCategory_.tasks.filter(t => claimedTaskIds.has(t.id) || completedEventTypes.has(t.id)).length;
  const totalTasksInCategory = activeCategory_.tasks.length;

  async function claimStreak() {
    setClaimingStreak(true);
    try {
      await claimStreakApi();
      await refetch();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setClaimingStreak(false);
    }
  }

  async function claimTask(taskId: string, points: number) {
    setClaimingTask(taskId);
    try {
      await claimTaskApi(taskId, points);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['loyalty', 'me'] });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setClaimingTask(null);
    }
  }

  function getTaskStatus(task: Task): 'completed' | 'claimable' | 'active' | 'locked' {
    if (claimedTaskIds.has(task.id)) return 'completed';
    if (completedEventTypes.has(task.id)) return 'claimable';
    if (task.auto) return 'locked';
    return 'active';
  }

  // Sort: completed last, claimable first, then active
  const sortedTasks = [...activeCategory_.tasks].sort((a, b) => {
    const order = { claimable: 0, active: 1, locked: 2, completed: 3 };
    return order[getTaskStatus(a)] - order[getTaskStatus(b)];
  });

  if (!user) return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800">
          <MdStars className="text-4xl text-blue-600 dark:text-blue-400" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">PZA Rewards</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Complete tasks, build streaks, earn PZA points and unlock exclusive rewards.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/registration?view=signup" className="flex-1"><Button className="w-full h-12 font-bold rounded-xl">Join Now</Button></Link>
          <Link to="/registration?view=login" className="flex-1"><Button variant="outline" className="w-full h-12 font-bold rounded-xl border-slate-200 dark:border-slate-700">Log In</Button></Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 space-y-6 pb-20 max-w-5xl mx-auto w-full">

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* PZA Balance Card */}
        <div className="md:col-span-2 bg-linear-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Your PZA Balance</p>
              <p className="text-5xl font-black tracking-tight">{totalPoints.toLocaleString()}</p>
              <p className="text-blue-200 text-sm font-bold mt-1">PZA Points</p>
            </div>
            <button onClick={() => setTierModal(true)} className="bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
              {currentTier.name} <MdMilitaryTech className="text-base" />
            </button>
          </div>
          {nextTier && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs text-blue-200 font-medium">
                <span>{currentTier.name}</span>
                <span>{totalPoints.toLocaleString()} / {nextTier.min.toLocaleString()} PZA → {nextTier.name}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Streak Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MdLocalFireDepartment className="text-orange-500 text-xl" />
              <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Daily Streak</span>
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{streakDays}<span className="text-sm font-bold text-slate-500 ml-1">days</span></span>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {STREAK_REWARDS.map((s, i) => {
              const done = i < streakDays;
              const today = i === streakDays && canClaimStreak;
              return (
                <div key={i} className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-center transition-all ${done ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800' : today ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 ring-1 ring-blue-400' : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-50'}`}>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">D{s.day}</span>
                  {done ? <MdCheckCircle className="text-orange-500 text-sm" /> : today ? <MdLocalFireDepartment className="text-blue-500 text-sm" /> : <MdLock className="text-slate-400 text-sm" />}
                  <span className="text-[8px] font-black text-slate-600 dark:text-slate-300">+{s.pts}</span>
                </div>
              );
            })}
          </div>
          <button onClick={claimStreak} disabled={!canClaimStreak || claimingStreak}
            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${canClaimStreak ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}>
            {claimingStreak ? 'Claiming…' : canClaimStreak ? '🔥 Claim Daily Reward' : '✓ Claimed Today'}
          </button>
        </div>
      </div>

      {/* Task Categories + Tasks */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Category Tabs */}
        <div className="border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
          <div className="flex min-w-max px-4">
            {TASK_CATEGORIES.map(cat => {
              const catColor = COLOR_MAP[cat.color];
              const isActive = activeCategory === cat.id;
              const catCompleted = cat.tasks.filter(t => claimedTaskIds.has(t.id) || completedEventTypes.has(t.id)).length;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${isActive ? `${catColor.text} border-current` : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'}`}>
                  {cat.icon}
                  {cat.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${isActive ? catColor.badge : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {catCompleted}/{cat.tasks.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Header */}
        <div className={`px-5 py-4 ${colorStyles.bg} border-b ${colorStyles.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${colorStyles.badge} flex items-center justify-center`}>
                {activeCategory_.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{activeCategory_.label}</h3>
                <p className={`text-xs font-medium ${colorStyles.text}`}>{completedCount} of {totalTasksInCategory} tasks completed</p>
              </div>
            </div>
            <div className="h-1.5 w-28 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${colorStyles.text.replace('text-', 'bg-')}`} style={{ width: `${totalTasksInCategory > 0 ? (completedCount / totalTasksInCategory) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sortedTasks.map((task) => {
            const status = getTaskStatus(task);
            const isClaiming = claimingTask === task.id;
            const isCompleted = status === 'completed';
            const isClaimable = status === 'claimable';
            const isLocked = status === 'locked';

            return (
              <div key={task.id} className={`flex items-center gap-4 px-5 py-4 transition-all ${isCompleted ? 'opacity-60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : isClaimable ? `${colorStyles.badge}` : isLocked ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : `${colorStyles.badge}`}`}>
                  {isCompleted ? <MdCheckCircle /> : task.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-sm ${isCompleted ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-900 dark:text-white'}`}>{task.name}</span>
                    {isClaimable && <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-pulse">Ready to claim!</span>}
                    {isLocked && <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><MdLock className="text-xs" />Auto-tracked</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{task.desc}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className={`font-black text-sm ${colorStyles.text}`}>+{task.points.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-medium">PZA</p>
                  </div>

                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <MdCheckCircle className="text-emerald-500 text-lg" />
                    </div>
                  ) : isClaimable ? (
                    <button onClick={() => claimTask(task.id, task.points)} disabled={isClaiming}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-sm shadow-emerald-500/30">
                      {isClaiming ? '…' : 'Claim'}
                    </button>
                  ) : isLocked ? (
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <MdLock className="text-slate-400 text-sm" />
                    </div>
                  ) : task.link ? (
                    <Link to={task.link}>
                      <button className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${colorStyles.badge} hover:opacity-80`}>
                        Go <MdArrowForward className="text-sm" />
                      </button>
                    </Link>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <MdOpenInNew className="text-slate-400 text-sm" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Redemption Store */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h2 className="font-bold text-slate-900 dark:text-white">Redemption Store</h2>
          </div>
          <Link to="/leaderboard?tab=Loyalty" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            Reward Leaderboard <MdArrowForward className="text-sm" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STORE_ITEMS.map((item, i) => {
            const col = COLOR_MAP[item.color];
            const canAfford = totalPoints >= item.cost;
            return (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${col.badge} flex items-center justify-center`}>
                  <span className={col.text}>{item.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className={`font-black text-sm ${col.text}`}>{item.cost.toLocaleString()} <span className="text-slate-400 font-medium text-xs">PZA</span></div>
                  <button disabled={!canAfford} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${canAfford ? `${col.badge} hover:opacity-80` : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
                    {canAfford ? 'Redeem' : 'Need more'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier Modal */}
      {tierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setTierModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">PZA Tier System</h3>
              <button onClick={() => setTierModal(false)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"><MdClose /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TIER_CONFIG.map(tier => {
                const active = totalPoints >= tier.min && totalPoints <= tier.max;
                return (
                  <div key={tier.name} className={`bg-linear-to-br ${tier.bg} border ${tier.border} rounded-xl p-4 ${active ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}>
                    <MdMilitaryTech className={`text-2xl ${tier.color} mb-2`} />
                    <p className={`font-black text-sm ${tier.color}`}>{tier.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {tier.max === Infinity ? `${tier.min.toLocaleString()}+ PZA` : `${tier.min.toLocaleString()} – ${tier.max.toLocaleString()} PZA`}
                    </p>
                    {active && <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 mt-2 block">← Current</span>}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setTierModal(false)} className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}
