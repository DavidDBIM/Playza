import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { ZASymbol } from '@/components/currency/ZASymbol';

interface ActionConfirmationModalProps {
  confirmingAction: { type: 'create' | 'join' | 'quick' | 'bot', stake: number, code?: string } | null;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const ActionConfirmationModal = ({ confirmingAction, onCancel, onConfirm, isLoading }: ActionConfirmationModalProps) => {
  if (!confirmingAction) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-950 border border-indigo-500/20 rounded-3xl p-6 md:p-8 space-y-6 overflow-hidden">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-48 bg-indigo-500/25 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="text-white w-9 h-9 md:w-10 md:h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 mb-1">
              Last Step
            </p>
            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
              Authorize Entry
            </h2>
          </div>
        </div>

        <div className="relative bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium text-center leading-relaxed">
            Wallet verification required. To enter this H2H battle, the room's
            entry fee will be deducted from your balance.
          </p>

          <div className="flex items-center justify-center gap-3 py-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Entry Fee:
            </span>
            <span className="text-2xl md:text-3xl font-black text-indigo-500 dark:text-indigo-400 italic flex items-center gap-1">
              {confirmingAction.stake > 0 ? (
                <>
                  {confirmingAction.stake} <ZASymbol className="scale-125" />
                </>
              ) : (
                "ROOM STAKE"
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[9px] text-amber-600 dark:text-amber-400 font-black uppercase justify-center bg-amber-500/10 py-2.5 rounded-xl border border-amber-500/20">
            <AlertCircle size={14} className="shrink-0" />
            Match abandonment forfeits this stake
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="py-3.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-colors active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Agree & Join"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmationModal;