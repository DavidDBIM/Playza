import React from "react";
import {
  MdEmojiEvents, MdLock, MdCheckCircle, MdGrade, MdStars,
  MdLocalFireDepartment, MdGroup, MdAccountBalanceWallet,
} from "react-icons/md";
import { useGameHistory, useProfile } from "@/hooks/profile/useProfile";
import type { GameHistoryItem } from "@/api/profile.api";

// ─── Achievement definitions ──────────────────────────────────────────────────
// Each achievement derives its progress from real profile/history data
interface AchievementDef {
  id: string;
  title: string;
  description: string;
  total: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  category: "Gaming" | "Social" | "Financial";
  icon: React.ReactNode;
  getProgress: (ctx: AchievementContext) => number;
}

interface AchievementContext {
  totalGames: number;
  totalWins: number;
  totalEarned: number;
  highestScore: number;
  referralCount: number;
  longestWinStreak: number;
  pzaPoints: number;
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first_blood",
    title: "First Blood",
    description: "Win your very first competitive match.",
    total: 1, rarity: "Common", category: "Gaming",
    icon: <MdStars className="text-slate-400 text-xl md:text-3xl" />,
    getProgress: ctx => Math.min(ctx.totalWins, 1),
  },
  {
    id: "ten_games",
    title: "Getting Started",
    description: "Play 10 competitive games.",
    total: 10, rarity: "Common", category: "Gaming",
    icon: <MdEmojiEvents className="text-blue-300 text-xl md:text-3xl" />,
    getProgress: ctx => Math.min(ctx.totalGames, 10),
  },
  {
    id: "century_club",
    title: "Century Club",
    description: "Complete 100 competitive games.",
    total: 100, rarity: "Rare", category: "Gaming",
    icon: <MdEmojiEvents className="text-blue-400 text-xl md:text-3xl" />,
    getProgress: ctx => Math.min(ctx.totalGames, 100),
  },
  {
    id: "hot_streak",
    title: "Hot Streak",
    description: "Win 5 matches in a row.",
    total: 5, rarity: "Rare", category: "Gaming",
    icon: <MdLocalFireDepartment className="text-orange-500 text-xl md:text-3xl" />,
    getProgress: ctx => Math.min(ctx.longestWinStreak, 5),
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    description: "Win 10 matches in a row.",
    total: 10, rarity: "Epic", category: "Gaming",
    icon: <MdLocalFireDepartment className="text-red-500 text-xl md:text-3xl" />,
    getProgress: ctx => Math.min(ctx.longestWinStreak, 10),
  },
  {
    id: "high_scorer",
    title: "High Scorer",
    description: "Achieve a score of over 20,000 in any game.",
    total: 20000, rarity: "Epic", category: "Gaming",
    icon: <MdGrade className="text-emerald-400 text-xl md:text-3xl" />,
    getProgress: ctx => Math.min(ctx.highestScore, 20000),
  },
  {
    id: "tycoon",
    title: "Tycoon",
    description: "Earn a total of 50,000 ZA from games.",
    total: 50000, rarity: "Epic", category: "Financial",
    icon: <MdAccountBalanceWallet className="text-purple-400 text-xl md:text-3xl" />,
    getProgress: ctx => Math.min(ctx.totalEarned, 50000),
  },
  {
    id: "pza_collector",
    title: "PZA Collector",
    description: "Accumulate 5,000 PZA points.",
    total: 5000, rarity: "Rare", category: "Financial",
    icon: <MdAccountBalanceWallet className="text-yellow-400 text-xl md:text-3xl" />,
    getProgress: ctx => Math.min(ctx.pzaPoints, 5000),
  },
  {
    id: "community_pillar",
    title: "Community Pillar",
    description: "Refer 10 active players to Playza.",
    total: 10, rarity: "Legendary", category: "Social",
    icon: <MdGroup className="text-yellow-500 text-xl md:text-3xl" />,
    getProgress: ctx => Math.min(ctx.referralCount, 10),
  },
];

