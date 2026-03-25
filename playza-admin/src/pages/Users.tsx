import React, { useState, useMemo } from 'react';
import {
  MdPeople
} from 'react-icons/md';
import { userStats, usersData } from '../data/usersData';
import { UsersStats } from '../components/users/UsersStats';
import { UsersToolbar } from '../components/users/UsersToolbar';
import { UsersTable } from '../components/users/UsersTable';

const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [joinedFilter, setJoinedFilter] = useState('All Time');

  const filteredUsers = useMemo(() => {
    const now = new Date('2024-03-25T06:43:36').getTime(); 
    const results = usersData.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchLower) || 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phoneNumber && user.phoneNumber.includes(searchQuery)) ||
        user.id.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'All Status' || user.status === statusFilter;
      
      let matchesJoined = true;
      if (joinedFilter === 'Last 24h') {
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        matchesJoined = user.joinedTimestamp > oneDayAgo;
      } else if (joinedFilter === 'Last 7 Days') {
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        matchesJoined = user.joinedTimestamp > sevenDaysAgo;
      }

      return matchesSearch && matchesStatus && matchesJoined;
    });

    // Default sort by joined timestamp descending (newest first)
    return results.sort((a, b) => b.joinedTimestamp - a.joinedTimestamp);
  }, [searchQuery, statusFilter, joinedFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All Status');
    setJoinedFilter('All Time');
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
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            joinedFilter={joinedFilter}
            setJoinedFilter={setJoinedFilter}
            clearFilters={clearFilters}
          />
        </div>

        {/* Table */}
        <div className="relative z-10">
          <UsersTable users={filteredUsers} clearFilters={clearFilters} />
        </div>

        {/* Info Footer */}
        <div className="relative z-10 px-8 py-6 bg-slate-50/50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-slate-500 dark:text-slate-400">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            Database Sync: <span className="text-emerald-500">Connected</span>
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            Displaying <span className="text-primary">{filteredUsers.length}</span> Records
          </p>
        </div>
      </div>
    </main>
  );
};

export default Users;
