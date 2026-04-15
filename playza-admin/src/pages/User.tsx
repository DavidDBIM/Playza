import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { 
  MdHistory, 
  MdReceiptLong, 
  MdAccountTree,
  MdSearch,
  MdFilterList,
  MdOutlineClear,
  MdRefresh
} from 'react-icons/md';
import { UserIdentityHero } from '../components/user/UserIdentityHero';
import { UserAdvancedMetrics } from '../components/user/UserAdvancedMetrics';
import { CombatLog, FinancialFlow, DownlineNetwork } from '../components/user/UserActivityTables';
import { Input } from '../components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Button } from '../components/ui/button';
import { useAdminUserDetails, useUpdateUserStatus } from '../hooks/use-admin';
import type { UserRecord, MatchRecord, TransactionRecord, ReferralRecord } from '../data/usersData';

const User: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'matches' | 'transactions' | 'referrals'>('matches');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: userDetails, isLoading, isError, refetch } = useAdminUserDetails(id || '');
  const updateStatus = useUpdateUserStatus();

  // Map backend details to our UI format
  const mappedUser = useMemo((): UserRecord | null => {
    if (!userDetails) return null;
    return {
      id: userDetails.id,
      username: userDetails.username,
      email: userDetails.email,
      phoneNumber: userDetails.phone,
      fullName: `${userDetails.first_name || ''} ${userDetails.last_name || ''}`.trim() || userDetails.username,
      walletBalance: userDetails.wallets?.balance || 0,
      status: userDetails.is_active ? 'Active' : 'Suspended',
      joinedDate: new Date(userDetails.created_at).toLocaleDateString(),
      joinedTimestamp: new Date(userDetails.created_at).getTime(),
      lastActive: 'Just now',
      avatar: userDetails.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      kycStatus: userDetails.is_email_verified ? 'Verified' : 'Pending',
      level: 1, // Default or computed
      referralCode: userDetails.referral_code,
      referrals: userDetails.total_referrals,
      pzaPoints: userDetails.pza_points?.total_points || 0,
      totalGames: userDetails.pza_history?.length || 0,
      totalWinnings: userDetails.pza_history?.reduce((acc, match) => acc + (match.amount || 0), 0) || 0
    };
  }, [userDetails]);

  const tabs = [
    { id: 'matches', icon: MdHistory, label: 'Game History' },
    { id: 'transactions', icon: MdReceiptLong, label: 'Transactions' },
    { id: 'referrals', icon: MdAccountTree, label: 'Referrals' }
  ] as const;

  // Filtered Data Logic (using live transactions/referrals from backend)
  const filteredMatches = useMemo((): MatchRecord[] => {
    if (!userDetails?.pza_history) return [];
    return userDetails.pza_history
      .filter(match => match.event_type.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(match => ({
        id: match.id,
        game: match.event_type,
        score: String(match.details?.score || '0'),
        position: 'N/A',
        winnings: match.amount || 0,
        date: new Date(match.created_at).toLocaleDateString(),
        status: 'COMPLETED'
      }));
  }, [userDetails, searchQuery]);

  const filteredTransactions = useMemo((): TransactionRecord[] => {
    if (!userDetails?.transactions) return [];
    return userDetails.transactions
      .filter(tx => {
        const matchesSearch = 
          tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .map(tx => ({
        id: tx.id,
        username: userDetails.username,
        type: tx.type === 'deposit' ? 'Deposit' : 'Withdrawal',
        amount: tx.amount,
        method: tx.reference || 'Manual',
        date: new Date(tx.created_at).toLocaleDateString(),
        status: tx.status === 'success' ? 'Successful' : tx.status === 'pending' ? 'Pending' : 'Failed'
      }));
  }, [userDetails, searchQuery, statusFilter]);

  const filteredReferrals = useMemo((): ReferralRecord[] => {
    if (!userDetails?.referrals) return [];
    return userDetails.referrals
      .filter(ref => {
        const matchesSearch = 
          ref.users?.username?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || ref.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .map(ref => ({
        id: ref.id,
        username: ref.users?.username || 'unknown',
        date: new Date(ref.created_at).toLocaleDateString(),
        reward: 0,
        status: ref.status === 'completed' ? 'Qualified' : 'Pending'
      }));
  }, [userDetails, searchQuery, statusFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
  };

  const handleUpdateStatus = (action: 'activate' | 'deactivate' | 'ban') => {
    if (!id) return;
    updateStatus.mutate({ userId: id, action });
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Interrogating Registry...</span>
    </div>
  );

  if (isError || !mappedUser) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center">
      <div className="p-8 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/20 max-w-md">
        <h2 className="text-rose-500 font-headline font-black text-2xl uppercase tracking-widest">Citizen Not Found</h2>
        <p className="text-muted-foreground/60 text-xs mt-4">The requested identity does not exist in our regional database or the connection was severed.</p>
        <Button onClick={() => window.history.back()} variant="outline" className="mt-8 border-rose-500/30 text-rose-500 h-14 rounded-2xl w-full">Return to Registry</Button>
      </div>
    </div>
  );

  return (
    <main className="flex-1 mx-auto w-full pb-20 p-4 md:p-8 space-y-6 md:space-y-10 max-w-362">
      
      {/* Identity Hero */}
      <UserIdentityHero 
        user={mappedUser} 
        onUpdateStatus={handleUpdateStatus} 
        isUpdating={updateStatus.isPending} 
      />

      {/* Stats */}
      <UserAdvancedMetrics user={mappedUser} />

      {/* Activity Console */}
      <section className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg transition-all duration-500">
        
        {/* Navigation Tabs */}
        <div className="px-4 md:px-8 border-b border-slate-200 dark:border-white/10 flex overflow-x-auto scrollbar-hide bg-slate-50/50 dark:bg-white/5 backdrop-blur-xl justify-between items-center">
          <div className="flex flex-nowrap w-max">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  resetFilters();
                }}
                className={`py-6 px-8 whitespace-nowrap text-xs md:text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 outline-none relative group ${
                  activeTab === tab.id 
                    ? 'text-primary' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className={`text-xl transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_-2px_15px_rgba(var(--primary-rgb),0.6)]"></div>
                )}
                {tab.id === 'referrals' && (
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm ml-2 ${
                    activeTab === tab.id ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                  }`}>{mappedUser.referrals}</span>
                )}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => refetch()}
            className="p-3 mr-4 rounded-xl hover:bg-primary/10 transition-colors text-primary"
            title="Reload Activity"
          >
            <MdRefresh className={`text-xl ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="p-6 md:px-10 md:py-8 bg-slate-50/30 dark:bg-white/2 border-b border-border/10">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full group">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder={`Search ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-white/50 dark:bg-black/20 border-border/20 rounded-2xl font-bold focus:ring-primary/20 transition-all text-sm uppercase tracking-tight"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <MdOutlineClear className="text-muted-foreground" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 h-14 bg-white/50 dark:bg-black/20 border-border/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] focus:ring-primary/20">
                  <div className="flex items-center gap-2">
                    <MdFilterList className="text-lg text-primary" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/20 bg-popover/95 backdrop-blur-xl">
                  <SelectItem value="All" className="font-black text-[10px] uppercase tracking-widest p-3">All Records</SelectItem>
                  {activeTab === 'transactions' && (
                    <>
                      <SelectItem value="success" className="font-black text-[10px] uppercase tracking-widest p-3">Successful</SelectItem>
                      <SelectItem value="pending" className="font-black text-[10px] uppercase tracking-widest p-3">Pending</SelectItem>
                      <SelectItem value="failed" className="font-black text-[10px] uppercase tracking-widest p-3">Failed</SelectItem>
                    </>
                  )}
                  {activeTab === 'referrals' && (
                    <>
                      <SelectItem value="completed" className="font-black text-[10px] uppercase tracking-widest p-3">Qualified</SelectItem>
                      <SelectItem value="pending" className="font-black text-[10px] uppercase tracking-widest p-3">Pending</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="min-h-125 bg-white/20 dark:bg-transparent">
          {activeTab === 'matches' && <CombatLog data={filteredMatches} />}
          {activeTab === 'transactions' && <FinancialFlow data={filteredTransactions} />}
          {activeTab === 'referrals' && <DownlineNetwork data={filteredReferrals} />}
          
          {((activeTab === 'matches' && filteredMatches.length === 0) || 
            (activeTab === 'transactions' && filteredTransactions.length === 0) || 
            (activeTab === 'referrals' && filteredReferrals.length === 0)) && (
            <div className="flex flex-col items-center justify-center p-20 opacity-30 grayscale pointer-events-none">
              <MdSearch className="text-8xl mb-4" />
              <h3 className="text-xl font-black uppercase tracking-widest">No Intelligence Found</h3>
              <p className="text-xs font-bold mt-1">Adjust your filters to locate the data.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default User;
