import { useState } from "react";
import {
  MdVpnKey,
  MdFingerprint,
  MdDevices,
  MdShield,
  MdLockReset,
  MdInfo,
  MdSmartphone,
  MdDesktopWindows,
  MdLogout,
  MdWarning,
} from "react-icons/md";
import { PinModal } from "./PinModal";
import { Link, useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useSecurity } from "@/hooks/profile/useSecurity";
import { useDeactivateUser } from "@/hooks/users/useDeactivateUser";
import { useProfile } from "@/hooks/profile/useProfile";
import { TokenStorage } from "@/api/axiosInstance";

const Security = () => {
  const { pinStatus, changePassword, updatePreferences, isLoadingPinStatus } = useSecurity();
  const { data: profile } = useProfile();
  const { mutate: deactivateUser, isPending: isDeactivating } = useDeactivateUser();
  const [isFingerprintEnabled, setIsFingerprintEnabled] = useState(true);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isFaceIDEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pinModal, setPinModal] = useState<"change" | "create" | null>(null);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDeactivate = () => {
    if (profile) {
      deactivateUser(profile.id, {
        onSuccess: () => {
          TokenStorage.clearTokens();
          window.location.href = "/";
        },
      });
    }
  };

  const handlePasswordUpdate = () => {
    if (!currentPassword || !newPassword) return;
    changePassword({ current_password: currentPassword, new_password: newPassword });
    setCurrentPassword("");
    setNewPassword("");
  };

  const activeSessions = [
    {
      id: 1,
      device: "iPhone 15 Pro",
      location: "Lagos, Nigeria",
      time: "Active Now",
      current: true,
    },
    {
      id: 2,
      device: "Windows Desktop • Chrome",
      location: "Lagos, Nigeria",
      time: "2 hours ago",
      current: false,
    },
    {
      id: 3,
      device: "Samsung Galaxy S23",
      location: "Abuja, Nigeria",
      time: "Yesterday",
      current: false,
    },
  ];

  return (
    <>
      {pinModal && (
        <PinModal mode={pinModal} onClose={() => setPinModal(null)} />
      )}

      <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
        {/* Mobile Page Title */}
        <h2 className="md:hidden text-base md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Security
        </h2>

        {/* Header Info */}
        <div className="bg-playza-green/10 dark:bg-playza-green/5 p-4 md:p-6 rounded-2xl border border-playza-green/20 flex items-start gap-2 md:gap-4 shadow-lg shadow-playza-green/5">
          <div className="size-12 rounded-2xl bg-playza-green/20 flex items-center justify-center text-playza-green text-xl md:text-3xl shrink-0 shadow-inner">
            <MdShield />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-black italic text-sm md:text-lg uppercase tracking-tighter">
              Your Account is Secure
            </h3>
            <p className="text-slate-600 dark:text-slate-500 text-xs font-bold leading-relaxed">
              We use industry-standard encryption to protect your funds and
              personal data. Level 2 Security verified.
            </p>
          </div>
        </div>

        {/* Financial Security - Withdrawal PIN */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 md:gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-base md:text-xl shadow-inner">
              <MdVpnKey />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Financial Security
            </h2>
          </div>

          <div className="glass-card p-2 md:p-8 rounded-xl border-slate-200 dark:border-white/5 space-y-8 shadow-xl">
            <div className="flex flex-col lg:flex-row md:items-center justify-between gap-2 md:gap-6">
              <div className="space-y-1">
                <p className="text-slate-900 dark:text-white font-black text-xs md:text-sm italic uppercase tracking-tighter">
                  Withdrawal PIN
                </p>
                <div className="flex items-center gap-2">
                   <p className="text-slate-500 dark:text-slate-500 text-xs font-bold max-w-sm">
                    Required for all fund transfers and withdrawals.
                  </p>
                  {isLoadingPinStatus ? (
                    <div className="size-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter ${pinStatus?.has_pin ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {pinStatus?.has_pin ? 'ACTIVE' : 'NOT SET'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 md:gap-3">
                {pinStatus?.has_pin ? (
                  <button
                    onClick={() => setPinModal("change")}
                    className="h-11 px-2 md:px-6 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-widest shadow-sm"
                  >
                    Change PIN
                  </button>
                ) : (
                  <button
                    onClick={() => setPinModal("create")}
                    className="h-11 px-2 md:px-6 bg-primary/10 border border-primary/20 rounded-xl text-xs font-black text-primary hover:bg-primary/20 transition-all uppercase tracking-widest shadow-lg shadow-primary/10"
                  >
                    Create New
                  </button>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/5"></div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-slate-900 dark:text-white font-black text-xs md:text-sm italic uppercase tracking-tighter">
                  Account Visibility
                </p>
                <p className="text-slate-500 text-xs font-bold max-w-sm">
                  Allow other players to see your gaming activity.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={user?.show_activity}
                  onChange={(e) => updatePreferences({ show_activity: e.target.checked })}
                />
                <div className="w-14 h-7 bg-slate-200 dark:bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white dark:after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner transition-colors"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Biometrics */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 md:gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-playza-blue/20 flex items-center justify-center text-playza-blue text-base md:text-xl shadow-inner">
              <MdFingerprint />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Biometrics
            </h2>
          </div>

          <div className="gl-card p-2 md:p-8 rounded-xl border border-slate-200 dark:border-white/5 space-y-8 shadow-xl bg-white dark:bg-white/5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-slate-900 dark:text-white font-black text-xs md:text-sm italic uppercase tracking-tighter">
                  Fingerprint Login
                </p>
                <p className="text-slate-500 dark:text-slate-500 text-xs font-bold max-w-sm">
                  Use your device fingerprint to unlock your account and
                  authorize transactions.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isFingerprintEnabled}
                  onChange={() =>
                    setIsFingerprintEnabled(!isFingerprintEnabled)
                  }
                />
                <div className="w-14 h-7 bg-slate-200 dark:bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white dark:after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner transition-colors"></div>
              </label>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/5"></div>

            <div className="flex items-center justify-between opacity-50">
              <div className="space-y-1">
                <p className="text-slate-900 dark:text-white font-black text-xs md:text-sm italic uppercase tracking-tighter">
                  Face ID Unlock
                </p>
                <p className="text-slate-500 text-xs font-bold max-w-sm">
                  Facial recognition for quick access (Unavailable on this
                  device).
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-not-allowed">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  disabled
                  checked={isFaceIDEnabled}
                />
                <div className="w-14 h-7 bg-slate-100 dark:bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-background-dark after:content-[''] after:absolute after:top-1 after:left-1 after:bg-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/20 shadow-inner transition-colors"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Account Password */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 md:gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary text-base md:text-xl shadow-inner">
              <MdLockReset />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Account Access
            </h2>
          </div>

          <div className="bg-white dark:bg-[#0a0f1e]/80 backdrop-blur-3xl rounded-xl p-2 md:p-8 border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 size-32 bg-secondary/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-8 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 px-2 md:px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 px-2 md:px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handlePasswordUpdate}
                className="h-12 px-2 md:px-10 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-lg"
              >
                Update Password
              </button>
            </div>
          </div>
        </section>

        {/* Active Sessions */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 md:gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-slate-500/20 flex items-center justify-center text-slate-500 text-base md:text-xl shadow-inner">
              <MdDevices />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Active Sessions
            </h2>
          </div>

          <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl">
            <div className="p-2 md:p-6 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Signed in Devices (3)
              </p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-2 md:p-6 flex items-center justify-between group hover:bg-white/2 transition-colors"
                >
                  <div className="flex items-center gap-2 md:gap-5">
                    <div
                      className={`size-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                        session.current
                          ? "bg-playza-green/20 text-playza-green"
                          : "bg-slate-100 dark:bg-white/5 text-slate-500"
                      }`}
                    >
                      {session.device.includes("iPhone") ||
                      session.device.includes("Galaxy") ? (
                        <MdSmartphone />
                      ) : (
                        <MdDesktopWindows />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-slate-900 dark:text-white font-black text-sm italic tracking-tight">
                          {session.device}
                        </h4>
                        {session.current && (
                          <span className="text-[8px] bg-playza-green text-white font-black px-1.5 py-0.5 rounded uppercase">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                        {session.location} • {session.time}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <button className="text-[10px] font-black text-red-500/60 uppercase tracking-widest hover:text-red-500 transition-all">
                      Terminate Session
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="p-2 md:p-6 bg-red-500/5 flex flex-col items-center gap-3">
              <button className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] hover:brightness-125 transition-all">
                Logout from all other devices
              </button>
              <div className="h-px w-full bg-red-500/10 dark:bg-red-500/20 my-2"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-black text-rose-500 uppercase tracking-widest hover:text-white hover:bg-rose-500 px-4 py-2 rounded-xl transition-all"
              >
                <MdLogout className="text-base md:text-xl" />
                Sign Out Current Session
              </button>
            </div>
          </div>
        </section>

        {/* Legal Documents */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 md:gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-muted/20 flex items-center justify-center text-muted-foreground text-base md:text-xl shadow-inner border border-white/5">
              <MdInfo />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight uppercase">
              Legal Documents
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            <Link
              to="/terms"
              className="glass-card p-2 md:p-6 rounded-xl border-slate-200 dark:border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all"
            >
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic group-hover:text-primary transition-colors">
                Terms & Conditions
              </span>
              <ArrowRight
                className="text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all"
                size={16}
              />
            </Link>
            <Link
              to="/privacy"
              className="glass-card p-2 md:p-6 rounded-xl border-slate-200 dark:border-white/5 flex items-center justify-between group hover:border-accent/30 transition-all"
            >
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic group-hover:text-accent transition-colors">
                Privacy Policy
              </span>
              <ArrowRight
                className="text-slate-400 group-hover:text-accent group-hover:translate-x-1 transition-all"
                size={16}
              />
            </Link>
          </div>
        </section>

        {/* Footer Note */}
        <div className="p-2 md:p-6 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-transparent flex items-center gap-2 md:gap-4 opacity-80">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <MdInfo className="text-base md:text-xl text-primary" />
          </div>
          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 leading-relaxed uppercase tracking-wider">
            If you notice any suspicious activity, please contact support
            immediately or use the 'Terminate All' function above.
          </p>
        </div>

        {/* ── Danger Zone ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 md:gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 text-base md:text-xl shadow-inner">
              <MdWarning />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-black text-red-500 italic tracking-tight">
                Danger Zone
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Irreversible actions
              </p>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 overflow-hidden">
            {/* Warning banner */}
            <div className="bg-red-500/10 dark:bg-red-900/20 px-4 py-3 border-b border-red-200 dark:border-red-900/40 flex items-start gap-2">
              <MdWarning className="text-red-500 text-base shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-700 dark:text-red-400 font-bold leading-relaxed">
                Deactivating your account will immediately suspend access, freeze your wallet, and remove you from all active games and tournaments. This action <span className="font-black underline">cannot be undone</span> without contacting support.
              </p>
            </div>

            <div className="px-4 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Deactivate Gaming Account
                </p>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                  Your data will be retained for 90 days before permanent deletion.
                </p>
              </div>

              {!showDeactivateConfirm ? (
                <button
                  onClick={() => setShowDeactivateConfirm(true)}
                  className="shrink-0 h-11 px-6 rounded-xl border-2 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                >
                  Deactivate Account
                </button>
              ) : (
                <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                  <p className="text-[10px] text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-center">
                    Are you sure? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeactivateConfirm(false)}
                      className="flex-1 h-10 px-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeactivate}
                      disabled={isDeactivating}
                      className="flex-1 h-10 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-red-500/30 active:scale-95"
                    >
                      {isDeactivating ? (
                        <>
                          <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Deactivating…
                        </>
                      ) : (
                        "Yes, Deactivate"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default Security;
