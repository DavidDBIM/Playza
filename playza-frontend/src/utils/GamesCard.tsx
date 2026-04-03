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
    <div className="group relative w-full max-w-44 lg:max-w-60 aspect-7/9 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5">
      <Link
        to={`/games/${slug}`}
        key={id}
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
        {status === "live" && (
          <div className="absolute top-4 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest z-20 border border-white/20">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            LIVE
          </div>
        )}
        {status === "coming soon" && (
          <div className="absolute top-4 right-2 flex items-center gap-1.5 px-1 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest z-20 border border-white/20">
            COMING SOON
          </div>
        )}
        {status === "not starting soon" && (
          <div className="absolute top-4 right-2 flex items-center gap-1.5 px-1 py-1 rounded-full bg-slate-600/80 backdrop-blur-xs text-white/50 text-[10px] font-black uppercase tracking-widest z-20 border border-white/10">
            OFFLINE
          </div>
        )}

        {badge && (badge === "NEW" || badge === "HOT") && (
          <div
            className={`absolute top-4 left-2 flex items-center gap-1 px-1.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-xs z-20 ${
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
        <div className="absolute bottom-0 inset-x-0 p-2 z-10">
          {/* Active Players & Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 backdrop-blur-md rounded-xl border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest">
              <FaUsers className="text-xs" />
              <span>{activePlayers.toLocaleString()}</span>
            </div>
            <div className="px-3 py-1.5 bg-secondary/50 backdrop-blur-md rounded-xl text-slate-900 dark:text-white text-xs font-black italic tracking-tighter border border-white/10 flex items-center gap-1">
              <ZASymbol className="text-[10px] scale-75" />
              <span>{entryFee.toLocaleString()}</span>
            </div>
          </div>

          {/* Title */}
          <div className="pt-2">
            <h4 className="text-white font-black text-[10px] md:text-xs lg:text-sm italic tracking-tight uppercase leading-tight">
              {title}
            </h4>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default GamesCard;
