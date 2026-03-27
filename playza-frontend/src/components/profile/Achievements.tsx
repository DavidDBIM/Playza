import React from "react";
import { MdEmojiEvents, MdLock, MdCheckCircle, MdGrade, MdStars, MdLocalFireDepartment, MdGroup, MdAccountBalanceWallet } from "react-icons/md";

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  rarity: "Common" | "Rare" | "Legendary" | "Epic";
  category: "Gaming" | "Social" | "Financial";
  unlocked: boolean;
  icon: React.ReactNode;
}

const achievements: Achievement[] = [
  {
    id: "1",
    title: "First Blood",
    description: "Win your very first competitive match.",
    progress: 1,
    total: 1,
    rarity: "Common",
    category: "Gaming",
    unlocked: true,
    icon: <MdStars className="text-slate-400 text-3xl" />,
  },
  {
    id: "2",
    title: "Century Club",
    description: "Complete 100 competitive games.",
    progress: 124,
    total: 100,
    rarity: "Rare",
    category: "Gaming",
    unlocked: true,
    icon: <MdEmojiEvents className="text-blue-400 text-3xl" />,
  },
  {
    id: "3",
    title: "Hot Streak",
    description: "Win 5 matches in a row.",
    progress: 5,
    total: 5,
    rarity: "Rare",
    category: "Gaming",
    unlocked: true,
    icon: <MdLocalFireDepartment className="text-orange-500 text-3xl" />,
  },
  {
    id: "4",
    title: "Tycoon",
    description: "Earn a total of 50,000 ZA from games.",
    progress: 18300,
    total: 50000,
    rarity: "Epic",
    category: "Financial",
    unlocked: false,
    icon: <MdAccountBalanceWallet className="text-purple-400 text-3xl" />,
  },
  {
    id: "5",
    title: "Community Pillar",
    description: "Refer 10 active players to Playza.",
    progress: 3,
    total: 10,
    rarity: "Legendary",
    category: "Social",
    unlocked: false,
    icon: <MdGroup className="text-yellow-500 text-3xl" />,
  },
  {
    id: "6",
    title: "High Scorer",
    description: "Achieve a score of over 20,000 in any game.",
    progress: 14250,
    total: 20000,
    rarity: "Epic",
    category: "Gaming",
    unlocked: false,
    icon: <MdGrade className="text-emerald-400 text-3xl" />,
  },
];

const Achievements = () => {
  const categories = ["All", "Gaming", "Social", "Financial"];
  const [activeCategory, setActiveCategory] = React.useState("All");

  const filteredAchievements = achievements.filter(
    (a) => activeCategory === "All" || a.category === activeCategory
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Mobile Page Title */}
      <h2 className="md:hidden text-2xl font-black text-slate-900 dark:text-white tracking-tight">Achievements</h2>

      {/* Stats Summary Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border-primary/20 bg-linear-to-br from-primary/10 to-transparent">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Unlocked</p>
          <p className="text-slate-900 dark:text-white text-3xl font-black">12 / 48</p>
          <div className="mt-4 h-1.5 w-full bg-slate-500/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '25%' }}></div>
          </div>
        </div>
        <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Achievement Points</p>
          <p className="text-slate-900 dark:text-white text-3xl font-black italic tracking-tighter">2,450</p>
          <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-1">
            <MdGrade className="text-sm" /> Global Rank #432
          </p>
        </div>
        <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Next Badge</p>
          <p className="text-slate-900 dark:text-white text-xl font-black italic tracking-tight">ELITE WARRIOR</p>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-1">
             <span className="size-1.5 bg-primary rounded-full animate-pulse"></span>
             2 missions remaining
          </p>
        </div>
      </div>

      {/* Categories / Filter */}
      <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-md w-full md:w-fit overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap h-11 px-8 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              activeCategory === cat
              ? "bg-primary text-white shadow-lg glow-accent scale-105"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAchievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={`p-6 rounded-xl border transition-all duration-500 group relative overflow-hidden shadow-lg ${
              achievement.unlocked 
              ? "border-primary/20 bg-white dark:bg-primary/5 shadow-primary/5" 
              : "border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-transparent opacity-80 grayscale"
            }`}
          >
            {/* Background Glow for Unlocked Achievements */}
            {achievement.unlocked && (
                <div className="absolute -top-12 -right-12 size-32 bg-primary/10 blur-3xl rounded-full transition-transform group-hover:scale-150"></div>
            )}

            <div className="flex items-start gap-6 relative z-10">
              <div className={`size-20 rounded-2xl flex items-center justify-center relative shrink-0 transition-transform duration-500 group-hover:scale-110 shadow-inner ${
                achievement.unlocked ? "bg-primary/10" : "bg-slate-100 dark:bg-white/5"
              }`}>
                {achievement.icon}
                {achievement.unlocked ? (
                    <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1 border-2 border-white dark:border-slate-900 shadow-xl">
                        <MdCheckCircle className="text-xs text-white" />
                    </div>
                ) : (
                    <div className="absolute -top-2 -right-2 bg-slate-200 dark:bg-slate-800 rounded-full p-1 border border-slate-300 dark:border-white/10">
                        <MdLock className="text-xs text-slate-500 dark:text-white/40" />
                    </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-black text-lg italic tracking-tighter group-hover:text-primary transition-colors">{achievement.title}</h4>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{achievement.rarity} • {achievement.category}</p>
                  </div>
                  {!achievement.unlocked && (
                     <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{achievement.progress.toLocaleString()} / {achievement.total.toLocaleString()}</p>
                  )}
                </div>
                
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed">{achievement.description}</p>
                
                {/* Progress Bar (Only if locked) */}
                {!achievement.unlocked && (
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mt-4 shadow-inner">
                    <div 
                        className="h-full bg-primary/40 rounded-full transition-all duration-1000" 
                        style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                    ></div>
                  </div>
                )}

                {achievement.unlocked && (
                   <div className="flex items-center gap-1.5 pt-2">
                      <MdGrade className="text-primary text-sm" />
                       <span className="text-primary text-[9px] font-black uppercase tracking-[0.2em]">Unlocked Achievement</span>
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
