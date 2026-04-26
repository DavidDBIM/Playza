import React, { useState, useMemo } from 'react';
import {
  MdPeople,
  MdRefresh
} from 'react-icons/md';
import { UsersStats } from '../components/users/UsersStats';
import { UsersToolbar } from '../components/users/UsersToolbar';
import { UsersTable } from '../components/users/UsersTable';
import { useAdminUsers, useDashboardMetrics } from '../hooks/use-admin';
import type { UserRecord } from '../data/usersData';
import type { UserAdmin } from '../types/admin';

const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [joinedFilter, setJoinedFilter] = useState('All Time');
  const [page, setPage] = useState(1);

  const { data: metrics } = useDashboardMetrics();

  // Map UI status filter to API status values
  const apiStatus = useMemo(() => {
    switch (statusFilter) {
      case 'Active': return 'active';
      case 'Suspended': return 'inactive';
      case 'Unverified': return 'unverified';
      default: return '';
    }
  }, [statusFilter]);

  // Map UI period filter to API period values
  const apiPeriod = useMemo(() => {
    switch (joinedFilter) {
      case 'Today': return 'today';
      case 'Past 7 Days': return '7d';
      case 'Past 30 Days': return '30d';
      default: return '';
    }
  }, [joinedFilter]);

  const { data, isLoading, isError, refetch } = useAdminUsers({
    page,
    search: searchQuery,
    status: apiStatus,
    period: apiPeriod
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
      lastActive: 'Just now',
      avatar: u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      kycStatus: u.is_email_verified ? 'Verified' : 'Pending',
      pzaPoints: u.pza_points?.total_points || 0,
      totalGames: 0,
      totalWinnings: 0,
      level: 1,
      referrals: 0
    }));
  }, [data]);

  const stats = useMemo(() => {
    if (!metrics) return [];
    return [
      { label: 'Total Players', value: metrics.total_users.toLocaleString(), change: '+12%', trend: 'up' as const },
      { label: 'Active Today', value: metrics.active_users.toLocaleString(), change: '+5%', trend: 'up' as const },
      { label: 'New This Week', value: metrics.new_users_week.toLocaleString(), change: '+18%', trend: 'up' as const },
      { label: 'KYC Verified', value: metrics.verified_users.toLocaleString(), change: '+3%', trend: 'up' as const },
    ];
  }, [metrics]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All Status');
    setJoinedFilter('All Time');
    setPage(1);
  };

  return (
    <main className="p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-400/30">
            <MdPeople className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight uppercase">Users</h1>
            <p className="text-xs text-muted-foreground font-medium">Manage platform users and track engagement</p>
          </div>
        </div>
        
        <button 
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-xl text-xs font-black uppercase tracking-widest text-foreground transition-all border border-border"
        >
          <MdRefresh className={`text-lg ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <UsersStats stats={stats} />

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden relative">
        <div className="relative z-10 border-b border-border">
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
        <div className="relative z-10">
          {isError ? (
            <div className="py-20 text-center text-rose-500">
              <p className="font-heading font-black uppercase text-xl">Registry Link Failure</p>
              <p className="text-xs opacity-60 mt-2">Could not synchronize with the user database.</p>
            </div>
          ) : (
            <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
              <UsersTable users={users} clearFilters={clearFilters} />
            </div>
          )}
        </div>

        <div className="relative z-10 px-4 py-3 bg-muted/50 border-t border-border flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Database Sync: <span className={isError ? 'text-rose-500' : 'text-emerald-500'}>
              {isError ? 'Disconnected' : isLoading ? 'Syncing...' : 'Connected'}
            </span>
          </p>
          <div className="flex items-center gap-4">
             <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
               Displaying <span className="text-primary font-number">{users.length}</span> Records
             </p>
             {data && data.pages > 1 && (
               <div className="flex items-center gap-3">
                 <button 
                   disabled={page === 1}
                   onClick={() => setPage(p => p - 1)}
                   className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                 >← Prev</button>
                 <span className="text-xs font-bold text-foreground">Page {page} of {data.pages}</span>
                 <button 
                   disabled={page === data.pages}
                   onClick={() => setPage(p => p + 1)}
                   className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                 >Next →</button>
               </div>
             )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Users;
