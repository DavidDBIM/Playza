import type { Game } from "@/types/types";
import GamesCard from "@/utils/GamesCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

const HomeGames = ({ games, title }: { games: Game[]; title: string }) => {
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
    
    // Check again after a short delay to ensure content is rendered
    const timeoutId = setTimeout(checkScroll, 100);

    // Use ResizeObserver to detect changes in container size
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [games]);

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-heading text-lg md:text-2xl font-black uppercase tracking-tight">
            {title}
          </h2>
          <div className="h-1 w-12 bg-primary mt-1 rounded-full"></div>
        </div>
        
        <div className="flex gap-3 items-center">
          <Link 
            to="/games" 
            className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border border-black/10 dark:border-white/10 bg-slate-100/50 dark:bg-white/5 text-slate-600 dark:text-white/80 hover:border-primary/50 hover:bg-primary hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
          >
            View All
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="flex items-center justify-center p-2 rounded-xl transition-all duration-300 border border-black/10 dark:border-white/10 bg-slate-100/50 dark:bg-white/5 text-slate-600 dark:text-white/70 hover:border-primary/50 hover:bg-primary/10 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed disabled:border-black/5 dark:disabled:border-white/5 hover:-translate-y-0.5"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="flex items-center justify-center p-2 rounded-xl transition-all duration-300 border border-black/10 dark:border-white/10 bg-slate-100/50 dark:bg-white/5 text-slate-600 dark:text-white/70 hover:border-primary/50 hover:bg-primary/10 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed disabled:border-black/5 dark:disabled:border-white/5 hover:-translate-y-0.5"
              aria-label="Scroll Right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-hidden">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide scroll-smooth snap-x gap-1.5 snap-mandatory py-2"
        >
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
