import { ShieldCheck, AlertCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/80 p-2">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-primary/30 rounded-xl p-4 md:p-6 space-y-6 md:space-y-8">
        <div className="flex flex-col items-center text-center space-y-2 md:space-y-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="text-primary w-10 h-10 md:w-12 md:h-12" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
              Authorize Entry
            </h2>
            <div className="h-1 w-12 bg-primary/30 mx-auto mt-2 rounded-full"></div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-4 md:space-y-6">
          <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest text-center leading-relaxed">
            Wallet verification required. To enter this H2H battle, the room's
            entry fee will be deducted from your balance.
          </p>

          <div className="flex items-center justify-center gap-3 py-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               Entry Fee:
            </span>
            <span className="text-lg md:text-xl lg:text-3xl font-black text-indigo-500 italic">
              {confirmingAction.stake > 0 ? (
                <>
                  {confirmingAction.stake} <ZASymbol className="scale-125" />
                </>
              ) : (
                "ROOM STAKE"
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[8px] md:text-[9px] text-amber-500 font-black uppercase justify-center bg-amber-500/5 py-2 rounded-lg border border-amber-500/10">
            <AlertCircle size={14} />
            Match abandonment forfeits this stake
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onCancel}
            className="py-4 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-500 active:bg-black/5 dark:active:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="py-4 bg-primary text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 active:translate-y-1"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
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
