import { Key, LockOpen } from "lucide-react";
import { MdLockReset, MdVerifiedUser } from "react-icons/md";

const NewPassword = ({ onClick }: { onClick: (value: string) => void }) => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[150px]"></div>
      <div className="max-w-130 w-full glass-card rounded-xl p-2 lg:p-10 neo-shadow z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 md:p-3 bg-primary/10 rounded-full mb-4">
            <MdLockReset className="text-primary text-xl md:text-3xl" />
          </div>
          <h1 className="text-slate-900 dark:text-slate-100 text-xl md:text-3xl font-bold leading-tight mb-2">
            Secure Reset
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
            Complete the verification to secure your gaming assets and reset
            your credentials.
          </p>
        </div>
        <form className="flex flex-col gap-2 md:gap-6">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-3">
              Verification Code
            </label>
            <div className="flex justify-between gap-2 sm:gap-4">
              <input
                className="w-12 h-14 text-center bg-background-dark/50 border border-slate-300 dark:border-slate-700 rounded-lg text-primary text-base md:text-xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                maxLength={1}
                type="text"
                placeholder="•"
              />
              <input
                className="w-12 h-14 text-center bg-background-dark/50 border border-slate-300 dark:border-slate-700 rounded-lg text-primary text-base md:text-xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                maxLength={1}
                type="text"
                placeholder="•"
              />
              <input
                className="w-12 h-14 text-center bg-background-dark/50 border border-slate-300 dark:border-slate-700 rounded-lg text-primary text-base md:text-xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                maxLength={1}
                placeholder="•"
                type="text"
              />
              <input
                className="w-12 h-14 text-center bg-background-dark/50 border border-slate-300 dark:border-slate-700 rounded-lg text-primary text-base md:text-xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                maxLength={1}
                placeholder="•"
                type="text"
              />
              <input
                className="w-12 h-14 text-center bg-background-dark/50 border border-slate-300 dark:border-slate-700 rounded-lg text-primary text-base md:text-xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                maxLength={1}
                placeholder="•"
                type="text"
              />
              <input
                className="w-12 h-14 text-center bg-background-dark/50 border border-slate-300 dark:border-slate-700 rounded-lg text-primary text-base md:text-xl font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                maxLength={1}
                placeholder="•"
                type="text"
              />
            </div>
            <p className="text-xs text-slate-500 mt-3 text-right">
              Didn't receive code?{" "}
              <button className="text-primary hover:underline" type="button">
                Resend
              </button>
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">
                New Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  className="w-full bg-background-dark/50 border border-slate-300 dark:border-slate-700 rounded-lg py-2 md:py-3 pl-2 md:pl-10 pr-2 md:pr-4 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                  placeholder="••••••••••••"
                  type="password"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                  Confirm Password
                </label>
                <span className="text-primary text-[10px] font-bold uppercase tracking-widest">
                  Strength: Strong
                </span>
              </div>
              <div className="relative">
                <MdVerifiedUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  className="w-full bg-background-dark/50 border border-slate-300 dark:border-slate-700 rounded-lg py-2 md:py-3 pl-2 md:pl-10 pr-2 md:pr-4 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                  placeholder="••••••••••••"
                  type="password"
                />
              </div>
            </div>
            <div className="flex gap-1 h-1.5 w-full mt-2">
              <div className="flex-1 bg-primary rounded-full"></div>
              <div className="flex-1 bg-primary rounded-full"></div>
              <div className="flex-1 bg-primary rounded-full"></div>
              <div className="flex-1 bg-primary rounded-full"></div>
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
          </div>
          <button
            onClick={() => onClick("login")}
            className="w-full bg-primary text-background-dark font-bold py-2 md:py-4 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all mt-4 neo-shadow"
            type="submit"
          >
            <LockOpen />
            Reset Password
          </button>
        </form>
      </div>
    </main>
  );
};

export default NewPassword;
