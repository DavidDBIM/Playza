import { useState, useEffect } from "react";
import { Wallet, X, ArrowRight, CreditCard, Building2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { ZASymbol } from "../currency/ZASymbol";

interface DepositModalProps {
  onClose: () => void;
}

const QUICK_AMOUNTS = [1000, 5000, 10000];

const DepositModal = ({ onClose }: DepositModalProps) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");
  const [isHovering, setIsHovering] = useState<number | null>(null);

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
    // Use setTimeout to ensure closing animation/state works smoothly before full redirect
    setTimeout(() => {
      navigate(`/wallet/deposit?amount=${amount}&method=${paymentMethod}`);
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md px-2 py-4 md:p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md glass-card rounded-3xl shadow-2xl border border-primary/20 overflow-hidden">
        {/* Glows */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all z-20"
        >
          <X size={18} />
        </button>

        <div className="px-2 py-6 md:p-8 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner shrink-0">
              <Wallet className="text-primary size-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Quick <span className="text-primary">Deposit</span>
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Amount (ZA)
              </label>
              
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:opacity-100 transition-opacity scale-90">
                  <ZASymbol className="text-xl md:text-2xl" />
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/5 rounded-xl py-4 pl-12 pr-4 text-xl md:text-2xl font-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 outline-none focus:border-primary/50 transition-all shadow-inner"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {QUICK_AMOUNTS.map((val, idx) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    onMouseEnter={() => setIsHovering(idx)}
                    onMouseLeave={() => setIsHovering(null)}
                    className={`relative py-2.5 rounded-lg text-xs font-black transition-all border overflow-hidden ${
                      Number(amount) === val
                      ? "bg-primary text-background dark:text-background-dark border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                      : "bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/5 hover:border-primary/30"
                    }`}
                  >
                    <div className={`absolute inset-0 bg-primary/10 transition-transform duration-300 -translate-x-full ${isHovering === idx ? 'translate-x-0' : ''}`}></div>
                    <span className="relative z-10">ZA{val.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Pay With
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all group text-left relative ${
                    paymentMethod === "card" 
                    ? "border-primary/50 bg-primary/5" 
                    : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/10"
                  }`}
                >
                  <CreditCard className={`size-5 ${paymentMethod === "card" ? "text-primary" : "text-slate-400"}`} />
                  <span className={`font-bold text-xs uppercase ${paymentMethod === "card" ? "text-primary" : "text-slate-500"}`}>Card</span>
                  {paymentMethod === "card" && <CheckCircle2 className="absolute right-3 text-primary size-4" />}
                </button>
                <button 
                  onClick={() => setPaymentMethod("transfer")}
                  className={`flex items-center gap-2 md:gap-3 px-2 py-3 md:p-3 rounded-xl border-2 transition-all group text-left relative ${
                    paymentMethod === "transfer" 
                    ? "border-primary/50 bg-primary/5" 
                    : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/10"
                  }`}
                >
                  <Building2 className={`size-5 ${paymentMethod === "transfer" ? "text-primary" : "text-slate-400"}`} />
                  <span className={`font-bold text-xs uppercase ${paymentMethod === "transfer" ? "text-primary" : "text-slate-500"}`}>Bank</span>
                  {paymentMethod === "transfer" && <CheckCircle2 className="absolute right-3 text-primary size-4" />}
                </button>
              </div>
            </div>

            <button 
              onClick={handleContinue}
              disabled={!amount || Number(amount) < 100}
              className="w-full bg-primary text-background dark:text-background-dark py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none group relative overflow-hidden text-sm"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span>Continue</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
