import { useState } from "react";
import { ArrowBigLeft, Loader2, MailCheck } from "lucide-react";
import { RxReset } from "react-icons/rx";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";

const ForgotPassword = ({ onClick }: { onClick: (value: string) => void }) => {
  const [email, setEmail] = useState("");
  const {
    mutate: sendReset,
    isPending,
    error,
    isSuccess,
  } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[ForgotPassword] Submitting reset request for email:", email);
    sendReset(
      { email },
      {
        onSuccess: (data) => {
          console.log("[ForgotPassword] Reset link sent successfully:", data);
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } }; message?: string };
          console.error(
            "[ForgotPassword] Error sending reset link:",
            error.response?.data?.message || error.message,
          );
        },
      },
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto px-6">
      <div className="relative">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-primary/5 p-5 rounded-2xl mb-6 border border-primary/20 group transition-all duration-500 hover:scale-110">
            {isSuccess ? (
              <MailCheck className="text-primary group-hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" size={32} />
            ) : (
              <RxReset className="text-primary text-3xl group-hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
            )}
          </div>
          <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight uppercase mb-3">
            {isSuccess ? "Check Your Email" : "Reset Portal"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
            {isSuccess
              ? `We've sent a password reset link to ${email}. Check your inbox or spam folder.`
              : "No stress! Enter your email and we'll send you a secure link to get back in the game."}
          </p>
        </div>

        {!isSuccess && (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/[0.03] dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 transition-all font-bold text-sm"
                  placeholder="Enter your gamer email"
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center font-bold italic">
                {error.message}
              </p>
            )}

            <button
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-black py-4.5 rounded-2xl transition-all shadow-xl shadow-primary/10 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-sm group"
              type="submit"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Request Arena Access
                  <RxReset className="group-hover:rotate-180 transition-transform duration-700" size={18} />
                </>
              )}
            </button>

            <div className="flex justify-center pt-8 mt-10 border-t border-slate-200/50 dark:border-white/5">
              <button
                type="button"
                onClick={() => onClick("login")}
                className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer"
              >
                <ArrowBigLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                Back to Login
              </button>
            </div>
          </form>
        )}

        {isSuccess && (
          <div className="flex flex-col gap-5 pt-4">
            <button
              onClick={() => onClick("login")}
              className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-black py-4.5 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] text-sm"
            >
              Back to Login
            </button>
            <p className="text-[10px] text-slate-500 text-center font-black uppercase tracking-[0.2em]">
              Didn't receive it?{" "}
              <span
                onClick={() => sendReset({ email })}
                className="text-primary hover:text-white cursor-pointer ml-1 underline underline-offset-4"
              >
                Resend Now
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

