import { useEffect } from "react";
import {
  Trophy,
  Info,
  Zap,
  ChevronDown,
  Wallet,
  X,
  Gamepad,
  ShieldCheck,
} from "lucide-react";

const LiveEntryModal = ({ onClick }: { onClick: (value: boolean) => void }) => {
  useEffect(() => {
    // lock scroll and hide nav footer via class
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");

    return () => {
      // restore scroll and show nav footer
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    };
  }, []);

  return (
    <main className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="relative w-full max-w-lg glass-card rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 blur-[80px] rounded-full pointer-events-none"></div>

          {/* Close Button */}
          <button
            onClick={() => onClick(false)}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-20 border border-white/5"
          >
            <X size={20} />
          </button>

          <div className="relative z-10 p-2 md:p-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
              Confirm{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-blue-400 to-secondary transition-all">
                Entry
              </span>
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Verify your details to join the live session.
            </p>
          </div>

          {/* Game Ticket Card */}
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-linear-to-r from-primary/30 to-secondary/30 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-white/5 overflow-hidden">
              <div
                className="h-28 w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAidbeU0WgwvrLv57QjlGkKw-k3BTFxO6S9SXiifffVcBgORCjId_ei2wDmSEeM1LkNjF_-OcrE4WAR-oZO8zay772R_sXRxorLy8dTYWasWamyxBLtyRl4EFE49FginGfrbKhnZryNLwLPlCTbVflhE8oyWKzmkXknm0RkphP0ZOSJNYw96nZX_4ocHjfirSHZvZkumsf7VJpj4Iz12cuS1yF6u80YDdISbNNvqQeS5KRACzZcP609ok7oIqaP4cgO85jWYXPFMjmj')",
                }}
              >
                <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-primary/20 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-primary/30 flex items-center gap-1.5">
                    <span className="flex size-1.5 rounded-full bg-primary animate-pulse"></span>
                    Live Now
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Speed Rush
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Gamepad size={12} className="text-primary" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Global Arena • #402
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-primary tracking-tighter leading-none">
                      ₦100
                    </div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                      Entry Fee
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-white/5 text-[11px] font-bold">
                  <div className="flex items-center gap-1.5 text-secondary">
                    <Trophy size={14} />
                    <span>Pool: ₦250,000</span>
                  </div>
                  <div className="h-4 w-px bg-slate-700"></div>
                  <div className="flex items-center gap-1.5 text-primary">
                    <ShieldCheck size={14} />
                    <span>Instant Payouts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Breakdown */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2 px-1">
              <Wallet size={16} className="text-slate-400" />
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Payment Breakdown
              </h4>
            </div>

            <div className="bg-slate-50/50 dark:bg-black/20 rounded-2xl p-6 space-y-4 border border-slate-200 dark:border-white/5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-500">
                  Available Funds
                </span>
                <span className="font-black text-slate-900 dark:text-slate-200 tracking-tight">
                  ₦1,250.00
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <div className="bg-primary/10 p-1 rounded-md">
                    <ChevronDown size={14} />
                  </div>
                  <span>Tournament Entry</span>
                </div>
                <span className="font-black text-primary tracking-tight">
                  -₦100.00
                </span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  New Balance
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  ₦1,150.00
                </span>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="flex gap-4 p-5 bg-amber-500/5 rounded-2xl border border-amber-500/20 mb-8 sm:items-center">
            <div className="bg-amber-500/20 p-2 rounded-xl h-fit">
              <Info size={18} className="text-amber-500" />
            </div>
            <p className="text-[11px] font-bold text-amber-500/80 leading-relaxed">
              Entry fees are non-refundable once the match begins. Ensure a
              stable connection before proceeding.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button className="w-full bg-linear-to-r from-primary to-blue-600 hover:from-blue-400 hover:to-secondary text-slate-900 font-black py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group tracking-widest uppercase text-xs">
              Confirm & Join Battle
              <Zap
                size={18}
                className="fill-slate-900 group-hover:animate-pulse"
              />
            </button>
            <button
              onClick={() => onClick(false)}
              className="w-full py-2 text-slate-500 font-bold hover:text-slate-900 dark:hover:text-white transition-colors text-xs uppercase tracking-widest"
            >
              Back to Arena
            </button>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
};

export default LiveEntryModal;
