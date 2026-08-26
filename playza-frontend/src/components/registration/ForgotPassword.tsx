import { useState } from "react";
import { Mail, Loader2, MailCheck, AlertCircle } from "lucide-react";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";

const BRAND = "#00aeee"; // Playza's actual logo blue — see LogIn.tsx/
// RegistrationForm.tsx for why this is a fixed hex rather than a theme
// variable (keeps the card identical in light and dark mode).

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
    sendReset(
      { email },
      {
        onSuccess: () => {},
        onError: () => {},
      },
    );
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-white dark:bg-[#12101c] rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-8">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(0,174,238,0.12)" }}>
            {isSuccess ? <MailCheck size={26} style={{ color: BRAND }} /> : <Mail size={26} style={{ color: BRAND }} />}
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold text-[#0f172a] dark:text-white mb-1">
          {isSuccess ? "Check Your Email" : "Forgot Password?"}
        </h1>
        <p className="text-center text-sm text-[#64748b] dark:text-slate-400 mb-6">
          {isSuccess
            ? `We've sent a password reset link to ${email}. Check your inbox or spam folder.`
            : "No worries — enter your email and we'll send you a reset link."}
        </p>

        {!isSuccess ? (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-[#334155] dark:text-slate-300 mb-1.5">
                Email Address <span style={{ color: BRAND }}>*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-600" size={16} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 dark:border-white/15 rounded-lg py-2.5 pl-9 pr-3 text-sm text-[#0f172a] dark:text-white placeholder:text-[#94a3b8] dark:placeholder:text-slate-600 outline-none transition-colors focus:border-[#00aeee]"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-600 text-xs">{error.message}</p>
              </div>
            )}

            <button
              disabled={isPending || !email}
              className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: BRAND }}
              type="submit"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <p className="text-center text-sm text-[#475569] dark:text-slate-400">
              Remembered your password?{" "}
              <button type="button" onClick={() => onClick("login")} className="font-medium hover:underline" style={{ color: BRAND }}>
                Log in
              </button>
            </p>
          </form>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => onClick("login")}
              className="w-full py-3 rounded-lg text-white font-semibold text-sm"
              style={{ background: BRAND }}
            >
              Back to Login
            </button>
            <p className="text-center text-sm text-[#475569] dark:text-slate-400">
              Didn't receive it?{" "}
              <button onClick={() => sendReset({ email })} className="font-medium hover:underline" style={{ color: BRAND }}>
                Resend
              </button>
            </p>
          </div>
        )}
      </div>

      <div className="text-center mt-4">
        <button onClick={() => onClick("login")} className="text-xs text-[#94a3b8] dark:text-slate-500 hover:text-[#475569] dark:hover:text-slate-300 transition-colors">
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;