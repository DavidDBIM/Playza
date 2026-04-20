import { useState } from "react";
import { User, Lock, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useLogin } from "@/hooks/auth/useLogin";
import { useNavigate, useSearchParams } from "react-router";

import { useAuth } from "@/context/auth";

interface LogInProps {
  onClick: (value: string) => void;
}

const LogIn = ({ onClick }: LogInProps) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const { mutate: login, isPending, error } = useLogin();

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[LogIn] Submitting login request for identifier:", identifier);
    login(
      { identifier, password },
      {
        onSuccess: (data) => {
          console.log("[LogIn] Success! Token and user data received:", data);
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

        onError: (err: unknown) => {
          const error = err as {
            response?: { data?: { message?: string } };
            message?: string;
          };
          console.error(
            "[LogIn] Error during login:",
            error.response?.data?.message || error.message,
          );
        },
      },
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto px-6">
      <div className="relative">

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase font-display">
            Welcome Back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
            Log in to access your dashboard and active tournaments.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">
              Username or Email
            </label>
            <div className="relative group">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-900/[0.03] dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 transition-all font-bold"
                placeholder="Gaming handle or email"
                type="text"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/[0.03] dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 transition-all font-bold"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors hover:text-slate-900 dark:hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs md:text-sm text-center font-medium">
              {error.message}
            </p>
          )}

          <div className="space-y-4 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-black py-4.5 rounded-2xl transition-all shadow-lg shadow-primary/10 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-sm group"
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
          </div>
        </form>

        <div className="pt-8 mt-10 border-t border-slate-200/50 dark:border-white/5 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium tracking-tight">
            New to the platform?
            <button
              onClick={() => onClick("signup")}
              className="text-primary font-black hover:text-slate-900 dark:hover:text-white ml-2 transition-colors uppercase tracking-widest text-[10px] underline underline-offset-4"
            >
              CREATE ACCOUNT
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogIn;

