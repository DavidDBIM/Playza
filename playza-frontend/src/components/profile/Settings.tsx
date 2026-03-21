import { useState } from "react";
import {
  MdAdd,
  MdPhotoCamera,
  MdNotifications,
  MdPayments,
  MdWarning,
  MdDelete,
} from "react-icons/md";
import { AddPaymentMethodModal } from "./AddPaymentMethodModal";
import { useAuth } from "@/context/auth";

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [hasKudaAccount, setHasKudaAccount] = useState(true);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");

  const handleSave = () => {
    updateProfile({ firstName, lastName });
  };

  return (
    <>
      {showAddMethod && (
        <AddPaymentMethodModal onClose={() => setShowAddMethod(false)} />
      )}

      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
        {/* Mobile Page Title */}
        <h2 className="md:hidden text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Settings
        </h2>

        {/* ── Public Identity ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-xl">
              <MdPhotoCamera />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Public Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-12 items-start glass-card p-8 rounded-[2.5rem] border-white/5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group/avatar">
                <div className="size-32 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105">
                  <img
                    alt="Avatar"
                    className="w-full h-full object-cover opacity-90 group-hover/avatar:opacity-100 transition-opacity"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTRp1_sbmUx0yY6FodbHtszGAcUBPop6CRljUKN9pUxBkh4QHv-j685IODQ9vs9HTN0BZhw_NhegqeZv5dRJRx_V0vXTrGmVZmPyJ8GIzbMHUVrBHxQcU1HPJYoUvxVdCQ6jBm2f_W0OMiT5NcGnBFfRFy_bozuXEBKxGyvd7xP1scI_l-IGyIHTN11tGegmAWt1MOY3Fk1CeIzxFO2PoJoMR8123ld7RXejdmncOF9YCpxbEkYkYeMFo_kqt483h_cTSi6BG-clgw"
                  />
                  <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm">
                    <MdPhotoCamera className="text-3xl text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-white size-8 flex items-center justify-center rounded-full border-4 border-white dark:border-slate-900 shadow-xl glow-accent">
                  <MdAdd className="text-xl" />
                </div>
              </div>
              <p className="text-[10px] items-center font-black text-slate-500 uppercase tracking-widest text-center">
                Recommended: <br /> 500x500px JPG
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Real Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    First Name
                  </label>
                  <input
                    className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Anthony"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Last Name
                  </label>
                  <input
                    className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Guseltony"
                  />
                </div>
              </div>

              {/* Legal name warning */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <MdWarning className="text-amber-500 dark:text-amber-400 text-lg shrink-0 mt-0.5" />
                <p className="text-amber-700 dark:text-amber-300/80 text-[11px] font-bold leading-relaxed">
                  Your name must exactly match the name on your registered bank
                  account. A mismatch will prevent you from withdrawing your
                  winnings.
                </p>
              </div>

              {/* Nickname & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Gaming Nickname
                  </label>
                  <input
                    className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
                    type="text"
                    placeholder="AnthonyGamer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Tagline / Title
                  </label>
                  <input
                    className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
                    type="text"
                    placeholder="The Subway Legend"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Bio / About Me
                </label>
                <textarea
                  className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none"
                  placeholder="Hooked on mobile gaming since 2012. Ready for any challenge!"
                  rows={4}
                ></textarea>
              </div>
            </div>
          </div>
        </section>

        {/* ── Preferences ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-playza-blue/20 flex items-center justify-center text-playza-blue text-xl shadow-inner">
              <MdNotifications />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Preferences
            </h2>
          </div>

          <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 space-y-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
                  New Match Alerts
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 font-bold max-w-sm">
                  Receive notifications when a new tournament or challenge is
                  available in your favorite games.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-14 h-7 bg-slate-200 dark:bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white dark:after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner transition-colors"></div>
              </label>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/5"></div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
                  Marketing Emails
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 font-bold max-w-sm">
                  Stay updated with Playza news, exclusive offers, and weekly
                  gaming event summaries.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-14 h-7 bg-slate-200 dark:bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white dark:after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner transition-colors"></div>
              </label>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/5"></div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
                  Show Activity on Profile
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 font-bold max-w-sm">
                  Allow other players to see your recent matches and
                  achievements on your public profile.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-14 h-7 bg-slate-200 dark:bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white dark:after:bg-slate-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner transition-colors"></div>
              </label>
            </div>
          </div>
        </section>

        {/* ── Financial Methods ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-2xl bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center text-secondary text-xl shadow-inner">
              <MdPayments />
            </div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">
              Financial Methods
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Existing method */}
            {hasKudaAccount && (
              <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 space-y-6 group hover:border-primary/20 transition-all shadow-xl relative overflow-hidden animate-in zoom-in duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                      Primary Settlement
                    </p>
                    <h3 className="text-slate-900 dark:text-white font-black text-lg italic tracking-tighter">
                      Kuda Bank
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="bg-secondary/10 px-3 py-1 rounded-full text-[10px] font-black uppercase text-secondary tracking-widest">
                      Active
                    </div>
                    <button
                      onClick={() => setHasKudaAccount(false)}
                      className="size-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all group/del shadow-sm"
                      title="Remove Account"
                    >
                      <MdDelete className="text-lg group-hover/del:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">
                      Account Number
                    </p>
                    <p className="text-slate-900 dark:text-white font-black tracking-[0.2em]">
                      **** **** 8829
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">
                      Legal Name
                    </p>
                    <p className="text-slate-900 dark:text-white font-black uppercase italic">
                      Anthony Guseltony
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Add new method card */}
            <div
              onClick={() => setShowAddMethod(true)}
              className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all duration-500"
            >
              <div className="size-16 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 group-hover:text-primary transition-all text-2xl text-slate-500 shadow-inner">
                <MdAdd />
              </div>
              <h4 className="text-slate-900 dark:text-white font-black italic text-lg uppercase tracking-tighter mb-1">
                New Method
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold max-w-45">
                Add a bank account or digital wallet to receive winnings.
              </p>
            </div>
          </div>
        </section>

        {/* ── Final Actions ── */}
        <div className="pt-10 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <button className="text-xs font-black text-red-500/60 uppercase tracking-widest hover:text-red-500 transition-all group flex items-center gap-2">
            <span className="size-2 bg-red-500/60 rounded-full group-hover:animate-pulse"></span>
            Deactivate Gaming Account
          </button>
          <div className="flex gap-4 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none h-12 px-8 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm">
              Reset
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none h-12 px-10 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.1em] hover:scale-105 hover:brightness-110 shadow-2xl glow-accent transition-all"
            >
              Save Everything
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
