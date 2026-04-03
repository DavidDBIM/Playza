import { AlertTriangle, ShieldCheck } from "lucide-react";

interface ResignConfirmationModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  stake: number;
}

const ResignConfirmationModal = ({
  onCancel,
  onConfirm,
  isLoading,
  stake,
}: ResignConfirmationModalProps) => {
  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-slate-950/90 p-2 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-red-500/30 rounded-2xl p-2 md:p-4 space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="text-red-500 w-12 h-12" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
              GIVE UP?
            </h2>
            <div className="h-1 w-12 bg-red-500/30 mx-auto mt-2 rounded-full"></div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-6">
          <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-widest text-center leading-relaxed">
            Resigning will forfeit your stake and end the game immediately.
          </p>

          <div className="flex flex-col items-center justify-center gap-2 py-4 bg-red-500/5 rounded-xl border border-red-500/10">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em]">
              LOSS ESTIMATE:
            </span>
            <span className="text-3xl md:text-4xl font-black text-red-500 italic">
              -{stake} ZA
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-amber-500 font-black uppercase justify-center italic">
            <ShieldCheck size={14} />
            Opponent will receive the prize pool
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="py-5 rounded-xl font-black uppercase text-xs tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Stay & Fight
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="py-5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 active:translate-y-1 transition-all shadow-lg shadow-red-600/20"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Confirm Resign"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResignConfirmationModal;
