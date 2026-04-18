import { useState, useEffect, useCallback, type ReactElement } from "react";
import { useLoyaltyMe } from "@/hooks/loyalty/useLoyaltyMe";
import { useAuth } from "@/context/auth";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { LoyaltySkeleton } from "@/components/skeletons/LoyaltySkeleton";
import {
  MdCheckCircle, MdLock, MdMilitaryTech, MdAccountCircle,
  MdSportsEsports, MdAccountBalanceWallet,
  MdStars, MdEmojiEvents, MdGroups,
  MdVerified, MdPhonelinkRing, MdShoppingBag, MdOutlineForum,
  MdThumbUp, MdEvent, MdReportProblem, MdVideoLibrary, MdToken,
  MdLocalFireDepartment, MdArrowForward, MdOpenInNew, MdClose,
} from "react-icons/md";
import { Zap, Trophy, Target, Flame, Star, Users, Shield } from "lucide-react";
import type { PzaEvent, ClaimedTask } from "@/api/loyalty.api";
import { useClaimStreak } from "@/hooks/loyalty/useClaimStreak";
import { useClaimTask } from "@/hooks/loyalty/useClaimTask";
import { RewardsSection } from "@/components/loyalty/RewardsSection";

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
      { id: "SIGNUP", name: "Genesis Join", desc: "Join the Playza ecosystem", points: 5, icon: <MdStars />, auto: true },
      { id: "EMAIL_VERIFIED", name: "Verify Email", desc: "Confirm your email address", points: 10, icon: <MdVerified />, auto: true },
      { id: "PHONE_VERIFIED", name: "Verify Phone", desc: "Add and verify your phone number", points: 10, icon: <MdPhonelinkRing />, auto: true },
      { id: "PROFILE_COMPLETED", name: "Complete Profile", desc: "Fill in your bio and details", points: 30, icon: <MdAccountCircle />, link: "/profile/settings" },
      { id: "AVATAR_UPLOADED", name: "Upload Avatar", desc: "Set your profile picture", points: 20, icon: <MdToken />, link: "/profile/settings" },
    ],
  },
  {
    id: "gameplay",
    label: "Play & Win",
    icon: <Zap className="w-4 h-4" />,
    color: "purple",
    tasks: [
      { id: "FIRST_GAME_PLAYED", name: "First Match", desc: "Play your very first game", points: 200, icon: <MdSportsEsports />, link: "/games" },
      { id: "FIRST_TICKET_BOUGHT", name: "Buy First Ticket", desc: "Purchase a game entry ticket", points: 50, icon: <MdShoppingBag />, link: "/games" },
      { id: "MATCH_COMPLETED", name: "Complete a Duel", desc: "Finish a competitive duel", points: 1000, icon: <MdSportsEsports />, link: "/h2h" },
      { id: "MATCH_WON", name: "Win a Match", desc: "Claim your first victory", points: 1000, icon: <MdEmojiEvents />, link: "/games" },
      { id: "WIN_STREAK_3", name: "Hot Streak", desc: "Win 3 matches in a row", points: 200, icon: <MdStars />, link: "/games" },
      { id: "FIVE_GAMES_PLAYED", name: "5 Games Played", desc: "Complete 5 total matches", points: 1000, icon: <MdSportsEsports />, link: "/games" },
      { id: "TEN_GAMES_PLAYED", name: "10 Games Played", desc: "Complete 10 total matches", points: 2000, icon: <MdSportsEsports />, link: "/games" },
    ],
  },
  {
    id: "tournaments",
    label: "Tournaments",
    icon: <Trophy className="w-4 h-4" />,
    color: "amber",
    tasks: [
      { id: "TOURNAMENT_JOINED", name: "Join Tournament", desc: "Enter a scheduled tournament", points: 100, icon: <MdEvent />, link: "/tournaments" },
      { id: "TOURNAMENT_FINISHED", name: "Finish Tournament", desc: "Complete a full tournament", points: 1000, icon: <MdEmojiEvents />, link: "/tournaments" },
      { id: "TOURNAMENT_WON", name: "Win Tournament", desc: "Claim a tournament champion title", points: 2000, icon: <MdEmojiEvents />, link: "/tournaments" },
      { id: "WEEKEND_CHALLENGE", name: "Weekend Challenge", desc: "Complete a weekend challenge event", points: 200, icon: <MdEvent />, link: "/tournaments" },
      { id: "HOLIDAY_TOURNAMENT", name: "Holiday Event", desc: "Win a special holiday tournament", points: 500, icon: <MdEvent />, link: "/tournaments" },
      { id: "WEEKLY_LEADERBOARD_TOP", name: "Top Leaderboard", desc: "Reach top of weekly leaderboard", points: 1000, icon: <MdEmojiEvents />, link: "/leaderboard" },
    ],
  },
  {
    id: "referrals",
    label: "Refer Friends",
    icon: <Users className="w-4 h-4" />,
    color: "green",
    tasks: [
      { id: "REFERRAL_SIGNED_UP", name: "First Referral", desc: "Refer your first friend to Playza", points: 10, icon: <MdGroups />, link: "/referral" },
      { id: "REFERRAL_EMAIL_VERIFIED", name: "Referral Verified", desc: "Your referral verifies their email", points: 10, icon: <MdVerified />, link: "/referral" },
      { id: "REFERRAL_FIRST_GAME", name: "Referral Plays", desc: "Your referral plays their first game", points: 200, icon: <MdSportsEsports />, link: "/referral" },
      { id: "REFERRAL_FIVE_GAMES", name: "Referral x5 Games", desc: "Your referral plays 5 games", points: 500, icon: <MdSportsEsports />, link: "/referral" },
      { id: "REFERRAL_TEN_GAMES", name: "Referral x10 Games", desc: "Your referral plays 10 games", points: 1000, icon: <MdSportsEsports />, link: "/referral" },
      { id: "REFERRAL_FIRST_DEPOSIT", name: "Referral Deposits", desc: "Your referral makes first deposit", points: 200, icon: <MdAccountBalanceWallet />, link: "/referral" },
      { id: "REFERRAL_DEPOSIT_1K", name: "Referral ₦1k Deposit", desc: "Referral deposits over ₦1,000", points: 500, icon: <MdAccountBalanceWallet />, link: "/referral" },
      { id: "REFERRAL_DEPOSIT_10K", name: "Referral ₦10k Deposit", desc: "Referral deposits over ₦10,000", points: 5000, icon: <MdAccountBalanceWallet />, link: "/referral" },
      { id: "REFERRAL_MILESTONE_1", name: "1 Referral", desc: "Reach first referral milestone", points: 5, icon: <MdGroups />, link: "/referral" },
      { id: "REFERRAL_MILESTONE_10", name: "10 Referrals", desc: "Refer 10 active members", points: 50, icon: <MdGroups />, link: "/referral" },
      { id: "REFERRAL_MILESTONE_50", name: "50 Referrals", desc: "Refer 50 active members", points: 200, icon: <MdGroups />, link: "/referral" },
      { id: "REFERRAL_MILESTONE_100", name: "100 Referrals", desc: "Refer 100 active members", points: 500, icon: <MdGroups />, link: "/referral" },
      { id: "REFERRAL_MILESTONE_500", name: "500 Referrals", desc: "Refer 500 active members", points: 1000, icon: <MdGroups />, link: "/referral" },
      { id: "REFERRAL_MILESTONE_1000", name: "1,000 Referrals", desc: "Refer 1,000 active members", points: 5000, icon: <MdGroups />, link: "/referral" },
      { id: "REFERRAL_MILESTONE_5000", name: "5,000 Referrals", desc: "Refer 5,000 active members", points: 10000, icon: <MdGroups />, link: "/referral" },
    ],
  },
  {
    id: "community",
    label: "Community",
    icon: <Shield className="w-4 h-4" />,
    color: "rose",
    tasks: [
      { id: "MATCH_COMMENT", name: "Comment on Match", desc: "Leave a comment on any match", points: 10, icon: <MdOutlineForum /> },
      { id: "CONTENT_LIKED_SHARED", name: "Like & Share", desc: "Like or share a platform event", points: 5, icon: <MdThumbUp /> },
      { id: "COMMUNITY_EVENT_JOINED", name: "Community Event", desc: "Join a community live event", points: 50, icon: <MdOutlineForum /> },
      { id: "CHEATER_REPORTED", name: "Report Cheater", desc: "Submit a valid cheat report", points: 200, icon: <MdReportProblem /> },
      { id: "CONTENT_CREATED", name: "Create Content", desc: "Create recognized content or art", points: 500, icon: <MdVideoLibrary /> },
      { id: "REFERRAL_CAMPAIGN_JOINED", name: "Referral Campaign", desc: "Win a weekly referral race", points: 100, icon: <MdStars /> },
    ],
  },
  {
    id: "ranks",
    label: "Rank Up",
    icon: <Star className="w-4 h-4" />,
    color: "cyan",
    tasks: [
      { id: "RANK_BRONZE", name: "Bronze Rank", desc: "Reach Bronze tier (0 - 4,999 PZA)", points: 500, icon: <MdMilitaryTech />, auto: true },
      { id: "RANK_SILVER", name: "Silver Rank", desc: "Reach Silver tier (5,000 - 24,999 PZA)", points: 3000, icon: <MdMilitaryTech />, auto: true },
      { id: "RANK_GOLD", name: "Gold Rank", desc: "Reach Gold tier (25,000 - 99,999 PZA)", points: 20000, icon: <MdMilitaryTech />, auto: true },
      { id: "RANK_PLATINUM", name: "Platinum Rank", desc: "Reach Platinum tier (100,000+ PZA)", points: 100000, icon: <MdMilitaryTech />, auto: true },
      { id: "STREAK_3_GAMES", name: "3-Day Streak", desc: "Play 3 consecutive days", points: 30, icon: <Flame className="w-4 h-4" />, auto: true },
      { id: "STREAK_7_GAMES", name: "7-Day Streak", desc: "Play 7 consecutive days", points: 80, icon: <Flame className="w-4 h-4" />, auto: true },
      { id: "STREAK_14_GAMES", name: "14-Day Streak", desc: "Play 14 consecutive days", points: 150, icon: <Flame className="w-4 h-4" />, auto: true },
      { id: "STREAK_21_GAMES", name: "21-Day Streak", desc: "Play 21 consecutive days", points: 250, icon: <Flame className="w-4 h-4" />, auto: true },
      { id: "STREAK_30_GAMES", name: "30-Day Streak", desc: "Play 30 consecutive days", points: 500, icon: <Flame className="w-4 h-4" />, auto: true },
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
  { name: "Bronze",   min: 0,       max: 4999,    color: "text-amber-700 dark:text-amber-600",  bg: "from-amber-100 to-amber-50 dark:from-amber-950/40 dark:to-amber-900/20",   border: "border-amber-200 dark:border-amber-800" },
  { name: "Silver",   min: 5000,    max: 24999,   color: "text-slate-500 dark:text-slate-400",  bg: "from-slate-100 to-slate-50 dark:from-slate-800/40 dark:to-slate-700/20",   border: "border-slate-300 dark:border-slate-600" },
  { name: "Gold",     min: 25000,   max: 99999,   color: "text-yellow-500 dark:text-yellow-400", bg: "from-yellow-100 to-yellow-50 dark:from-yellow-950/40 dark:to-yellow-900/20", border: "border-yellow-300 dark:border-yellow-700" },
  { name: "Platinum", min: 100000,  max: Infinity, color: "text-blue-500 dark:text-blue-400",  bg: "from-blue-100 to-blue-50 dark:from-blue-950/40 dark:to-blue-900/20",     border: "border-blue-300 dark:border-blue-700" },
];


// Points awarded per day position within any 7-day cycle
// Days 3 and 7 are bonus days; everything else is the base 10
function getStreakPtsForDay(absoluteDay: number): number {
  const pos = absoluteDay % 7; // 0 = day 7 slot, 1 = day 1 slot, etc.
  if (pos === 0) return 80;    // every 7th day
  if (pos === 3) return 30;    // every 3rd day
  return 10;
}

// Build a 7-cell window centred on the user's current streak position.
// Cells 0-streakDays are "done", the next cell is "today", rest are locked.
function buildStreakWindow(streakDays: number) {
  // Show days (streakDays - 2) through (streakDays + 4), clamped to min 1
  const windowStart = Math.max(1, streakDays - 2);
  return Array.from({ length: 7 }, (_, i) => {
    const absoluteDay = windowStart + i;
    return { day: absoluteDay, pts: getStreakPtsForDay(absoluteDay) };
  });
}

export default function Loyalty() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: loyaltyData, isLoading: loyaltyLoading, refetch: refetchLoyalty } = useLoyaltyMe();
  const { mutate: performClaimStreak, isPending: claimingStreak } = useClaimStreak();
  const { mutate: performClaimTask, isPending: isMutationPending, variables: mutationVariables } = useClaimTask();
  const [activeCategory, setActiveCategory] = useState("onboarding");
  const [tierModal, setTierModal] = useState(false);
  const [countdown, setCountdown] = useState<string>('');

  const lastClaimedAt = loyaltyData?.last_claimed_at ?? null;
  const totalPoints = loyaltyData?.total_points ?? 0;
  const streakDays = loyaltyData?.streak_days ?? 0;
  const canClaimStreak = loyaltyData?.can_claim_streak_today ?? false;
  const spinsLeftToday = loyaltyData?.spins_left_today ?? 3;
  const claimedTaskIds = new Set((loyaltyData?.claimed_tasks ?? []).map((t: ClaimedTask) => t.task_id));
  const completedEventTypes = new Set((loyaltyData?.recent_events ?? []).map((e: PzaEvent) => e.event_type));

  const computeCountdown = useCallback(() => {
    if (canClaimStreak || !lastClaimedAt) return '';
    let parsedDate = lastClaimedAt;
    if (!parsedDate.includes('Z') && !parsedDate.includes('+')) {
      parsedDate = parsedDate.replace(' ', 'T') + 'Z';
    }
    const last = new Date(parsedDate);
    const next = new Date(last.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = next.getTime() - now.getTime();
    
    if (diff <= 0) return '00:00:00';
    
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }, [lastClaimedAt, canClaimStreak]);

  useEffect(() => {
    const update = () => setCountdown(computeCountdown());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [computeCountdown]);

  if (authLoading || (user && loyaltyLoading)) return <LoyaltySkeleton />;

  const currentTier = TIER_CONFIG.find(t => totalPoints >= t.min && totalPoints <= t.max) || TIER_CONFIG[0];
  const nextTier = TIER_CONFIG.find(t => t.min > totalPoints);
  const progressPct = nextTier ? Math.min(100, Math.round((totalPoints / nextTier.min) * 100)) : 100;

  const activeCategory_ = TASK_CATEGORIES.find(c => c.id === activeCategory)!;
  const colorStyles = COLOR_MAP[activeCategory_.color];

  const completedCount = activeCategory_.tasks.filter(t => claimedTaskIds.has(t.id) || completedEventTypes.has(t.id)).length;
  const totalTasksInCategory = activeCategory_.tasks.length;

  async function claimStreak() {
    performClaimStreak(undefined, {
      onSuccess: () => {},
      onError: (err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Failed to claim reward";
        alert(msg);
      },
    });
  }

  async function claimTask(taskId: string) {
    performClaimTask(taskId, {
      onSuccess: () => {},
      onError: (err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Failed to claim reward";
        alert(msg);
      },
    });
  }

  function getTaskStatus(
    task: Task,
  ): "completed" | "claimable" | "active" | "locked" {
    if (claimedTaskIds.has(task.id)) return "completed";
    if (completedEventTypes.has(task.id)) return "claimable";
    if (task.auto) return "locked";
    return "active";
  }

  // Sort: completed last, claimable first, then active
  const sortedTasks = [...activeCategory_.tasks].sort((a, b) => {
    const order = { claimable: 0, active: 1, locked: 2, completed: 3 };
    return order[getTaskStatus(a)] - order[getTaskStatus(b)];
  });

  if (!user)
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800">
            <MdStars className="text-4xl text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              PZA Rewards
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Complete tasks, build streaks, earn PZA points and unlock
              exclusive rewards.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/registration?view=signup" className="flex-1">
              <Button className="w-full h-12 font-bold rounded-xl">
                Join Now
              </Button>
            </Link>
            <Link to="/registration?view=login" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-12 font-bold rounded-xl border-slate-200 dark:border-slate-700"
              >
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex-1 space-y-6 pb-20 mx-auto w-full">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* PZA Balance Card */}
        <div className="md:col-span-2 bg-linear-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">
                Your PZA Balance
              </p>
              <p className="text-5xl font-black tracking-tight">
                {totalPoints.toLocaleString()}
              </p>
              <p className="text-blue-200 text-sm font-bold mt-1">PZA Points</p>
            </div>
            <button
              onClick={() => setTierModal(true)}
              className="bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              {currentTier.name} <MdMilitaryTech className="text-base" />
            </button>
          </div>
          {nextTier && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs text-blue-200 font-medium">
                <span>{currentTier.name}</span>
                <span>
                  {totalPoints.toLocaleString()} /{" "}
                  {nextTier.min.toLocaleString()} PZA → {nextTier.name}
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Streak Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MdLocalFireDepartment className="text-orange-500 text-xl" />
              <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                Daily Streak
              </span>
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {streakDays}
              <span className="text-sm font-bold text-slate-500 ml-1">
                days
              </span>
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {buildStreakWindow(streakDays).map((s, i) => {
              // A cell is "done" if its absolute day number is <= streakDays
              // and the user has already claimed today (or it's a past day)
              const isDone =
                s.day < streakDays || (s.day === streakDays && !canClaimStreak);
              const isToday = s.day === streakDays && canClaimStreak;
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-center transition-all ${
                    isDone
                      ? "bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800"
                      : isToday
                        ? "bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 ring-1 ring-blue-400"
                        : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-50"
                  }`}
                >
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                    D{s.day}
                  </span>
                  {isDone ? (
                    <MdCheckCircle className="text-orange-500 text-sm" />
                  ) : isToday ? (
                    <MdLocalFireDepartment className="text-blue-500 text-sm animate-pulse" />
                  ) : (
                    <MdLock className="text-slate-400 text-sm" />
                  )}
                  <span className="text-[8px] font-black text-slate-600 dark:text-slate-300">
                    +{s.pts}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            onClick={claimStreak}
            disabled={!canClaimStreak || claimingStreak}
            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${canClaimStreak ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"}`}
          >
            {claimingStreak ? (
              "Claiming…"
            ) : canClaimStreak ? (
              "🔥 Claim Daily Reward"
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>✓ Claimed! Next in</span>
                <span className="font-mono font-black text-blue-500 dark:text-blue-400">
                  {countdown || "00:00:00"}
                </span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Task Categories + Tasks */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Category Tabs */}
        <div className="border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
          <div className="flex min-w-max px-4">
            {TASK_CATEGORIES.map((cat) => {
              const catColor = COLOR_MAP[cat.color];
              const isActive = activeCategory === cat.id;
              const catCompleted = cat.tasks.filter(
                (t) =>
                  claimedTaskIds.has(t.id) || completedEventTypes.has(t.id),
              ).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${isActive ? `${catColor.text} border-current` : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  {cat.icon}
                  {cat.label}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${isActive ? catColor.badge : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}
                  >
                    {catCompleted}/{cat.tasks.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Header */}
        <div
          className={`px-5 py-4 ${colorStyles.bg} border-b ${colorStyles.border}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg ${colorStyles.badge} flex items-center justify-center`}
              >
                {activeCategory_.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {activeCategory_.label}
                </h3>
                <p className={`text-xs font-medium ${colorStyles.text}`}>
                  {completedCount} of {totalTasksInCategory} tasks completed
                </p>
              </div>
            </div>
            <div className="h-1.5 w-28 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${colorStyles.text.replace("text-", "bg-")}`}
                style={{
                  width: `${totalTasksInCategory > 0 ? (completedCount / totalTasksInCategory) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sortedTasks.map((task) => {
            const status = getTaskStatus(task);
            const isClaiming =
              isMutationPending && mutationVariables === task.id;
            const isCompleted = status === "completed";
            const isClaimable = status === "claimable";
            const isLocked = status === "locked";

            return (
              <div
                key={task.id}
                className={`flex items-center gap-4 px-5 py-4 transition-all ${isCompleted ? "opacity-60" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${isCompleted ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : isClaimable ? `${colorStyles.badge}` : isLocked ? "bg-slate-100 dark:bg-slate-800 text-slate-400" : `${colorStyles.badge}`}`}
                >
                  {isCompleted ? <MdCheckCircle /> : task.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-bold text-sm ${isCompleted ? "text-slate-400 dark:text-slate-600 line-through" : "text-slate-900 dark:text-white"}`}
                    >
                      {task.name}
                    </span>
                    {isClaimable && (
                      <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-pulse">
                        Ready to claim!
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <MdLock className="text-xs" />
                        Auto-tracked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {task.desc}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className={`font-black text-sm ${colorStyles.text}`}>
                      +{task.points.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      PZA
                    </p>
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold">
                      <MdCheckCircle className="text-sm" /> Claimed
                    </div>
                  ) : isClaimable ? (
                    <button
                      onClick={() => claimTask(task.id)}
                      disabled={isClaiming}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-sm shadow-emerald-500/30"
                    >
                      {isClaiming ? "Claiming..." : "Claim"}
                    </button>
                  ) : isLocked ? (
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <MdLock className="text-slate-400 text-sm" />
                    </div>
                  ) : task.link ? (
                    <Link to={task.link}>
                      <button
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${colorStyles.badge} hover:opacity-80`}
                      >
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

      {/* Rewards Hub */}
      <RewardsSection
        totalPoints={totalPoints}
        spinsLeftToday={spinsLeftToday}
        onPointsChanged={refetchLoyalty}
      />

      {/* Tier Modal */}
      {tierModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setTierModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                PZA Tier System
              </h3>
              <button
                onClick={() => setTierModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <MdClose />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TIER_CONFIG.map((tier) => {
                const active =
                  totalPoints >= tier.min && totalPoints <= tier.max;
                return (
                  <div
                    key={tier.name}
                    className={`bg-linear-to-br ${tier.bg} border ${tier.border} rounded-xl p-4 ${active ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}`}
                  >
                    <MdMilitaryTech className={`text-2xl ${tier.color} mb-2`} />
                    <p className={`font-black text-sm ${tier.color}`}>
                      {tier.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {tier.max === Infinity
                        ? `${tier.min.toLocaleString()}+ PZA`
                        : `${tier.min.toLocaleString()} – ${tier.max.toLocaleString()} PZA`}
                    </p>
                    {active && (
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 mt-2 block">
                        ← Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setTierModal(false)}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
