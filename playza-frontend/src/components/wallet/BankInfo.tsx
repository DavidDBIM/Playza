import { VerifiedIcon, CheckCircle2, AlertCircle, ArrowRight, Landmark } from "lucide-react";
import { useNavigate } from "react-router";
import { useBankAccounts } from "@/hooks/profile/useProfile";

const BankInfo = () => {
  const navigate = useNavigate();
  const { data: accounts, isLoading } = useBankAccounts();

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-4 md:p-8 border-l-4 border-l-primary/50 flex flex-col h-full bg-slate-50/50 dark:bg-white/2 backdrop-blur-sm shadow-xl animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-white/5 rounded-full mb-6"></div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 w-full bg-slate-200 dark:bg-white/5 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="glass-card rounded-xl p-4 md:p-8 border-l-4 border-l-red-500/50 flex flex-col items-center text-center justify-center gap-4 h-full bg-slate-50/50 dark:bg-white/2 backdrop-blur-sm shadow-xl">
        <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shadow-inner">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">No Account Set</h3>
          <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            Proceed to your profile to set up your withdrawal destination.
          </p>
        </div>
        <button
          onClick={() => navigate("/profile/settings")}
          className="w-full mt-2 py-3.5 bg-primary text-white font-black rounded-xl uppercase tracking-[0.1em] shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Setup Bank Details <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4 md:p-8 border-l-4 border-l-primary/50 flex flex-col h-full bg-slate-50/50 dark:bg-white/2 backdrop-blur-sm shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-sm md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Payout Methods</h3>
        <span className="bg-playza-green/10 text-playza-green text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-playza-green/20 flex items-center gap-1 shadow-sm">
          <VerifiedIcon size={12} /> Verified
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1 no-scrollbar">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 relative group ${
              acc.is_primary 
                ? "bg-white dark:bg-slate-900 hover:border-primary/40 border-primary/20 shadow-md" 
                : "bg-slate-50 dark:bg-white/5 border-white/5 hover:border-white/20 opacity-70 hover:opacity-100"
            }`}
          >
            <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center p-1.5 shadow-inner shrink-0">
               <Landmark size={20} className="text-slate-400 group-hover:text-primary" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white truncate uppercase italic">
                  {acc.bank_name}
                </p>
                {acc.is_primary && (
                  <CheckCircle2 size={12} className="text-primary shrink-0" />
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                 ****{acc.account_number.slice(-4)}
              </p>
            </div>
            {acc.is_primary && (
              <span className="text-[8px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded italic">
                Primary
              </span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/profile/settings")}
        className="w-full mt-6 py-3.5 text-[10px] font-black text-primary uppercase tracking-[0.15em] border border-primary/20 hover:bg-primary/5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
      >
        Manage Details
      </button>
    </div>
  );
};

export default BankInfo;
