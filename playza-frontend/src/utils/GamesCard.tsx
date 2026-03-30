import type { Game } from "@/types/types";
import { FaUsers } from "react-icons/fa";
import { GiFlame } from "react-icons/gi";
import { Link } from "react-router";
import { ZASymbol } from "@/components/currency/ZASymbol";

const GamesCard = ({
  id,
  thumbnail,
  slug,
  entryFee,
  title,
  activePlayers,
  badge,
  status,
}: Game) => {
  return (
    <div className="group relative w-full max-w-44 lg:max-w-60 aspect-7/9 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-white/5 transition-colors">
      <Link
        to={`/games/${slug}`}
        key={id}
        className="block w-full h-full relative"
      >
        {/* Main Thumbnail */}
        <img
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          src={thumbnail}
          alt={title}
          loading="lazy"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

        {/* Status Badge */}
        {status === "live" && (
          <div className="absolute top-4 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg z-20 border border-white/20">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            LIVE
          </div>
        )}
        {status === "coming soon" && (
          <div className="absolute top-4 right-2 flex items-center gap-1.5 px-1 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg z-20 border border-white/20">
            COMING SOON
          </div>
        )}
        {status === "not starting soon" && (
          <div className="absolute top-4 right-2 flex items-center gap-1.5 px-1 py-1 rounded-full bg-slate-600/80 backdrop-blur-xs text-white/50 text-[10px] font-black uppercase tracking-widest shadow-lg z-20 border border-white/10">
            OFFLINE
          </div>
        )}

        {badge && (badge === "NEW" || badge === "HOT") && (
          <div
            className={`absolute top-4 left-2 flex items-center gap-1 px-1.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-xs shadow-lg z-20 ${
              badge === "HOT"
                ? "bg-playza-red text-white"
                : "bg-primary text-white"
            }`}
          >
            <GiFlame />
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
            <div className="px-3 py-1.5 bg-secondary/50 backdrop-blur-md rounded-xl text-slate-900 dark:text-white text-xs font-black italic tracking-tighter shadow-xl border border-white/10 flex items-center gap-1">
              <ZASymbol className="text-[10px] scale-75" />
              <span>{entryFee.toLocaleString()}</span>
            </div>
          </div>

          {/* Title */}
          <div className="pt-2">
            <h4 className="text-white font-black text-xs lg:text-sm 2xl:text-lg italic tracking-tight uppercase leading-tight group-hover:text-primary transition-colors">
              {title}
            </h4>
          </div>
        </div>

        {/* Glass Glow effect on hover */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Link>
    </div>
  );
};

export default GamesCard;
