import type { Game } from "@/types/types";
import { Info, Play, Target, Zap } from "lucide-react";

export const AboutGameTab = ({ game }: { game: Game }) => {
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
          {game.rules || `Step into a world of high-stakes competition. This game is designed to test your strategy, reflex, and endurance. 
          Navigate through challenging environments, outsmart your opponents, and climb the global leaderboard to claim massive cash rewards.`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Scoring System */}
        <div className="bg-white dark:bg-white/5 p-4 md:p-8 rounded-xl border border-slate-200 dark:border-white/5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <div className="p-2 md:p-2.5 bg-playza-yellow/20 rounded-xl">
              <Target className="w-5 h-5 text-playza-yellow" />
            </div>
            <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-white tracking-tight italic uppercase">Controls</h3>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-lg leading-relaxed font-medium">
            {game.controls || "Master the movement to dominate the arena. Use your skills to navigate and survive the challenge."}
          </p>
        </div>

        {/* Highlights */}
        <div className="bg-white dark:bg-white/5 p-4 md:p-8 rounded-xl border border-slate-200 dark:border-white/5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <div className="p-2 md:p-2.5 bg-primary/10 rounded-xl">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-white tracking-tight italic uppercase">Gameplay Info</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-2 md:gap-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-slate-500 dark:text-slate-400 text-xs md:text-lg font-medium">Category: {game.category}</span>
            </li>
            <li className="flex items-start gap-2 md:gap-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-slate-500 dark:text-slate-400 text-xs md:text-lg font-medium">Mode: {game.mode}</span>
            </li>
            <li className="flex items-start gap-2 md:gap-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-slate-500 dark:text-slate-400 text-xs md:text-lg font-medium">Difficulty: {game.difficulty}</span>
            </li>
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
