import React, { useState } from 'react';
import { 
  MdCampaign, 
  MdSettingsSuggest, 
  MdAccountBalanceWallet, 
  MdSecurity, 
  MdSearch, 
  MdChevronLeft, 
  MdChevronRight,
  MdNotificationsActive,
  MdRefresh
} from 'react-icons/md';
import { useNotifications } from '../../hooks/use-notifications';

const NotiHistory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { notifications, loading, total, page, totalPages, setPage, refresh } = useNotifications();

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'promotional offer':
      case 'promotional': return MdCampaign;
      case 'system update':
      case 'system': return MdSettingsSuggest;
      case 'transactional': return MdAccountBalanceWallet;
      case 'maintenance alert': return MdSecurity;
      case 'login banner': return MdNotificationsActive;
      default: return MdCampaign;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent': return { text: 'text-emerald-400', orb: 'bg-emerald-500 shadow-emerald-500/50' };
      case 'scheduled': return { text: 'text-amber-400', orb: 'bg-amber-500 shadow-amber-500/50' };
      case 'failed': return { text: 'text-rose-500', orb: 'bg-rose-500 shadow-rose-500/50' };
      default: return { text: 'text-emerald-400', orb: 'bg-emerald-500 shadow-emerald-500/50' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search and Refresh */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-2">Search</label>
          <div className="glass-card px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-white/5 focus-within:border-primary/40 transition-all bg-white/50 dark:bg-white/5">
            <MdSearch className="text-muted-foreground text-2xl" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full placeholder:text-muted-foreground/50 font-bold outline-none" 
              placeholder="Search title..." 
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-2">Actions</label>
          <button 
            onClick={() => refresh()}
            className="glass-card px-5 py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/5 hover:border-primary/20 transition-all cursor-pointer bg-white/50 dark:bg-white/5 text-primary"
          >
            <MdRefresh className={`text-xl ${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs font-black uppercase tracking-widest">Refresh</span>
          </button>
        </div>
      </section>

      {/* Notification Table */}
      <section className="glass-card rounded-[2rem] overflow-hidden shadow-2xl bg-white/30 dark:bg-white/5 border border-border relative">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-muted/50 dark:bg-white/5">
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-muted-foreground">ID</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-muted-foreground">Title</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-muted-foreground">Type</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-muted-foreground">Audience</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-muted-foreground">Status</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-muted-foreground">Sent At</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest font-black text-muted-foreground text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notifications.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <p className="text-muted-foreground text-sm font-bold">No notifications found in history.</p>
                  </td>
                </tr>
              )}
              {notifications.map((noti) => {
                const Icon = getIcon(noti.type);
                const colors = getStatusColor(noti.status);
                return (
                  <tr key={noti.id} className="group hover:bg-primary/5 transition-all duration-300">
                    <td className="px-8 py-6 font-mono text-primary text-[10px] font-bold">#{noti.id.slice(0, 8)}</td>
                    <td className="px-8 py-6">
                      <span className="block font-black text-foreground group-hover:text-primary transition-colors text-sm">{noti.title || 'Untitled'}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="text-xl opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{noti.type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-muted/30 dark:bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-foreground/60 border border-border dark:border-white/5">{noti.audience}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${colors.orb} animate-pulse`}></span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${colors.text}`}>{noti.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                      {new Date(noti.created_at).toLocaleString('en-US', { 
                        month: 'short', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        hour12: false 
                      })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="px-4 py-2 rounded-xl bg-muted/30 dark:bg-white/5 hover:bg-primary/10 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-all">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination / Footer */}
      <footer className="mt-10 flex items-center justify-between px-4">
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Showing {notifications.length} of {total} communications</p>
        <div className="flex gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl glass-card hover:bg-primary/10 hover:text-primary transition-colors bg-white/50 dark:bg-white/5 disabled:opacity-30"
          >
            <MdChevronLeft className="text-xl" />
          </button>
          <div className="flex items-center px-4 bg-primary text-white font-black rounded-xl text-xs">
            {page} / {totalPages}
          </div>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl glass-card hover:bg-primary/10 hover:text-primary transition-colors bg-white/50 dark:bg-white/5 disabled:opacity-30"
          >
            <MdChevronRight className="text-xl" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default NotiHistory;
