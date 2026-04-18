import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { MdAddCircleOutline, MdGamepad } from "react-icons/md";
import { games, gamesStats } from "../data/gamesData";
import { GamesStats } from "../components/games/GamesStats";
import { GamesToolbar } from "../components/games/GamesToolbar";
import { GamesTable } from "../components/games/GamesTable";

const Games: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        game.title.toLowerCase().includes(searchLower) ||
        game.id.toLowerCase().includes(searchLower) ||
        game.slug.toLowerCase().includes(searchLower);

      const matchesCategory =
        categoryFilter === "All Categories" || game.category === categoryFilter;
      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "Active" ? game.isActive : !game.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, categoryFilter, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All Categories");
    setStatusFilter("All Status");
  };

  return (
    <main className="p-6 space-y-6">
      {/* Header Container */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-400/30">
            <MdGamepad className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">
              Games
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Manage platform games and match configurations
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/games/create")}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 border border-primary/20"
        >
          <MdAddCircleOutline className="text-lg" />
          <span>Deploy Game</span>
        </button>
      </div>

      {/* Stats Cards */}
      <GamesStats stats={gamesStats} />

      {/* Table Section */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="relative z-10 border-b border-border">
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
        <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-between text-muted-foreground">
          <p className="text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
            Database Sync: <span className="text-emerald-500">Connected</span>
          </p>
          <p className="text-[10px] font-black uppercase tracking-wider">
            Displaying{" "}
            <span className="text-primary font-number">
              {filteredGames.length}
            </span>{" "}
            Records
          </p>
        </div>
      </div>
    </main>
  );
};

export default Games;
