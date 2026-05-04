import { useEffect, useState } from "react";
import {
  Zap,
  X,
  Gamepad,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ZASymbol } from "../currency/ZASymbol";
import { useWallet } from "@/hooks/wallet/useWallet";

import { useJoinSession } from "@/hooks/gamesession/useGameSession";
import { useToast } from "@/context/toast";


interface LiveEntryModalProps {
  game: {
    id: string; // session id
    title: string;
    thumbnail: string;
    entryFee: number;
  };
  onClick: (value: boolean) => void;
  onConfirm: () => void;
}

const LiveEntryModal = ({ game, onClick, onConfirm }: LiveEntryModalProps) => {
  const { data: walletData, isLoading: walletLoading } = useWallet();
  const toast = useToast();
  const joinMutation = useJoinSession();

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    };
  }, []);

  const userBalance = walletData?.balance || 0;
  const newBalance = userBalance - game.entryFee;
  const isInsufficient = newBalance < 0;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const response = await joinMutation.mutateAsync(game.id);
      if (response.success) {
        toast.success("Entry successful! Good luck in the arena.");
        onConfirm();
      } else {
        toast.error(response.message || "Failed to join session");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "An error occurred");

    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="fixed inset-0 z-100 overflow-y-auto backdrop-blur-xl bg-slate-100/80 dark:bg-slate-950/80">
      <div className="min-h-full flex items-center justify-center p-2 md:p-4">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          <button
            onClick={() => onClick(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 z-20 hover:scale-110 transition-transform"
          >
            <X size={18} />
          </button>

          <div className="p-2 md:p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic">
                ARENA <span className="text-primary">PASS</span>
              </h2>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-tighter">
                Enter the prize-backed tournament
              </p>
            </div>

            <div className="relative rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 overflow-hidden mb-6">
              <div className="h-20 w-full relative">
                <img
                  src={game.thumbnail}
                  alt={game.title}
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900 to-transparent"></div>
                <div className="absolute bottom-2 left-4">
                  <h3 className="text-sm md:text-lg font-black text-white italic uppercase tracking-tight">
                    {game.title}
                  </h3>
                </div>
              </div>
              <div className="p-2 md:p-4 flex justify-between items-center bg-slate-100 dark:bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-primary">
                    <ZASymbol className="text-sm scale-90" />
                    <span className="text-base md:text-xl font-black">
                      {game.entryFee.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Gamepad size={12} className="text-primary" />
                  Arena Entry
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest px-1">
                <span>Your Wallet</span>
                {walletLoading ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <div className="flex items-center gap-1 text-slate-900 dark:text-white">
                    <ZASymbol className="text-[10px] scale-75" />
                    <span>{userBalance.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-100 dark:bg-black/40 rounded-xl p-2 md:p-4 border border-slate-200 dark:border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Match Stake
                  </span>
                  <span className="text-xs font-black text-rose-500">
                    -{game.entryFee.toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-white/5 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Post-Match Balance
                  </span>
                  <span
                    className={`text-sm font-black ${isInsufficient ? "text-rose-500" : "text-primary"}`}
                  >
                    {newBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {isInsufficient ? (
              <div className="flex gap-2 md:gap-3 p-2 md:p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 mb-6 items-center">
                <AlertCircle size={16} className="text-rose-500 shrink-0" />
                <p className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest leading-relaxed">
                  Insufficient funds. <br />
                  <span className="opacity-60">
                    Deposit more to enter this arena.
                  </span>
                </p>
              </div>
            ) : (
              <div className="flex gap-2 md:gap-3 p-2 md:p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 mb-6 items-center">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-tighter italic">
                  Ranked results are recorded immediately.
                </p>
              </div>
            )}

            <button
              disabled={isInsufficient || isProcessing}
              onClick={handleConfirm}
              className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 group
                ${
                  isInsufficient || isProcessing
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-primary text-slate-950 cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all"
                }
              `}
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <>
                  Deduct & Enter Arena
                  <Zap size={14} className="fill-slate-950" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LiveEntryModal;
