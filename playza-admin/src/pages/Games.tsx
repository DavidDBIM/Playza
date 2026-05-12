import React, { useState, useMemo } from "react";
import type { Game } from "../types/game";
import { useNavigate } from "react-router";
import { MdAddCircleOutline, MdGamepad } from "react-icons/md";
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
  const [modeFilter, setModeFilter] = useState("All Modes");

  const { data: gamesData, isLoading, refetch } = useGames();

  const allGames = useMemo(() => {
    const rawGames = (gamesData?.games || []) as Game[];
    return rawGames
      .map((g) => ({
        ...g,
        thumbnail: g.thumbnail_url || g.thumbnail || "/games/placeholder.png",
        isActive: g.is_active ?? false,
        durationInSeconds: g.duration_seconds || 300,
        platformFeePercentage: g.platform_fee_percentage || 10,
        unique_players: g.unique_players || 0,
        total_revenue: g.total_revenue || 0,
        createdAt: g.created_at || new Date().toISOString(),
        updatedAt: g.created_at || new Date().toISOString(),
      }))
      .sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0)); // Active games on top
  }, [gamesData]);

  const liveStats = useMemo(() => {
    const total = allGames.length;
    const active = allGames.filter((g) => g.isActive).length;
    const players = allGames.reduce(
      (sum, g) => sum + (g.unique_players || 0),
      0,
    );
    const revenue = allGames.reduce(
      (sum, g) => sum + (Number(g.total_revenue) || 0),
      0,
    );

    return [
      {
        label: "Total Games",
        value: total.toString(),
        change: "Live",
        trend: "up" as const,
      },
      {
        label: "Active Games",
        value: active.toString(),
        change: "Live",
        trend: "up" as const,
      },
      {
        label: "Total Players",
        value: players.toLocaleString(),
        change: "Unique",
        trend: "up" as const,
      },
      {
        label: "Revenue (MTD)",
        value: revenue.toLocaleString(),
        change: "Platform",
        trend: "up" as const,
      },
    ];
  }, [allGames]);

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

      const matchesMode =
        modeFilter === "All Modes" || game.mode === modeFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesMode;
    });
  }, [allGames, searchQuery, categoryFilter, statusFilter, modeFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All Categories");
    setStatusFilter("All Status");
    setModeFilter("All Modes");
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
      <GamesStats stats={liveStats} />

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
            modeFilter={modeFilter}
            setModeFilter={setModeFilter}
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
            <GamesTable
              games={filteredGames}
              clearFilters={clearFilters}
              refetch={refetch}
            />
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
