import type { ComponentType } from "react";
import type { Game } from "@/types/types";
import GamesCard from "@/utils/GamesCard";
import { ChevronRight, Gamepad2 } from "lucide-react";
import { Link } from "react-router";

interface HomeGamesProps {
  games: Game[];
  title: string;
  icon?: ComponentType<{ className?: string; size?: string | number }>;
  viewAllHref?: string;
}

// Header now matches the compact icon + chevron style used by
// CategoryGamesRow (Tournaments/Head-to-Head/Solo Earn) instead of the
// bigger underlined title + "View All" pill it used before.
const HomeGames = ({ games, title, icon: Icon = Gamepad2, viewAllHref = "/games" }: HomeGamesProps) => {
  return (
    <div className="relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-primary/8 blur-[120px] pointer-events-none" />

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
            <div
              key={game.id}
              className="shrink-0 snap-start"
            >
              <GamesCard {...game} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeGames;