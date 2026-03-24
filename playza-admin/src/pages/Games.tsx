import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { 
  MdAddCircleOutline,
  MdGamepad
} from 'react-icons/md';
import { Button } from '../components/ui/button';
import { games, gamesStats } from '../data/gamesData';
import { GamesStats } from '../components/games/GamesStats';
import { GamesToolbar } from '../components/games/GamesToolbar';
import { GamesTable } from '../components/games/GamesTable';

const Games: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        game.title.toLowerCase().includes(searchLower) || 
        game.id.toLowerCase().includes(searchLower) ||
        game.slug.toLowerCase().includes(searchLower);
      
      const matchesCategory = categoryFilter === 'All Categories' || game.category === categoryFilter;
      const matchesStatus = statusFilter === 'All Status' || 
        (statusFilter === 'Active' ? game.isActive : !game.isActive);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, categoryFilter, statusFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All Categories');
    setStatusFilter('All Status');
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
              <MdGamepad className="text-primary hidden md:inline-block" />
              Games
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base">
              Manage platform games, tournaments, and configure match configurations.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/games/create')}
            className="w-full sm:w-auto bg-linear-to-r from-primary via-emerald-500 to-sky-500 hover:from-primary hover:to-emerald-400 text-white px-8 h-12 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all text-sm uppercase tracking-widest font-black"
          >
            <MdAddCircleOutline className="text-xl" />
            Deploy Game
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <GamesStats stats={gamesStats} />

      {/* Table Section */}
      <div className="glass-card rounded-3xl overflow-hidden relative">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        {/* Toolbar */}
        <div className="relative z-10">
          <GamesToolbar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            clearFilters={clearFilters}
          />
        </div>

        {/* Table */}
        <div className="relative z-10">
          <GamesTable games={filteredGames} clearFilters={clearFilters} />
        </div>

        {/* Info Footer */}
        <div className="relative z-10 px-8 py-6 bg-slate-50/50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-slate-500 dark:text-slate-400">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
            Database Sync: <span className="text-emerald-500">Connected</span>
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            Displaying <span className="text-primary">{filteredGames.length}</span> Records
          </p>
        </div>
      </div>
    </main>
  );
};

export default Games;
