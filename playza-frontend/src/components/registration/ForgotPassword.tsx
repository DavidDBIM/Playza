import { ArrowBigLeft } from "lucide-react";
import React from "react";
import { MdAlternateEmail, MdVerifiedUser } from "react-icons/md";
import { RxReset } from "react-icons/rx";

const ForgotPassword = ({ onClick }: { onClick: (value: string) => void }) => {
  return (
    <main className="flex-1 h-full flex items-center justify-center">
      <div className="glass-card w-full max-w-[480px] rounded-xl p-2 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-primary/10 p-4 rounded-full mb-6">
            <RxReset className="material-symbols-outlined text-primary text-4xl" />
          </div>
          <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight mb-3">
            Forgot Password?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base font-normal">
            No worries! Enter your registered details below and we'll send you a
            secure reset link.
          </p>
        </div>
        <form className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold flex items-center gap-2">
              <MdAlternateEmail className="material-symbols-outlined text-xs text-primary" />
              Email or Phone Number
            </label>
            <div className="relative">
              <input
                className="w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-primary/20 bg-slate-900/5 dark:bg-white/5 dark:bg-background-dark/50 h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 transition-all"
                placeholder="e.g. gamer@platform.com"
                type="text"
              />
            </div>
          </div>
          <button
            onClick={() => onClick("newpw")}
            className="w-full flex cursor-pointer items-center justify-center rounded-lg h-14 px-5 bg-primary text-background-dark text-base font-bold tracking-wide shadow-[0_0_20px_rgba(19,218,236,0.3)] hover:shadow-[0_0_30px_rgba(19,218,236,0.5)] transition-all transform hover:-translate-y-0.5"
            type="submit"
          >
            Send Reset Code
          </button>
          <div className="flex justify-center pt-4">
            <div
              onClick={() => onClick("login")}
              className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium"
            >
              <ArrowBigLeft className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1" />
              Back to Login
            </div>
          </div>
        </form>
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-primary/10 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center justify-center gap-1 uppercase tracking-widest font-bold">
            <MdVerifiedUser className="material-symbols-outlined text-xs" />
            Bank-Grade Security
          </p>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
