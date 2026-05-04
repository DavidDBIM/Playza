import React, { useState, useMemo } from "react";
import type { Game } from "../types/game";
import { useNavigate } from "react-router";
import { MdAddCircleOutline, MdGamepad } from "react-icons/md";
import { gamesStats } from "../data/gamesData";
import { GamesStats } from "../components/games/GamesStats";
import { GamesToolbar } from "../components/games/GamesToolbar";
import { GamesTable } from "../components/games/GamesTable";
import { useGames } from "../hooks/use-games";
import { Loader2 } from "lucide-react";

const Games: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const { data: gamesData, isLoading } = useGames();

  const allGames = useMemo(() => {
    const rawGames = (gamesData?.games || []) as Game[];
    return rawGames.map((g) => ({
      ...g,
      thumbnail: g.thumbnail_url || g.thumbnail || "/games/placeholder.png",
      isActive: g.is_active ?? false,
      durationInSeconds: g.duration_seconds || 300,
      platformFeePercentage: g.platform_fee_percentage || 10,
      createdAt: g.created_at || new Date().toISOString(),
      updatedAt: g.created_at || new Date().toISOString(),
    }));
  }, [gamesData]);

  const filteredGames = useMemo(() => {
    return allGames.filter((game: Game) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        game.title.toLowerCase().includes(searchLower) ||
        (game.id && game.id.toLowerCase().includes(searchLower)) ||
        (game.slug && game.slug.toLowerCase().includes(searchLower));

      const matchesCategory =
        categoryFilter === "All Categories" || game.category === categoryFilter;
      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "Active" ? game.isActive : !game.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allGames, searchQuery, categoryFilter, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All Categories");
    setStatusFilter("All Status");
  };

  return (
    <main className="p-4 space-y-4">
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
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Synchronizing Games Database...
              </p>
            </div>
          ) : (
            <GamesTable games={filteredGames} clearFilters={clearFilters} />
          )}
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
