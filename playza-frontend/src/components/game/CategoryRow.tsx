import type { Game } from "@/types/types";
import GamesCard from "@/utils/GamesCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

interface CategoryRowProps {
  games: Game[];
  title: string;
  categorySlug: string;
  totalGames: number;
}

const CategoryRow = ({ games, title, categorySlug, totalGames }: CategoryRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const isAtStart = el.scrollLeft <= 5;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;

    setCanScrollLeft(!isAtStart);
    setCanScrollRight(!isAtEnd);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.8;

    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    
    const timeoutId = setTimeout(checkScroll, 100);

    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [games]);

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-1 h-6 bg-primary rounded-full"></div>
          <h2 className="font-heading text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
            {title}
          </h2>
        </div>
        
        <div className="flex gap-2 md:gap-4 items-center">
          {totalGames > 8 && (
            <Link 
              to={`/games/category/${categorySlug}`} 
              className="text-primary text-xs md:text-sm font-bold whitespace-nowrap"
            >
              Show All
            </Link>
          )}
          <div className="flex gap-1.5">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="flex items-center justify-center p-1.5 rounded-lg border border-black/5 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 text-slate-500 dark:text-white/50 disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="flex items-center justify-center p-1.5 rounded-lg border border-black/5 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 text-slate-500 dark:text-white/50 disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Scroll Right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide scroll-smooth snap-x gap-2 md:gap-3 snap-mandatory py-2 px-1"
        >
          {games.map((game) => (
            <div
              key={game.id}
              className="shrink-0 snap-start "
            >
              <GamesCard {...game} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryRow;
