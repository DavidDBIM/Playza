import React, { useState } from 'react';
import { 
  MdCampaign, 
  MdSettingsSuggest, 
  MdAccountBalanceWallet, 
  MdSecurity, 
  MdSearch, 
  MdExpandMore, 
  MdChevronLeft, 
  MdChevronRight 
} from 'react-icons/md';

const NotiHistory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    { id: '#NT-8291', title: 'Season 4 Rewards Claim', type: 'Promotional', icon: MdCampaign, audience: 'Top Tier Players', status: 'Sent', statusColor: 'text-emerald-400', orbColor: 'bg-emerald-500 shadow-emerald-500/50', time: 'Oct 24, 14:20' },
    { id: '#NT-8288', title: 'Server Maintenance Window', type: 'System', icon: MdSettingsSuggest, audience: 'All Users', status: 'Scheduled', statusColor: 'text-amber-400', orbColor: 'bg-amber-500 shadow-amber-500/50', time: 'Oct 26, 02:00' },
    { id: '#NT-8285', title: 'Withdrawal Processed - #XJ29', type: 'Transactional', icon: MdAccountBalanceWallet, audience: 'Specific User', status: 'Sent', statusColor: 'text-emerald-400', orbColor: 'bg-emerald-500 shadow-emerald-500/50', time: 'Oct 24, 11:05' },
    { id: '#NT-8280', title: 'Flash Sale: 50% Bonus Gold', type: 'Promotional', icon: MdCampaign, audience: 'Inactive 30d+', status: 'Failed', statusColor: 'text-rose-500', orbColor: 'bg-rose-500 shadow-rose-500/50', time: 'Oct 23, 18:45' },
    { id: '#NT-8277', title: 'Account Security Alert', type: 'System', icon: MdSecurity, audience: 'Specific User', status: 'Sent', statusColor: 'text-emerald-400', orbColor: 'bg-emerald-500 shadow-emerald-500/50', time: 'Oct 23, 10:12' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Filters Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-zinc-500 ml-2">Type</label>
          <div className="glass-card px-5 py-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-primary/20 transition-all cursor-pointer bg-white/50 dark:bg-white/5">
            <span className="text-sm font-bold">All Types</span>
            <MdExpandMore className="text-zinc-500 text-xl" />
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-zinc-500 ml-2">Audience</label>
          <div className="glass-card px-5 py-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-primary/20 transition-all cursor-pointer bg-white/50 dark:bg-white/5">
            <span className="text-sm font-bold">Segments</span>
            <MdExpandMore className="text-zinc-500 text-xl" />
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-zinc-500 ml-2">Status</label>
          <div className="glass-card px-5 py-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-primary/20 transition-all cursor-pointer bg-white/50 dark:bg-white/5">
            <span className="text-sm font-bold">All Statuses</span>
            <MdExpandMore className="text-zinc-500 text-xl" />
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-zinc-500 ml-2">Search</label>
          <div className="glass-card px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-white/5 focus-within:border-primary/40 transition-all bg-white/50 dark:bg-white/5">
            <MdSearch className="text-zinc-500 text-2xl" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full placeholder:text-zinc-600 font-bold outline-none" 
              placeholder="Search title or ID..." 
            />
          </div>
        </div>
      </section>

      {/* Notification Table */}
      <section className="glass-card rounded-[2rem] overflow-hidden shadow-2xl bg-white/30 dark:bg-white/5 border border-slate-200 dark:border-white/10">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-white/5">
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-zinc-500">ID</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-zinc-500">Title</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-zinc-500">Type</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-zinc-500">Audience</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-zinc-500">Status</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-zinc-500">Sent At</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-zinc-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {notifications.map((noti) => (
                <tr key={noti.id} className="group hover:bg-primary/5 transition-all duration-300">
                  <td className="px-8 py-6 font-mono text-primary text-xs font-bold">{noti.id}</td>
                  <td className="px-8 py-6">
                    <span className="block font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{noti.title}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                      <noti.icon className="text-xl opacity-50" />
                      <span className="text-xs font-bold uppercase tracking-widest">{noti.type}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-white/5">{noti.audience}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${noti.orbColor} animate-pulse`}></span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${noti.statusColor}`}>{noti.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-slate-500 dark:text-zinc-500 font-black uppercase tracking-widest">{noti.time}</td>
                  <td className="px-8 py-6 text-right">
                    <button className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-primary/10 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-all">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination / Footer */}
      <footer className="mt-10 flex items-center justify-between px-4">
        <p className="text-slate-500 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">Showing 5 of 1,248 communications</p>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl glass-card hover:bg-primary/10 hover:text-primary transition-colors bg-white/50 dark:bg-white/5">
            <MdChevronLeft className="text-xl" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20">1</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl glass-card hover:bg-primary/10 hover:text-primary transition-colors font-black text-xs bg-white/50 dark:bg-white/5">2</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl glass-card hover:bg-primary/10 hover:text-primary transition-colors font-black text-xs bg-white/50 dark:bg-white/5">3</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl glass-card hover:bg-primary/10 hover:text-primary transition-colors bg-white/50 dark:bg-white/5">
            <MdChevronRight className="text-xl" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default NotiHistory;