// ─── Streak calculator ────────────────────────────────────────────────────────
function calcLongestStreak(history: GameHistoryItem[]): number {
  let longest = 0, current = 0;
  const sorted = [...history].sort(
    (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  );
  for (const m of sorted) {
    if (m.winnings > 0) { current++; longest = Math.max(longest, current); }
    else current = 0;
  }
  return longest;
}

// ─── Component ────────────────────────────────────────────────────────────────
const Achievements = () => {
  const [activeCategory, setActiveCategory] = React.useState("All");
  const categories = ["All", "Gaming", "Social", "Financial"];

  // Fetch up to 200 games to compute accurate stats
  const { data: historyData, isLoading: histLoading } = useGameHistory(1, 200);
  const { data: profile, isLoading: profLoading } = useProfile();

  const isLoading = histLoading || profLoading;

  const history: GameHistoryItem[] = historyData?.history ?? [];
  const totalGames = historyData?.total ?? 0;
  const totalWins = history.filter(m => m.winnings > 0).length;
  const totalEarned = history.reduce((sum, m) => sum + (m.winnings || 0), 0);
  const highestScore = history.reduce((max, m) => Math.max(max, m.score || 0), 0);
  const longestWinStreak = calcLongestStreak(history);
  const pzaPoints = profile?.pza_points ?? 0;
  // Referral count not in current profile API — show 0 until referral endpoint added
  const referralCount = 0;

  const ctx: AchievementContext = {
    totalGames, totalWins, totalEarned, highestScore,
    referralCount, longestWinStreak, pzaPoints,
  };

  const achievements = ACHIEVEMENT_DEFS.map(def => ({
    ...def,
    progress: def.getProgress(ctx),
    unlocked: def.getProgress(ctx) >= def.total,
  }));

  const unlocked = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;
  const achievementPoints = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => {
      const pts = a.rarity === "Common" ? 50 : a.rarity === "Rare" ? 150 : a.rarity === "Epic" ? 300 : 500;
      return sum + pts;
    }, 0);

  const filtered = achievements.filter(
    a => activeCategory === "All" || a.category === activeCategory
  );

  const rarityColor: Record<string, string> = {
    Common: "text-slate-400",
    Rare: "text-blue-400",
    Epic: "text-purple-400",
    Legendary: "text-yellow-500",
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="md:hidden text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
        Achievements
      </h2>

      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
        <div className="glass-card p-3 md:p-5 rounded-xl border-primary/20 bg-linear-to-br from-primary/10 to-transparent">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Unlocked</p>
          {isLoading ? (
            <div className="h-5 w-16 bg-slate-200 dark:bg-white/10 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-sm md:text-xl text-slate-900 dark:text-white font-black">
              {unlocked} / {totalAchievements}
            </p>
          )}
          <div className="mt-3 h-1.5 w-full bg-slate-500/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: totalAchievements > 0 ? `${(unlocked / totalAchievements) * 100}%` : "0%" }}
            />
          </div>
        </div>

        <div className="glass-card p-3 md:p-5 rounded-xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Achievement Points</p>
          {isLoading ? (
            <div className="h-5 w-20 bg-slate-200 dark:bg-white/10 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-sm md:text-xl text-slate-900 dark:text-white font-black italic tracking-tighter">
              {achievementPoints.toLocaleString()}
            </p>
          )}
          <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-1">
            <MdGrade className="text-sm" />
            {totalWins} wins · {longestWinStreak} best streak
          </p>
        </div>

        <div className="glass-card p-3 md:p-5 rounded-xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Next Achievement</p>
          {isLoading ? (
            <div className="h-5 w-24 bg-slate-200 dark:bg-white/10 rounded animate-pulse mt-1" />
          ) : (() => {
            const next = achievements
              .filter(a => !a.unlocked)
              .sort((a, b) => (b.progress / b.total) - (a.progress / a.total))[0];
            return next ? (
              <>
                <p className="text-slate-900 dark:text-white text-xs md:text-sm font-black italic tracking-tight">
                  {next.title}
                </p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-1">
                  <span className="size-1.5 bg-primary rounded-full animate-pulse" />
                  {next.progress.toLocaleString()} / {next.total.toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-slate-900 dark:text-white text-sm font-black">All Unlocked! 🏆</p>
            );
          })()}
        </div>
      </div>

      {/* ── Category filter ── */}
      <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5 w-full md:w-fit overflow-x-auto no-scrollbar">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              activeCategory === cat
                ? "bg-primary text-white shadow-lg scale-105"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* ── Achievement Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-5 rounded-xl border border-slate-200 dark:border-white/5 animate-pulse">
              <div className="flex gap-4">
                <div className="size-16 rounded-2xl bg-slate-200 dark:bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded" />
                  <div className="h-3 w-48 bg-slate-200 dark:bg-white/10 rounded" />
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full mt-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-4">
          {filtered.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 md:p-5 rounded-xl border transition-all duration-500 group relative overflow-hidden shadow-md ${
                achievement.unlocked
                  ? "border-primary/20 bg-white dark:bg-primary/5 shadow-primary/5"
                  : "border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-transparent opacity-80"
              }`}
            >
              {achievement.unlocked && (
                <div className="absolute -top-10 -right-10 size-28 bg-primary/10 blur-3xl rounded-full transition-transform group-hover:scale-150" />
              )}

              <div className="flex items-start gap-3 md:gap-4 relative z-10">
                {/* Icon */}
                <div className={`size-14 md:size-16 rounded-2xl flex items-center justify-center relative shrink-0 transition-transform duration-500 group-hover:scale-110 shadow-inner ${
                  achievement.unlocked ? "bg-primary/10" : "bg-slate-100 dark:bg-white/5"
                }`}>
                  {achievement.icon}
                  {achievement.unlocked ? (
                    <div className="absolute -top-1.5 -right-1.5 bg-primary rounded-full p-0.5 border-2 border-white dark:border-slate-900 shadow-lg">
                      <MdCheckCircle className="text-[10px] text-white" />
                    </div>
                  ) : (
                    <div className="absolute -top-1.5 -right-1.5 bg-slate-200 dark:bg-slate-800 rounded-full p-0.5 border border-slate-300 dark:border-white/10">
                      <MdLock className="text-[10px] text-slate-500 dark:text-white/40" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h4 className="text-slate-900 dark:text-white font-black text-sm italic tracking-tighter group-hover:text-primary transition-colors truncate">
                        {achievement.title}
                      </h4>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${rarityColor[achievement.rarity]}`}>
                        {achievement.rarity} · {achievement.category}
                      </p>
                    </div>
                    {!achievement.unlocked && (
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest shrink-0">
                        {achievement.progress.toLocaleString()} / {achievement.total.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold leading-relaxed">
                    {achievement.description}
                  </p>

                  {!achievement.unlocked && (
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-primary/50 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((achievement.progress / achievement.total) * 100, 100)}%` }}
                      />
                    </div>
                  )}

                  {achievement.unlocked && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <MdGrade className="text-primary text-xs" />
                      <span className="text-primary text-[9px] font-black uppercase tracking-widest">
                        Unlocked
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Achievements;
