import { useMemo, useState } from "react";
import Search from "../Search";
import GamesCard from "@/utils/GamesCard";
import { games } from "@/data/games";
import { calculatePrizePool } from "@/utils/calculatedPrizePool";
import FeatureGameCard from "../FeatureGameCard";
import { Link } from "react-router";
import CategoryRow from "./CategoryRow";
import Filter, { type FilterOption } from "./Filter";
import { filterGames } from "@/lib/filterGames";

const FullGame = () => {
  const [query, setQuery] = useState("");
  const [filterBy, setFilterBy] = useState<FilterOption | "">("Filter By");

  const allGames = useMemo(() => 
    games.map((g) => ({
      ...g,
      pricePool: calculatePrizePool(
        g.entryFee,
        g.activePlayers,
        g.platformFeePercentage,
      ),
    })), []);

  const biggestPoolGame = useMemo(() => 
    [...allGames].sort((a, b) => b.pricePool - a.pricePool)[0], 
    [allGames]
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
      "live": 1,
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
      if (!groups[game.category]) {
        groups[game.category] = [];
      }
      groups[game.category].push(game);
    });
    return groups;
  }, [allGames, filteredGames]);

  return (
    <main className="space-y-6 md:space-y-8">
      <div className="overflow-hidden">
        <nav className="flex text-[10px] md:text-xs text-slate-500 gap-2 mb-1 px-1">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span className="opacity-50">/</span>
          <span className="text-slate-900 dark:text-slate-300 font-medium font-heading">Games</span>
        </nav>
      </div>

      <section className="relative h-72 md:h-80 flex items-center rounded-xl overflow-hidden shadow-2xl shadow-primary/5">
        <FeatureGameCard
          {...biggestPoolGame}
          subTitle="Featured Challenge"
        />
      </section>

      <div className="glass rounded-2xl p-2 md:p-3 flex gap-4 items-center">
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
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-6 px-2">
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
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-lg">No games found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      ) : (

        <div className="space-y-2 animate-in fade-in duration-700">
          {groupedGames && Object.entries(groupedGames).map(([category, games]) => (
            <CategoryRow
              key={category}
              title={category}
              categorySlug={category.toLowerCase()}
              games={games.slice(0, 8)}
              totalGames={games.length}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default FullGame;
