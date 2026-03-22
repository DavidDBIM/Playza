import type { Game } from "@/types/types";
import { FaUsers } from "react-icons/fa";
import { GiFlame } from "react-icons/gi";
import { Link } from "react-router";

const GamesCard = ({
  id,
  thumbnail,
  slug,
  entryFee,
  title,
  activePlayers,
  badge,
  isActive,
}: Game) => {
  return (
    <div className="group relative w-full max-w-52 lg:max-w-60 aspect-9/11 rounded-2xl overflow-hidden shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 border border-slate-200 dark:border-white/5">
      <Link
        to={`/games/${slug}`}
        key={id}
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
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

        {/* Badge (HOT/NEW) */}
        {isActive && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg z-20 animate-pulse border border-white/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            LIVE
          </div>
        )}

        {badge && (badge === "NEW" || badge === "HOT") && (
          <div
            className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg z-20 ${
              badge === "HOT"
                ? "bg-playza-red text-white"
                : "bg-primary text-white"
            }`}
          >
            <GiFlame className={badge === "HOT" ? "animate-pulse" : ""} />
            {badge}
          </div>
        )}

        {/* Stats & Info - Floating Style */}
        <div className="absolute bottom-0 inset-x-0 p-2  z-10 transition-transform duration-300">
          {/* Active Players & Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 backdrop-blur-md rounded-xl border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest shadow-lg">
              <FaUsers className="text-xs" />
              <span>{activePlayers.toLocaleString()}</span>
            </div>
            <div className="px-3 py-1.5 bg-secondary/50 backdrop-blur-md rounded-xl text-slate-900 dark:text-white text-xs font-black italic tracking-tighter shadow-xl border border-white/10">
              ₦{entryFee.toLocaleString()}
            </div>
          </div>

          {/* Title */}
          <div className="pt-2">
            <h4 className="text-white font-black text-xs lg:text-sm 2xl:text-lg italic tracking-tight uppercase leading-tight group-hover:text-primary transition-colors">
              {title}
            </h4>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Play Now
            </p>
          </div>
        </div>

        {/* Glass Glow effect on hover */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-primary/10 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 pointer-events-none" />
      </Link>
    </div>
  );
};

export default GamesCard;
