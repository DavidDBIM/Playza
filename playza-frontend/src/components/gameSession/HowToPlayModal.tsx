import { useEffect } from "react";
import { X, Gamepad2, Target, Trophy, Play } from "lucide-react";
import type { Game } from "@/types/types";

interface HowToPlayModalProps {
  game: Game;
  onClose: () => void;
  onConfirm: () => void;
}

const HowToPlayModal = ({ game, onClose, onConfirm }: HowToPlayModalProps) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    };
  }, []);

  const howToPlay = game.howToPlay || {
    controls: "Click or tap to interact. Standard swipe or arrow keys for movement.",
    rules: "Survive as long as possible or complete the objectives faster than your opponents.",
    scoring: "Score points based on time, eliminations, and level progression.",
  };

  return (
    <main className="fixed inset-0 z-100 overflow-y-auto backdrop-blur-xl bg-slate-100/80 dark:bg-slate-950/80 flex items-center justify-center p-2 md:p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 z-20 md:hover:bg-slate-200 dark:md:hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-4 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic">
              HOW TO <span className="text-primary">PLAY</span>
            </h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
              {game.title} Briefing
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex gap-4">
              <div className="bg-primary/10 p-3 rounded-lg h-fit text-primary">
                <Gamepad2 size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide text-slate-800 dark:text-slate-200 mb-1">Controls</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {howToPlay.controls}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex gap-4">
              <div className="bg-amber-500/10 p-3 rounded-lg h-fit text-amber-500">
                <Target size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide text-slate-800 dark:text-slate-200 mb-1">Rules</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {howToPlay.rules}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex gap-4">
              <div className="bg-emerald-500/10 p-3 rounded-lg h-fit text-emerald-500">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide text-slate-800 dark:text-slate-200 mb-1">Scoring</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {howToPlay.scoring}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onConfirm}
            className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 bg-primary text-slate-950 md:hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/20"
          >
            I'm Ready - Play Game
            <Play size={16} className="fill-slate-950" />
          </button>
        </div>
      </div>
    </main>
  );
};

export default HowToPlayModal;
