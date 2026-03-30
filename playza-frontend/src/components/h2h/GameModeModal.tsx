import { Swords } from "lucide-react";
import { MdLink } from "react-icons/md";

interface GameModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: "quick" | "invite") => void;
}

const GameModeModal = ({
  isOpen,
  onClose,
  onSelectMode,
}: GameModeModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-4 sm:gap-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2 px-1">
          <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
            Choose Mode
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-red-500 font-black text-xs sm:text-sm uppercase tracking-widest transition-colors py-2 px-4 rounded-xl hover:bg-red-500/10"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
          {/* Find Online Rival */}
          <button
            onClick={() => {
              onSelectMode("quick");
              onClose();
            }}
            className="group relative overflow-hidden rounded-xl p-1 transition-all hover:scale-[1.01] active:scale-[0.99] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 shadow-sm hover:shadow-lg"
          >
            <div className="relative p-4 flex items-center gap-4 text-left h-full">
              <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                <Swords className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1">
                <span className="text-indigo-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1 block">
                  Global Matchmaking
                </span>
                <h2 className="text-lg sm:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                  Find Online Rival
                </h2>
                <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                  Battle random tiers across the globe
                </p>
              </div>
            </div>
          </button>

          {/* Invite a Friend */}
          <button
            onClick={() => {
              onSelectMode("invite");
              onClose();
            }}
            className="group relative overflow-hidden rounded-xl p-1 transition-all hover:scale-[1.01] active:scale-[0.99] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 shadow-sm hover:shadow-lg"
          >
            <div className="relative p-4 flex items-center gap-4 text-left h-full">
              <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <MdLink className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1">
                <span className="text-emerald-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1 block">
                  Private Challenge
                </span>
                <h2 className="text-lg sm:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                  Invite a Friend
                </h2>
                <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                  Play with someone you know
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameModeModal;
