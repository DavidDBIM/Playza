import type { Game } from "@/types/types";
import { Link } from "react-router";
import { FaUsers } from "react-icons/fa";
import { GiFlame } from "react-icons/gi";
import { ZASymbol } from "@/components/currency/ZASymbol";

const GamesCard = (game: Game) => {
  const { slug, title, thumbnail, sessions, activePlayers, entryFee, badge } = game;

  const displayStatus = (() => {
    if (sessions?.some(s => s.status === 'active' || s.status === 'live')) return 'live';
    if (sessions?.some(s => s.status === 'upcoming' || s.status === 'coming soon')) return 'upcoming';
    return null;
  })();

  return (
    <div className="group relative w-full max-w-44 lg:max-w-60 aspect-7/9 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-xl transition-all duration-500 hover:shadow-primary/20 hover:scale-[1.02]">
      <Link
        to={`/games/${slug}`}
        className="block w-full h-full relative"
      >
        {/* Main Thumbnail */}
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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

        {badge && (badge === "NEW" || badge === "HOT") && (
          <div
            className={`absolute top-4 left-2 flex items-center gap-1 px-1.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-xs z-20 shadow-lg ${
              badge === "HOT"
                ? "bg-orange-500 text-white shadow-orange-500/20"
                : "bg-primary text-white shadow-primary/20"
            }`}
          >
            <GiFlame />
            {badge}
          </div>
        )}

        {/* Stats & Info - Floating Style */}
        <div className="absolute bottom-0 inset-x-0 p-3 z-10 space-y-2">
          {/* Active Players & Price */}
          <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
              <FaUsers className="text-xs text-primary" />
              <span>{(activePlayers ?? 0).toLocaleString()}</span>
            </div>
            <div className="px-2.5 py-1.5 bg-primary/20 backdrop-blur-md rounded-xl text-primary text-[10px] font-black italic tracking-tighter border border-primary/30 flex items-center gap-1">
              <ZASymbol className="scale-75" />
              <span>{(entryFee ?? 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <h4 className="text-white font-black text-sm md:text-base italic tracking-tight uppercase leading-tight drop-shadow-md group-hover:text-primary transition-colors">
              {title}
            </h4>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default GamesCard;
