import { useState } from "react";
import { User, Lock, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useLogin } from "@/hooks/auth/useLogin";
import { useNavigate, useSearchParams, Link } from "react-router";
import Turnstile from "@/components/common/Turnstile";

import { useAuth } from "@/context/auth";

const BRAND = "#00aeee"; // Playza's --primary, fixed rather than referencing
// the CSS variable — that variable itself shifts value between light/dark
// mode, and this card is deliberately locked to look identical regardless
// of the site's theme toggle. A fixed hex keeps it that way.

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
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-white dark:bg-[#12101c] rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-8">
        {/* Centered logo badge — light violet circle, matches the
            reference's icon treatment, using Playza's actual wordmark
            scaled down to fit the circle. */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(0,174,238,0.12)" }}>
            <img src="/logo.webp" alt="Playza" className="h-6 w-auto object-contain" />
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold text-[#0f172a] dark:text-white mb-1">
          Welcome Back
        </h1>
        <p className="text-center text-sm text-[#64748b] dark:text-slate-500 mb-6">
          Log in to your Playza account
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-[#334155] dark:text-slate-300 mb-1.5">
              Username or Email <span style={{ color: BRAND }}>*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-600" size={16} />
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full border border-slate-300 dark:border-white/15 rounded-lg py-2.5 pl-9 pr-3 text-sm text-[#0f172a] dark:text-white placeholder:text-[#94a3b8] dark:placeholder:text-slate-600 outline-none transition-colors focus:border-[#00aeee]"
                placeholder="Enter your username or email"
                type="text"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-[#334155] dark:text-slate-300">
                Password <span style={{ color: BRAND }}>*</span>
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-600" size={16} />
              <input
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 dark:border-white/15 rounded-lg py-2.5 pl-9 pr-10 text-sm text-[#0f172a] dark:text-white placeholder:text-[#94a3b8] dark:placeholder:text-slate-600 outline-none transition-colors focus:border-[#00aeee]"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-600 hover:text-[#334155] dark:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="text-right mt-1.5">
              <button
                type="button"
                onClick={() => onClick("forgot")}
                className="text-sm font-medium hover:underline"
                style={{ color: BRAND }}
              >
                Forgot password?
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-600 text-xs">{error.message}</p>
            </div>
          )}

          <div className="flex justify-center">
            <Turnstile key={turnstileKey} onVerify={setCaptchaToken} />
          </div>

          <button
            type="submit"
            disabled={isPending || !identifier || !password || (!!import.meta.env.VITE_TURNSTILE_SITE_KEY && !captchaToken)}
            className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: BRAND }}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#475569] dark:text-slate-400 mt-6">
          Don't have an account?{" "}
          <button
            onClick={() => onClick("signup")}
            className="font-medium hover:underline"
            style={{ color: BRAND }}
          >
            Sign up
          </button>
        </p>
      </div>

      <div className="text-center mt-4">
        <Link to="/" className="text-xs text-[#94a3b8] dark:text-slate-600 hover:text-[#475569] dark:text-slate-400 transition-colors">
          ← Back to Arena
        </Link>
      </div>
    </div>
  );
};

export default LogIn;