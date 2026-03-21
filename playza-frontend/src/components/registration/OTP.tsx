import { Edit, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";

interface OtpProps {
  onClick: (value: string) => void;
}

const OTP = ({ onClick }: OtpProps) => {
  return (
    <main className="h-full flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="glass-card p-2 md:p-6 rounded-2xl shadow-2xl relative overflow-hidden border border-slate-200 dark:border-white/10 text-center">
          {/* Decorative Cyan Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50"></div>
          
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
            <ShieldCheck className="text-primary" size={40} />
          </div>

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase font-display">
              Verify Account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
              We've sent a 6-digit verification code to
              <br />
              <span className="text-primary font-black tracking-wider">+234 •••• ••• 424</span>
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <fieldset className="flex gap-2 md:gap-4">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  required
                  className="w-12 h-14 md:w-14 md:h-16 text-center bg-slate-100 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-white/5 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary text-2xl font-black text-primary transition-all outline-none"
                  max="9"
                  maxLength={1}
                  type="text"
                />
              ))}
            </fieldset>
          </div>

          <div className="space-y-6">
            <Button
              onClick={() => window.location.href = "/"}
              className="w-full h-15 bg-primary text-background-dark text-lg font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
            >
              Verify & Launch
            </Button>
            
            <div className="flex flex-col items-center gap-6 pt-4">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="bg-slate-100 dark:bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/5">
                    <p className="text-primary text-sm font-black font-mono">01:59</p>
                  </div>
                  <p className="text-slate-500 text-[9px] uppercase font-black tracking-widest mt-2 opacity-50">
                    Code Expires
                  </p>
                </div>
                <div className="h-10 w-px bg-slate-200 dark:bg-white/5"></div>
                <button className="text-slate-500 dark:text-slate-400 hover:text-primary text-xs font-black uppercase tracking-widest transition-colors">
                  Resend Code
                </button>
              </div>

              <button
                onClick={() => onClick("signup")}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all p-3 border-t border-slate-200 dark:border-white/5 w-full justify-center group"
              >
                <Edit size={14} className="group-hover:text-primary transition-colors" />
                Change contact information
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OTP;
