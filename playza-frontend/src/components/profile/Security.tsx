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
} from "react-icons/md";
import { PinModal } from "./PinModal";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

const Security = () => {
  const [isFingerprintEnabled, setIsFingerprintEnabled] = useState(true);
  const [isFaceIDEnabled] = useState(false);
  const [pinModal, setPinModal] = useState<"change" | "create" | null>(null);

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
        <h2 className="md:hidden text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Security
        </h2>

        {/* Header Info */}
        <div className="bg-playza-green/10 dark:bg-playza-green/5 p-4 md:p-6 rounded-2xl border border-playza-green/20 flex items-start gap-4 shadow-lg shadow-playza-green/5">
          <div className="size-12 rounded-2xl bg-playza-green/20 flex items-center justify-center text-playza-green text-3xl shrink-0 shadow-inner">
            <MdShield />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-black italic text-lg uppercase tracking-tighter">
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
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-xl shadow-inner">
              <MdVpnKey />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Financial Security
            </h2>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] border-slate-200 dark:border-white/5 space-y-8 shadow-xl">
            <div className="flex flex-col lg:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-slate-900 dark:text-white font-black text-sm italic uppercase tracking-tighter">
                  Withdrawal PIN
                </p>
                <p className="text-slate-500 dark:text-slate-500 text-xs font-bold max-w-sm">
                  Required for all fund transfers and withdrawals. Never share
                  this PIN with anyone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPinModal("change")}
                  className="h-11 px-6 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-widest shadow-sm"
                >
                  Change PIN
                </button>
                <button
                  onClick={() => setPinModal("create")}
                  className="h-11 px-6 bg-primary/10 border border-primary/20 rounded-xl text-xs font-black text-primary hover:bg-primary/20 transition-all uppercase tracking-widest shadow-lg shadow-primary/10"
                >
                  Create New
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/5"></div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-slate-900 dark:text-white font-black text-sm italic uppercase tracking-tighter">
                  2FA for Withdrawals
                </p>
                <p className="text-slate-500 text-xs font-bold max-w-sm">
                  Receive an SMS/Email code for every withdrawal request.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-14 h-7 bg-slate-200 dark:bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white dark:after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner transition-colors"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Biometrics */}
        <section className="space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-playza-blue/20 flex items-center justify-center text-playza-blue text-xl shadow-inner">
              <MdFingerprint />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Biometrics
            </h2>
          </div>

          <div className="gl-card p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 space-y-8 shadow-xl bg-white dark:bg-white/5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-slate-900 dark:text-white font-black text-sm italic uppercase tracking-tighter">
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
                <div className="w-14 h-7 bg-slate-200 dark:bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white dark:after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner transition-colors"></div>
              </label>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/5"></div>

            <div className="flex items-center justify-between opacity-50">
              <div className="space-y-1">
                <p className="text-slate-900 dark:text-white font-black text-sm italic uppercase tracking-tighter">
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
                <div className="w-14 h-7 bg-slate-100 dark:bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-background-dark after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary/20 shadow-inner transition-colors"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Account Password */}
        <section className="space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary text-xl shadow-inner">
              <MdLockReset />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Account Access
            </h2>
          </div>

          <div className="bg-white dark:bg-[#0a0f1e]/80 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 size-32 bg-secondary/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button className="h-12 px-10 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-lg">
                Update Password
              </button>
            </div>
          </div>
        </section>

        {/* Active Sessions */}
        <section className="space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-slate-500/20 flex items-center justify-center text-slate-500 text-xl shadow-inner">
              <MdDevices />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Active Sessions
            </h2>
          </div>

          <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl">
            <div className="p-6 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Signed in Devices (3)
              </p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-5">
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
            <div className="p-6 bg-red-500/5 text-center">
              <button className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] hover:brightness-125 transition-all">
                Logout from all other devices
              </button>
            </div>
          </div>
        </section>

        {/* Legal Documents */}
        <section className="space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-muted/20 flex items-center justify-center text-muted-foreground text-xl shadow-inner border border-white/5">
              <MdInfo />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight uppercase">
              Legal Documents
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/terms" className="glass-card p-6 rounded-3xl border-slate-200 dark:border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic group-hover:text-primary transition-colors">Terms & Conditions</span>
              <ArrowRight className="text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" size={16} />
            </Link>
            <Link to="/privacy" className="glass-card p-6 rounded-3xl border-slate-200 dark:border-white/5 flex items-center justify-between group hover:border-accent/30 transition-all">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic group-hover:text-accent transition-colors">Privacy Policy</span>
              <ArrowRight className="text-slate-400 group-hover:text-accent group-hover:translate-x-1 transition-all" size={16} />
            </Link>
          </div>
        </section>

        {/* Footer Note */}
        <div className="p-6 rounded-4xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-transparent flex items-center gap-4 opacity-80">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <MdInfo className="text-xl text-primary" />
          </div>
          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 leading-relaxed uppercase tracking-wider">
            If you notice any suspicious activity, please contact support
            immediately or use the 'Terminate All' function above.
          </p>
        </div>
      </div>
    </>
  );
};

export default Security;
