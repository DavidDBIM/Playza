import { VerifiedIcon } from "lucide-react";

const BankInfo = () => {
  return (
    <div className="glass-card rounded-xl p-2 md:p-8 border-l-4 border-l-primary/50 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white">Bank Information</h3>
        <span className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-primary/20 flex items-center gap-1">
          <VerifiedIcon size={12} /> Verified
        </span>
      </div>
      <div className="space-y-4 flex-1">
        <div className="flex items-center gap-2 md:gap-4 p-2 md:p-4 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-white/5 group hover:border-primary/30 transition-colors">
          <div className="size-12 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden">
            <img
              alt="Bank Logo"
              className="w-full h-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxuRGEeXDIAhTZaRM5cIUhBBwMLqQLItgWx2Ps7uw78Sk2druQ6AnGFk2zttkm1xHbuuxq3rjnIH9NXr5DyLEANUZ_EVccv2xRf14eqXzqRM9M2sd58HOUFTGkSt304ko0OOSm2A4u4gNErVoIXhglSEFG5jxc6aFjYuqyfD2mcYTHvWNxBE83qodOpdT4nzMlLaaqRYGM7iM2hlMd62R7W_UuzdBAdtZvCsmfpf86dvBY_SpYksA4Dn1s5aws_d4QqR-ez-oa6myP"
            />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Bank Name</p>
            <p className="text-xs md:text-base font-bold text-slate-900 dark:text-white">Zenith Bank PLC</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2 md:gap-4">
          <div className="p-3 rounded-lg bg-white/2 dark:bg-black/2 border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Account Holder</p>
            <p className="text-xs md:text-sm font-medium text-slate-900 dark:text-white">John Doe</p>
          </div>
          <div className="p-3 rounded-lg bg-white/2 dark:bg-black/2 border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Account Number</p>
            <p className="text-xs md:text-sm font-medium text-slate-900 dark:text-white tracking-[0.2em]">**** 8841</p>
          </div>
        </div>
      </div>
      <button className="w-full mt-6 py-3 text-xs text-primary font-bold hover:bg-primary/10 border border-primary/20 rounded-lg transition-all cursor-pointer">
        Update Bank Details
      </button>
    </div>
  );
};

export default BankInfo;
