import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { resetPasswordApi } from "@/api/auth.api";
import { useNavigate } from "react-router";

const BRAND = "#00aeee"; // Playza's actual logo blue — see LogIn.tsx for why
// this is a fixed hex rather than a theme variable.

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
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-white dark:bg-[#12101c] rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-8 text-center">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-50 dark:bg-green-500/10">
              <CheckCircle2 className="text-green-500" size={30} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-1">Password Updated</h1>
          <p className="text-sm text-[#64748b] dark:text-slate-400">Redirecting you to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-white dark:bg-[#12101c] rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-8">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(0,174,238,0.12)" }}>
            <Lock size={26} style={{ color: BRAND }} />
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold text-[#0f172a] dark:text-white mb-1">
          Set New Password
        </h1>
        <p className="text-center text-sm text-[#64748b] dark:text-slate-400 mb-6">
          {accessToken ? "Create a strong new password for your account." : "This link is invalid or has expired."}
        </p>

        {!accessToken ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-600 text-xs">Invalid or expired reset link.</p>
            </div>
            <button
              onClick={() => onClick("forgot")}
              className="w-full py-3 rounded-lg text-white font-semibold text-sm"
              style={{ background: BRAND }}
            >
              Request New Reset Link
            </button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-[#334155] dark:text-slate-300 mb-1.5">
                New Password <span style={{ color: BRAND }}>*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-600" size={16} />
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-300 dark:border-white/15 rounded-lg py-2.5 pl-9 pr-9 text-sm text-[#0f172a] dark:text-white placeholder:text-[#94a3b8] dark:placeholder:text-slate-600 outline-none transition-colors focus:border-[#00aeee]"
                  placeholder="Enter new password"
                  type={showNew ? "text" : "password"}
                  required
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-600 hover:text-[#334155] dark:hover:text-slate-300 transition-colors">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {newPassword && (
                <div className="flex items-center gap-1.5 px-0.5 pt-1.5">
                  <div className="flex-1 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${strengthColor}`} style={{ width: `${strength}%` }} />
                  </div>
                  <span className={`text-[9px] font-semibold shrink-0 ${strengthColor.replace("bg-", "text-")}`}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#334155] dark:text-slate-300 mb-1.5">
                Confirm Password <span style={{ color: BRAND }}>*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-600" size={16} />
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full border rounded-lg py-2.5 pl-9 pr-9 text-sm text-[#0f172a] dark:text-white placeholder:text-[#94a3b8] dark:placeholder:text-slate-600 outline-none transition-colors ${
                    confirmPassword && newPassword !== confirmPassword
                      ? "border-red-400 focus:border-red-400"
                      : "border-slate-300 dark:border-white/15 focus:border-[#00aeee]"
                  }`}
                  placeholder="Confirm new password"
                  type={showConfirm ? "text" : "password"}
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] dark:text-slate-600 hover:text-[#334155] dark:hover:text-slate-300 transition-colors">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                {confirmPassword && !showConfirm && (
                  <div className="absolute right-9 top-1/2 -translate-y-1/2">
                    {newPassword === confirmPassword
                      ? <CheckCircle2 size={14} className="text-green-500" />
                      : <AlertCircle size={14} className="text-red-500" />}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            <button
              disabled={loading || !newPassword || newPassword !== confirmPassword || strength < 25}
              className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: BRAND }}
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>

            <p className="text-center text-sm text-[#475569] dark:text-slate-400">
              Remembered your password?{" "}
              <button type="button" onClick={() => onClick("login")} className="font-medium hover:underline" style={{ color: BRAND }}>
                Log in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewPassword;