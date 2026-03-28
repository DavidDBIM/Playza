import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle2, Loader2, Landmark } from "lucide-react";
import { ZASymbol } from "@/components/currency/ZASymbol";

export default function WithdrawSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const amountStr = searchParams.get("amount") || "0";
  const bank = searchParams.get("bank") || "gtb";
  const amount = Number(amountStr);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/wallet", { replace: true });
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto py-8 md:py-16 px-2 md:px-4 flex flex-col items-center justify-center min-h-[60vh] animate-in slide-in-from-bottom-4 duration-500">
      <div className="w-full glass-card rounded-xl py-2 md:py-12 px-2 md:px-6 md:p-16 relative overflow-hidden border border-emerald-500/20 shadow-2xl flex flex-col items-center text-center">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>

        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 animate-in zoom-in duration-500 delay-150">
          <CheckCircle2 className="text-emerald-500 w-12 h-12 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 font-display uppercase tracking-tight relative z-10">
          Request <span className="text-emerald-500">Successful!</span>
        </h2>
        
        <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 mb-8 max-w-md font-medium relative z-10 leading-relaxed font-sans">
          Your payout of <span className="font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5"><ZASymbol className="text-[10px] scale-90" />{amount.toLocaleString()}</span> is being processed to your <span className="uppercase text-slate-900 dark:text-white">{bank}</span> account. We'll notify you once it hits.
        </p>

        <div className="w-full max-w-xs bg-slate-50 dark:bg-white/5 rounded-2xl p-2 md:p-4 border border-slate-200 dark:border-white/5 mb-10 flex items-center justify-between text-left">
           <div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Destination</span>
             <span className="font-bold text-sm text-slate-900 dark:text-white uppercase flex items-center gap-1.5 mt-1">
               <Landmark size={14} className="text-emerald-500" />
               {bank} - ****456
             </span>
           </div>
           <div className="text-right">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block text-right">Amount</span>
             <div className="flex items-center gap-1.5 justify-end mt-1">
               <ZASymbol className="text-xs scale-75" />
               <span className="font-bold text-sm text-emerald-500 block">
                 {amount.toLocaleString()}
               </span>
             </div>
           </div>
        </div>
        
        <div className="flex flex-col items-center justify-center relative z-10">
          <Loader2 className="animate-spin text-slate-300 dark:text-slate-600 w-6 h-6 mb-3" />
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Heading back to your wallet</span>
        </div>
      </div>
    </main>
  );
}
