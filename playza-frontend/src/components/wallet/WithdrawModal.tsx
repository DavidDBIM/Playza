import { useState, useEffect } from "react";
import { X, ArrowRight, Landmark, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { ZASymbol } from "../currency/ZASymbol";

interface WithdrawModalProps {
  onClose: () => void;
}

const WithdrawModal = ({ onClose }: WithdrawModalProps) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("");
  const [bank, setBank] = useState<"gtb" | "zenith">("gtb");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl px-2 py-2 md:py-4 md:p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 glass-card rounded-xl border border-slate-200 dark:border-yellow-500/20 overflow-hidden">

        <button 
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 md:hover:bg-slate-200 dark:bg-slate-800 md:dark:hover:bg-slate-700 text-slate-500 md:hover:text-slate-900 dark:text-slate-400 md:dark:hover:text-white z-20 border border-slate-200 dark:border-white/5"
        >
          <X size={18} />
        </button>

        <div className="px-2 py-2 md:py-6 md:p-8 relative z-10">
          <div className="flex items-center gap-2 md:gap-4 mb-6 px-2">
            <div className="size-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
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
                <span className="flex items-center gap-1">Amount (<ZASymbol className="scale-75" />)</span>
                <span className="text-yellow-600 dark:text-yellow-500 font-bold flex items-center gap-1">Bal: <ZASymbol className="scale-75" />10,250</span>
              </label>
              
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600 dark:text-yellow-500 font-black text-xl md:text-2xl opacity-60 dark:opacity-50 md:group-focus-within:opacity-100 flex items-center justify-center">
                  <ZASymbol className="scale-75" />
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/5 rounded-xl py-2 md:py-4 pl-2 md:pl-12 pr-2 md:pr-4 text-xl md:text-2xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 outline-none focus:border-yellow-500/50"
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
                  className={`flex flex-col px-3 py-3 rounded-xl border-2 text-left relative ${
                    bank === "gtb" 
                    ? "border-yellow-500 bg-yellow-50 dark:border-yellow-500/50 dark:bg-yellow-500/5" 
                    : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 md:hover:bg-slate-100 md:dark:hover:bg-white/10"
                  }`}
                >
                  <span className={`font-bold text-sm ${bank === "gtb" ? "text-yellow-600 dark:text-yellow-500" : "text-slate-900 dark:text-white"}`}>GTBank - 0123***890</span>
                  <span className="text-xs text-slate-500 font-medium">Guseltony</span>
                  {bank === "gtb" && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600 dark:text-yellow-500 size-5" />}
                </button>
                <button 
                  onClick={() => setBank("zenith")}
                  className={`flex flex-col px-3 py-3 rounded-xl border-2 text-left relative ${
                    bank === "zenith" 
                    ? "border-yellow-500 bg-yellow-50 dark:border-yellow-500/50 dark:bg-yellow-500/5" 
                    : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 md:hover:bg-slate-100 md:dark:hover:bg-white/10"
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
              className="w-full bg-linear-to-r from-yellow-500 to-amber-600 md:hover:from-yellow-400 md:hover:to-amber-500 text-white py-2 md:py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50 disabled:pointer-events-none group relative overflow-hidden text-sm border-t border-white/20"
            >
              <span>Continue to Withdraw</span>
              <ArrowRight className="md:group-hover:translate-x-1 size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
