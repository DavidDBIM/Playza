import { useMemo, useState } from "react";
import Search from "../Search";
import GamesCard from "@/utils/GamesCard";
import { calculatePrizePool } from "@/utils/calculatedPrizePool";
import FeatureGameCard from "../FeatureGameCard";
import CategoryRow from "./CategoryRow";
import Filter, { type FilterOption } from "./Filter";
import { filterGames } from "@/lib/filterGames";
import { useGames } from "@/hooks/gamesession/useGameSession";
import { Loader2 } from "lucide-react";
import type { Game, Session } from "@/types/types";

const FullGame = () => {
  const [query, setQuery] = useState("");
  const [filterBy, setFilterBy] = useState<FilterOption | "">("Filter By");

  const { data: gamesData, isLoading } = useGames();

  const allGames = useMemo(() => {
    const rawGames = (gamesData?.games || []) as Game[];

    // TESTING VIA LOCALHOST
    const isDev = window.location.hostname === "localhost";

    // Filter for active games only - show inactive ones only on localhost for development/preview
    const gamesToUse = rawGames.filter(
      (g: Game) => g.is_active === true || isDev,
    );

    return gamesToUse.map((g: Game & Record<string, unknown>) => {
      // Map backend fields to frontend Game type
      const game: Game = {
        ...g, // Spread first
        id: g.id,
        title: g.title,
        slug: g.slug,
        thumbnail:
          (g.thumbnail_url as string) ||
          (g.thumbnail as string) ||
          "/games/placeholder.png",
        category: g.category as Game["category"],
        mode: g.mode as Game["mode"],
        entryFee: Number(g.entryFee || 0),
        platformFeePercentage: Number(
          g.platform_fee_percentage || g.platformFeePercentage || 10,
        ),
        difficulty: g.difficulty as Game["difficulty"],
        durationInSeconds: Number(
          g.duration_seconds || g.durationInSeconds || 300,
        ),
        status:
          (g.status as Game["status"]) ||
          (g.is_active ? "live" : "coming soon"),
        activePlayers: Number(g.active_players || g.activePlayers || 0),
        ctaLabel: (g.ctaLabel as string) || "Play Now",
        badge: (g.badge as Game["badge"]) || null,
        iframeUrl: (g.iframe_url as string) || (g.iframeUrl as string),
        createdAt: (g.created_at as string) || (g.createdAt as string),
        updatedAt: (g.created_at as string) || (g.updatedAt as string),
        sessions: (g.sessions as Session[]) || [],
      };

      return {
        ...game,
        pricePool: calculatePrizePool(
          game.entryFee,
          game.activePlayers,
          game.platformFeePercentage,
        ),
      };
    });
  }, [gamesData]);

  const biggestPoolGame = useMemo(
    () =>
      allGames.length > 0
        ? [...allGames].sort((a, b) => b.pricePool - a.pricePool)[0]
        : null,
    [allGames],
  );

  const handleFiltering = (option: FilterOption) => {
    setFilterBy(option);
  };

  const filteredGames = useMemo(() => {
    if (query || (filterBy && filterBy !== "Filter By")) {
      return filterGames(allGames, "All Games", filterBy, query);
    }
    return null;
  }, [allGames, query, filterBy]);

  const groupedGames = useMemo(() => {
    if (filteredGames) return null;

    const statusOrder: Record<string, number> = {
      live: 1,
      "coming soon": 2,
      "not starting soon": 3,
    };

    const groups: Record<string, typeof allGames> = {};

    const sortedGames = [...allGames].sort((a, b) => {
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      return orderA - orderB;
    });

    sortedGames.forEach((game) => {
      const cat = game.category || "Other";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(game);
    });
    return groups;
  }, [allGames, filteredGames]);

  if (isLoading) {
    return (
      <div className="py-40 flex flex-col items-center justify-center gap-4 animate-pulse">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
          Syncing Arena Data...
        </p>
      </div>
    );
  }

  return (
    <main className="space-y-6 md:space-y-8">
      {biggestPoolGame && (
        <section className="relative flex items-center rounded-xl overflow-hidden">
          <FeatureGameCard {...biggestPoolGame} subTitle="Featured Challenge" />
        </section>
      )}

      <div className="glass rounded-xl p-2 md:p-3 flex gap-2 md:gap-4 items-center">
        <Search
          placeholder="Search for your favorite games..."
          value={query}
          onChange={setQuery}
        />
        <div className="hidden md:block">
          <Filter fn={handleFiltering} />
        </div>
      </div>

      {filteredGames ? (
        <section className="">
          <div className="flex items-center gap-2 md:gap-3 mb-6 px-2">
            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
            <h2 className="font-heading text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Results ({filteredGames.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filteredGames.map((g) => (
              <GamesCard {...g} key={g.id} />
            ))}
            {filteredGames.length === 0 && (
              <div className="col-span-full py-2 md:py-20 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm uppercase font-black tracking-widest">
                  No signals found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="space-y-4">
          {groupedGames && Object.keys(groupedGames).length > 0 ? (
            Object.entries(groupedGames).map(([category, games]) => (
              <CategoryRow
                key={category}
                title={category}
                categorySlug={category.toLowerCase()}
                games={games.slice(0, 8)}
                totalGames={games.length}
              />
            ))
          ) : (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative size-24 md:size-32 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl">
                  <span className="text-5xl md:text-6xl animate-pulse">🕹️</span>
                </div>
              </div>
              <div className="space-y-2 max-w-sm px-6">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                  Arena Maintenance
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold leading-relaxed uppercase tracking-widest">
                  The gaming sector is currently undergoing a scheduled systems
                  upgrade. New challenges are being calibrated.
                </p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="size-1.5 rounded-full bg-primary/30 animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default FullGame;
