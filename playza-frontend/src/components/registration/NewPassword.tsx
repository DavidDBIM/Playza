import { useState, useEffect } from "react";
import { LockOpen, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { MdLockReset } from "react-icons/md";
import { resetPasswordApi } from "@/api/auth.api";
import { useNavigate } from "react-router";

const NewPassword = ({ onClick }: { onClick: (value: string) => void }) => {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Extract access_token from URL hash — Supabase puts it there after redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const token = params.get("access_token");
      const type = params.get("type");
      if (token && type === "recovery") {
        setAccessToken(token);
        // Clean the hash from URL without reloading
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  const calculateStrength = () => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 8) s += 25;
    if (/[A-Z]/.test(newPassword)) s += 25;
    if (/[0-9]/.test(newPassword)) s += 25;
    if (/[^A-Za-z0-9]/.test(newPassword)) s += 25;
    return s;
  };

  const strength = calculateStrength();
  const strengthColor = strength <= 25 ? "bg-red-500" : strength <= 50 ? "bg-orange-500" : strength <= 75 ? "bg-yellow-500" : "bg-green-500";
  const strengthLabel = strength <= 25 ? "Weak" : strength <= 50 ? "Fair" : strength <= 75 ? "Good" : "Strong";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!accessToken) {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi({
        access_token: accessToken,
        new_password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        onClick("login");
        navigate("/registration?view=login");
      }, 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-lg mx-auto text-center px-6">
        <div className="bg-green-500/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-green-500/20 shadow-inner animate-in zoom-in duration-500">
          <CheckCircle2 className="text-green-500 w-12 h-12" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Identity Reclaimed!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Your credentials have been updated. Redirecting to Arena access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-6">
      <div className="relative">

        <div className="text-center mb-10">
          <div className="bg-primary/5 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-10 border border-primary/20 shadow-inner group transition-all duration-500 hover:scale-110">
            <MdLockReset className="text-primary text-4xl group-hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">
            Set New Password
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
            {accessToken ? "Create a strong new password for your account." : "This link is invalid or has expired. Request a new reset link."}
          </p>
        </div>

        {!accessToken ? (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold">Invalid or expired reset link.</p>
            </div>
            <button
              onClick={() => onClick("forgot")}
              className="w-full bg-primary text-slate-950 font-black py-4.5 rounded-2xl uppercase tracking-[0.2em] text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary/10"
            >
              Request New Secure Link
            </button>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                New Password
              </label>
              <div className="relative group">
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900/[0.03] dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 rounded-2xl py-4 px-6 pr-14 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-bold text-sm"
                  placeholder="New secure password"
                  type={showNew ? "text" : "password"}
                  required
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {newPassword && (
                <div className="flex items-center gap-2 px-1 mt-2">
                  <div className="flex-1 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-700 ${strengthColor}`} style={{ width: `${strength}%` }} />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${strengthColor.replace("bg-", "text-")}`}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-slate-900/[0.03] dark:bg-white/[0.03] border rounded-2xl py-4 px-6 pr-14 text-slate-900 dark:text-white focus:ring-2 outline-none transition-all font-bold text-sm ${
                    confirmPassword && newPassword !== confirmPassword
                      ? "border-red-500/50 focus:ring-red-500/10"
                      : "border-slate-200/50 dark:border-white/5 focus:ring-primary/20 focus:border-primary/50"
                  }`}
                  placeholder="Verify new password"
                  type={showConfirm ? "text" : "password"}
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {confirmPassword && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    {newPassword === confirmPassword
                      ? <CheckCircle2 size={16} className="text-green-500" />
                      : <AlertCircle size={16} className="text-red-500" />}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            <button
              disabled={loading || !newPassword || newPassword !== confirmPassword || strength < 25}
              className="w-full bg-primary text-slate-950 font-black py-4.5 rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/10 disabled:opacity-50 group"
              type="submit"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Calibrating…</span>
                </div>
              ) : (
                <>
                  Confirm New Identity
                  <LockOpen size={18} className="group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium pt-4">
              Remembered your identity?{" "}
              <button type="button" onClick={() => onClick("login")} className="text-primary font-black hover:text-slate-900 dark:hover:text-white transition-colors underline underline-offset-4 uppercase tracking-widest text-[10px]">
                Arena Log In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewPassword;
