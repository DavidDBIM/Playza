import React, { useState, useMemo } from 'react';
import { 
  MdPersonAdd
} from 'react-icons/md';
import { Button } from '../components/ui/button';
import { userStats, usersData } from '../data/usersData';
import { UsersStats } from '../components/users/UsersStats';
import { UsersToolbar } from '../components/users/UsersToolbar';
import { UsersTable } from '../components/users/UsersTable';

const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filteredUsers = useMemo(() => {
    return usersData.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchLower) || 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.id.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'All Status' || user.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All Status');
  };

  return (
    <main className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-400 mx-auto w-full min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-headline font-black text-primary tracking-tight">Citizen Registry</h1>
          <p className="text-muted-foreground font-body text-sm md:text-base">Managing the high-score warriors of the Playza Empire.</p>
        </div>
        <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest font-bold">
          <MdPersonAdd className="text-xl" />
          Enlist Citizen
        </Button>
      </div>

      {/* Stats Cards - Factored */}
      <UsersStats stats={userStats} />

      {/* Table Section - Factored */}
      <div className="glass-card bg-card text-card-foreground rounded-3xl overflow-hidden border border-border/50 shadow-2xl transition-all duration-300">
        
        {/* Toolbar - Factored */}
        <UsersToolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          clearFilters={clearFilters}
        />

        {/* Table - Factored */}
        <UsersTable users={filteredUsers} clearFilters={clearFilters} />

        {/* Info Footer */}
        <div className="px-8 py-6 bg-muted/30 border-t border-border/30 flex items-center justify-between text-muted-foreground/50">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            Database Sync: <span className="text-emerald-500">Connected</span>
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            Displaying <span className="text-primary">{filteredUsers.length}</span> records detected in proximity
          </p>
        </div>
      </div>
    </main>
  );
};

export default Users;
