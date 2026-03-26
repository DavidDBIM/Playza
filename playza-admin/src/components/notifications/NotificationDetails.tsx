import React from 'react';
import { 
  MdCalendarToday, 
  MdEmojiPeople, 
  MdContentCopy, 
  MdSubject, 
  MdArrowUpward, 
  MdErrorOutline, 
  MdPieChart, 
  MdMoreVert 
} from 'react-icons/md';

const NotificationDetails: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">Promotional</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-green-500/50 animate-pulse"></span>
              Sent
            </div>
          </div>
          <h2 className="font-headline text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">Golden Weekend Boost</h2>
          <div className="flex items-center gap-6 text-slate-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <MdCalendarToday className="text-sm" />
              <span>Sent on Oct 24, 2023 • 14:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <MdEmojiPeople className="text-sm" />
              <span>Target: Active Players (Lvl 10+)</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-slate-200 dark:border-white/5 text-xs">
            <MdContentCopy className="text-lg" />
            Duplicate
          </button>
          <button className="px-8 py-3 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs">
            View Raw Analytics
          </button>
        </div>
      </section>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-12 gap-8">
        {/* Message Card */}
        <div className="col-span-12 lg:col-span-7 glass-card rounded-[2rem] p-8 border border-slate-200 dark:border-white/5 bg-white/30 dark:bg-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest text-xs">
              <MdSubject className="text-primary text-xl" />
              Message Content
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-black uppercase tracking-widest">ID: NTF-8829-X</span>
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
              <p className="text-primary font-black font-headline text-lg mb-4">Subject: Double XP & Gold this Weekend! ✨</p>
              <p className="text-slate-600 dark:text-zinc-300 leading-relaxed font-bold text-sm">
                Get ready, Legend! This weekend, the Vault is open. Earn 2x Experience and double the Gold rewards in all Competitive matches. Log in between Friday 18:00 and Sunday 23:59 to claim your boost. 
                <br/><br/>
                Don't let the opportunity slip away. See you in the arena!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-black mb-2">Push Payload</p>
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">{"{\"action\": \"deep_link\", \"url\": \"playza://rewards/boost\"}"}</p>
              </div>
              <div className="p-4 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-black mb-2">Image Asset</p>
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-300 truncate">gold_weekend_banner_v2.png</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Delivery Stats */}
        <div className="col-span-12 lg:col-span-5 grid grid-rows-3 gap-6">
          {/* Stat 1 */}
          <div className="glass-card rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 bg-white/30 dark:bg-white/5 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Sent Count</p>
              <h4 className="font-headline text-4xl font-black text-slate-900 dark:text-white tracking-tighter">42,890</h4>
              <p className="text-green-500 dark:text-green-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mt-1">
                <MdArrowUpward className="text-sm" />
                99.8% Success Rate
              </p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-zinc-800 flex items-center justify-center relative">
              <svg className="w-full h-full absolute -rotate-90">
                <circle cx="32" cy="32" fill="transparent" r="28" stroke="#ffd700" strokeDasharray="175" strokeDashoffset="10" strokeWidth="4"></circle>
              </svg>
              <span className="text-[10px] font-black text-primary">99%</span>
            </div>
          </div>
          {/* Stat 2 */}
          <div className="glass-card rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 bg-white/30 dark:bg-white/5 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Failed Count</p>
              <h4 className="font-headline text-4xl font-black text-slate-900 dark:text-white tracking-tighter">84</h4>
              <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Primarily invalid tokens</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-zinc-800 flex items-center justify-center">
              <MdErrorOutline className="text-rose-500 text-3xl" />
            </div>
          </div>
          {/* Stat 3 */}
          <div className="glass-card rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 bg-white/30 dark:bg-white/5 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Open Rate</p>
              <h4 className="font-headline text-4xl font-black text-slate-900 dark:text-white tracking-tighter">28.4%</h4>
              <p className="text-primary/60 text-[10px] font-black uppercase tracking-widest mt-1">Above sector average (21%)</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-zinc-800 flex items-center justify-center relative">
              <svg className="w-full h-full absolute -rotate-90">
                <circle cx="32" cy="32" fill="transparent" r="28" stroke="#ffd700" strokeDasharray="175" strokeDashoffset="125" strokeWidth="4"></circle>
              </svg>
              <span className="text-[10px] font-black text-primary">28%</span>
            </div>
          </div>
        </div>

        {/* Audience Breakdown */}
        <div className="col-span-12 glass-card rounded-[2rem] p-8 border border-slate-200 dark:border-white/5 bg-white/30 dark:bg-white/5 shadow-xl">
          <h3 className="font-headline font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 uppercase tracking-widest text-xs">
            <MdPieChart className="text-primary text-xl" />
            Audience Breakdown
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative w-64 h-64">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#ffd700" strokeDasharray="125 125" strokeWidth="20"></circle>
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#d97706" strokeDasharray="60 190" strokeDashoffset="-125" strokeWidth="20"></circle>
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="#71717a" strokeDasharray="66 185" strokeDashoffset="-185" strokeWidth="20"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-black uppercase tracking-[0.2em]">Total</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">42.8k</p>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 rounded-full bg-primary mt-1.5 shadow-lg shadow-primary/50"></div>
                <div className="flex-1">
                  <p className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest">Elite Players (Lvl 50+)</p>
                  <p className="text-slate-500 dark:text-zinc-500 text-[10px] font-bold mt-1">18,400 Users • 43%</p>
                  <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-primary h-full w-[43%]"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 rounded-full bg-amber-600 mt-1.5 shadow-lg shadow-amber-600/30"></div>
                <div className="flex-1">
                  <p className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest">Mid-Tier (Lvl 10-49)</p>
                  <p className="text-slate-500 dark:text-zinc-500 text-[10px] font-bold mt-1">12,200 Users • 28%</p>
                  <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-amber-600/60 h-full w-[28%]"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 rounded-full bg-zinc-500 mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest">Dormant Accounts</p>
                  <p className="text-slate-500 dark:text-zinc-500 text-[10px] font-bold mt-1">9,100 Users • 21%</p>
                  <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-zinc-500 h-full w-[21%]"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 rounded-full bg-zinc-400 mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest">Guest Accounts</p>
                  <p className="text-slate-500 dark:text-zinc-500 text-[10px] font-bold mt-1">3,190 Users • 8%</p>
                  <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-zinc-800 h-full w-[8%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipient Logs Section */}
        <section className="col-span-12 glass-card rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white/30 dark:bg-white/5 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-zinc-900/40">
            <h3 className="font-headline font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Recipient Logs</h3>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 dark:text-zinc-400 transition-all">
                <MdMoreVert className="text-xl" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-zinc-900/50 text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500 font-black">
                <tr>
                  <th className="px-8 py-4">User</th>
                  <th className="px-8 py-4">Player ID</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Delivery Time</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {[
                  { name: 'Alex Rivers', id: '#PZ-100492', status: 'Delivered', time: '14:00:02 Oct 24', color: 'text-green-500', orb: 'bg-green-500' },
                  { name: 'Sarah Jenkins', id: '#PZ-882312', status: 'Opened', time: '14:05:15 Oct 24', color: 'text-primary', orb: 'bg-primary' },
                  { name: 'Kofi Arhin', id: '#PZ-449210', status: 'Failed', time: '14:00:00 Oct 24', color: 'text-rose-500', orb: 'bg-rose-500' },
                  { name: 'Liam Zhao', id: '#PZ-552311', status: 'Delivered', time: '14:00:10 Oct 24', color: 'text-green-500', orb: 'bg-green-500' },
                ].map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 shadow-inner"></div>
                        <span className="text-sm font-black text-slate-900 dark:text-zinc-200">{log.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-mono text-xs text-slate-500 dark:text-zinc-400">{log.id}</td>
                    <td className="px-8 py-6">
                      <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${log.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${log.orb}`}></span>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">{log.time}</td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white transition-colors">
                        <MdMoreVert className="text-xl" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NotificationDetails;