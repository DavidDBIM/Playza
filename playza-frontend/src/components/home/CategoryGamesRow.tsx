import type { Game } from "@/types/types";
import type { ComponentType } from "react";
import GamesCard from "@/utils/GamesCard";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

interface CategoryGamesRowProps {
  games: Game[];
  title: string;
  icon: ComponentType<{ className?: string; size?: string | number }>;
  viewAllHref: string;
}

// Compact row used under the "Explore Games" header for the Tournaments,
// Head-to-Head, and Solo Earn sub-categories — a small icon + label header
// (instead of HomeGames' larger underlined title) with a horizontally
// scrollable strip of game cards underneath.
const CategoryGamesRow = ({ games, title, icon: Icon, viewAllHref }: CategoryGamesRowProps) => {
  if (games.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Icon className="w-4 h-4 text-primary" />
          <h3 className="text-xs md:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white/90">
            {title}
          </h3>
        </div>
        <Link
          to={viewAllHref}
          className="flex items-center text-slate-400 dark:text-white/50 hover:text-primary transition-colors"
          aria-label={`View all ${title}`}
        >
          <ChevronRight size={18} />
        </Link>
      </div>

      <div className="overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide scroll-smooth snap-x gap-1.5 snap-mandatory py-1">
          {games.map((game) => (
            <div key={game.id} className="shrink-0 snap-start">
              <GamesCard {...game} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGamesRow;