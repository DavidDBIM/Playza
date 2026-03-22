import { useParams, Link } from "react-router";
import { useMemo, useState } from "react";
import { games } from "@/data/games";
import GamesCard from "@/utils/GamesCard";
import { calculatePrizePool } from "@/utils/calculatedPrizePool";
import { ChevronLeft } from "lucide-react";
import Search from "@/components/Search";
import Filter, { type FilterOption } from "@/components/game/Filter";
import { filterGames } from "@/lib/filterGames";

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [query, setQuery] = useState("");
  const [filterBy, setFilterBy] = useState<FilterOption | "">("Filter By");

  const allCategoryGames = useMemo(() => {
    return games
      .filter((g) => g.category.toLowerCase() === category?.toLowerCase())
      .map((g) => ({
        ...g,
        pricePool: calculatePrizePool(
          g.entryFee,
          g.activePlayers,
          g.platformFeePercentage,
        ),
      }));
  }, [category]);

  const categoryTitle = useMemo(() => {
    if (!category) return "";
    return category.charAt(0).toUpperCase() + category.slice(1);
  }, [category]);

  const filteredGames = useMemo(() => {
    const filtered = filterGames(allCategoryGames, "All Games", filterBy, query);
    return [...filtered].sort((a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1));
  }, [allCategoryGames, filterBy, query]);

  const handleFiltering = (option: FilterOption) => {
    setFilterBy(option);
  };

  return (
    <main className="space-y-6 md:space-y-8 min-h-screen">
      {/* <!-- Breadcrumbs & Back Button --> */}
      <div className="flex flex-col gap-4">
        <nav className="flex text-[10px] md:text-xs text-slate-500 gap-2 px-1">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span className="opacity-50">/</span>
          <Link to="/games" className="hover:text-primary transition-colors">
            Games
          </Link>
          <span className="opacity-50">/</span>
          <span className="text-slate-900 dark:text-slate-300 font-medium font-heading capitalize">
            {category}
          </span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link
              to="/games"
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 hover:text-primary hover:bg-primary/10 transition-all border border-black/5 dark:border-white/5"
            >
              <ChevronLeft size={24} />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-slate-900 dark:text-white uppercase">
                  {categoryTitle} Games
                </h1>
              </div>
              <p className="text-offset text-sm font-medium">
                Explore our best {categoryTitle} collection
              </p>
            </div>
          </div>

          <div className="glass rounded-2xl p-2 md:p-3 flex gap-4 items-center flex-1 max-w-xl self-end md:self-auto">
            <Search
              placeholder={`Search ${categoryTitle} games...`}
              value={query}
              onChange={setQuery}
            />
            <div className="hidden sm:block">
              <Filter fn={handleFiltering} />
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Games Grid --> */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <GamesCard key={game.id} {...game} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center glass rounded-3xl">
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              No games found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default CategoryPage;
