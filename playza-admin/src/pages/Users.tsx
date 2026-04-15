import React, { useState, useMemo } from 'react';
import {
  MdPeople,
  MdRefresh
} from 'react-icons/md';
import { userStats } from '../data/usersData';
import { UsersStats } from '../components/users/UsersStats';
import { UsersToolbar } from '../components/users/UsersToolbar';
import { UsersTable } from '../components/users/UsersTable';
import { useAdminUsers } from '../hooks/use-admin';
import type { UserRecord } from '../data/usersData';
import type { UserAdmin } from '../types/admin';
const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [joinedFilter, setJoinedFilter] = useState('All Time');
  const [page, setPage] = useState(1);

  // Map UI status filter to API status values
  const apiStatus = useMemo(() => {
    switch (statusFilter) {
      case 'Active': return 'active';
      case 'Suspended': return 'inactive';
      case 'Unverified': return 'unverified';
      default: return '';
    }
  }, [statusFilter]);

  const { data, isLoading, isError, refetch } = useAdminUsers({
    page,
    search: searchQuery,
    status: apiStatus
  });

  const users = useMemo((): UserRecord[] => {
    if (!data?.users) return [];

    return (data.users as UserAdmin[]).map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      phoneNumber: u.phone,
      fullName: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
      walletBalance: u.wallets?.balance || 0,
      status: u.is_active ? 'Active' : 'Suspended',
      joinedDate: new Date(u.created_at).toLocaleDateString(),
      joinedTimestamp: new Date(u.created_at).getTime(),
      lastActive: 'Just now', // Not available in current endpoint
      avatar: u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      kycStatus: u.is_email_verified ? 'Verified' : 'Pending',
      pzaPoints: u.pza_points?.total_points || 0,
      totalGames: 0,
      totalWinnings: 0,
      level: 1,
      referrals: 0
    }));
  }, [data]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All Status');
    setJoinedFilter('All Time');
    setPage(1);
  };

  return (
    <main className="flex-1 mx-auto w-full pb-10 p-4 md:p-8 space-y-6 md:space-y-8 max-w-350">
      {/* Header Container */}
      <div className="glass-card rounded-3xl p-6 md:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[120px] rounded-full -mr-40 -mt-40 transition-all duration-700 group-hover:bg-primary/30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <MdPeople className="text-primary hidden md:inline-block" />
              Users
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base">
              Manage platform users, view their activities, and track engagement.
            </p>
          </div>
          
          <button 
            onClick={() => refetch()}
            className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-primary hover:text-white transition-all border border-slate-200 dark:border-white/10 flex items-center gap-2 group/refresh"
          >
            <MdRefresh className={`text-xl ${isLoading ? 'animate-spin' : 'group-hover/refresh:rotate-180 transition-transform duration-700'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Refresh Sync</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <UsersStats stats={userStats} />

      {/* Table Section */}
      <div className="glass-card rounded-3xl overflow-hidden relative">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        {/* Toolbar */}
        <div className="relative z-10">
          <UsersToolbar 
            searchQuery={searchQuery}
            setSearchQuery={(q) => { setSearchQuery(q); setPage(1); }}
            statusFilter={statusFilter}
            setStatusFilter={(s) => { setStatusFilter(s); setPage(1); }}
            joinedFilter={joinedFilter}
            setJoinedFilter={(j) => { setJoinedFilter(j); setPage(1); }}
            clearFilters={clearFilters}
          />
        </div>

        {/* Table */}
        <div className="relative z-10">
          {isError ? (
            <div className="py-20 text-center text-rose-500">
              <p className="font-headline font-black uppercase text-xl">Registry Link Failure</p>
              <p className="text-xs opacity-60 mt-2">Could not synchronize with the user database.</p>
            </div>
          ) : (
            <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
              <UsersTable users={users} clearFilters={clearFilters} />
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="relative z-10 px-8 py-6 bg-slate-50/50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-slate-500 dark:text-slate-400">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            Database Sync: <span className={isError ? 'text-rose-500' : 'text-emerald-500'}>
              {isError ? 'Disconnected' : isLoading ? 'Syncing...' : 'Connected'}
            </span>
          </p>
          <div className="flex items-center gap-4">
             <p className="text-[10px] font-black uppercase tracking-[0.2em]">
               Displaying <span className="text-primary">{users.length}</span> Records
             </p>
             {data && data.total_pages > 1 && (
               <div className="flex items-center gap-2 border-l border-slate-200 dark:border-white/10 pl-4">
                 <button 
                   disabled={page === 1}
                   onClick={() => setPage(p => p - 1)}
                   className="text-[10px] font-black uppercase hover:text-primary disabled:opacity-30"
                 >Prev</button>
                 <span className="text-[10px] font-black uppercase">Page {page} of {data.total_pages}</span>
                 <button 
                   disabled={page === data.total_pages}
                   onClick={() => setPage(p => p + 1)}
                   className="text-[10px] font-black uppercase hover:text-primary disabled:opacity-30"
                 >Next</button>
               </div>
             )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Users;
