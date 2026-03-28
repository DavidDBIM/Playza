import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle2, Loader2, ArrowLeft, XCircle, CreditCard, Building2 } from "lucide-react";
import { ZASymbol } from "@/components/currency/ZASymbol";

export default function Deposit() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const amountStr = searchParams.get("amount") || "0";
  const method = searchParams.get("method") || "card";
  
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  
  const amount = Number(amountStr);
  const fee = Math.max(50, amount * 0.015);
  const total = amount + fee;

  const handlePay = () => {
    setStatus("processing");
    // Simulate payment gateway delay
    setTimeout(() => {
      // 90% success rate simulation
      if (Math.random() > 0.1) {
        setStatus("success");
      } else {
        setStatus("failed");
      }
    }, 2500);
  };

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        // Redirection with replacement so user doesn't hit back to success
        navigate("/wallet", { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto py-2 md:py-4 flex flex-col  animate-in slide-in-from-bottom-4 duration-500">
      
      <button 
        onClick={() => navigate(-1)} 
        disabled={status === "processing" || status === "success"}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-8 disabled:opacity-50"
      >
        <ArrowLeft size={20} />
        <span className="font-bold text-sm">Back</span>
      </button>

      <div className="glass-card rounded-xl px-2 py-2 md:py-8 md:p-12 relative overflow-hidden border border-primary/20 shadow-2xl">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
        
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 relative z-10 tracking-tight">
          Complete <span className="text-primary tracking-tighter italic">Top Up</span>
        </h1>
        <p className="text-xs md:text-base text-slate-500 font-medium mb-12 relative z-10">Review your top up details and finalize payment securely.</p>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-2 md:py-12 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="text-emerald-500 w-12 h-12" />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-emerald-500 mb-2">Payment Successful!</h2>
            <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
              <ZASymbol className="text-sm" />
              <span className="font-bold text-slate-900 dark:text-white">{amount.toLocaleString()}</span> has been added to your Playza wallet.
            </div>
            <Loader2 className="animate-spin text-slate-300 w-5 h-5 mb-2" />
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Redirecting to Wallet...</span>
          </div>
        ) : (
          <div className="space-y-8 relative z-10">
            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl px-2 py-2 md:py-6 md:p-6 border border-slate-200 dark:border-white/5">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 px-1">Summary</h3>
              
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm tracking-widest uppercase">Method</span>
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  {method === "card" ? <CreditCard size={18} className="text-primary" /> : <Building2 size={18} className="text-primary"/>}
                  <span className="capitalize">{method}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 px-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm tracking-widest uppercase">Amount</span>
                <div className="flex items-center gap-1.5">
                  <ZASymbol className="text-sm scale-90" />
                  <span className="font-black text-slate-900 dark:text-white">{amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 px-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm tracking-widest uppercase">Processing Fee</span>
                <div className="flex items-center gap-1.5">
                  <ZASymbol className="text-xs scale-90" />
                  <span className="font-bold text-slate-500">{fee.toLocaleString()}</span>
                </div>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div>

              <div className="flex items-center justify-between px-1">
                <span className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Total Payable</span>
                <div className="flex items-center gap-2 text-primary">
                  <ZASymbol className="text-xl md:text-2xl" />
                  <span className="text-lg md:text-2xl font-black">{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {status === "failed" && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-2 py-2 md:py-4 md:p-4 flex gap-2 md:gap-3 text-red-500 animate-in shake">
                <XCircle className="shrink-0" />
                <div>
                  <p className="text-xs md:text-base font-bold">Transaction Failed</p>
                  <p className="text-xs opacity-80 mt-1">There was an issue processing your payment. Please try again or use another payment method.</p>
                </div>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={status === "processing"}
              className="w-full bg-primary hover:bg-primary/90 text-background dark:text-background-dark py-2 md:py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
            >
              {status === "processing" ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processing Payment...</span>
                </>
              ) : status === "failed" ? (
                <span>Retry Payment</span>
              ) : (
                <div className="flex items-center gap-2 md:gap-3">
                  <span>Pay Now</span>
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <ZASymbol className="text-sm scale-90" />
                    <span>{total.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
