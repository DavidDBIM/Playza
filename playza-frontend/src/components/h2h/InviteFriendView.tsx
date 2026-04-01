import React from 'react';
import { PlusCircle, Zap } from 'lucide-react';
import { MdLink } from 'react-icons/md';
import { ZASymbol } from '@/components/currency/ZASymbol';

interface InviteFriendViewProps {
  inviteMobileTab: "create" | "join" | null;
  setInviteMobileTab: (tab: "create" | "join" | null) => void;
  customStake: string;
  setCustomStake: (val: string) => void;
  addStake: (amt: number) => void;
  handleCreateChallenge: () => void;
  handleJoinByCode: (e: React.FormEvent) => void;
  joinCode: string;
  setJoinCode: (val: string) => void;
  loading: boolean;
  setView: (view: 'hub' | 'quick' | 'invite' | 'bot') => void;
}

const InviteFriendView = ({
  inviteMobileTab,
  setInviteMobileTab,
  customStake,
  setCustomStake,
  addStake,
  handleCreateChallenge,
  handleJoinByCode,
  joinCode,
  setJoinCode,
  loading,
  setView,
}: InviteFriendViewProps) => {
  return (
    <div className="w-full flex flex-col lg:flex-col xl:grid xl:grid-cols-2 gap-4 xl:gap-8 animate-in slide-in-from-left-8 duration-500">
      <div className="xl:col-span-2 px-4 md:px-0">
        <button
          onClick={() => setView("hub")}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white mb-3 transition-colors"
        >
          ← Back to Hub
        </button>
      </div>

      {/* Create Challenge Accordion */}
      <section className="w-full bg-white/90 dark:bg-slate-900/40 lg:rounded-2xl xl:rounded-[2.4rem] rounded-none border-y md:border border-slate-200 dark:border-white/10 flex flex-col shadow-md overflow-hidden xl:min-h-auto text-slate-900 dark:text-white">
        <button
          onClick={() => setInviteMobileTab(inviteMobileTab === "create" ? null : "create")}
          className={`w-full p-6 md:p-8 lg:p-10 flex items-center justify-between font-black uppercase text-xs md:text-sm tracking-widest transition-colors ${inviteMobileTab === "create" ? "bg-emerald-500/10 text-emerald-500" : "text-slate-500 dark:text-slate-400 hover:bg-white/5"}`}
        >
          <div className="flex items-center gap-4">
            <PlusCircle size={24} className={inviteMobileTab === "create" ? "animate-pulse" : ""} />
            <span>Create Challenge</span>
          </div>
          <span className={`text-slate-400 transition-transform duration-300 ${inviteMobileTab === "create" ? "rotate-90" : ""}`}>▶</span>
        </button>

        <div className={`transition-all duration-500 overflow-hidden ${inviteMobileTab === "create" ? "max-h-200 border-t border-slate-200 dark:border-white/5" : "max-h-0 lg:max-h-none"}`}>
          <div className={`p-6 md:p-8 lg:p-10 flex flex-col gap-6 ${inviteMobileTab === "create" ? "opacity-100 scale-100" : "opacity-0 scale-95 lg:opacity-100 lg:scale-100"} transition-all duration-500`}>
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <PlusCircle size={24} />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter">Room Setup</h2>
                <span className="text-[8px] lg:text-[10px] font-black text-emerald-500/80 uppercase tracking-widest leading-none">Global Link Protection</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] md:text-[11px] uppercase tracking-[0.3em] text-slate-500 font-bold pl-1 italic">Arena Entry Stake</label>
                <div className="relative group/input">
                  <input value={customStake} onChange={(e) => setCustomStake(e.target.value)} className="w-full bg-slate-50 dark:bg-black/40 border-2 border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 font-black text-2xl text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all tracking-tighter italic" placeholder="100" type="number" />
                  <span className="-translate-y-1/2 absolute right-6 top-1/2 text-emerald-500 scale-125"><ZASymbol /></span>
                </div>
                <div className="flex gap-2">
                  {[100, 200, 500].map((amt) => (
                    <button key={amt} onClick={() => addStake(amt)} className="flex-1 py-3 bg-slate-50 dark:bg-white/5 hover:bg-emerald-500/10 border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 rounded-xl font-bold text-[10px] text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-all uppercase italic">+{amt}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleCreateChallenge} disabled={loading} className="w-full bg-emerald-500 text-white font-black py-5 rounded-2xl text-sm md:text-base tracking-[0.2em] transition-all hover:brightness-110 active:scale-95 italic uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                {loading ? "INITIALIZING..." : <><MdLink size={20} /> GENERATE WARZONE LINK</>}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Join Challenge Accordion */}
      <section className="w-full bg-white/90 dark:bg-slate-900/40 lg:rounded-2xl xl:rounded-[2.4rem] rounded-none border-y md:border border-slate-200 dark:border-white/10 flex flex-col shadow-md overflow-hidden xl:min-h-auto text-slate-900 dark:text-white">
        <button
          onClick={() => setInviteMobileTab(inviteMobileTab === "join" ? null : "join")}
          className={`w-full p-6 md:p-8 lg:p-10 flex items-center justify-between font-black uppercase text-xs md:text-sm tracking-widest transition-colors ${inviteMobileTab === "join" ? "bg-amber-500/10 text-amber-500 dark:text-amber-400" : "text-slate-500 dark:text-slate-400 hover:bg-white/5"}`}
        >
          <div className="flex items-center gap-4">
            <Zap size={24} className={inviteMobileTab === "join" ? "animate-pulse" : ""} />
            <span>Join Challenge</span>
          </div>
          <span className={`text-slate-400 transition-transform duration-300 ${inviteMobileTab === "join" ? "rotate-90" : ""}`}>▶</span>
        </button>

        <div className={`transition-all duration-500 overflow-hidden ${inviteMobileTab === "join" ? "max-h-200 border-t border-slate-200 dark:border-white/5" : "max-h-0 lg:max-h-none"}`}>
          <div className={`p-6 md:p-8 lg:p-10 flex flex-col gap-6 ${inviteMobileTab === "join" ? "opacity-100 scale-100" : "opacity-0 scale-95 lg:opacity-100 lg:scale-100"} transition-all duration-500`}>
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                <Zap size={24} />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter">Credentials</h2>
                <span className="text-[8px] lg:text-[10px] font-black text-amber-500/80 dark:text-amber-400/60 uppercase tracking-widest">Authorized Entry Only</span>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] md:text-[11px] uppercase tracking-[0.3em] text-slate-500 font-bold pl-1 italic">Match Access Code</label>
                <form onSubmit={handleJoinByCode} className="space-y-4">
                  <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6} placeholder="ROOM-ID" className="w-full bg-slate-50 dark:bg-black/40 border-2 border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 font-mono font-black text-center tracking-[0.5em] text-2xl text-slate-900 dark:text-white focus:border-amber-500 outline-none transition-all uppercase" />
                  <button type="submit" disabled={joinCode.length < 6 || loading} className="w-full bg-amber-500 text-slate-950 py-5 rounded-2xl font-black text-sm md:text-base tracking-[0.2em] hover:brightness-110 transition-all active:scale-95 disabled:opacity-30 uppercase italic shadow-lg shadow-amber-500/20">ENTER WARZONE</button>
                </form>
              </div>
              <div className="p-4 bg-amber-500/5 dark:bg-white/5 border border-amber-500/10 rounded-2xl text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic text-center">Codes are case-insensitive. Ensure you enter the 6-character sequence exactly as provided by your opponent.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InviteFriendView;
