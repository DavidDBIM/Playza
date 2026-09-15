import { Swords, X, Zap, Users } from "lucide-react";
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
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950 border border-black/5 dark:border-indigo-500/20 rounded-3xl p-6 md:p-8 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-40 bg-indigo-500/25 blur-[70px] rounded-full pointer-events-none" />

        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 mb-1">
              One Step Away
            </p>
            <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
              Choose Mode
            </h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-full bg-black/5 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Quick Play — find a random rival */}
          <button
            onClick={() => {
              onSelectMode("quick");
              onClose();
            }}
            className="group relative overflow-hidden rounded-2xl p-5 border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-left flex flex-col gap-3 transition-colors active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Swords className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase italic tracking-tight text-slate-900 dark:text-white mb-1">
                Quick Play
              </h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
                Get matched with the nearest available rival instantly. No waiting around.
              </p>
            </div>
            <span className="mt-auto flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
              <Zap className="w-3 h-3" /> Usually &lt;10 sec
            </span>
          </button>

          {/* Private — invite a friend */}
          <button
            onClick={() => {
              onSelectMode("invite");
              onClose();
            }}
            className="group relative overflow-hidden rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-left flex flex-col gap-3 transition-colors active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <MdLink className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase italic tracking-tight text-slate-900 dark:text-white mb-1">
                Invite Friend
              </h2>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
                Create a private room and share the code — only the friend you invite can join.
              </p>
            </div>
            <span className="mt-auto flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
              <Users className="w-3 h-3" /> 1-on-1, invite only
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameModeModal;