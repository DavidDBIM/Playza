import { Swords, Trophy } from "lucide-react";
import { MdLink } from "react-icons/md";

interface GameModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: "quick" | "invite" | "bot") => void;
}

const GameModeModal = ({
  isOpen,
  onClose,
  onSelectMode,
}: GameModeModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 p-2"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl p-4 md:p-6 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
            Choose Mode
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-red-500 font-black text-[10px] md:text-sm uppercase tracking-widest py-2 px-4 active:bg-black/5 dark:active:bg-white/5"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Find Online Rival */}
          <button
            onClick={() => {
              onSelectMode("quick");
              onClose();
            }}
            className="relative overflow-hidden rounded-xl p-4 border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 text-center flex flex-col items-center gap-3 active:translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <span className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 block">Quick Play</span>
              <h2 className="text-[10px] md:text-sm font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Find Rival</h2>
            </div>
          </button>

          {/* Invite a Friend */}
          <button
            onClick={() => {
              onSelectMode("invite");
              onClose();
            }}
            className="relative overflow-hidden rounded-xl p-4 border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 text-center flex flex-col items-center gap-3 active:translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
              <MdLink className="w-6 h-6" />
            </div>
            <div>
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 block">Private</span>
              <h2 className="text-[10px] md:text-sm font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Invite Friend</h2>
            </div>
          </button>

          {/* Solo Practice (Bot) */}
          <button
            onClick={() => {
              onSelectMode("bot");
              onClose();
            }}
            className="relative overflow-hidden rounded-xl p-4 border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 text-center flex flex-col items-center gap-3 active:translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 block">Solo Training</span>
              <h2 className="text-[10px] md:text-sm font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">vs Computer</h2>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameModeModal;
