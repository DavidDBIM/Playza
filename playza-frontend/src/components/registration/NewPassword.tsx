import { LockOpen } from "lucide-react";
import { MdLockReset } from "react-icons/md";

const NewPassword = ({ onClick }: { onClick: (value: string) => void }) => {
  return (
    <div className="w-full max-w-lg">
      <div className="p-4 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-30"></div>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
            <MdLockReset className="text-primary text-3xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">
            Finalize Reset
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
            Protect your account with a high-strength password.
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-2">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  className="w-full h-12 md:h-14 text-center bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-white/10 rounded-xl text-primary text-xl font-black focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                  maxLength={1}
                  type="text"
                  placeholder="•"
                />
              ))}
            </div>
            <p className="text-[10px] text-slate-500 text-right font-black uppercase tracking-widest">
              No code?{" "}
              <button className="text-primary hover:underline" type="button">
                Resend link
              </button>
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                New Matrix Key
              </label>
              <div className="relative group">
                <input
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 px-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
                  placeholder="••••••••••••"
                  type="password"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Confirm Key
                </label>
                <span className="text-primary text-[9px] font-black uppercase tracking-tight">
                  Strength: Optimal
                </span>
              </div>
              <div className="relative group">
                <input
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 px-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
                  placeholder="••••••••••••"
                  type="password"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => onClick("login")}
            className="w-full bg-primary text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest text-sm shadow-lg shadow-primary/10"
            type="submit"
          >
            <LockOpen size={18} />
            Update Credentials
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPassword;
