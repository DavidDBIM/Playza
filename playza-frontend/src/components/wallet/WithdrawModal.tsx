import { useState, useEffect } from "react";
import { X, ArrowRight, Landmark, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";

interface WithdrawModalProps {
  onClose: () => void;
}

const WithdrawModal = ({ onClose }: WithdrawModalProps) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("");
  const [bank, setBank] = useState<"gtb" | "zenith">("gtb");

  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  const handleAmountChange = (val: string) => {
    if (val === "" || /^\d+$/.test(val)) {
      setAmount(val);
    }
  };

  const handleContinue = () => {
    onClose();
    setTimeout(() => {
      navigate(`/wallet/withdraw?amount=${amount}&bank=${bank}`);
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-background/80 backdrop-blur-sm px-2 py-2 md:py-4 md:p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 glass-card rounded-xl shadow-2xl border border-slate-200 dark:border-yellow-500/20 overflow-hidden">
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-yellow-500/10 dark:bg-yellow-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        <button 
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all z-20 border border-slate-200 dark:border-white/5"
        >
          <X size={18} />
        </button>

        <div className="px-2 py-2 md:py-6 md:p-8 relative z-10">
          <div className="flex items-center gap-2 md:gap-4 mb-6 px-2">
            <div className="size-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shadow-inner shrink-0">
              <Landmark className="text-yellow-600 dark:text-yellow-500 size-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Quick <span className="bg-clip-text text-transparent bg-linear-to-r from-yellow-600 via-amber-400 to-yellow-700 dark:from-yellow-400 dark:via-amber-200 dark:to-yellow-600">Withdraw</span>
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex justify-between px-1">
                <span>Amount (ZA)</span>
                <span className="text-yellow-600 dark:text-yellow-500 font-bold">Bal: ZA10,250</span>
              </label>
              
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600 dark:text-yellow-500 font-black text-xl md:text-2xl opacity-60 dark:opacity-50 group-focus-within:opacity-100 transition-opacity">
                  ZA
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/5 rounded-xl py-2 md:py-4 pl-2 md:pl-12 pr-2 md:pr-4 text-xl md:text-2xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 outline-none focus:border-yellow-500/50 transition-all shadow-sm focus:shadow-md"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">
                To Bank Account
              </label>
              <div className="grid gap-2 md:gap-3">
                <button 
                  onClick={() => setBank("gtb")}
                  className={`flex flex-col px-3 py-3 rounded-xl border-2 transition-all text-left relative shadow-sm ${
                    bank === "gtb" 
                    ? "border-yellow-500 bg-yellow-50 dark:border-yellow-500/50 dark:bg-yellow-500/5" 
                    : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  <span className={`font-bold text-sm ${bank === "gtb" ? "text-yellow-600 dark:text-yellow-500" : "text-slate-900 dark:text-white"}`}>GTBank - 0123***890</span>
                  <span className="text-xs text-slate-500 font-medium">Guseltony</span>
                  {bank === "gtb" && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600 dark:text-yellow-500 size-5" />}
                </button>
                <button 
                  onClick={() => setBank("zenith")}
                  className={`flex flex-col px-3 py-3 rounded-xl border-2 transition-all text-left relative shadow-sm ${
                    bank === "zenith" 
                    ? "border-yellow-500 bg-yellow-50 dark:border-yellow-500/50 dark:bg-yellow-500/5" 
                    : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  <span className={`font-bold text-sm ${bank === "zenith" ? "text-yellow-600 dark:text-yellow-500" : "text-slate-900 dark:text-white"}`}>Zenith - 2101***456</span>
                  <span className="text-xs text-slate-500 font-medium">Guseltony</span>
                  {bank === "zenith" && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600 dark:text-yellow-500 size-5" />}
                </button>
              </div>
            </div>

              <button 
              onClick={handleContinue}
              disabled={!amount || Number(amount) > 10250 || Number(amount) < 100}
              className="w-full bg-linear-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white py-2 md:py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50 disabled:pointer-events-none group relative overflow-hidden text-sm border-t border-white/20"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span>Continue to Withdraw</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
