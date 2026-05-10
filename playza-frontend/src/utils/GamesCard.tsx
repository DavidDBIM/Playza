import type { Game } from "@/types/types";
import { Link } from "react-router";

const GamesCard = (game: Game) => {
  const { slug, title, thumbnail, sessions } = game;

  const displayStatus = (() => {
    if (sessions?.some(s => s.status === 'active' || s.status === 'live')) return 'live';
    if (sessions?.some(s => s.status === 'upcoming' || s.status === 'coming soon')) return 'upcoming';
    return null;
  })();

  return (
    <div className="group relative w-full max-w-44 lg:max-w-60 aspect-7/9 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5">
      <Link
        to={`/games/${slug}`}
        className="block w-full h-full relative"
      >
        {/* Main Thumbnail */}
        <img
          className="w-full h-full object-cover"
          src={thumbnail}
          alt={title}
          loading="lazy"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-80" />

        {/* Status Badge */}
        {displayStatus === "live" && (
          <div className="absolute top-4 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest z-20 border border-white/20 shadow-lg shadow-red-600/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            LIVE
          </div>
        )}
        {displayStatus === "upcoming" && (
          <div className="absolute top-4 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest z-20 border border-white/20 shadow-lg shadow-emerald-500/20">
            UPCOMING
          </div>
        )}

        {/* Title Only */}
        <div className="absolute bottom-0 inset-x-0 p-4 z-10">
          <h4 className="text-white font-black text-sm md:text-base italic tracking-tight uppercase leading-tight drop-shadow-md">
            {title}
          </h4>
        </div>
      </Link>
    </div>
  );
};

export default GamesCard;
