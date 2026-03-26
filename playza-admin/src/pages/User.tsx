import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { 
  MdHistory, 
  MdReceiptLong, 
  MdAccountTree,
  MdSearch,
  MdFilterList,
  MdOutlineClear
} from 'react-icons/md';
import { 
  usersData, 
  matchHistory, 
  transactionHistory, 
  referralHistory 
} from '../data/usersData';
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

const User: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'matches' | 'transactions' | 'referrals'>('matches');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Find user by ID or username (demo logic)
  const user = usersData.find(u => u.id === id || u.username === id) || usersData[0];

  const tabs = [
    { id: 'matches', icon: MdHistory, label: 'Game History' },
    { id: 'transactions', icon: MdReceiptLong, label: 'Transactions' },
    { id: 'referrals', icon: MdAccountTree, label: 'Referrals' }
  ] as const;

  // Filtered Data Logic
  const filteredMatches = useMemo(() => {
    return matchHistory.filter(match => {
      const matchesSearch = 
        match.game.toLowerCase().includes(searchQuery.toLowerCase()) || 
        match.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || match.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const filteredTransactions = useMemo(() => {
    return transactionHistory.filter(tx => {
      const matchesSearch = 
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.method.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const filteredReferrals = useMemo(() => {
    return referralHistory.filter(ref => {
      const matchesSearch = 
        ref.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || ref.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
  };

  return (
    <main className="flex-1 mx-auto w-full pb-20 p-4 md:p-8 space-y-6 md:space-y-10 max-w-362">
      
      {/* Identity Hero */}
      <UserIdentityHero user={user} />

      {/* Stats */}
      <UserAdvancedMetrics user={user} />

      {/* Activity Console */}
      <section className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg transition-all duration-500">
        
        {/* Navigation Tabs */}
        <div className="px-4 md:px-8 border-b border-slate-200 dark:border-white/10 flex overflow-x-auto scrollbar-hide bg-slate-50/50 dark:bg-white/5 backdrop-blur-xl">
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
                  }`}>{user.referrals}</span>
                )}
              </button>
            ))}
          </div>
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
                  {activeTab === 'matches' && (
                    <>
                      <SelectItem value="COMPLETED" className="font-black text-[10px] uppercase tracking-widest p-3">Completed</SelectItem>
                      <SelectItem value="LOST" className="font-black text-[10px] uppercase tracking-widest p-3">Lost / DNF</SelectItem>
                    </>
                  )}
                  {activeTab === 'transactions' && (
                    <>
                      <SelectItem value="Successful" className="font-black text-[10px] uppercase tracking-widest p-3">Successful</SelectItem>
                      <SelectItem value="Pending" className="font-black text-[10px] uppercase tracking-widest p-3">Pending</SelectItem>
                      <SelectItem value="Failed" className="font-black text-[10px] uppercase tracking-widest p-3">Failed</SelectItem>
                    </>
                  )}
                  {activeTab === 'referrals' && (
                    <>
                      <SelectItem value="Qualified" className="font-black text-[10px] uppercase tracking-widest p-3">Qualified</SelectItem>
                      <SelectItem value="Pending" className="font-black text-[10px] uppercase tracking-widest p-3">Pending</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              
              {(searchQuery || statusFilter !== 'All') && (
                <Button 
                  variant="ghost" 
                  onClick={resetFilters}
                  className="h-14 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 gap-2 transition-all shadow-none"
                >
                  <MdOutlineClear className="text-lg" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
            <span>Query Results:</span>
            <span className="text-primary">
              {activeTab === 'matches' ? filteredMatches.length : 
               activeTab === 'transactions' ? filteredTransactions.length : 
               filteredReferrals.length} Records Found
            </span>
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
