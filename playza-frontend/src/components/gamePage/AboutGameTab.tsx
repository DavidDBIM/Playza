import { Info, Play, Target, Zap } from "lucide-react";

export const AboutGameTab = () => {
  return (
    <div className="space-y-4 md:space-y-12">
      {/* Overview Card */}
      <div className="bg-white dark:bg-white/5 p-2 md:p-6 rounded-xl border border-slate-200 dark:border-white/5 space-y-6">
        <div className="flex items-center gap-2 md:gap-4 mb-2">
          <div className="p-2 md:p-3 bg-primary/10 rounded-xl">
            <Info className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Game Overview</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-lg leading-relaxed max-w-4xl font-medium">
          Step into a world of high-stakes competition. This game is designed to test your strategy, reflex, and endurance. 
          Navigate through challenging environments, outsmart your opponents, and climb the global leaderboard to claim massive cash rewards.
          Every move counts, and every second matters in this ultimate gaming showdown.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Scoring System */}
        <div className="bg-white dark:bg-white/5 p-4 md:p-8 rounded-xl border border-slate-200 dark:border-white/5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <div className="p-2 md:p-2.5 bg-playza-yellow/20 rounded-xl">
              <Target className="w-5 h-5 text-playza-yellow" />
            </div>
            <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-white tracking-tight italic uppercase">Scoring System</h3>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-lg leading-relaxed font-medium">
            Your performance is measured by multiple metrics. Points are awarded for accuracy, speed, and objective completion. 
            Bonus multipliers are active for streaks and perfect runs.
          </p>
          <div className="pt-2 md:pt-4 space-y-3">
            <div className="flex justify-between items-center p-2 md:p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 shadow-inner">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Base Score</span>
              <span className="text-slate-900 dark:text-white font-black">100 pts / task</span>
            </div>
            <div className="flex justify-between items-center p-2 md:p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 shadow-inner">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Speed Bonus</span>
              <span className="text-playza-green font-black">Up to 2x Multiplier</span>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-white dark:bg-white/5 p-4 md:p-8 rounded-xl border border-slate-200 dark:border-white/5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <div className="p-2 md:p-2.5 bg-primary/10 rounded-xl">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-white tracking-tight italic uppercase">Gameplay Highlights</h3>
          </div>
          <ul className="space-y-4">
            {[
              "High-fidelity graphics and smooth 60FPS gameplay",
              "Real-time competitive leaderboard and matchmaking",
              "Dynamic environments that evolve as you play",
              "Exclusive rewards for top-tier performers"
            ].map((highlight, i) => (
              <li key={i} className="flex items-start gap-2 md:gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-slate-500 dark:text-slate-400 text-xs md:text-lg font-medium">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Final CTA Area */}
      <div className="p-4 md:p-8 bg-slate-900 rounded-xl border border-slate-800 dark:border-playza-blue/20 text-center space-y-8">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-base md:text-xl font-black text-white tracking-tight uppercase italic">Ready to dominate?</h2>
          <p className="text-slate-400 text-xs md:text-lg font-medium">
            Join the arena now and start your journey to the top of the leaderboard.
          </p>
        </div>
        
        <div className="flex  items-center justify-center">
          <button className="w-full sm:w-auto px-2 md:px-10 py-2 md:py-5 bg-white dark:bg-primary text-slate-900 dark:text-white font-black rounded-xl flex items-center justify-center gap-2 md:gap-3 group">
            <Play className="w-5 h-5 fill-current" />
            PLAY NOW
          </button>
        </div>
      </div>
    </div>
  );
};
