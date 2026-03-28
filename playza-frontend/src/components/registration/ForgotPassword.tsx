import { useState } from "react";
import { ArrowBigLeft, Loader2, MailCheck } from "lucide-react";
import { MdAlternateEmail } from "react-icons/md";
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
    <main className="flex-1 h-full flex items-center justify-center">
      <div className="glass-card w-full max-w-120 rounded-xl p-2 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50"></div>
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-primary/10 p-2 md:p-4 rounded-full mb-6">
            {isSuccess ? (
              <MailCheck className="text-primary" size={36} />
            ) : (
              <RxReset className="material-symbols-outlined text-primary text-2xl md:text-4xl" />
            )}
          </div>
          <h1 className="text-slate-900 dark:text-white text-xl md:text-3xl font-bold leading-tight mb-3">
            {isSuccess ? "Check Your Email" : "Forgot Password?"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs md:text-base font-normal">
            {isSuccess
              ? `We've sent a password reset link to ${email}. Follow the link in the email to create a new password.`
              : "No worries! Enter your registered email below and we'll send you a secure reset link."}
          </p>
        </div>

        {!isSuccess && (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-slate-800 dark:text-slate-200 text-sm font-semibold flex items-center gap-2">
                <MdAlternateEmail className="material-symbols-outlined text-xs text-primary" />
                Email Address
              </label>
              <div className="relative">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-primary/20 bg-slate-900/5 dark:bg-white/5 dark:bg-background-dark/50 h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-2 md:px-4 transition-all"
                  placeholder="e.g. gamer@platform.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs md:text-sm text-center font-medium">
                {error.message}
              </p>
            )}

            <button
              disabled={isPending}
              className="w-full flex cursor-pointer items-center justify-center gap-2 rounded-lg h-14 px-2 md:px-5 bg-primary text-background-dark text-base font-bold tracking-wide shadow-[0_0_20px_rgba(19,218,236,0.3)] hover:shadow-[0_0_30px_rgba(19,218,236,0.5)] transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              type="submit"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending…
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="flex justify-center pt-2 md:pt-4">
              <div
                onClick={() => onClick("login")}
                className="group flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium cursor-pointer"
              >
                <ArrowBigLeft className="material-symbols-outlined text-sm md:text-lg transition-transform group-hover:-translate-x-1" />
                Back to Login
              </div>
            </div>
          </form>
        )}

        {isSuccess && (
          <div className="flex flex-col gap-2 md:gap-4">
            <button
              onClick={() => onClick("login")}
              className="w-full flex cursor-pointer items-center justify-center gap-2 rounded-lg h-14 px-2 md:px-5 bg-primary text-background-dark text-base font-bold tracking-wide shadow-[0_0_20px_rgba(19,218,236,0.3)] hover:shadow-[0_0_30px_rgba(19,218,236,0.5)] transition-all"
            >
              Back to Login
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("");
                sendReset({ email: "" });
              }}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-center"
            >
              Didn't receive it?{" "}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  sendReset({ email });
                }}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Resend
              </span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default ForgotPassword;

