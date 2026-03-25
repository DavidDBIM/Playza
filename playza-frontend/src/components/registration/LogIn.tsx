import { useState } from "react";
import { User, Lock, Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/auth/useLogin";
import { useNavigate } from "react-router";

interface LogInProps {
  onClick: (value: string) => void;
}

const LogIn = ({ onClick }: LogInProps) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending, error } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { identifier, password },
      {
        onSuccess: (data) => {
          console.log("Login success:", data);
          navigate("/");
        },
      },
    );
  };

  return (
    <main className="h-full flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="glass-card p-2 md:p-6 rounded-2xl shadow-2xl relative overflow-hidden border border-slate-200 dark:border-white/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50"></div>

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase font-display">
              Welcome Back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
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
                  className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all font-medium"
                  placeholder="AnthonyGamer"
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
                  className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all font-medium"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-medium">
                {error.message}
              </p>
            )}

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Enter PlayZa"
                )}
              </button>
            </div>
          </form>

          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/5 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              New to the platform?
              <button
                onClick={() => onClick("signup")}
                className="text-primary font-bold hover:underline ml-1"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LogIn;

