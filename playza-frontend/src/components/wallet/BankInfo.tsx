import { VerifiedIcon, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";

const ACCOUNTS = [
  {
    id: 1,
    bankName: "Zenith Bank PLC",
    accountNumber: "2284 **** 8841",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxuRGEeXDIAhTZaRM5cIUhBBwMLqQLItgWx2Ps7uw78Sk2druQ6AnGFk2zttkm1xHbuuxq3rjnIH9NXr5DyLEANUZ_EVccv2xRf14eqXzqRM9M2sd58HOUFTGkSt304ko0OOSm2A4u4gNErVoIXhglSEFG5jxc6aFjYuqyfD2mcYTHvWNxBE83qodOpdT4nzMlLaaqRYGM7iM2hlMd62R7W_UuzdBAdtZvCsmfpf86dvBY_SpYksA4Dn1s5aws_d4QqR-ez-oa6myP",
    isPrimary: true,
  },
  {
    id: 2,
    bankName: "Kuda Bank",
    accountNumber: "5501 **** 9920",
    logo: "https://brandlogos.net/wp-content/uploads/2022/05/kuda_bank-logo-brandlogo.net_.png",
    isPrimary: false,
  },
];

const BankInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="glass-card rounded-xl p-4 md:p-8 border-l-4 border-l-primary/50 flex flex-col h-full bg-slate-50/50 dark:bg-white/2 backdrop-blur-sm shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-sm md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Methods</h3>
        <span className="bg-playza-green/10 text-playza-green text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-playza-green/20 flex items-center gap-1 shadow-sm">
          <VerifiedIcon size={12} /> Verified
        </span>
      </div>

      <div className="space-y-3 flex-1">
        {ACCOUNTS.map((acc) => (
          <div
            key={acc.id}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 relative group ${
              acc.isPrimary 
                ? "bg-white dark:bg-slate-900 hover:border-primary/40 border-primary/20 shadow-md" 
                : "bg-slate-50 dark:bg-white/5 border-white/5 hover:border-white/20 opacity-70 hover:opacity-100"
            }`}
          >
            <div className="size-10 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-inner shrink-0">
              <img
                alt={acc.bankName}
                className="w-full h-full object-contain"
                src={acc.logo}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white truncate">
                  {acc.bankName}
                </p>
                {acc.isPrimary && (
                  <CheckCircle2 size={12} className="text-primary shrink-0" />
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em]">
                {acc.accountNumber}
              </p>
            </div>
            {acc.isPrimary && (
              <span className="text-[8px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded italic">
                Primary
              </span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/profile/settings#financial-methods")}
        className="w-full mt-6 py-3.5 text-[10px] font-black text-primary uppercase tracking-[0.15em] border border-primary/20 hover:bg-primary/5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
      >
        Manage Payout Methods
      </button>
    </div>
  );
};

export default BankInfo;
