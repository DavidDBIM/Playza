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
    <main className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-400 mx-auto w-full min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-headline font-black text-primary tracking-tight">Game Matrix</h1>
          <p className="text-muted-foreground font-body text-sm md:text-base">Managing the virtual battlefields of the Playza Empire.</p>
        </div>
        <Button 
          onClick={() => navigate('/games/create')}
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-black px-8 h-12 rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          <MdAddCircleOutline className="text-xl" />
          Deploy New Game
        </Button>
      </div>

      {/* Stats Cards */}
      <GamesStats stats={gamesStats} />

      {/* Table Section */}
      <div className="glass-card bg-card text-card-foreground rounded-3xl overflow-hidden border border-border/50 shadow-2xl transition-all duration-300">
        
        {/* Toolbar */}
        <GamesToolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          clearFilters={clearFilters}
        />

        {/* Table */}
        <GamesTable games={filteredGames} clearFilters={clearFilters} />

        {/* Info Footer */}
        <div className="px-8 py-6 bg-muted/30 border-t border-border/30 flex items-center justify-between text-muted-foreground/50">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <MdGamepad className="text-primary text-sm animate-pulse" />
            Core Simulation: <span className="text-emerald-500">Stable</span>
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            Syncing <span className="text-primary">{filteredGames.length}</span> Active Projections
          </p>
        </div>
      </div>
    </main>
  );
};

export default Games;
