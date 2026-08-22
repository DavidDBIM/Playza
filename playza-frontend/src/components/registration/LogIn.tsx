import { useState } from "react";
import { User, Lock, Loader2, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { useLogin } from "@/hooks/auth/useLogin";
import { useNavigate, useSearchParams, Link } from "react-router";
import Turnstile from "@/components/common/Turnstile";

import { useAuth } from "@/context/auth";

interface LogInProps {
  onClick: (value: string) => void;
}

const LogIn = ({ onClick }: LogInProps) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [searchParams] = useSearchParams();
  const { mutate: login, isPending, error } = useLogin();

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { identifier, password, captcha_token: captchaToken },
      {
        onSuccess: (data) => {
          const { access_token, refresh_token, user } = data.data;
          setAuth(
            {
              id: user.id,
              username: user.username,
              email: user.email,
              phone: user.phone,
              referralCode: user.referral_code,
              avatarUrl: user.avatar_url,
              firstName: user.first_name,
              lastName: user.last_name,
              pzaPoints: user.pza_points,
              isEmailVerified: user.is_email_verified,
            },
            access_token,
            refresh_token,
          );
          const redirectTo = searchParams.get("redirect") || "/";
          navigate(redirectTo);
        },

        // A Turnstile token is single-use — Cloudflare invalidates it the
        // moment the backend checks it, success or fail. So on a failed
        // login (e.g. wrong password) we have to re-mount the widget to
        // get a fresh token, otherwise the next attempt would fail captcha
        // even with the right password.
        onError: () => {
          setCaptchaToken("");
          setTurnstileKey((k) => k + 1);
        },
      },
    );
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 md:px-6">
      <Link
        to="/"
        className="mb-4 flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-black uppercase tracking-[0.2em] text-[10px] group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Arena
      </Link>

      {/* Same signature treatment as the signup card — angled violet→magenta
          strip on white, not the app's dark shell, kept consistent across
          both halves of the auth flow. */}
      <div className="relative">
        <div className="absolute -top-24 -left-20 w-64 h-64 bg-primary/25 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 -right-20 w-56 h-56 bg-fuchsia-500/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 bg-white rounded-[2rem] shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden">
          <div className="relative px-6 pt-7 pb-5 overflow-hidden" style={{ background: "linear-gradient(115deg, #7c3aed 0%, #7c3aed 55%, #d946ef 100%)" }}>
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)" }} />
            <div className="relative flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic leading-none">
                  Welcome Back
                </h1>
                <p className="text-white/70 text-[11px] font-bold mt-1.5">
                  Log in to your dashboard and active tournaments.
                </p>
              </div>
              <div className="shrink-0 hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 border border-white/20">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">🔒 Secure</span>
              </div>
            </div>
          </div>

          <div className="px-6 pt-6 pb-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Username or Email
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                    size={17}
                  />
                  <input
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 placeholder:text-slate-400 transition-all font-bold text-sm"
                    placeholder="Gaming handle or email"
                    type="text"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => onClick("forgot")}
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline hover:brightness-110 transition-all"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                    size={17}
                  />
                  <input
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 placeholder:text-slate-400 transition-all font-bold text-sm"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-red-600 text-xs font-semibold">{error.message}</p>
                </div>
              )}

              <div className="flex justify-center">
                <Turnstile key={turnstileKey} onVerify={setCaptchaToken} />
              </div>

              <button
                type="submit"
                disabled={isPending || !identifier || !password || (!!import.meta.env.VITE_TURNSTILE_SITE_KEY && !captchaToken)}
                className="w-full h-12 text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 text-sm group border-none"
                style={{ background: "linear-gradient(115deg, #a855f7, #d946ef)", boxShadow: "0 8px 20px -6px rgba(168,85,247,0.5)" }}
              >
                {isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Launch Arena
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 mt-1 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-xs font-medium tracking-tight">
                New to the platform?
                <button
                  onClick={() => onClick("signup")}
                  className="text-primary font-black hover:text-slate-900 ml-2 transition-colors uppercase tracking-widest text-[10px] underline underline-offset-4"
                >
                  CREATE ACCOUNT
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogIn;